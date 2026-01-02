
import React from "react";

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large" | "xl";
  variant?: "icon" | "full" | "light";
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "medium",
  variant = "full",
}) => {
  const sizeClasses = {
    small: "h-12",
    medium: "h-20",
    large: "h-32",
    xl: "h-48 md:h-64",
  };

  const containerHeight = sizeClasses[size];
  const isLight = variant === "light";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={containerHeight}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="شعار المجلس للتباين العالي"
      >
        <defs>
          <linearGradient id="srcDomeGradient" x1="256" y1="150" x2="256" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor={isLight ? "#7A968D" : "#5B7A70"} /> 
            <stop offset="1" stopColor={isLight ? "#3D5A50" : "#2D463E"} />
          </linearGradient>
          
          <filter id="srcOuterGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor={isLight ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"} result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M140 230 C140 150 372 150 372 230 Z"
          fill="url(#srcDomeGradient)"
          stroke={isLight ? "#D4AF37" : "#1A2E28"}
          strokeWidth={isLight ? "10" : "8"}
          strokeLinejoin="round"
          filter="url(#srcOuterGlow)"
        />

        <rect
          x="100"
          y="230"
          width="312"
          height="110"
          rx="18"
          fill="#FFFFFF"
          stroke={isLight ? "#D4AF37" : "#B18154"}
          strokeWidth="6"
        />

        <g opacity="0.9">
          <rect x="120" y="245" width="272" height="12" rx="4" fill="#F2F0EA" />
          <rect x="236" y="260" width="40" height="65" rx="6" fill="#F2F0EA" />
          <g stroke={isLight ? "#D4AF37" : "#E3DED1"} strokeWidth="5" strokeLinecap="round">
            {[145, 175, 205, 307, 337, 367].map(x => (
              <line key={x} x1={x} y1={265} x2={x} y2={315} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Logo;
