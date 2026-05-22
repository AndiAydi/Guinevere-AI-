'use client';

/**
 * Guinevere AI — Dashboard (Protected)
 * app/dashboard/page.tsx
 */
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = { role: 'user' | 'ai'; text: string; ts: number };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]         = useState<{ email?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return; }
      setUser(data.session.user);
      setChecking(false);
    });
  }, [router]);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // TODO: ganti ini dengan trpc.chat.sendMessage.mutate() saat chatRouter siap
      const res = await fetch('http://localhost:3000/api/trpc/chat.sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: { message: text } }),
      });
      const data = await res.json();
      const reply = data?.result?.data?.json?.reply ?? '(Belum ada respons dari Guinevere)';
      setMessages(prev => [...prev, { role: 'ai', text: reply, ts: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Koneksi ke Guinevere terputus. Coba lagi.',
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.2em' }}>
        MEMVERIFIKASI SESI...
      </p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }

        .dash {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          background: #080808;
          font-family: 'DM Mono', monospace;
        }

        /* ── Header ── */
        .header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.01);
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 300;
          color: #F5F0E8; letter-spacing: 0.02em;
        }
        .logo span { color: rgba(212,175,55,0.7); }
        .user-info {
          display: flex; align-items: center; gap: 16px;
        }
        .email-badge {
          font-size: 10px; letter-spacing: 0.06em;
          color: rgba(255,255,255,0.25); max-width: 200px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .logout-btn {
          font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,100,100,0.5); background: none;
          border: 1px solid rgba(255,100,100,0.2);
          border-radius: 3px; padding: 6px 12px;
          cursor: pointer; font-family: 'DM Mono', monospace;
          transition: all 0.2s;
        }
        .logout-btn:hover { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.5); }

        /* ── Chat area ── */
        .chat-area {
          overflow-y: auto; padding: 28px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .chat-area::-webkit-scrollbar { width: 4px; }
        .chat-area::-webkit-scrollbar-track { background: transparent; }
        .chat-area::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 2px; }

        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          color: rgba(255,255,255,0.12);
        }
        .empty-glyph {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem; font-weight: 300;
          color: rgba(212,175,55,0.15);
        }
        .empty-text { font-size: 11px; letter-spacing: 0.1em; }

        /* ── Bubble ── */
        .bubble-wrap {
          display: flex;
          animation: fadeUp 0.3s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bubble-wrap.user  { justify-content: flex-end; }
        .bubble-wrap.ai    { justify-content: flex-start; }

        .bubble {
          max-width: 68%; padding: 12px 16px;
          border-radius: 2px; font-size: 13px; line-height: 1.65;
          letter-spacing: 0.01em;
        }
        .bubble.user {
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.2);
          color: #F5F0E8;
          border-bottom-right-radius: 0;
        }
        .bubble.ai {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.75);
          border-bottom-left-radius: 0;
        }
        .bubble-label {
          font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 6px;
          color: rgba(212,175,55,0.45);
        }

        /* Thinking dots */
        .thinking { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
        .dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(212,175,55,0.4);
          animation: pulse 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%           { transform: scale(1); opacity: 1; }
        }

        /* ── Input bar ── */
        .input-bar {
          display: flex; gap: 10px; align-items: flex-end;
          padding: 16px 28px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .input-field {
          flex: 1; padding: 13px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px; color: #F5F0E8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          outline: none; resize: none;
          transition: border-color 0.2s;
          min-height: 48px; max-height: 140px;
        }
        .input-field:focus { border-color: rgba(212,175,55,0.4); }
        .input-field::placeholder { color: rgba(255,255,255,0.14); }

        .send-btn {
          padding: 13px 22px; height: 48px;
          background: transparent;
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 4px; color: rgba(212,175,55,0.8);
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .send-btn:hover:not(:disabled) {
          border-color: rgba(212,175,55,0.9);
          box-shadow: 0 0 16px rgba(212,175,55,0.1);
        }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      <div className="dash">
        {/* Header */}
        <header className="header">
          <div className="logo">Guinevere<span>.</span></div>
          <div className="user-info">
            <span className="email-badge">{user?.email}</span>
            <button className="logout-btn" onClick={handleLogout}>Keluar</button>
          </div>
        </header>

        {/* Chat */}
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-glyph">G</div>
              <p className="empty-text">Guinevere siap membantumu.</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`bubble-wrap ${m.role}`}>
                <div>
                  <div className="bubble-label">
                    {m.role === 'user' ? 'Kamu' : 'Guinevere'}
                  </div>
                  <div className={`bubble ${m.role}`}>{m.text}</div>
                </div>
              </div>
            ))
          )}

          {/* Thinking indicator */}
          {loading && (
            <div className="bubble-wrap ai">
              <div>
                <div className="bubble-label">Guinevere</div>
                <div className="bubble ai">
                  <div className="thinking">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="input-bar">
          <textarea
            className="input-field"
            placeholder="Ketik pesanmu ke Guinevere..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
            Kirim
          </button>
        </div>
      </div>
    </>
  );
}
