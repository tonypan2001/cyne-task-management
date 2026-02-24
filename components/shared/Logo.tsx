import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "w-10 h-10" }: LogoProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="shapeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="12"
            floodColor="#000000"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* Background Squircle */}
      <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />

      {/* Top Left Square */}
      <rect
        x="136"
        y="136"
        width="104"
        height="104"
        rx="32"
        fill="url(#shapeGrad)"
        filter="url(#shadow)"
      />

      {/* Top Right Square */}
      <rect
        x="272"
        y="136"
        width="104"
        height="104"
        rx="32"
        fill="url(#shapeGrad)"
        filter="url(#shadow)"
      />

      {/* Bottom Left Square */}
      <rect
        x="136"
        y="272"
        width="104"
        height="104"
        rx="32"
        fill="url(#shapeGrad)"
        filter="url(#shadow)"
      />

      {/* Bottom Right Checkmark */}
      <path
        d="M 280 320 L 316 356 L 384 276"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#shadow)"
      />
    </svg>
  );
};
