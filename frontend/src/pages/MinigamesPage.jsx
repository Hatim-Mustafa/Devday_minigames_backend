import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

const DEFAULT_PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ9NNQ-CYDqz7lFsyYUSS_kZfjZrPZhCRK4NdCDBfGUNg-P0roJHyAJJttg9KIE3yiXHVTKeduXODEUbOlnP7sFSSnOTav2Jf_jpbHGhHOwuwSCa2HIetcyQVeyYglw85AwGajddwqu0Jh9CATtEKIQmRWLtMpo8Tcu5sLgnt6sY331XFsBETqPY3Gr9E-mC-pI236FdtqzS7wRnKwsLhm3841mHVzLDp4C-18frHFKB-9DUgnnxVcvrI7Wc9w0X0OFke3CyKVdks';

export default function MinigamesPage() {
  const navigate = useNavigate();
  const { id: minigameId } = useParams();
  const isEditMode = Boolean(minigameId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [formError, setFormError] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchMinigame = async () => {
      try {
        setLoadingExisting(true);
        setFormError('');
        const res = await api.get(`/minigames/${minigameId}`);
        const game = res.data || {};
        setName(game.name || '');
        setDescription(game.description || '');
        setLocation(game.location || '');
        setCoverPreview(game.imageUrl || '');
      } catch {
        setFormError('Failed to load minigame details.');
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchMinigame();
  }, [isEditMode, minigameId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setLocation('');
    setCoverImage(null);
    setCoverPreview('');
    setFormError('');
    setCopyMessage('');
    setNewApiKey('');
    navigate('/admin/dashboard');
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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (location) {
        formData.append('location', location);
      }
      if (coverImage) {
        formData.append('image', coverImage);
      }

      if (isEditMode) {
        await api.put(`/minigames/${minigameId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate('/admin/dashboard');
      } else {
        const res = await api.post('/minigames', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setNewApiKey(res.data?.apiKey || '');
        setName('');
        setDescription('');
        setLocation('');
        setCoverImage(null);
        setCoverPreview('');
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          (isEditMode ? 'Failed to update minigame.' : 'Failed to register minigame.')
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
    <div className="dark min-h-screen bg-background text-on-surface font-body">
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
            {isEditMode ? 'Edit Minigame' : 'Register New Minigame'}
          </h1>
          <p className="mt-4 max-w-2xl border-l-2 border-primary pl-4 font-body text-on-surface-variant">
            {isEditMode
              ? 'Update configuration for this minigame and apply changes to the registry.'
              : 'Deploy your latest creation to the global event terminal. Ensure all technical specifications are met for high-performance integration.'}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <form className="space-y-8" onSubmit={handleRegister} autoComplete="off">
              <input type="text" name="fake-user" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
              <input type="password" name="fake-pass" autoComplete="new-password" className="hidden" tabIndex={-1} aria-hidden="true" />
              {loadingExisting ? (
                <p className="text-sm text-on-surface-variant">Loading minigame details…</p>
              ) : null}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="gameName">
                  Game Title
                </label>
                <input
                  id="gameName"
                  name="minigame-title"
                  className="w-full border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface transition-colors placeholder:text-surface-container-highest focus:border-primary focus:ring-0"
                  placeholder="e.g. Cyber Runner 2077"
                  type="text"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
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
                  name="minigame-description"
                  className="w-full resize-none border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface transition-colors placeholder:text-surface-container-highest focus:border-primary focus:ring-0"
                  placeholder="Detailed game mechanics and instructions..."
                  rows="8"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="gameLocation">
                  Location <span className="text-on-surface-variant">(Optional)</span>
                </label>
                <input
                  id="gameLocation"
                  name="minigame-location"
                  className="w-full border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface transition-colors placeholder:text-surface-container-highest focus:border-primary focus:ring-0"
                  placeholder="e.g. Lab 201, Auditorium, Campus Ground"
                  type="text"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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

                  {newApiKey && !isEditMode ? (
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
                      disabled={submitting || loadingExisting}
                      className="!bg-gradient-to-r !from-primary !to-primary-container px-10 py-4 text-sm font-black uppercase tracking-tighter text-on-primary-fixed transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? isEditMode
                          ? 'Updating…'
                          : 'Registering…'
                        : isEditMode
                          ? 'Update Game'
                          : 'Register Game'}
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
                      className="absolute inset-0 h-full w-full object-cover opacity-30"
                      src={coverPreview || DEFAULT_PREVIEW_IMAGE}
                      alt="Game preview"
                    />
                    <div className="z-10 px-4 text-center transition-opacity duration-200 group-hover:opacity-0">
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

          <footer className="mt-auto flex w-full flex-col items-center justify-center gap-4 border-t border-[#5B403D]/15 bg-background py-8 font-['Inter'] text-xs uppercase tracking-wide text-[#E53935]">
            <div className="flex gap-8">
            </div>
            <p className="opacity-60">
              © 2024 Developer&apos;s Day. Built for High-Octane Precision.
            </p>
          </footer>
        </div>
      </div>
    );
  }
