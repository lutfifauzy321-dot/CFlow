"use client";

import Link from "next/link";
import type { ComponentType } from "react";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  activePath: string;
  isNavigatingToThis?: boolean;
  onSelect: (href: string) => void;
};

export function SidebarItem({
  href,
  label,
  icon: Icon,
  activePath,
  isNavigatingToThis,
  onSelect,
}: SidebarItemProps) {
  const isActive =
    activePath === href ||
    (href !== "/dashboard" && activePath.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={() => onSelect(href)}
      aria-current={isActive ? "page" : undefined}
      className={`group flex h-10.5 items-center gap-3 rounded-2xl px-4 text-sm font-medium outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-300/60 transition-all duration-100 active:scale-[0.98] ${
        isActive
          ? "bg-gradient-to-r from-[#7644e8]/90 via-[#6432d4]/85 to-[#5122b8]/85 text-white font-semibold shadow-md shadow-[#12062c]/35 border border-purple-300/35"
          : "text-purple-100/80 hover:bg-[#6e3cdb]/30 hover:text-white border border-transparent"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={isActive ? 2.2 : 1.8}
        className={`shrink-0 ${
          isActive ? "text-white" : "text-purple-200/90 group-hover:text-white"
        }`}
        aria-hidden={true}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {isNavigatingToThis && (
        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
    </Link>
  );
}
