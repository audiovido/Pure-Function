import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'text' | 'badge';
  theme?: 'light' | 'dark';
}

/**
 * Pure 100% inline vector reconstruction of the exact Pure Function Fitness Center logo.
 * Zero external image requests — guaranteed to load instantaneously (0ms) on any domain
 * or GitHub Pages subpath (e.g. /Pure-Function/) without broken image icons.
 */
export const PureFunctionLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const whiteColor = isLight ? '#111827' : '#FFFFFF';
  const yellowColor = '#FCC404';

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      title="Pure Function Fitness Center"
    >
      <svg
        viewBox="24 24 956 350"
        className={
          variant === 'badge'
            ? 'w-full h-auto max-w-full block'
            : 'w-auto h-full max-w-full block'
        }
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ============================================================
            TOP LEFT: LETTER "P" (x: 40..124, y: 40..166)
           ============================================================ */}
        <path
          d="M 40 40 H 88 C 110 40 124 52 124 73 C 124 94 110 106 88 106 H 53 V 166 H 40 V 40 Z M 53 52 V 94 H 86 C 102 94 111 86 111 73 C 111 60 102 52 86 52 H 53 Z"
          fill={whiteColor}
        />

        {/* ============================================================
            SHORT YELLOW BAR UNDER "P" (x: 38..120, y: 186..206)
           ============================================================ */}
        <rect x="38" y="186" width="82" height="20" fill={yellowColor} />

        {/* ============================================================
            BOTTOM LEFT: LETTER "F" (x: 40..118, y: 228..354)
           ============================================================ */}
        <path
          d="M 40 228 H 118 V 240 H 53 V 284 H 108 V 296 H 53 V 354 H 40 V 228 Z"
          fill={whiteColor}
        />

        {/* ============================================================
            CENTER TALL YELLOW "U" (x: 156..242, y: 40..360)
           ============================================================ */}
        <path
          d="M 165 40 V 304 C 165 332 180 349 199 349 C 218 349 233 332 233 304 V 40"
          stroke={yellowColor}
          strokeWidth="19"
          strokeLinecap="butt"
          fill="none"
        />

        {/* ============================================================
            TOP MIDDLE: LETTERS "R" & "E" (y: 40..166)
           ============================================================ */}
        {/* Letter R (x: 285..378, y: 40..166) */}
        <path
          d="M 285 40 H 338 C 361 40 375 51 375 72 C 375 89 365 100 347 104 C 358 107 364 115 368 131 L 377 166 H 363 L 355 134 C 350 114 343 108 326 108 H 298 V 166 H 285 V 40 Z M 298 52 V 96 H 335 C 352 96 361 88 361 72 C 361 58 352 52 335 52 H 298 Z"
          fill={whiteColor}
        />

        {/* Letter E (x: 416..500, y: 40..166) */}
        <path
          d="M 416 40 H 498 V 52 H 429 V 96 H 492 V 108 H 429 V 154 H 500 V 166 H 416 V 40 Z"
          fill={whiteColor}
        />

        {/* ============================================================
            TOP RIGHT: "F I T N E S S" & "C E N T E R" (Yellow)
           ============================================================ */}
        {/* Row 1: F I T N E S S */}
        <g
          fill={yellowColor}
          fontFamily="Arial, Helvetica, 'Montserrat', sans-serif"
          fontWeight="800"
          fontSize="39"
          textAnchor="middle"
        >
          <text x="546" y="74">
            F
          </text>
          <text x="612" y="74">
            I
          </text>
          <text x="676" y="74">
            T
          </text>
          <text x="748" y="74">
            N
          </text>
          <text x="820" y="74">
            E
          </text>
          <text x="888" y="74">
            S
          </text>
          <text x="952" y="74">
            S
          </text>
        </g>

        {/* Row 2: C E N T E R */}
        <g
          fill={yellowColor}
          fontFamily="Arial, Helvetica, 'Montserrat', sans-serif"
          fontWeight="800"
          fontSize="39"
          textAnchor="middle"
        >
          <text x="546" y="165">
            C
          </text>
          <text x="627" y="165">
            E
          </text>
          <text x="708" y="165">
            N
          </text>
          <text x="789" y="165">
            T
          </text>
          <text x="870" y="165">
            E
          </text>
          <text x="951" y="165">
            R
          </text>
        </g>

        {/* ============================================================
            LONG YELLOW BAR UNDER "RE FITNESS CENTER" (x: 285..964)
           ============================================================ */}
        <rect x="285" y="186" width="679" height="20" fill={yellowColor} />

        {/* ============================================================
            BOTTOM RIGHT: "N C T I O N" (x: 285..962, y: 228..354)
           ============================================================ */}
        {/* First N (x: 285..375) */}
        <path
          d="M 285 228 H 299 L 362 332 V 228 H 375 V 354 H 361 L 298 250 V 354 H 285 V 228 Z"
          fill={whiteColor}
        />

        {/* Letter C (x: 416..514) */}
        <path
          d="M 501 266 C 496 247 483 238 466 238 C 442 238 429 258 429 291 C 429 324 442 344 466 344 C 485 344 498 333 502 312 H 515 C 510 340 492 356 466 356 C 433 356 415 331 415 291 C 415 251 433 226 466 226 C 491 226 509 240 514 266 H 501 Z"
          fill={whiteColor}
        />

        {/* Letter T (x: 544..638) */}
        <path
          d="M 544 228 H 638 V 240 H 597.5 V 354 H 584.5 V 240 H 544 V 228 Z"
          fill={whiteColor}
        />

        {/* Letter I (x: 678..691) */}
        <rect x="678" y="228" width="13" height="126" fill={whiteColor} />

        {/* Letter O (x: 730..836) */}
        <path
          d="M 783 226 C 817 226 836 252 836 291 C 836 330 817 356 783 356 C 749 356 730 330 730 291 C 730 252 749 226 783 226 Z M 783 238 C 757 238 744 259 744 291 C 744 323 757 344 783 344 C 809 344 822 323 822 291 C 822 259 809 238 783 238 Z"
          fill={whiteColor}
        />

        {/* Second N (x: 872..962) */}
        <path
          d="M 872 228 H 886 L 949 332 V 228 H 962 V 354 H 948 L 885 250 V 354 H 872 V 228 Z"
          fill={whiteColor}
        />
      </svg>
    </div>
  );
};
