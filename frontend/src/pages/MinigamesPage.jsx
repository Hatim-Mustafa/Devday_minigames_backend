import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

const DEFAULT_PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ9NNQ-CYDqz7lFsyYUSS_kZfjZrPZhCRK4NdCDBfGUNg-P0roJHyAJJttg9KIE3yiXHVTKeduXODEUbOlnP7sFSSnOTav2Jf_jpbHGhHOwuwSCa2HIetcyQVeyYglw85AwGajddwqu0Jh9CATtEKIQmRWLtMpo8Tcu5sLgnt6sY331XFsBETqPY3Gr9E-mC-pI236FdtqzS7wRnKwsLhm3841mHVzLDp4C-18frHFKB-9DUgnnxVcvrI7Wc9w0X0OFke3CyKVdks';

export default function MinigamesPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [formError, setFormError] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setCoverImage(null);
    setCoverPreview('');
    setFormError('');
    setCopyMessage('');
    setNewApiKey('');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setCopyMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/minigames', { name, description });
      setNewApiKey(res.data?.apiKey || '');
      setName('');
      setDescription('');
      setCoverImage(null);
      setCoverPreview('');
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to register minigame.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!newApiKey) return;

    try {
      await navigator.clipboard.writeText(newApiKey);
      setCopyMessage('API key copied. Store it safely now.');
    } catch {
      setCopyMessage('Copy failed. Please copy it manually.');
    }
  };

  return (
    <div className="dark h-screen overflow-hidden bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-fixed">
      <div className="flex h-screen">
        {/* <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-outline-variant/10 bg-[#0e0e0e] py-0 text-sm font-medium text-[#E53935]">
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
              className="flex items-center gap-3 px-4 py-3 font-headline uppercase tracking-tighter text-[#E4BEB9] transition-all duration-150 ease-in-out hover:bg-[#2A2A2A]"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/minigames/new"
              className="flex items-center gap-3 border-l-4 border-[#E53935] bg-[#1c1b1b] px-4 py-3 font-headline uppercase tracking-tighter text-[#FFB3B3] transition-all duration-150 ease-in-out"
            >
              <span className="material-symbols-outlined">sports_esports</span>
              <span>Games</span>
            </Link>
          </nav>

          <div className="mt-auto p-4">
            <div className="mb-4 flex items-center gap-3 bg-surface-container-low p-4">
              <div className="flex h-10 w-10 items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-on-surface-variant">
                  person
                </span>
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
        </aside> */}

        <main className="no-scrollbar flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-5xl p-12">
            <div className="mb-12">
              <Link
                to="/admin/dashboard"
                className="mb-4 flex items-center gap-2 text-primary"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  Back to Dashboard
                </span>
              </Link>
              <h1 className="font-headline text-5xl font-black uppercase leading-none tracking-tighter text-on-surface">
                Register New Minigame
              </h1>
              <p className="mt-4 max-w-2xl border-l-2 border-primary pl-4 font-body text-on-surface-variant">
                Deploy your latest creation to the global event terminal. Ensure
                all technical specifications are met for high-performance
                integration.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8">
                <form className="space-y-8" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="gameName">
                      Game Title
                    </label>
                    <input
                      id="gameName"
                      className="w-full border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface transition-colors placeholder:text-surface-container-highest focus:border-primary focus:ring-0"
                      placeholder="e.g. Cyber Runner 2077"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="gameDesc">
                      Description
                    </label>
                    <textarea
                      id="gameDesc"
                      className="w-full resize-none border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface transition-colors placeholder:text-surface-container-highest focus:border-primary focus:ring-0"
                      placeholder="Detailed game mechanics and instructions..."
                      rows="8"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="coverUpload">
                      Upload Cover Image
                    </label>
                    <label
                      htmlFor="coverUpload"
                      className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-8 text-center transition-colors hover:bg-surface-container-high"
                    >
                      <span className="material-symbols-outlined mb-4 text-4xl text-on-surface-variant group-hover:text-primary">
                        cloud_upload
                      </span>
                      <p className="text-sm font-medium text-on-surface">
                        Drag and drop game art here
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        PNG, JPG up to 10MB (16:9 Recommended)
                      </p>
                    </label>
                    <input
                      id="coverUpload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  {formError ? (
                    <p className="text-sm text-error">{formError}</p>
                  ) : null}

                  {newApiKey ? (
                    <div className="border border-outline-variant/20 bg-surface-container-low p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                        New API Key (shown once)
                      </p>
                      <p className="break-all bg-surface-container-lowest p-3 font-mono text-sm text-on-surface">
                        {newApiKey}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCopyApiKey}
                          className="bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-highest"
                        >
                          Copy API Key
                        </button>
                        {copyMessage ? (
                          <p className="text-xs text-on-surface-variant">{copyMessage}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-6 border-t border-outline-variant/15 pt-8">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="!bg-gradient-to-r !from-primary !to-primary-container px-10 py-4 text-sm font-black uppercase tracking-tighter text-on-primary-fixed transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Registering…' : 'Register Game'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="col-span-12 space-y-6 lg:col-span-4">
                <div className="border-l-4 border-primary bg-surface-container-low p-8">
                  <h3 className="mb-4 font-headline text-lg font-bold uppercase text-on-surface">
                    Registration Specs
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <span
                        className="material-symbols-outlined text-lg text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <p className="text-xs leading-relaxed text-on-surface-variant">
                        <strong className="text-on-surface">Resolution:</strong>{' '}
                        Assets must be high-fidelity (min 1920x1080).
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <span
                        className="material-symbols-outlined text-lg text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <p className="text-xs leading-relaxed text-on-surface-variant">
                        <strong className="text-on-surface">Format:</strong>{' '}
                        Web-ready packages only (WebGL/WASM).
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <span
                        className="material-symbols-outlined text-lg text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <p className="text-xs leading-relaxed text-on-surface-variant">
                        <strong className="text-on-surface">Review:</strong>{' '}
                        Submission enters queue for technical audit immediately
                        after registration.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="border border-outline-variant/10 bg-surface-container-lowest p-8">
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
                    Preview
                  </h4>
                  <div className="group relative flex aspect-video items-center justify-center overflow-hidden bg-surface-container-high">
                    <img
                      className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale transition-all duration-500 group-hover:grayscale-0"
                      src={coverPreview || DEFAULT_PREVIEW_IMAGE}
                      alt="Game preview"
                    />
                    <div className="z-10 px-4 text-center">
                      <span className="material-symbols-outlined mb-2 text-4xl text-on-surface-variant">
                        image_not_supported
                      </span>
                      <p className="text-xs font-bold uppercase tracking-tighter text-on-surface">
                        Live Card Preview
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-auto flex w-full flex-col items-center justify-center gap-4 border-t border-[#5B403D]/15 bg-background py-8 font-['Inter'] text-xs uppercase tracking-wide text-[#E53935]">
            <div className="flex gap-8">
            </div>
            <p className="opacity-60">
              © 2024 Developer&apos;s Day. Built for High-Octane Precision.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
