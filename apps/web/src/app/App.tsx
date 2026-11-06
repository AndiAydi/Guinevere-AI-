import { useEffect, useState } from 'react';

interface HealthResponse {
  ok: boolean;
  providers: { id: string; model: string }[];
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d: HealthResponse) => setHealth(d))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '2rem' }}>Guinevere AI</h1>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
        Assistant pribadi multi-mode. Ada yang bisa dibantu?
      </p>

      {error && (
        <p style={{ color: 'var(--color-status-danger)' }}>
          Server belum merespons: {error}
        </p>
      )}

      {health && (
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
          Provider aktif:{' '}
          {health.providers.length > 0
            ? health.providers.map((p) => p.id).join(', ')
            : 'belum ada — isi .env'}
        </p>
      )}
    </main>
  );
}
