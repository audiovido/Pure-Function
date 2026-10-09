import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'text' | 'badge';
  theme?: 'light' | 'dark';
}

export const PureFunctionLogo: React.FC<LogoProps> = ({ className = '', theme = 'dark' }) => {
  const isLight = theme === 'light';
  const textColor = isLight ? '#111827' : '#FFFFFF';
  const goldColor = '#F9B208';

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      title="Pure Function Fitness Center"
    >
      <svg
        viewBox="14 16 602 196"
        className="w-auto h-full max-w-full drop-shadow-sm overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ textRendering: 'geometricPrecision' }}
      >
        {/* ROW 1: Letter P (starts at x:20, cap-top: 30, baseline: 102) */}
        <text
          x="20"
          y="102"
          fill={textColor}
          fontSize="96"
          fontWeight="300"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
          className="transition-colors duration-200"
        >
          P
        </text>

        {/* Small Yellow Horizontal Bar under P */}
        <line
          x1="20"
          y1="114"
          x2="74"
          y2="114"
          stroke={goldColor}
          strokeWidth="6"
          strokeLinecap="square"
        />

        {/* Letters RE (starts at x:184, ends at x:296, baseline: 102) */}
        <text
          x="184"
          y="102"
          fill={textColor}
          fontSize="96"
          fontWeight="300"
          letterSpacing="1.5"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
          className="transition-colors duration-200"
        >
          RE
        </text>

        {/* FITNESS:
            - Cap-top starts at EXACTLY y:30 (flush with ceiling of P, U, RE!)
            - Baseline at y:54
            - Starts at x:352 (leaves 56px clean space after E!), ends at x:610
        */}
        <text
          x="352"
          y="54"
          textLength="258"
          lengthAdjust="spacing"
          fill={goldColor}
          fontSize="24"
          fontWeight="700"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          FITNESS
        </text>

        {/* CENTER:
            - Cap-top at y:72, baseline at y:96
            - Leaves clean 18px gap above the yellow divider at y:114
            - Starts at x:352, ends flush at x:610
        */}
        <text
          x="352"
          y="96"
          textLength="258"
          lengthAdjust="spacing"
          fill={goldColor}
          fontSize="24"
          fontWeight="700"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          CENTER
        </text>

        {/* MIDDLE: YELLOW DIVIDER AT y:114 */}
        <line
          x1="184"
          y1="114"
          x2="610"
          y2="114"
          stroke={goldColor}
          strokeWidth="6"
          strokeLinecap="square"
        />

        {/* ROW 2: Letter F (starts at x:20, cap-top: 128, baseline: 200) */}
        <text
          x="20"
          y="200"
          fill={textColor}
          fontSize="96"
          fontWeight="300"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
          className="transition-colors duration-200"
        >
          F
        </text>

        {/* TALL ATHLETIC YELLOW U:
            - Top ends flat at EXACTLY y:30 (flush with top of P, RE, and FITNESS!)
            - Bottom curves at EXACTLY y:200 (flush with baseline of F and NCTION!)
            - Symmetrically spaced between left block and right block
            - 5.5px stroke weight matches the font stem weight
        */}
        <path
          d="M 104 30 L 104 176 A 24 24 0 0 0 152 176 L 152 30"
          stroke={goldColor}
          strokeWidth="5.5"
          strokeLinecap="butt"
          strokeLinejoin="round"
          fill="none"
        />

        {/* N C T I O N:
            - Starts at x:184 (flush with R and left of divider)
            - Ends at x:610 (flush with FITNESS/CENTER and right of divider)
            - Baseline at y:200 (flush with F and bottom of U)
        */}
        <text
          x="184"
          y="200"
          textLength="426"
          lengthAdjust="spacing"
          fill={textColor}
          fontSize="96"
          fontWeight="300"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
          className="transition-colors duration-200"
        >
          NCTION
        </text>
      </svg>
    </div>
  );
};
