import React from 'react';

interface SodeEmblemProps {
  className?: string;
}

export const SodeEmblem: React.FC<SodeEmblemProps> = ({ className = 'w-full h-full' }) => {
  const uniqueId = React.useId().replace(/:/g, '_');
  const topArcId = `sodeTopArc_${uniqueId}`;
  const bottomArcId = `sodeBottomArc_${uniqueId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 500 500"
      className={className}
      aria-label="SODE Group of Institutions Emblem"
    >
      <rect width="500" height="500" fill="#ffffff" />

      {/* Outer & Inner Golden Rings */}
      <circle cx="250" cy="250" r="236" fill="#ffffff" stroke="#C59341" strokeWidth="3" />
      <circle cx="250" cy="250" r="226" fill="none" stroke="#C59341" strokeWidth="1.2" />
      <circle cx="250" cy="250" r="162" fill="none" stroke="#C59341" strokeWidth="1.5" />

      {/* Path Definitions for Text along Arcs */}
      <defs>
        {/* Top arc for SODE GROUP OF INSTITUTIONS */}
        <path
          id={topArcId}
          d="M 58,250 A 192,192 0 1,1 442,250"
          fill="none"
        />
        {/* Bottom arc for UDUPI */}
        <path
          id={bottomArcId}
          d="M 125,385 A 196,196 0 0,0 375,385"
          fill="none"
        />
      </defs>

      {/* Top Arc Text: SODE GROUP OF INSTITUTIONS */}
      <text
        fontFamily="'Times New Roman', 'FreeSerif', 'Cinzel', Georgia, serif"
        fontSize="28"
        fontWeight="700"
        fill="#6E1B2C"
        letterSpacing="2.5"
      >
        <textPath href={`#${topArcId}`} xlinkHref={`#${topArcId}`} startOffset="50%" textAnchor="middle">
          SODE GROUP OF INSTITUTIONS
        </textPath>
      </text>

      {/* Flanking Golden Solid Dots */}
      <circle cx="108" cy="378" r="11" fill="#C59341" />
      <circle cx="392" cy="378" r="11" fill="#C59341" />

      {/* Bottom Arc Text: UDUPI */}
      <text
        fontFamily="'Arial', 'FreeSans', Helvetica, sans-serif"
        fontSize="34"
        fontWeight="800"
        fill="#6E1B2C"
        letterSpacing="4"
      >
        <textPath href={`#${bottomArcId}`} xlinkHref={`#${bottomArcId}`} startOffset="50%" textAnchor="middle">
          UDUPI
        </textPath>
      </text>

      {/* Golden Concentric Arcs behind the lotus */}
      <g stroke="#C59341" strokeWidth="1.5" fill="none" opacity="0.85">
        <path d="M 152,240 A 120,120 0 0,1 348,240" />
        <path d="M 166,206 A 140,140 0 0,1 334,206" />
        <path d="M 185,174 A 155,155 0 0,1 315,174" />
        <path d="M 210,146 A 170,170 0 0,1 290,146" />
      </g>

      {/* Top Sunburst Element */}
      <g transform="translate(250, 142)">
        {/* Golden halo ring */}
        <circle cx="0" cy="0" r="23" fill="none" stroke="#C59341" strokeWidth="1.2" />
        {/* Radiating Maroon Sun Rays */}
        <g fill="#6E1B2C">
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => (
            <polygon
              key={angle}
              points="-2.5,-16 2.5,-16 0,-22"
              transform={`rotate(${angle})`}
            />
          ))}
          {/* Central Maroon Sun Disc */}
          <circle cx="0" cy="0" r="15" />
        </g>
      </g>

      {/* Central Interlocking Stylized Lotus Flower Motif */}
      <g stroke="#6E1B2C" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Center Diamond Bud */}
        <path d="M 250,176 C 262,205 278,235 292,260 C 275,295 260,330 250,370 C 240,330 225,295 208,260 C 222,235 238,205 250,176 Z" />

        {/* Left Wing Upper Loop */}
        <path d="M 250,176 C 228,210 196,242 165,268 C 190,300 220,335 250,370" />
        {/* Right Wing Upper Loop */}
        <path d="M 250,176 C 272,210 304,242 335,268 C 310,300 280,335 250,370" />

        {/* Outermost Left Petal Curl */}
        <path d="M 148,284 C 130,315 135,348 152,368 C 175,372 215,355 250,318 C 215,265 178,235 152,210 C 182,215 220,240 250,285" />
        {/* Outermost Right Petal Curl */}
        <path d="M 352,284 C 370,315 365,348 348,368 C 325,372 285,355 250,318 C 285,265 322,235 348,210 C 318,215 280,240 250,285" />

        {/* Lower Base Sweep Curve */}
        <path d="M 152,368 C 185,395 220,395 250,370 C 280,395 315,395 348,368" />
      </g>

      {/* Sanskrit Motto: सर्वे भद्राणि पश्यन्तु */}
      <text
        x="250"
        y="382"
        textAnchor="middle"
        fontFamily="'FreeSans', 'Arial', 'Nirmala UI', sans-serif"
        fontSize="16.5"
        fontWeight="bold"
        fill="#AC7D30"
        letterSpacing="0.8"
      >
        सर्वे भद्राणि पश्यन्तु
      </text>
    </svg>
  );
};
