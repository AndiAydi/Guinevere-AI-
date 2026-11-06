import { describe, expect, it } from 'vitest';
import { ProviderRouter } from '../src/providers/router.js';
import { QuotaExhaustedError } from '../src/providers/types.js';
import type { Provider } from '../src/providers/types.js';
import type { ProviderId } from '@guinevere/shared';

/**
 * Test failover router — TANPA API key sungguhan.
 *
 * Ini contoh langsung dari anti-pola proyek lama: klaim "71 tests passing"
 * tanpa bukti. Test di sini benar-benar dijalankan di CI, dan kalau router
 * gagal ber-failover, CI akan merah.
 */

function makeProvider(
  id: ProviderId,
  behavior: 'ok' | 'quota' | 'error',
  opts: { model?: string; available?: boolean } = {},
): Provider & { calls: number } {
  const p = {
    id,
    model: opts.model ?? `${id}-model`,
    available: opts.available ?? true,
    calls: 0,
    async generate() {
      p.calls++;
      if (behavior === 'quota') {
        throw new QuotaExhaustedError(id, `${id}: 429 rate limit`);
      }
      if (behavior === 'error') {
        const e = new Error(`${id}: 500 internal`);
        (e as { status?: number }).status = 500;
        throw e;
      }
      return {
        text: `jawaban dari ${id}`,
        provider: id,
        model: p.model,
        attempts: 1,
      };
    },
  };
  return p as unknown as Provider & { calls: number };
}

describe('ProviderRouter', () => {
  it('memakai provider pertama saat semuanya sehat', async () => {
    const groq = makeProvider('groq', 'ok');
    const gemini = makeProvider('gemini', 'ok');
    const router = new ProviderRouter({ providers: [groq, gemini] });

    const result = await router.generate({
      messages: [{ role: 'user', content: 'halo' }],
    });

    expect(result.provider).toBe('groq');
    expect(result.attempts).toBe(1);
    expect(groq.calls).toBe(1);
    expect(gemini.calls).toBe(0);
  });

  it('failover ke provider berikutnya saat kuota habis', async () => {
    const groq = makeProvider('groq', 'quota');
    const gemini = makeProvider('gemini', 'ok');
    const router = new ProviderRouter({ providers: [groq, gemini] });

    const result = await router.generate({
      messages: [{ role: 'user', content: 'halo' }],
    });

    expect(result.provider).toBe('gemini');
    expect(result.attempts).toBe(2);
    expect(groq.calls).toBe(1);
    expect(gemini.calls).toBe(1);
  });

  it('failover berantai sampai provider ketiga', async () => {
    const groq = makeProvider('groq', 'quota');
    const gemini = makeProvider('gemini', 'quota');
    const openrouter = makeProvider('openrouter', 'ok');
    const router = new ProviderRouter({
      providers: [groq, gemini, openrouter],
    });

    const result = await router.generate({
      messages: [{ role: 'user', content: 'halo' }],
    });

    expect(result.provider).toBe('openrouter');
    expect(result.attempts).toBe(3);
  });

  it('melempar error yang jelas saat semua provider gagal', async () => {
    const router = new ProviderRouter({
      providers: [
        makeProvider('groq', 'quota'),
        makeProvider('gemini', 'error'),
      ],
    });

    await expect(
      router.generate({ messages: [{ role: 'user', content: 'halo' }] }),
    ).rejects.toThrow(/Semua provider AI gagal/);
  });

  it('mengabaikan provider tanpa kredensial', () => {
    const groq = makeProvider('groq', 'ok', { available: false });
    const gemini = makeProvider('gemini', 'ok');
    const router = new ProviderRouter({ providers: [groq, gemini] });

    expect(router.availableProviders().map((p) => p.id)).toEqual(['gemini']);
  });

  it('menyusun ulang prioritas ketika preferred diberikan', async () => {
    const groq = makeProvider('groq', 'ok');
    const gemini = makeProvider('gemini', 'ok');
    const router = new ProviderRouter({ providers: [groq, gemini] });

    const result = await router.generate({
      messages: [{ role: 'user', content: 'halo' }],
      preferred: 'gemini',
    });

    expect(result.provider).toBe('gemini');
    expect(groq.calls).toBe(0);
  });

  it('melempar error informatif saat tidak ada provider sama sekali', async () => {
    const router = new ProviderRouter({ providers: [] });

    await expect(
      router.generate({ messages: [{ role: 'user', content: 'halo' }] }),
    ).rejects.toThrow(/GROQ_API_KEY/);
  });

  it('melaporkan kegagalan ke onFailure untuk telemetry', async () => {
    const failures: string[] = [];
    const router = new ProviderRouter({
      providers: [makeProvider('groq', 'quota'), makeProvider('gemini', 'ok')],
      onFailure: (provider) => failures.push(provider),
    });

    await router.generate({ messages: [{ role: 'user', content: 'halo' }] });

    expect(failures).toEqual(['groq']);
  });
});
