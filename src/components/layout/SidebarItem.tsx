"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  onNavigate?: () => void;
};

export function SidebarItem({
  href,
  label,
  icon: Icon,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={`group flex h-11 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
        isActive
          ? "bg-white/22 text-white font-semibold backdrop-blur-md shadow-sm border border-white/10"
          : "text-purple-200/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        size={19}
        strokeWidth={isActive ? 2.2 : 1.8}
        className={`shrink-0 transition-transform group-hover:scale-105 ${
          isActive ? "text-white" : "text-purple-200/90"
        }`}
        aria-hidden={true}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}
