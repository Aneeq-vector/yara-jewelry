import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="90%"
          height="90%"
          viewBox="7 10 86 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Star */}
          <path
            d="M50 15 Q50 30 62 30 Q50 30 50 45 Q50 30 38 30 Q50 30 50 15 Z"
            fill="#fdf9f6"
          />
          {/* Left Leaf */}
          <path
            d="M50 85 C30 85, 12 72, 12 50 C28 58, 44 70, 50 85 Z"
            stroke="#fdf9f6"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Right Leaf */}
          <path
            d="M50 85 C70 85, 88 72, 88 50 C72 58, 56 70, 50 85 Z"
            stroke="#fdf9f6"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
