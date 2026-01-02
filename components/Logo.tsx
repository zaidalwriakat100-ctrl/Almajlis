import React from "react";

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large" | "xl";
  variant?: "dark" | "light";
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "medium",
  variant = "dark",
}) => {
  const sizeClasses = {
    small: "h-12",
    medium: "h-24",
    large: "h-40",
    xl: "h-64",
  };

  const colors = {
    primary: variant === "light" ? "#2D463E" : "#FFFFFF",
    accent: "#D4AF37", // Gold
    domePrimary: "#3D5A50",
    domeSecondary: "#2D463E",
    bg: variant === "light" ? "#FFFFFF" : "transparent"
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The Dome (smaller, no finial) */}
        <path
          d="M140 200 C140 150 260 150 260 200"
          fill={colors.domePrimary}
          stroke={colors.accent}
          strokeWidth="1.5"
        />
        {/* Inner Shadow for Depth */}
        <path
          d="M200 155 C230 155 260 170 260 200 H200 V155Z"
          fill={colors.domeSecondary}
          opacity="0.3"
        />

        {/* 3. The Grand Entrance (Negative Space Style) */}
        <rect x="80" y="200" width="240" height="80" rx="4" fill={variant === "light" ? "#F4F4F4" : "#FFFFFF"} />

        {/* Architectural Pillars (Clean & Spaced) */}
        <g fill={colors.domeSecondary} opacity="0.15">
          {[111, 141, 171, 221, 251, 281].map(x => (
            <rect key={x} x={x} y="210" width="8" height="60" rx="2" />
          ))}
        </g>



        {/* Jordanian Flag Pole - Single Flag on Right */}
        <g transform="translate(330, 160)">
          {/* Pole */}
          <line x1="0" y1="0" x2="0" y2="120" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="0" r="2.5" fill="#D4AF37" />

          {/* Flag Content */}
          <g transform="translate(2, 5) scale(0.5)">
            <rect x="0" y="0" width="80" height="20" fill="#000000" />
            <rect x="0" y="20" width="80" height="20" fill="#FFFFFF" />
            <rect x="0" y="40" width="80" height="20" fill="#007A3D" />
            <path d="M0 0 L40 30 L0 60 Z" fill="#CE1126" />
            <polygon
              points="14,24 15.3,27 18.7,26.3 16.6,28.7 19.9,31.3 17,33 16.6,35.4 14,33.6 11.4,35.4 11,33 8.1,31.3 11.4,28.7 9.3,26.3 12.7,27"
              fill="#FFFFFF"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Logo;
