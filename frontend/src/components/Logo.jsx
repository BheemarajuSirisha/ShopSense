import React from 'react';

export function StorefrontIcon({ className = "w-full h-full" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ssStoreBaseGrad" x1="6" y1="15" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7A1259" stopOpacity="0.2" />
          <stop offset="1" stopColor="#B5179E" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Upward Chart Spark above storefront */}
      <path
        d="M6 6.5 L12 4 L17.5 5.5 L24 2"
        stroke="#F8B4D9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chart node dots */}
      <circle cx="12" cy="4" r="1.1" fill="#FFFFFF" />
      <circle cx="17.5" cy="5.5" r="1.1" fill="#FFFFFF" />
      {/* Sparkle spark at apex */}
      <path
        d="M24 0.2 Q24 2 25.8 2 Q24 2 24 3.8 Q24 2 22.2 2 Q24 2 24 0.2 Z"
        fill="#FFFFFF"
      />

      {/* Storefront Building Base */}
      <rect
        x="6"
        y="15.5"
        width="20"
        height="12.5"
        rx="1"
        fill="url(#ssStoreBaseGrad)"
        stroke="#B5179E"
        strokeWidth="1.2"
      />

      {/* Showcase Window with cross panes */}
      <rect
        x="8"
        y="18.2"
        width="8"
        height="6.8"
        rx="0.75"
        fill="#FFFFFF"
        fillOpacity="0.4"
        stroke="#F8B4D9"
        strokeWidth="0.9"
      />
      <line x1="12" y1="18.2" x2="12" y2="25" stroke="#F8B4D9" strokeWidth="0.8" />
      <line x1="8" y1="21.6" x2="16" y2="21.6" stroke="#F8B4D9" strokeWidth="0.8" />

      {/* Storefront Door with knob */}
      <rect
        x="18"
        y="18.2"
        width="6"
        height="9.8"
        rx="0.75"
        fill="#7A1259"
        stroke="#F8B4D9"
        strokeWidth="0.9"
      />
      <circle cx="22.5" cy="23.2" r="0.65" fill="#FFFFFF" />

      {/* Ground Foundation Line */}
      <line x1="4" y1="29" x2="28" y2="29" stroke="#B5179E" strokeWidth="1.4" strokeLinecap="round" />

      {/* Striped Awning */}
      {/* Awning Top Header Bar */}
      <rect x="4.5" y="8" width="23" height="1.8" rx="0.9" fill="#7A1259" stroke="#B5179E" strokeWidth="0.6" />

      {/* 5 Alternating Striped Segments with Scalloped Base */}
      {/* Stripe 1 (Magenta) */}
      <path
        d="M5.5 9.8 L4.5 14.5 C4.5 15.8 8.8 15.8 8.8 14.5 L9.5 9.8 Z"
        fill="#B5179E"
        stroke="#7A1259"
        strokeWidth="0.5"
      />
      {/* Stripe 2 (Blush Pink) */}
      <path
        d="M9.5 9.8 L8.8 14.5 C8.8 15.8 13.3 15.8 13.3 14.5 L13.8 9.8 Z"
        fill="#F8B4D9"
        stroke="#B5179E"
        strokeWidth="0.5"
      />
      {/* Stripe 3 (Magenta) */}
      <path
        d="M13.8 9.8 L13.3 14.5 C13.3 15.8 18.2 15.8 18.2 14.5 L18.2 9.8 Z"
        fill="#B5179E"
        stroke="#7A1259"
        strokeWidth="0.5"
      />
      {/* Stripe 4 (Blush Pink) */}
      <path
        d="M18.2 9.8 L18.2 14.5 C18.2 15.8 22.7 15.8 22.7 14.5 L22.5 9.8 Z"
        fill="#F8B4D9"
        stroke="#B5179E"
        strokeWidth="0.5"
      />
      {/* Stripe 5 (Magenta) */}
      <path
        d="M22.5 9.8 L22.7 14.5 C22.7 15.8 27.5 15.8 27.5 14.5 L26.5 9.8 Z"
        fill="#B5179E"
        stroke="#7A1259"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export default function Logo({
  showText = true,
  className = "w-7 h-7",
  textClassName = "text-xl",
  variant = "light", // 'light' for dark plum sidebar (white 'Shop'), 'dark' for light surfaces (#3B0A33 'Shop')
  subtitle = "Marketplace Analytics",
  subtitleClassName = "",
  showSubtitle = true,
}) {
  const shopTextColor = variant === 'dark' ? 'text-[#3B0A33]' : 'text-white';
  const senseTextColor = variant === 'dark' ? 'text-[#B5179E]' : 'text-[#F8B4D9]';

  return (
    <div
      className="inline-flex items-center gap-2.5 select-text cursor-default"
      aria-label="ShopSense"
      role="banner"
    >
      {/* Storefront Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <StorefrontIcon />
      </div>

      {showText && (
        <div className="flex flex-col select-text leading-tight">
          <div className={`tracking-tight inline-flex items-center ${textClassName}`}>
            <span className={`${shopTextColor} font-bold`}>Shop</span>
            <span className={`${senseTextColor} font-bold ml-0.5`}>Sense</span>
          </div>
          {showSubtitle && (
            <span
              className={`text-[10px] tracking-wider font-semibold ${
                subtitleClassName
                  ? subtitleClassName
                  : (variant === 'dark' ? 'text-[#7A1259]' : 'text-[#F8B4D9]/90 uppercase')
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
