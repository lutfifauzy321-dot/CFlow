import { CheckCircle2 } from "lucide-react";

type DashboardGreetingBannerProps = {
  userName: string;
};

export function DashboardGreetingBanner({ userName }: DashboardGreetingBannerProps) {
  const firstName = userName.split(" ")[0] || "David";

  return (
    <section className="relative overflow-visible pt-2 pb-4 sm:py-5">
      {/* Background panoramic fluid waves - smoothly masked on the left so there is ZERO hard cutoff */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[90%] lg:w-[75%] select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_30%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_30%)]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 900 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gWave1" x1="0" y1="20" x2="900" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--hero-wave-1)" stopOpacity="0.95" />
              <stop offset="60%" stopColor="var(--hero-wave-2)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--hero-wave-3)" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="gWave2" x1="100" y1="30" x2="900" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--hero-wave-2)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--hero-wave-3)" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gWave3" x1="300" y1="10" x2="900" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--hero-wave-soft)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--hero-wave-1)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Top gentle flowing wave crest */}
          <path
            d="M0 50 C200 15 350 95 520 50 C680 15 780 70 900 30 V240 H0 Z"
            fill="url(#gWave3)"
          />

          {/* Middle fluid contour swooping under badge & behind wallet */}
          <path
            d="M80 115 C220 60 380 145 550 95 C700 50 800 110 900 75 V240 H80 Z"
            fill="url(#gWave1)"
          />

          {/* Foreground hill / pedestal supporting the wallet */}
          <path
            d="M360 170 C480 120 610 160 720 135 C810 115 850 140 900 130 V240 H360 Z"
            fill="url(#gWave2)"
          />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left Column: Greeting & Copy */}
        <div className="max-w-md lg:max-w-xl space-y-2">
          <p className="text-sm sm:text-base font-semibold text-foreground-soft flex items-center gap-1.5">
            Halo, {firstName} <span className="inline-block animate-bounce">👋</span>
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight text-foreground font-sans leading-[1.18]">
            Atur arus uangmu <br className="hidden sm:inline" />
            dengan lebih mudah
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-sm">
            Pantau saldo, atur anggaran, dan capai tujuan finansialmu.
          </p>
        </div>

        {/* Right Column: Health Status Pill Badge + 3D Wallet & Coins with generous breathing room */}
        <div className="relative flex items-center justify-between sm:justify-end gap-5 sm:gap-8 lg:gap-12 shrink-0 pr-4 sm:pr-8 lg:pr-12">
          {/* Health Status Pill Badge matching reference crop */}
          <div className="flex items-center gap-3 rounded-full bg-white dark:bg-[#1a1438] px-4 sm:px-5 py-2.5 text-xs font-semibold text-foreground shadow-[0_8px_24px_rgba(100,60,200,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-purple-100/80 dark:border-purple-800/40 backdrop-blur-md transition-transform hover:scale-105 shrink-0">
            <span className="grid size-6 sm:size-7 place-items-center rounded-full bg-emerald-500 text-white shrink-0 shadow-xs">
              <CheckCircle2 size={16} strokeWidth={2.8} />
            </span>
            <div className="leading-tight text-left">
              <p className="text-[12px] sm:text-[13px] font-bold text-foreground font-sans">
                Finansial sehat,
              </p>
              <p className="text-[11px] sm:text-[12px] text-muted font-normal">
                hidup lebih tenang
              </p>
            </div>
          </div>

          {/* 3D Purple Wallet & Floating Golden Coins Illustration */}
          <div className="relative select-none shrink-0 py-2">
            {/* Diffuse soft ground shadow beneath the wallet */}
            <div className="absolute bottom-0 left-4 right-6 h-5 rounded-full bg-purple-950/20 dark:bg-purple-500/15 blur-lg" />

            {/* Floating Gold Coin 1 (top-left) */}
            <div className="absolute -left-4 -top-1.5 size-7 sm:size-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-lg shadow-amber-500/30 border-2 border-yellow-100 flex items-center justify-center animate-bounce duration-1000 z-20">
              <div className="size-3.5 sm:size-4 rounded-full border border-amber-600/40 bg-amber-400/20" />
            </div>

            {/* Floating Gold Coin 2 (top-right) */}
            <div className="absolute -right-3 -top-2 size-8 sm:size-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-xl shadow-amber-500/30 border-2 border-yellow-100 flex items-center justify-center rotate-12 z-20">
              <div className="size-4 sm:size-4.5 rounded-full border border-amber-600/40 bg-amber-400/20" />
            </div>

            {/* 3D Purple Wallet SVG with ample viewBox so nothing is clipped */}
            <div className="relative size-24 sm:size-28 drop-shadow-2xl transition-transform hover:rotate-2 duration-300">
              <svg viewBox="0 0 140 125" fill="none" className="size-full overflow-visible">
                <defs>
                  <linearGradient id="wGradBody" x1="20" y1="20" x2="115" y2="110" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6D3BD9" />
                    <stop offset="1" stopColor="#4A1F9E" />
                  </linearGradient>
                  <linearGradient id="wGradPocket" x1="25" y1="28" x2="110" y2="105" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7E4BE8" />
                    <stop offset="1" stopColor="#582AB5" />
                  </linearGradient>
                  <linearGradient id="wGradFlap" x1="25" y1="18" x2="100" y2="65" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8C58F7" />
                    <stop offset="1" stopColor="#6331C4" />
                  </linearGradient>
                  <linearGradient id="wGradStrap" x1="98" y1="50" x2="118" y2="82" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5428B8" />
                    <stop offset="1" stopColor="#3A1485" />
                  </linearGradient>
                </defs>

                {/* Main Back Body (tilted ~ -8 deg, comfortably centered inside 140x125 box) */}
                <rect
                  x="20"
                  y="26"
                  width="92"
                  height="76"
                  rx="20"
                  fill="url(#wGradBody)"
                  transform="rotate(-8 66 64)"
                />

                {/* Front Pocket Layer */}
                <rect
                  x="24"
                  y="30"
                  width="90"
                  height="74"
                  rx="18"
                  fill="url(#wGradPocket)"
                  transform="rotate(-8 66 64)"
                />

                {/* Wallet Flap with smooth curve */}
                <path
                  d="M24 34 C24 25 32 20 40 20 H94 C102 20 108 25 108 34 V52 C108 59 102 64 96 64 H36 C29 64 24 59 24 52 V34 Z"
                  fill="url(#wGradFlap)"
                  transform="rotate(-8 66 64)"
                />

                {/* Side Strap Loop on right edge matching screenshot */}
                <path
                  d="M103 54 C111 53 118 60 117 69 C116 77 108 81 101 80"
                  stroke="url(#wGradStrap)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  transform="rotate(-8 66 64)"
                />

                {/* Golden Clasp Button with radial highlight */}
                <g transform="rotate(-8 66 64)">
                  <circle cx="83" cy="54" r="6.5" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="2.2" />
                  <circle cx="83" cy="54" r="3.2" fill="#D97706" />
                  <circle cx="81.2" cy="52.2" r="1.3" fill="#FFFFFF" opacity="0.9" />
                </g>
              </svg>
            </div>

            {/* Decorative Purple Leaf Sprig matching reference crop */}
            <div className="absolute top-14 -right-4 size-7 select-none pointer-events-none">
              <svg viewBox="0 0 28 28" fill="none" className="size-full">
                <path
                  d="M4 24 C10 22, 18 16, 24 6 C24 14, 18 22, 4 24 Z"
                  fill="#7c5dfa"
                  opacity="0.9"
                />
                <path
                  d="M8 26 C14 24, 20 20, 26 14 C26 20, 20 26, 8 26 Z"
                  fill="#5b3fc8"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
