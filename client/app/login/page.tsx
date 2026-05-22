'use client';

/**
 * Guinevere AI — Login Page
 * app/login/page.tsx
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../utils/trpc';

// ─── 6-kotak OTP Input ────────────────────────────────────────
function OTPInput({ value, onChange, disabled }: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = char.slice(-1) || ' ';
    const next = arr.join('').replace(/ /g, '');
    onChange(next.slice(0, 6));
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(p);
    refs.current[Math.min(p.length, 5)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: 46, height: 54,
            textAlign: 'center',
            fontSize: '1.4rem',
            fontFamily: "'DM Mono', monospace",
            background: 'rgba(255,255,255,0.03)',
            border: value[i] ? '1px solid rgba(212,175,55,0.7)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            color: '#F5F0E8',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.9)'; }}
          onBlur={e => { e.target.style.borderColor = value[i] ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.1)'; }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [step, setStep]         = useState<'email' | 'otp'>('email');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOTP = trpc.auth.sendOTP.useMutation({
    onSuccess: () => {
      setStep('otp');
      setSuccess(`Kode OTP dikirim ke ${email}`);
      setError('');
      setCountdown(60);
    },
    onError: e => setError(e.message),
  });

  const verifyOTP = trpc.auth.verifyOTP.useMutation({
    onSuccess: () => {
      setSuccess('Berhasil masuk!');
      setTimeout(() => router.push('/dashboard'), 800);
    },
    onError: e => setError(e.message),
  });

  const handleSend = () => {
    setError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Masukkan email yang valid.');
      return;
    }
    sendOTP.mutate({ email });
  };

  const handleVerify = () => {
    setError('');
    if (otp.length !== 6) { setError('Masukkan 6 digit kode OTP.'); return; }
    verifyOTP.mutate({ email, token: otp });
  };

  const loading = sendOTP.isPending || verifyOTP.isPending;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080808;
          font-family: 'DM Mono', monospace;
          position: relative;
          overflow: hidden;
        }
        .page::after {
          content: '';
          position: fixed;
          top: -20%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          padding: 52px 44px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 2px;
          animation: up 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
        }
        @keyframes up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .otp-wrap { animation: up 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        .eyebrow {
          font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(212,175,55,0.65); margin-bottom: 36px;
        }
        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400; font-size: 1.9rem;
          color: #F5F0E8; line-height: 1.15;
          margin-bottom: 8px;
        }
        .sub {
          font-size: 11px; color: rgba(255,255,255,0.28);
          letter-spacing: 0.04em; line-height: 1.7; margin-bottom: 36px;
        }
        .sub span { color: rgba(212,175,55,0.7); }
        .label {
          display: block; font-size: 10px; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 9px;
        }
        input.field {
          width: 100%; padding: 13px 15px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px; color: #F5F0E8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          outline: none; margin-bottom: 22px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input.field:focus {
          border-color: rgba(212,175,55,0.5);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.06);
        }
        input.field::placeholder { color: rgba(255,255,255,0.14); }
        input.field:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn {
          width: 100%; padding: 14px;
          background: transparent;
          border: 1px solid rgba(212,175,55,0.45);
          border-radius: 4px; color: rgba(212,175,55,0.9);
          font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .btn:hover:not(:disabled) {
          border-color: rgba(212,175,55,0.9);
          box-shadow: 0 0 18px rgba(212,175,55,0.1);
        }
        .btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .err {
          font-size: 11px; color: rgba(255,100,100,0.8);
          padding: 9px 13px; border: 1px solid rgba(255,100,100,0.2);
          border-radius: 4px; margin-bottom: 14px;
          background: rgba(255,100,100,0.04);
          animation: up 0.3s ease;
        }
        .ok {
          font-size: 11px; color: rgba(120,200,120,0.8);
          padding: 9px 13px; border: 1px solid rgba(120,200,120,0.2);
          border-radius: 4px; margin-bottom: 14px;
          background: rgba(120,200,120,0.04);
          animation: up 0.3s ease;
        }
        .divider { width: 24px; height: 1px; background: rgba(212,175,55,0.25); margin: 26px 0; }
        .row {
          display: flex; justify-content: space-between;
          align-items: center; margin-top: 18px;
        }
        .ghost {
          font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace; transition: color 0.2s;
        }
        .spin {
          display: inline-block; width: 11px; height: 11px;
          border: 1px solid rgba(212,175,55,0.3);
          border-top-color: rgba(212,175,55,0.9);
          border-radius: 50%; animation: spin 0.7s linear infinite;
          margin-right: 7px; vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer { font-size: 10px; color: rgba(255,255,255,0.12); text-align: center; margin-top: 30px; letter-spacing: 0.06em; }
      `}</style>

      <div className="page">
        <div className="card">
          <p className="eyebrow">Guinevere AI · GUIN</p>

          {step === 'email' ? (
            <>
              <h1>Masuk ke<br />Guinevere.</h1>
              <p className="sub">Masukkan email kamu. Kami kirimkan<br />kode verifikasi sekali pakai.</p>

              {error   && <div className="err">{error}</div>}
              {success && <div className="ok">{success}</div>}

              <label className="label" htmlFor="email">Alamat Email</label>
              <input
                id="email" type="email" className="field"
                placeholder="nama@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={loading}
                autoFocus
              />
              <button className="btn" onClick={handleSend} disabled={loading || !email}>
                {loading ? <><span className="spin" />Mengirim...</> : 'Kirim Kode OTP'}
              </button>
            </>
          ) : (
            <div className="otp-wrap">
              <h1>Verifikasi<br />Identitas.</h1>
              <p className="sub">Kode dikirim ke<br /><span>{email}</span></p>

              {error   && <div className="err">{error}</div>}
              {success && <div className="ok">{success}</div>}

              <label className="label" style={{ marginBottom: 14 }}>Kode OTP</label>
              <OTPInput value={otp} onChange={setOtp} disabled={loading} />

              <div className="divider" />

              <button className="btn" onClick={handleVerify} disabled={loading || otp.length !== 6}>
                {loading ? <><span className="spin" />Memverifikasi...</> : 'Verifikasi & Masuk'}
              </button>

              <div className="row">
                <button className="ghost" style={{ color: 'rgba(255,255,255,0.2)' }}
                  onClick={() => { setStep('email'); setOtp(''); setError(''); setSuccess(''); }}>
                  ← Ganti email
                </button>
                <button className="ghost"
                  disabled={countdown > 0}
                  style={{ color: countdown > 0 ? 'rgba(255,255,255,0.18)' : 'rgba(212,175,55,0.6)' }}
                  onClick={() => { if (countdown > 0) return; setOtp(''); sendOTP.mutate({ email }); }}>
                  {countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim ulang'}
                </button>
              </div>
            </div>
          )}

          <p className="footer">© 2024 Guinevere AI — Akses terbatas</p>
        </div>
      </div>
    </>
  );
}
