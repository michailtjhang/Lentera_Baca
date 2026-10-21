import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function LogoIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lanternGlow" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="flameGlow" x1="24" y1="16" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <filter id="glowFilter" x="14" y="10" width="20" height="26" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Rounded Squircle */}
      <rect width="48" height="48" rx="14" fill="url(#lanternGlow)" />

      {/* Subtle Inner Glow */}
      <rect x="1" y="1" width="46" height="46" rx="13" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Top Lantern Ring */}
      <circle cx="24" cy="10" r="3" stroke="#FFF7ED" strokeWidth="1.5" fill="none" />

      {/* Lantern Roof / Cap */}
      <path
        d="M16 14.5C16 13.5 19 12.5 24 12.5C29 12.5 32 13.5 32 14.5L34 17H14L16 14.5Z"
        fill="#FFF7ED"
        fillOpacity="0.95"
      />

      {/* Lantern Glass Body Frame */}
      <path
        d="M15 17L17.5 29H30.5L33 17H15Z"
        fill="rgba(0,0,0,0.18)"
        stroke="#FFF7ED"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Flame / Lantern Light */}
      <path
        d="M24 18C21.5 21 21.5 24 22.5 25.5C23.2 26.5 24.8 26.5 25.5 25.5C26.5 24 26.5 21 24 18Z"
        fill="url(#flameGlow)"
        filter="url(#glowFilter)"
      />

      {/* Flame Inner Core */}
      <circle cx="24" cy="24" r="1.5" fill="#FFFFFF" />

      {/* Base of Lantern */}
      <path
        d="M17 29H31L32 31H16L17 29Z"
        fill="#FFF7ED"
        fillOpacity="0.95"
      />

      {/* Open Book Base (Symbol of Reading / Baca) */}
      <path
        d="M12 37C17 35 21 36 24 38C27 36 31 35 36 37L35 34C30.5 32 26.5 33 24 35C21.5 33 17.5 32 13 34L12 37Z"
        fill="#FFF7ED"
      />
      {/* Book Spine Center Divider */}
      <line x1="24" y1="35" x2="24" y2="38.5" stroke="#92400E" strokeWidth="1" />
    </svg>
  );
}

export default function Logo({
  variant = "full",
  size = "md",
  className = "",
  href = "/",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 26, text: "text-base", sub: "text-[0.55rem]" },
    md: { icon: 34, text: "text-lg", sub: "text-[0.6rem]" },
    lg: { icon: 42, text: "text-2xl", sub: "text-[0.65rem]" },
  };

  const current = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className="shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300 drop-shadow-md">
        <LogoIcon size={current.icon} />
      </div>

      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={`${current.text} font-black tracking-tight text-[#2B1810] dark:text-white transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400`}>
            Lentera Baca
          </span>
          <span className={`${current.sub} font-bold uppercase tracking-[0.22em] text-amber-700/60 dark:text-amber-400/60 mt-0.5`}>
            Terangi Ceritamu
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Lentera Baca - Beranda">
        {content}
      </Link>
    );
  }

  return content;
}
