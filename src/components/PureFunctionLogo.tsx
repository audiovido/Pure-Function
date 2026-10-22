import React, { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'text' | 'badge';
  theme?: 'light' | 'dark';
}

const UPLOADED_LOGO_SRC =
  '/assets/aistudio/e5685ed9-a821-4018-a4d5-65b77ca837e3_698af197.JPG';

let cachedTransparentLogoUrl: string | null = null;

export const PureFunctionLogo: React.FC<LogoProps> = ({
  className = '',
  theme = 'dark',
}) => {
  const [processedImgUrl, setProcessedImgUrl] = useState<string | null>(
    cachedTransparentLogoUrl
  );

  useEffect(() => {
    if (cachedTransparentLogoUrl) {
      setProcessedImgUrl(cachedTransparentLogoUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Crop tightly around the PURE FUNCTION FITNESS CENTER mark from the uploaded image
        const cropX = Math.round(img.width * 0.085);
        const cropY = Math.round(img.height * 0.265);
        const cropW = Math.round(img.width * 0.83);
        const cropH = Math.round(img.height * 0.43);

        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imageData.data;

        // Background in the JPG is ~ RGB(35, 35, 40). Key it out smoothly to full transparency
        // so the exact uploaded logo sits cleanly on the shaded header without a box seam.
        const bgR = 35;
        const bgG = 35;
        const bgB = 40;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dist = Math.max(
            Math.abs(r - bgR),
            Math.abs(g - bgG),
            Math.abs(b - bgB)
          );

          if (dist < 18) {
            data[i + 3] = 0;
          } else if (dist < 65) {
            const alpha = Math.min(1, (dist - 18) / (65 - 18));
            data[i + 3] = Math.round(alpha * 255);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        cachedTransparentLogoUrl = dataUrl;
        setProcessedImgUrl(dataUrl);
      } catch {
        // Fallback to vector if canvas fails
      }
    };
    img.src = UPLOADED_LOGO_SRC;
  }, []);

  const isLight = theme === 'light';
  const textColor = isLight ? '#111827' : '#FFFFFF';
  const goldColor = '#FDC40A';

  if (processedImgUrl && !isLight) {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        title="Pure Function Fitness Center"
      >
        <img
          src={processedImgUrl}
          alt="Pure Function Fitness Center"
          className="w-auto h-full max-w-full object-contain block"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      title="Pure Function Fitness Center"
    >
      <svg
        viewBox="12 16 608 198"
        className="w-auto h-full max-w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ textRendering: 'geometricPrecision' }}
      >
        {/* ROW 1: Letter P */}
        <text
          x="18"
          y="100"
          fill={textColor}
          fontSize="100"
          fontWeight="400"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          P
        </text>

        {/* Bold Yellow Horizontal Bar under P */}
        <rect x="18" y="109" width="56" height="12" fill={goldColor} />

        {/* Letters RE */}
        <text
          x="184"
          y="100"
          fill={textColor}
          fontSize="100"
          fontWeight="400"
          letterSpacing="2"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          RE
        </text>

        {/* FITNESS (Larger & Bolder, matching uploaded image) */}
        <text
          x="342"
          y="53"
          textLength="272"
          lengthAdjust="spacing"
          fill={goldColor}
          fontSize="28"
          fontWeight="800"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          FITNESS
        </text>

        {/* CENTER (Larger & Bolder, baseline aligned with RE) */}
        <text
          x="342"
          y="99"
          textLength="272"
          lengthAdjust="spacing"
          fill={goldColor}
          fontSize="28"
          fontWeight="800"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          CENTER
        </text>

        {/* Bold Yellow Divider Bar under RE FITNESS CENTER */}
        <rect x="184" y="109" width="430" height="12" fill={goldColor} />

        {/* ROW 2: Letter F */}
        <text
          x="18"
          y="204"
          fill={textColor}
          fontSize="100"
          fontWeight="400"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          F
        </text>

        {/* Tall Bold Yellow U */}
        <path
          d="M 101 28 L 101 174 A 26 26 0 0 0 153 174 L 153 28"
          stroke={goldColor}
          strokeWidth="11.5"
          strokeLinecap="butt"
          strokeLinejoin="round"
          fill="none"
        />

        {/* N C T I O N */}
        <text
          x="184"
          y="204"
          textLength="430"
          lengthAdjust="spacing"
          fill={textColor}
          fontSize="100"
          fontWeight="400"
          fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
        >
          NCTION
        </text>
      </svg>
    </div>
  );
};
