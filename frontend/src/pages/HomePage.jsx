import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import developerDayLogo from '../assets/logo.png';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [leaderboardsByGameId, setLeaderboardsByGameId] = useState({});
  const [selectedGameId, setSelectedGameId] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const gamesRes = await api.get('/minigames');
        const allGames = gamesRes.data || [];
        setGames(allGames);

        const leaderboardResults = await Promise.all(
          allGames.map(async (game) => {
            try {
              const boardRes = await api.get(`/scores/leaderboard/${game.id}`);
              return {
                gameId: game.id,
                leaderboard: boardRes.data?.leaderboard || [],
                failed: false,
              };
            } catch {
              return {
                gameId: game.id,
                leaderboard: [],
                failed: true,
              };
            }
          })
        );

        const nextBoards = {};
        leaderboardResults.forEach((result) => {
          nextBoards[result.gameId] = {
            leaderboard: result.leaderboard,
            failed: result.failed,
          };
        });
        setLeaderboardsByGameId(nextBoards);
      } catch {
        setError('Failed to load leaderboards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const flattenedLeaderboard = useMemo(() => {
    const rows = [];

    games.forEach((game) => {
      const boardData = leaderboardsByGameId[game.id];
      if (!boardData || boardData.failed || !boardData.leaderboard) return;

      boardData.leaderboard.forEach((entry) => {
        rows.push({
          gameId: game.id,
          gameName: game.name,
          userCode: entry.userCode,
          score: Number(entry.score) || 0,
          playTime: Number(entry.playTime) || 0,
          updatedAt: entry.updatedAt,
        });
      });
    });

    const filteredRows = selectedGameId
      ? rows.filter((row) => row.gameId === selectedGameId)
      : [];

    return filteredRows
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.playTime !== b.playTime) return a.playTime - b.playTime;
        return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
      })
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [games, leaderboardsByGameId, selectedGameId]);

  const visibleLeaderboard = showAllRows
    ? flattenedLeaderboard
    : flattenedLeaderboard.slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-none bg-[#131313] px-6">
        <div className="flex items-center gap-4">
          <img
            alt="Event Logo"
            className="h-8 w-8 object-contain"
            src={developerDayLogo}
          />
          <span className="font-headline text-2xl font-black uppercase tracking-tighter text-[#E53935]">
            Developer&apos;s Day
          </span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            className="border-b-2 border-[#E53935] font-headline font-bold uppercase tracking-tighter text-[#E5E2E1]"
            to="/"
          >
            Leaderboard
          </Link>
          <Link
            className="px-3 py-1 font-headline font-bold uppercase tracking-tighter text-[#E4BEB9] transition-colors duration-200 hover:bg-[#2A2A2A]"
            to="/games"
          >
            Games
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            className="cta-gradient inline-block px-6 py-2 font-body text-sm font-bold uppercase text-[#400009] transition-transform active:scale-95"
            to="/login"
          >
            Admin Access
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="leaderboard-hero-gradient relative overflow-hidden border-b border-outline-variant/15 px-6 py-20">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="h-full w-full translate-x-1/2 -translate-y-1/2 rotate-45 transform border-b-[100px] border-r-[100px] border-primary"></div>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="h-[2px] w-8 bg-primary"></span>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                Live Statistics
              </span>
            </div>
            <h1 className="mb-6 font-headline text-6xl font-black uppercase leading-none tracking-tighter text-on-surface md:text-8xl">
              Minigame <br />
              <span className="gradient-text">
                Leaderboard
              </span>
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant">
              Track real-time performance of the world&apos;s most elite
              developers. High-octane precision in every line of code, every
              pixel moved, and every bracket closed.
            </p>
          </div>
        </section>

        <section id="leaderboard" className="bg-surface px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
              <div>
                <h2 className="font-headline text-3xl font-bold uppercase tracking-tight text-on-surface">
                  Top Performers
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Updated every 30 seconds
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="cursor-pointer appearance-none border-none bg-surface-container-high px-4 py-2 pr-8 font-label text-xs font-bold uppercase text-primary focus:ring-0"
                  >
                    <option value="" disabled hidden={Boolean(selectedGameId)}>
                      Select Game
                    </option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-sm text-primary">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                Loading leaderboard…
              </div>
            ) : null}
            {error ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-error">
                {error}
              </div>
            ) : null}

            {!loading && !error ? (
              <>
                <div className="overflow-hidden bg-surface-container-low shadow-2xl">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-surface-container-highest">
                        <th className="px-6 py-4 font-label text-xs font-bold uppercase tracking-wider text-primary">
                          Rank
                        </th>
                        <th className="px-6 py-4 font-label text-xs font-bold uppercase tracking-wider text-primary">
                          Player
                        </th>
                        <th className="px-6 py-4 font-label text-xs font-bold uppercase tracking-wider text-primary text-right">
                          Score
                        </th>
                        <th className="px-6 py-4 font-label text-xs font-bold uppercase tracking-wider text-primary text-right">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {visibleLeaderboard.map((entry) => (
                        <tr
                          key={`${entry.gameId}-${entry.userCode}-${entry.rank}`}
                          className="group border-l-4 border-transparent transition-colors hover:border-primary hover:bg-primary-container/10"
                        >
                          <td className="px-6 py-6">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center text-sm font-black ${
                                entry.rank === 1
                                  ? 'bg-primary text-on-primary-fixed'
                                  : 'bg-surface-container-high text-on-surface'
                              }`}
                            >
                              {String(entry.rank).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center border border-outline-variant/30 bg-surface-container-highest">
                                <span
                                  className={`material-symbols-outlined text-xs ${
                                    entry.rank === 1
                                      ? 'text-primary'
                                      : 'text-on-surface-variant'
                                  }`}
                                >
                                  {entry.rank === 1 ? 'terminal' : 'person'}
                                </span>
                              </div>
                              <span className="font-body font-semibold">
                                {entry.userCode}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right font-headline text-xl font-bold">
                            {entry.score.toLocaleString()}
                          </td>
                          <td className="px-6 py-6 text-right font-body text-xs uppercase text-on-surface-variant">
                            {entry.updatedAt
                              ? new Date(entry.updatedAt).toLocaleString()
                              : '—'}
                          </td>
                        </tr>
                      ))}
                      {visibleLeaderboard.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-sm text-on-surface-variant"
                          >
                            No leaderboard entries available.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                {flattenedLeaderboard.length > 10 ? (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllRows((prev) => !prev)}
                      className="flex items-center gap-2 border border-outline-variant/30 px-8 py-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high"
                    >
                      {showAllRows ? 'Show Top 10' : 'Load Full Standings'}
                      <span className="material-symbols-outlined text-sm">
                        {showAllRows ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </section>

        <section className="bg-surface px-6 pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="mt-12 grid grid-cols-12 gap-6 pb-12">
              <div className="group relative col-span-12 overflow-hidden bg-surface-container-low p-1 md:col-span-7">
                <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rotate-45 bg-primary/5"></div>
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
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-auto flex w-full flex-col items-center justify-center gap-4 border-t border-[#5B403D]/15 bg-[#0E0E0E] py-8">
        <div className="mb-2 flex gap-8">
        </div>
        <p className="font-body text-xs uppercase tracking-wide text-[#E4BEB9] opacity-80">
          © 2024 Developer&apos;s Day. Built for High-Octane Precision.
        </p>
      </footer>
    </div>
  );
}