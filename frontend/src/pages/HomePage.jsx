import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import PublicTopNav from '../components/PublicTopNav';

const GALLERY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBW5rgFNVYaVr4QzsrHxYRyv8XUzC6zONL8RROJPyau2uqs1goOyiOYyNNc2SXta_XJ1vYvQwn5KbZC7yVWbieERrZJJdUI5PAJvl2YhKqY3ohGxzmIb5LRyjLyEG0W_W5692x6BKTY_17hDL5x9XjVlxg2FI4wNQDKe8IGSxtT7DAHaW5wb3qv3tQ1OGtNymIYa2G_rE4kbU2fGmfK9gq76iO8d13nRXcHRZn4110byB_BXMBSozjXysw0R2drie3ZdTT5UjKOcd0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8IcEh90_vjJyWku7QQXdFKdBsajT07_kUXvX_HCCLUvkh-lI2KFE24fiiDaexZ7Z9gg1K-T1V_vjaH9r_vZjCJrVHh9xh1B2z7k4TCwOLfsvA6tyjH7IgnL90_AJexcNyMDNBKAzs_O3zU6U27jnEHZCeB2zdx7nnOzGmh8SEzC0NwzDg2JXUsADrlzfBeKW-tD-uPBmwaf6gubvrl7U0T5C9PHbTQD8rI5X8ngPw8U1-6_ZC4yb78XsLsO5nuvsaf7p_ETWjlDo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl37xybqM4V_d4CMJAkzadELGx5HX7IItenY89VS95hZ6ftQTCXMrX17sJbyh94a8erEhgfN69Zn7bDeZmKt95cQGhUM2n4MtkzjSt8ngsdZGziJQutdEvgDqRLdGA0_fxVn40xaD1vd255D0KTpCcrjDbSOBM4dmoYdzPy1_HbsV5yQ8QMPZVN_Z5PFD6j2GRNm0jRKQdaLNTePeUU13BupGk21VFGWYS1r4nEHb5fhtVnbpszzxTxbOeD4l6DwORWwh62Trvbs8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHyOX24Zkf_XOAbnPzsIDkVPHwr3ODLdazP5y7tHZuLrXrKN8LIVDZxcwdRWPpKohuLBfj46Zf2gq--YYQH-qqoPOk8VKtwVpsfwPM9zVLkpiAOt3vr0oLUgMSU910xVqJBjYTk5sGFDzWfl59t5jfOhq1EJIckFTqYYNMhqwWAt337j0_RBvQJ5pDZfewfYY48zA1lIgnRmB8gv6Jfn_mMF4X-jvFzxbiMEY7Kd-gQj2uKOYRf2Nfp39i3WPbcbutHNE3MNsSxpQ',
];

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [leaderboardsByGameId, setLeaderboardsByGameId] = useState({});
  const [selectedGameId, setSelectedGameId] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      setError('');

      try {
        const gamesRes = await api.get('/minigames');
        setGames(gamesRes.data || []);
      } catch {
        setError('Failed to load minigames. Please try again.');
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (!selectedGameId) return;
    if (leaderboardsByGameId[selectedGameId]) return;

    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const boardRes = await api.get(`/scores/leaderboard/${selectedGameId}`);
        setLeaderboardsByGameId((prev) => ({
          ...prev,
          [selectedGameId]: {
            leaderboard: boardRes.data?.leaderboard || [],
            failed: false,
          },
        }));
      } catch {
        setLeaderboardsByGameId((prev) => ({
          ...prev,
          [selectedGameId]: {
            leaderboard: [],
            failed: true,
          },
        }));
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGameId, leaderboardsByGameId]);

  const flattenedLeaderboard = useMemo(() => {
    if (!selectedGameId) return [];

    const boardData = leaderboardsByGameId[selectedGameId];
    if (!boardData || boardData.failed || !boardData.leaderboard) return [];

    return boardData.leaderboard
      .map((entry) => ({
        gameId: selectedGameId,
        userCode: entry.userCode,
        score: Number(entry.score) || 0,
        playTime: Number(entry.playTime) || 0,
        updatedAt: entry.updatedAt,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.playTime !== b.playTime) return a.playTime - b.playTime;
        return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
      })
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [leaderboardsByGameId, selectedGameId]);

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId) || null,
    [games, selectedGameId]
  );

  const visibleLeaderboard = showAllRows
    ? flattenedLeaderboard
    : flattenedLeaderboard.slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <PublicTopNav />

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

        <section id="games" className="bg-surface px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-left">
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight text-on-surface">
                Minigame Modules
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Select any module to open its dedicated leaderboard feed.
              </p>
            </div>

            {loadingGames ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                Loading games…
              </div>
            ) : null}

            {!loadingGames && error ? (
              <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-error">
                {error}
              </div>
            ) : null}

            {!loadingGames && !error ? (
              <div className="grid grid-cols-1 gap-4">
                {games.map((game, index) => {
                  const isSelected = game.id === selectedGameId;
                  return (
                    <div
                      key={game.id}
                      className={`group flex flex-col border bg-surface-container-lowest transition-all duration-300 md:flex-row ${
                        isSelected
                          ? 'border-primary/70 shadow-[0_0_0_1px_rgba(229,57,53,0.25)]'
                          : 'border-outline-variant/10 hover:border-primary/40'
                      }`}
                    >
                      <div className="h-48 w-full overflow-hidden bg-surface-container-low md:h-auto md:w-48">
                        <img
                          alt={game.name}
                          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                          src={game.imageUrl || GALLERY_IMAGES[index % GALLERY_IMAGES.length]}
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                        <div>
                          <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-on-surface">
                            {game.name}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                            {game.description ||
                              'No description available for this deployed module yet.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedGameId(game.id)}
                          className="inline-flex items-center gap-2 border border-outline-variant/25 px-4 py-2 font-label text-[11px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high"
                        >
                          View Leaderboard
                          <span className="material-symbols-outlined text-sm">
                            arrow_outward
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {games.length === 0 ? (
                  <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                    No minigames found.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {selectedGameId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-surface-container-low shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-lowest p-6">
                <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface">
                  {selectedGame?.name} Leaderboard
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedGameId('')}
                  className="flex h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Close leaderboard"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <div className="p-6">
                {loadingLeaderboard ? (
                  <div className="border border-outline-variant/10 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
                    Loading leaderboard…
                  </div>
                ) : null}

                {selectedGameId && leaderboardsByGameId[selectedGameId]?.failed ? (
                  <div className="border border-outline-variant/10 bg-surface-container-lowest p-6 text-sm text-error">
                    Failed to load leaderboard for this game. Please try another module.
                  </div>
                ) : null}

                {selectedGameId &&
                !loadingLeaderboard &&
                !leaderboardsByGameId[selectedGameId]?.failed ? (
                  <>
                    <div className="overflow-hidden bg-surface-container-lowest">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-surface-container-high">
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
            </div>
          </div>
        ) : null}

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

      <footer className="mt-auto flex w-full flex-col items-center justify-center gap-2 border-t border-[#5B403D]/15 bg-[#0E0E0E] py-5 sm:gap-4 sm:py-8">
        <div className="mb-1 flex gap-8 sm:mb-2">
        </div>
        <p className="font-body text-[10px] uppercase tracking-wide text-[#E4BEB9] opacity-80 sm:text-xs">
          © 2026 Developer&apos;s Day. Built for High-Octane Precision.
        </p>
      </footer>
    </div>
  );
}