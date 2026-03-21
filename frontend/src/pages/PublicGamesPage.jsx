import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import developerDayLogo from '../assets/logo.png';

const GALLERY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBW5rgFNVYaVr4QzsrHxYRyv8XUzC6zONL8RROJPyau2uqs1goOyiOYyNNc2SXta_XJ1vYvQwn5KbZC7yVWbieERrZJJdUI5PAJvl2YhKqY3ohGxzmIb5LRyjLyEG0W_W5692x6BKTY_17hDL5x9XjVlxg2FI4wNQDKe8IGSxtT7DAHaW5wb3qv3tQ1OGtNymIYa2G_rE4kbU2fGmfK9gq76iO8d13nRXcHRZn4110byB_BXMBSozjXysw0R2drie3ZdTT5UjKOcd0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8IcEh90_vjJyWku7QQXdFKdBsajT07_kUXvX_HCCLUvkh-lI2KFE24fiiDaexZ7Z9gg1K-T1V_vjaH9r_vZjCJrVHh9xh1B2z7k4TCwOLfsvA6tyjH7IgnL90_AJexcNyMDNBKAzs_O3zU6U27jnEHZCeB2zdx7nnOzGmh8SEzC0NwzDg2JXUsADrlzfBeKW-tD-uPBmwaf6gubvrl7U0T5C9PHbTQD8rI5X8ngPw8U1-6_ZC4yb78XsLsO5nuvsaf7p_ETWjlDo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl37xybqM4V_d4CMJAkzadELGx5HX7IItenY89VS95hZ6ftQTCXMrX17sJbyh94a8erEhgfN69Zn7bDeZmKt95cQGhUM2n4MtkzjSt8ngsdZGziJQutdEvgDqRLdGA0_fxVn40xaD1vd255D0KTpCcrjDbSOBM4dmoYdzPy1_HbsV5yQ8QMPZVN_Z5PFD6j2GRNm0jRKQdaLNTePeUU13BupGk21VFGWYS1r4nEHb5fhtVnbpszzxTxbOeD4l6DwORWwh62Trvbs8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHyOX24Zkf_XOAbnPzsIDkVPHwr3ODLdazP5y7tHZuLrXrKN8LIVDZxcwdRWPpKohuLBfj46Zf2gq--YYQH-qqoPOk8VKtwVpsfwPM9zVLkpiAOt3vr0oLUgMSU910xVqJBjYTk5sGFDzWfl59t5jfOhq1EJIckFTqYYNMhqwWAt337j0_RBvQJ5pDZfewfYY48zA1lIgnRmB8gv6Jfn_mMF4X-jvFzxbiMEY7Kd-gQj2uKOYRf2Nfp39i3WPbcbutHNE3MNsSxpQ',
];

export default function PublicGamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get('/minigames');
        setGames(res.data || []);
      } catch {
        setError('Failed to load games gallery.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-fixed">
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
            className="px-3 py-1 font-headline font-bold uppercase tracking-tighter text-[#E4BEB9] transition-colors duration-200 hover:bg-[#2A2A2A]"
            to="/"
          >
            Leaderboard
          </Link>
          <Link
            className="border-b-2 border-[#E53935] font-headline font-bold uppercase tracking-tighter text-[#E5E2E1]"
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

      <main className="no-scrollbar overflow-y-auto bg-background pt-16">
        <section className="leaderboard-hero-gradient relative overflow-hidden border-b border-outline-variant/15 px-6 py-20">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="h-full w-full translate-x-1/2 -translate-y-1/2 rotate-45 transform border-b-[100px] border-r-[100px] border-primary"></div>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="h-[2px] w-8 bg-primary"></span>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                System Explorer
              </span>
            </div>
            <h1 className="mb-6 font-headline text-6xl font-black uppercase leading-none tracking-tighter text-on-surface md:text-8xl">
              Minigame <br />
              <span className="gradient-text">
                Gallery
              </span>
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant">
              Access the central registry of deployed modules. Execute
              interface shells or debug system components.
            </p>
          </div>
        </section>

        <section className="bg-surface px-6 py-12">
          <div className="mx-auto max-w-7xl">

          {loading ? (
            <div className="border border-outline-variant/10 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
              Loading games…
            </div>
          ) : null}

          {error ? (
            <div className="border border-outline-variant/10 bg-surface-container-lowest p-6 text-sm text-error">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="grid grid-cols-1 gap-4">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  className="group flex flex-col border border-outline-variant/10 bg-surface-container-lowest transition-all duration-300 hover:border-primary/40 md:flex-row"
                >
                  <div className="h-48 w-full overflow-hidden bg-surface-container-low md:h-auto md:w-48">
                    <img
                      alt={game.name}
                      className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      src={GALLERY_IMAGES[index % GALLERY_IMAGES.length]}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-on-surface">
                          {game.name}
                        </h3>
                      </div>
                      <p className="line-clamp-2 text-sm text-on-surface-variant">
                        {game.description ||
                          'No description available for this deployed module yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {games.length === 0 ? (
                <div className="border border-outline-variant/10 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
                  No minigames found.
                </div>
              ) : null}
            </div>
          ) : null}
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
