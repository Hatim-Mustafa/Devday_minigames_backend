import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function LoginPage({ onLogin }) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { secret });
      localStorage.setItem('adminToken', res.data.token);
      onLogin();
    } catch {
      setError('Invalid admin secret. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-on-surface">
      <main className="hero-gradient relative flex flex-grow items-center justify-center overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute right-[-10%] top-[-10%] h-[120%] w-[40%] rotate-12 border-l border-outline-variant"></div>
          <div className="absolute bottom-[-20%] left-[5%] h-[40%] w-[80%] -rotate-3 border-t border-outline-variant"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-headline text-3xl font-black uppercase tracking-tighter text-on-surface">
              Admin Portal
            </h1>
            <p className="mt-2 font-label text-sm uppercase tracking-widest text-on-surface-variant">
              Developer&apos;s Day / Access Control
            </p>
          </div>

          <div className="relative bg-surface-container-low p-8 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 border border-outline-variant opacity-20"></div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="font-label text-xs font-bold uppercase tracking-wider text-primary"
                  htmlFor="secret"
                >
                  Password
                </label>
                <div className="group relative">
                  <input
                    className="w-full bg-surface-container-lowest px-4 py-4 font-body text-on-surface ring-1 ring-outline-variant/20 transition-all duration-200 focus:ring-primary"
                    id="secret"
                    name="secret"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-error">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="button-gradient flex w-full items-center justify-center py-5 font-headline text-lg font-bold uppercase tracking-tighter text-on-primary-fixed transition-transform duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Leaderboard
              </Link>
            </div>
          </div>

          <div className="mt-6 flex justify-between px-2 font-label text-[10px] uppercase tracking-[0.2em] text-outline opacity-40">
            <span>System: Online</span>
            <span>Encrypted-SSL-v3</span>
            <span>Node: 04-DX-24</span>
          </div>
        </div>
      </main>

      <footer className="flex flex-col items-center justify-center gap-4 border-t border-outline-variant/15 bg-surface-container-lowest py-8">
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-on-surface-variant opacity-60">
          © 2024 Developer&apos;s Day. Built for High-Octane Precision.
        </p>
        <div className="flex gap-6">
          <a className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100" href="#">
            Event Info
          </a>
          <a className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100" href="#">
            Support
          </a>
          <a className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100" href="#">
            Privacy
          </a>
        </div>
      </footer>
    </div>
  );
}
