import { useState } from 'react';
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
        </nav>
      </div>
    </header>
  );
}