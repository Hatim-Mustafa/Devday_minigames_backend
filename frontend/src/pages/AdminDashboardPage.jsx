import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

const GAME_THUMBNAIL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wm80BTIR3kf0smSrPgc_pIlIoUnJLnW5dBcKmnOvWl0TUwD-CNGff36fBeDlTqP4zw5TT1bfkNkSLWcStZiby2jV-bs32d7VZF-DdwdG8H0qi0L7b5WQoP5VbGDNtPbwMK92l9zfcGDrvE9t5egpvRM0bdpZLxYNd-zW_u5lgX8yC7130RM2oqv8z_zpTgVP5g6mAqTf-hLxms8s0G2-2f9OSunrsw-BwtGMdxExnRsbNX8Z77eqTLzLJ7JszvVBvTxOkoniNOU';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGames = async () => {
    try {
      setError('');
      const res = await api.get('/minigames');
      setGames(res.data || []);
    } catch {
      setError('Failed to load minigames.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const stats = useMemo(() => {
    const totalGames = games.length;
    const activeGames = games.filter((game) => game.isActive).length;
    const inactiveGames = totalGames - activeGames;

    return { totalGames, activeGames, inactiveGames };
  }, [games]);

  const handleToggleActive = async (game) => {
    try {
      await api.put(`/minigames/${game.id}`, { isActive: !game.isActive });
      await fetchGames();
    } catch {
      alert('Failed to update minigame.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this minigame?')) return;

    try {
      await api.delete(`/minigames/${id}`);
      await fetchGames();
    } catch {
      alert('Failed to delete minigame.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div className="dark overflow-x-hidden bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-outline-variant/10 bg-[#0e0e0e] py-0 text-sm font-medium text-[#E53935]">
        <div className="p-8">
          <div class="flex items-center gap-4">
            <span class="font-headline text-xl font-black text-[#E53935] tracking-tighter uppercase">Developer's Day</span>
          </div>
          <div className="mt-1 font-headline text-[10px] uppercase tracking-tighter text-neutral-500">
            MINIGAME_ROOT
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-2 px-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 border-l-4 border-[#E53935] bg-[#1c1b1b] px-4 py-3 font-headline uppercase tracking-tighter text-[#FFB3B3] transition-all duration-150 ease-in-out"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/games"
            className="flex items-center gap-3 px-4 py-3 font-headline uppercase tracking-tighter text-[#E4BEB9] transition-all duration-150 ease-in-out hover:bg-[#2A2A2A]"
          >
            <span className="material-symbols-outlined">sports_esports</span>
            <span>Games</span>
          </Link>
        </nav>

        <div className="mt-auto p-4">
          <div className="mb-4 flex items-center gap-3 bg-surface-container-low p-4">
            <div className="flex h-10 w-10 items-center justify-center bg-surface-container-high">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-on-surface">Admin Avatar</p>
              <p className="truncate font-headline text-[10px] uppercase text-on-surface-variant/60">
                SYS_OP_042
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-headline uppercase tracking-tighter text-[#E4BEB9] transition-all duration-150 ease-in-out hover:bg-[#2A2A2A]"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between border-b-0 bg-neutral-950/80 px-8 font-headline font-bold backdrop-blur-md">
        <div className="text-xl font-black text-neutral-100">MINIGAME_COMMAND</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-widest text-red-500">
              ADMIN_STATUS:ACTIVE
            </span>
          </div>
        </div>
      </header>

      <main className="ml-64 min-h-screen bg-surface pt-16">
        <div className="mx-auto max-w-7xl space-y-12 p-8">
          <section className="flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="space-y-2">
              <h1 className="font-headline text-5xl font-extrabold uppercase tracking-tighter text-on-surface">
                Admin Game Registry
              </h1>
              <p className="max-w-xl border-l-2 border-primary pl-4 font-body text-sm leading-relaxed text-on-surface-variant">
                Comprehensive management interface for high-performance minigames.
                Monitor status, update configurations, and deploy new instances
                across the local cluster.
              </p>
            </div>
            <Link
              to="/admin/minigames/new"
              className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-label text-sm font-bold uppercase tracking-widest text-on-primary-fixed transition-all hover:brightness-110 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add_box</span>
              Register New Minigame
            </Link>
          </section>

          <section className="grid grid-cols-1 gap-0 md:grid-cols-3">
            <div className="group border-r border-outline-variant/10 bg-surface-container-low p-8 transition-colors hover:bg-surface-container-high">
              <p className="mb-4 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Total Games
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-6xl font-black tracking-tighter">
                  {stats.totalGames}
                </span>
                <span className="font-mono text-xs text-neutral-600">REG_INSTANCES</span>
              </div>
            </div>
            <div className="group border-r border-outline-variant/10 bg-surface-container-low p-8 transition-colors hover:bg-surface-container-high">
              <p className="mb-4 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Active Games
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-6xl font-black tracking-tighter text-on-surface">
                  {stats.activeGames}
                </span>
                <span className="font-mono text-xs text-green-500">LIVE_TRAFFIC</span>
              </div>
            </div>
            <div className="group bg-surface-container-low p-8 transition-colors hover:bg-surface-container-high">
              <p className="mb-4 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Inactive Games
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-6xl font-black tracking-tighter text-on-surface">
                  {stats.inactiveGames}
                </span>
                <span className="font-mono text-xs font-bold text-primary">ONLINE</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-widest text-neutral-500">
                <span className="h-2 w-2 animate-pulse bg-primary"></span>
                Live_Registry_Stream
              </h3>
            </div>

            {loading ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                Loading…
              </div>
            ) : null}
            {error ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-error">
                {error}
              </div>
            ) : null}
            {!loading && !error && games.length === 0 ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                No minigames registered yet.
              </div>
            ) : null}

            {!loading && !error && games.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest text-left font-label text-[10px] uppercase tracking-widest text-primary">
                      <th className="px-6 py-4 font-bold">ID</th>
                      <th className="px-6 py-4 font-bold">Game Title</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm">
                    {games.map((game, index) => (
                      <tr
                        key={game.id}
                        className={`${
                          index % 2 === 1 ? 'bg-surface-container-low' : ''
                        } group border-l-2 border-transparent transition-colors hover:border-primary hover:bg-primary-container/10`}
                      >
                        <td className="px-6 py-5 font-mono text-neutral-500">#{game.id.slice(0, 8)}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden border border-outline-variant/20 bg-surface-container-lowest">
                              <img
                                alt={game.name}
                                className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                                src={GAME_THUMBNAIL}
                              />
                            </div>
                            <div>
                              <span className="font-bold uppercase tracking-tight">{game.name}</span>
                              {game.description ? (
                                <p className="max-w-md truncate text-xs text-on-surface-variant">
                                  {game.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="space-x-2 px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(game)}
                            className="p-2 text-neutral-400 transition-colors hover:bg-surface-container-highest hover:text-primary"
                            title={game.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {game.isActive ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(game.id)}
                            className="p-2 text-neutral-400 transition-colors hover:bg-surface-container-highest hover:text-error"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <footer className="border-t border-outline-variant/10 py-6"></footer>
          </section>

          <section className="mt-12 grid grid-cols-12 gap-6 pb-12">
            <div className="relative col-span-12 overflow-hidden bg-surface-container-low p-1 group md:col-span-7">
              <div className="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rotate-45 bg-primary/5"></div>
              <div className="relative z-10 border border-outline-variant/10 p-8">
                <h4 className="mb-4 font-headline text-xl font-black uppercase tracking-tighter">
                  System Alert Log
                </h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <p className="flex items-center gap-4 text-neutral-500">
                    <span className="text-primary">[14:22:01]</span>
                    <span>SESSION_LOAD_BALANCER: SUCCESSFUL_HANDSHAKE_NODE_A9</span>
                  </p>
                  <p className="flex items-center gap-4 text-neutral-500">
                    <span className="text-primary">[14:18:55]</span>
                    <span>MINIGAME_DEPLOY: #G-1105 VERSION_PATCH_APPLIED</span>
                  </p>
                  <p className="flex items-center gap-4 text-neutral-500">
                    <span className="text-primary">[14:15:30]</span>
                    <span className="font-bold text-error">
                      WARNING: NODE_B2 LATENCY_THRESHOLD_EXCEEDED
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-12 flex flex-col justify-between bg-gradient-to-br from-surface-container-high to-surface-container-low p-8 md:col-span-5">
              <div>
                <h4 className="mb-2 font-headline text-xl font-black uppercase tracking-tighter">
                  Engine Status
                </h4>
                <p className="font-body text-xs text-on-surface-variant">
                  Sub-system kernel operating at peak efficiency. No critical
                  failures detected in last 24h cycle.
                </p>
              </div>
              <div className="mt-6 h-1 w-full bg-surface-container-lowest">
                <div className="h-full w-[92%] bg-primary"></div>
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase text-neutral-500">
                <span>Cluster_Sync</span>
                <span className="text-primary">92% Ready</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
