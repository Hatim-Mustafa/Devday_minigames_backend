import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import developerDayLogo from '../assets/logo.png';

export default function PublicTopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-none bg-[#131313]">
      <div className="flex h-16 items-center justify-between px-6">
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

        <div className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'border-b-2 border-[#E53935] font-headline font-bold uppercase tracking-tighter text-[#E5E2E1]'
                : 'px-3 py-1 font-headline font-bold uppercase tracking-tighter text-[#E4BEB9] transition-colors duration-200 hover:bg-[#2A2A2A]'
            }
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/games"
            className={({ isActive }) =>
              isActive
                ? 'border-b-2 border-[#E53935] font-headline font-bold uppercase tracking-tighter text-[#E5E2E1]'
                : 'px-3 py-1 font-headline font-bold uppercase tracking-tighter text-[#E4BEB9] transition-colors duration-200 hover:bg-[#2A2A2A]'
            }
          >
            Games
          </NavLink>
        </div>

        <div className="hidden items-center gap-4 md:flex md:gap-6">
          <div className="hidden items-center gap-2 border border-outline-variant/20 bg-surface-container-low/50 px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Status: Public_Access
            </span>
          </div>
          <Link
            className="inline-block bg-gradient-to-r from-[#E53935] to-[#B71C1C] px-6 py-2 font-['Space_Grotesk'] text-xs font-black uppercase tracking-tighter text-white shadow-[0_0_15px_rgba(229,57,53,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(229,57,53,0.5)] active:scale-95"
            to="/login"
          >
            Elevate Status
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="material-symbols-outlined text-2xl text-[#E4BEB9] md:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? 'close' : 'menu'}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-outline-variant/10 bg-[#131313] transition-all duration-300 md:hidden ${
          menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-2 p-4">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 text-center font-headline font-bold uppercase tracking-tighter transition-colors duration-200 ${
                isActive
                  ? 'border-t-2 border-[#E53935] bg-[#1c1b1b] text-[#FFB3B3]'
                  : 'text-[#E4BEB9] hover:bg-[#2A2A2A]'
              }`
            }
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/games"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 text-center font-headline font-bold uppercase tracking-tighter transition-colors duration-200 ${
                isActive
                  ? 'border-t-2 border-[#E53935] bg-[#1c1b1b] text-[#FFB3B3]'
                  : 'text-[#E4BEB9] hover:bg-[#2A2A2A]'
              }`
            }
          >
            Games
          </NavLink>
          <div className="mt-1 flex justify-center">
            <div className="inline-flex items-center gap-2 border border-outline-variant/20 bg-surface-container-low/50 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Status: Public_Access
              </span>
            </div>
          </div>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-block bg-gradient-to-r from-[#E53935] to-[#B71C1C] px-6 py-2 text-center font-['Space_Grotesk'] text-xs font-black uppercase tracking-tighter text-white shadow-[0_0_15px_rgba(229,57,53,0.3)] transition-all duration-200 hover:shadow-[0_0_20px_rgba(229,57,53,0.5)]"
          >
            Elevate Status
          </Link>
        </nav>
      </div>
    </header>
  );
}