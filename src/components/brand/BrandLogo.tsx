import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
};

export function BrandLogo({ href = "/dashboard", compact = false }: BrandLogoProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="inline-flex w-fit items-center gap-2.5 text-current group"
    >
      <span className="relative grid size-9.5 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-xs text-white shadow-inner transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="size-6" fill="none" aria-hidden="true">
          {/* Circular flowing C path */}
          <path
            d="M20 9.5A7.5 7.5 0 1 0 20 22.5"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Dynamic rising arrow */}
          <path
            d="M15 17L23 9M18 9H23V14"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="text-[21px] font-bold tracking-tight text-white font-sans flex items-center">
          CFlow
        </span>
      )}
    </Link>
  );
}
