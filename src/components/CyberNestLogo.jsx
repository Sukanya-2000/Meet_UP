export default function CyberNestLogo({ className = 'h-9 w-9', showText = false }) {
  return (
    <span className={`inline-flex items-center gap-2 ${showText ? '' : className}`}>
      <svg viewBox="0 0 64 64" className={showText ? 'h-9 w-9' : 'h-full w-full'} fill="none" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill="url(#cn-bg)" />
        <path d="M18 31c-6-8 0-18 10-14 3 1 6 4 8 7 2-3 5-6 8-7 10-4 16 6 10 14L36 51 18 31Z" stroke="url(#cn-line)" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 47c12 7 27-4 32-20" stroke="url(#cn-line)" strokeWidth="4.8" strokeLinecap="round" />
        <path d="M16 22c11 14 21 22 35 26" stroke="url(#cn-line2)" strokeWidth="4.8" strokeLinecap="round" />
        <defs>
          <linearGradient id="cn-bg" x1="6" x2="58" y1="4" y2="60">
            <stop stopColor="#FFF7ED" />
            <stop offset="1" stopColor="#FFE4E6" />
          </linearGradient>
          <linearGradient id="cn-line" x1="12" x2="55" y1="12" y2="56">
            <stop stopColor="#FB7185" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="cn-line2" x1="14" x2="52" y1="18" y2="50">
            <stop stopColor="#C084FC" />
            <stop offset="1" stopColor="#FB7185" />
          </linearGradient>
        </defs>
      </svg>
      {showText && <span className="font-['Playfair_Display'] text-xl font-extrabold text-slate-800">CyberNest</span>}
    </span>
  );
}
