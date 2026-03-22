import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div className="dark overflow-x-hidden bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-outline-variant/10 bg-[#0e0e0e] py-0 text-sm font-medium text-[#E53935] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="font-headline text-xl font-black text-[#E53935] tracking-tighter uppercase">
              Developer&apos;s Day
            </span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden material-symbols-outlined text-xl"
            >
              close
            </button>
          </div>
          <div className="mt-1 font-headline text-[10px] uppercase tracking-tighter text-neutral-500">
            MINIGAME_ROOT
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-2 px-4">
          <NavLink
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-headline uppercase tracking-tighter transition-all duration-150 ease-in-out ${
                isActive
                  ? 'border-l-4 border-[#E53935] bg-[#1c1b1b] text-[#FFB3B3]'
                  : 'text-[#E4BEB9] hover:bg-[#2A2A2A]'
              }`
            }
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/games"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-headline uppercase tracking-tighter transition-all duration-150 ease-in-out ${
                isActive
                  ? 'border-l-4 border-[#E53935] bg-[#1c1b1b] text-[#FFB3B3]'
                  : 'text-[#E4BEB9] hover:bg-[#2A2A2A]'
              }`
            }
          >
            <span className="material-symbols-outlined">sports_esports</span>
            <span>Games</span>
          </NavLink>
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

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b-0 bg-neutral-950/80 px-8 font-headline font-bold backdrop-blur-md md:left-64">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden material-symbols-outlined text-xl text-neutral-100"
          >
            menu
          </button>
          <div className="text-xl font-black text-neutral-100">MINIGAME_COMMAND</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="hidden border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-widest text-red-500 sm:inline-block">
              ADMIN_STATUS:ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="ml-0 min-h-screen bg-surface pt-16 md:ml-64">
        {children}
      </main>
    </div>
  );
}
