import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import AdminLayout from '../components/AdminLayout';

const GALLERY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBW5rgFNVYaVr4QzsrHxYRyv8XUzC6zONL8RROJPyau2uqs1goOyiOYyNNc2SXta_XJ1vYvQwn5KbZC7yVWbieERrZJJdUI5PAJvl2YhKqY3ohGxzmIb5LRyjLyEG0W_W5692x6BKTY_17hDL5x9XjVlxg2FI4wNQDKe8IGSxtT7DAHaW5wb3qv3tQ1OGtNymIYa2G_rE4kbU2fGmfK9gq76iO8d13nRXcHRZn4110byB_BXMBSozjXysw0R2drie3ZdTT5UjKOcd0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8IcEh90_vjJyWku7QQXdFKdBsajT07_kUXvX_HCCLUvkh-lI2KFE24fiiDaexZ7Z9gg1K-T1V_vjaH9r_vZjCJrVHh9xh1B2z7k4TCwOLfsvA6tyjH7IgnL90_AJexcNyMDNBKAzs_O3zU6U27jnEHZCeB2zdx7nnOzGmh8SEzC0NwzDg2JXUsADrlzfBeKW-tD-uPBmwaf6gubvrl7U0T5C9PHbTQD8rI5X8ngPw8U1-6_ZC4yb78XsLsO5nuvsaf7p_ETWjlDo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl37xybqM4V_d4CMJAkzadELGx5HX7IItenY89VS95hZ6ftQTCXMrX17sJbyh94a8erEhgfN69Zn7bDeZmKt95cQGhUM2n4MtkzjSt8ngsdZGziJQutdEvgDqRLdGA0_fxVn40xaD1vd255D0KTpCcrjDbSOBM4dmoYdzPy1_HbsV5yQ8QMPZVN_Z5PFD6j2GRNm0jRKQdaLNTePeUU13BupGk21VFGWYS1r4nEHb5fhtVnbpszzxTxbOeD4l6DwORWwh62Trvbs8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHyOX24Zkf_XOAbnPzsIDkVPHwr3ODLdazP5y7tHZuLrXrKN8LIVDZxcwdRWPpKohuLBfj46Zf2gq--YYQH-qqoPOk8VKtwVpsfwPM9zVLkpiAOt3vr0oLUgMSU910xVqJBjYTk5sGFDzWfl59t5jfOhq1EJIckFTqYYNMhqwWAt337j0_RBvQJ5pDZfewfYY48zA1lIgnRmB8gv6Jfn_mMF4X-jvFzxbiMEY7Kd-gQj2uKOYRf2Nfp39i3WPbcbutHNE3MNsSxpQ',
];

export default function GamesGalleryPage() {
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
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-12">
            <header className="mb-12">
              <h1 className="font-headline text-5xl font-black uppercase leading-none tracking-tighter text-on-surface">
                MINIGAME GALLERY
              </h1>
              <p className="mt-4 max-w-xl border-l-2 border-primary pl-4 font-body text-sm leading-relaxed text-on-surface-variant">
                Access the central registry of deployed modules. Execute
                interface shells or debug system components.
              </p>
            </header>

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
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                        src={game.imageUrl || GALLERY_IMAGES[index % GALLERY_IMAGES.length]}
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
                        {game.location ? (
                          <p className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {game.location}
                          </p>
                        ) : null}
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
        </AdminLayout>
  );
}
