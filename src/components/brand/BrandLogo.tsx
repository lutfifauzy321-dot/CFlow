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
      <span className="relative flex h-10 w-11 shrink-0 items-center justify-center rounded-xl bg-white/18 px-1.5 border border-white/20 shadow-inner transition-transform group-hover:scale-105">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Logo CFlow"
          className="h-6.5 w-auto object-contain drop-shadow-xs"
        />
      </span>
      {!compact && (
        <span className="text-[21px] font-bold tracking-tight text-white font-sans flex items-center">
          CFlow
        </span>
      )}
    </Link>
  );
}
