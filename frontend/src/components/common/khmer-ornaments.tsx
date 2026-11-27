import React from 'react';

/**
 * Authentic Khmer Kbach (ក្បាច់ខ្មែរ) Ornamental Components & Background Patterns
 * - Kbach Chan (ក្បាច់ចាន): Traditional diamond rosette lattice pattern inspired by Angkor Wat reliefs & Khmer Silk.
 * - Kbach Phni (ក្បាច់ភ្ញី): Winding floral vine flourishes and corner accents.
 * - Pka Chhouk (ផ្កាឈូក): Sacred lotus blossoms representing purity, prosperity, and marital bliss.
 */

interface PatternProps {
  className?: string;
  opacity?: number;
  color?: string;
}

/**
 * Seamless repeating Khmer Kbach Chan tile background pattern
 */
export function KhmerBackgroundPattern({
  className = '',
  opacity = 0.05,
  color = '#8A6E2D',
}: PatternProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="khmer-kbach-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Center Khmer Lotus Rosette (ក្បាច់ចានផ្កាចន្ទន៍) */}
            <g transform="translate(40, 40)" fill="none" stroke={color} strokeWidth="1.2">
              {/* Central Diamond Seed */}
              <polygon points="0,-6 6,0 0,6 -6,0" fill={color} fillOpacity="0.4" />
              
              {/* 4 Cardinal Lotus Petals */}
              <path d="M 0,-6 C -4,-14 0,-20 0,-20 C 0,-20 4,-14 0,-6 Z" fill={color} fillOpacity="0.15" />
              <path d="M 0,6 C -4,14 0,20 0,20 C 0,20 4,14 0,6 Z" fill={color} fillOpacity="0.15" />
              <path d="M -6,0 C -14,-4 -20,0 -20,0 C -20,0 -14,4 -6,0 Z" fill={color} fillOpacity="0.15" />
              <path d="M 6,0 C 14,-4 20,0 20,0 C 20,0 14,4 6,0 Z" fill={color} fillOpacity="0.15" />

              {/* 4 Diagonal Flourish Tendrils (ភ្ញីទេស) */}
              <path d="M -4,-4 C -10,-10 -14,-8 -16,-16 C -8,-14 -10,-10 -4,-4" />
              <path d="M 4,-4 C 10,-10 14,-8 16,-16 C 8,-14 10,-10 4,-4" />
              <path d="M -4,4 C -10,10 -14,8 -16,16 C -8,14 -10,10 -4,4" />
              <path d="M 4,4 C 10,10 14,8 16,16 C 8,14 10,10 4,4" />

              {/* Outer Sacred Ring */}
              <circle cx="0" cy="0" r="14" strokeDasharray="1.5 2.5" strokeWidth="0.8" />
            </g>

            {/* Corner Connecting Diamond Lattice */}
            <g fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.6">
              <path d="M 0,0 L 40,40 M 80,0 L 40,40 M 0,80 L 40,40 M 80,80 L 40,40" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="3" fill={color} fillOpacity="0.3" />
              <circle cx="80" cy="0" r="3" fill={color} fillOpacity="0.3" />
              <circle cx="0" cy="80" r="3" fill={color} fillOpacity="0.3" />
              <circle cx="80" cy="80" r="3" fill={color} fillOpacity="0.3" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khmer-kbach-pattern)" />
      </svg>
    </div>
  );
}

/**
 * Traditional Khmer Kbach Corner Ornament (ក្បាច់ជ្រុង)
 * Used to frame luxury cards, headers, and certificates.
 */
export function KhmerCorner({
  className = '',
  position = 'top-left',
  size = 56,
  color = '#B89758',
}: {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  color?: string;
}) {
  const rotation = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <div className={`absolute ${className} ${rotation} pointer-events-none select-none`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Outer Corner Vine (ក្បាច់ភ្ញីទេស) */}
        <path
          d="M 6,6 L 70,6 C 55,10 40,20 30,30 C 20,40 10,55 6,70 Z"
          fill={color}
          fillOpacity="0.12"
          stroke={color}
          strokeWidth="1.5"
        />
        {/* Inner Intricate Swirls */}
        <path
          d="M 6,6 C 25,6 35,16 40,25 C 32,25 25,20 20,28 C 15,35 22,42 16,50 C 12,40 6,35 6,6 Z"
          fill={color}
          fillOpacity="0.35"
        />
        {/* Flame Tip (ចុងក្បាច់ភ្ញី) */}
        <path
          d="M 12,12 C 28,12 48,22 55,40 C 45,36 38,42 32,36 C 26,30 32,22 18,18 Z"
          fill={color}
          fillOpacity="0.7"
        />
        {/* Corner Diamond Rosette */}
        <polygon points="6,6 14,3 22,6 14,9" fill={color} />
        <polygon points="6,6 3,14 6,22 9,14" fill={color} />
        <circle cx="14" cy="14" r="3" fill={color} />
      </svg>
    </div>
  );
}

/**
 * Traditional Khmer Ornamental Divider (ខ្សែឆ្នូតក្បាច់ភ្ញី)
 * A royal centerpiece lotus flanked by continuous winding vine tendrils.
 */
export function KhmerDivider({
  className = '',
  color = '#B89758',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`flex items-center justify-center my-6 gap-3 ${className}`}>
      {/* Left Vine Ribbon */}
      <svg className="w-24 sm:w-36 h-5" viewBox="0 0 140 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 0,10 H 70 C 85,10 95,4 105,10 C 115,16 125,7 140,10"
          stroke={color}
          strokeWidth="1.2"
        />
        <path
          d="M 50,10 C 60,4 65,3 70,8 C 75,13 78,16 85,10"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />
        <circle cx="105" cy="10" r="2.5" fill={color} />
        <circle cx="40" cy="10" r="1.5" fill={color} />
        <circle cx="15" cy="10" r="1" fill={color} />
      </svg>

      {/* Central Sacred Khmer Lotus (ផ្កាឈូកមាស) */}
      <div className="relative flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-600" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Lotus Core */}
          <circle cx="20" cy="20" r="4" fill={color} />
          {/* Main Petals */}
          <path
            d="M 20,4 C 15,12 18,17 20,18 C 22,17 25,12 20,4 Z"
            fill={color}
            fillOpacity="0.85"
          />
          <path
            d="M 20,36 C 15,28 18,23 20,22 C 22,23 25,28 20,36 Z"
            fill={color}
            fillOpacity="0.85"
          />
          <path
            d="M 4,20 C 12,15 17,18 18,20 C 17,22 12,25 4,20 Z"
            fill={color}
            fillOpacity="0.85"
          />
          <path
            d="M 36,20 C 28,15 23,18 22,20 C 23,22 28,25 36,20 Z"
            fill={color}
            fillOpacity="0.85"
          />
          {/* Diagonal Secondary Petals */}
          <path
            d="M 9,9 C 14,15 17,17 18,18 C 17,17 15,14 9,9 Z"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M 31,9 C 26,15 23,17 22,18 C 23,17 25,14 31,9 Z"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M 9,31 C 14,25 17,23 18,22 C 17,23 15,26 9,31 Z"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M 31,31 C 26,25 23,23 22,22 C 23,23 25,26 31,31 Z"
            stroke={color}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Right Vine Ribbon (Mirrored) */}
      <svg className="w-24 sm:w-36 h-5" viewBox="0 0 140 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 140,10 H 70 C 55,10 45,4 35,10 C 25,16 15,7 0,10"
          stroke={color}
          strokeWidth="1.2"
        />
        <path
          d="M 90,10 C 80,4 75,3 70,8 C 65,13 62,16 55,10"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />
        <circle cx="35" cy="10" r="2.5" fill={color} />
        <circle cx="100" cy="10" r="1.5" fill={color} />
        <circle cx="125" cy="10" r="1" fill={color} />
      </svg>
    </div>
  );
}

/**
 * Traditional Khmer Pediment Arch Silhouette (ហោជាងប្រាសាទខ្មែរ)
 * Inspired by Banteay Srei & Angkor Wat lintels.
 */
export function KhmerPedimentArch({
  className = '',
  color = '#B89758',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`w-full flex justify-center overflow-hidden ${className}`}>
      <svg
        className="w-full max-w-lg h-10 text-amber-600/30"
        viewBox="0 0 400 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crown Peak (កំពូលហោជាង) */}
        <polygon points="200,4 206,14 194,14" fill={color} />
        <circle cx="200" cy="16" r="2.5" fill={color} />
        
        {/* Flowing Arch Waves */}
        <path
          d="M 20,38 C 70,36 120,24 160,18 C 180,15 195,12 200,12 C 205,12 220,15 240,18 C 280,24 330,36 380,38"
          stroke={color}
          strokeWidth="1.8"
        />
        <path
          d="M 50,38 C 95,35 140,26 175,22 C 190,20 197,18 200,18 C 203,18 210,20 225,22 C 260,26 305,35 350,38"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Leaf crests (ចុងក្បាច់) */}
        <path d="M 160,18 C 163,12 168,14 170,19" stroke={color} strokeWidth="1.5" />
        <path d="M 240,18 C 237,12 232,14 230,19" stroke={color} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * Traditional Khmer Royal Calligraphy Wing Flourishes (ស្លាបក្បាច់ភ្ញីទេសសងខាង)
 * Replicates the golden wedding calligraphic flourishes seen on royal invitation cards.
 */
export function KhmerCalligraphyWing({
  direction = 'left',
  className = '',
  color = '#C5A059',
}: {
  direction?: 'left' | 'right';
  className?: string;
  color?: string;
}) {
  const isRight = direction === 'right';
  return (
    <svg
      className={`w-12 h-12 sm:w-16 sm:h-16 ${isRight ? '-scale-x-100' : ''} ${className}`}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`goldGrad-${direction}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F7E7BE" />
          <stop offset="50%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#8C6627" />
        </linearGradient>
      </defs>
      {/* Outer Sweeping Wing Swirl */}
      <path
        d="M 70,65 C 55,60 40,45 35,32 C 30,20 38,10 45,5 C 38,8 25,18 20,32 C 15,48 26,62 48,70 C 58,74 66,72 70,65 Z"
        fill={`url(#goldGrad-${direction})`}
        stroke="#7A5620"
        strokeWidth="0.8"
      />
      {/* Inner Flame Leaf (ភ្ញីភ្លើង) */}
      <path
        d="M 60,55 C 50,52 38,40 35,28 C 32,18 40,12 42,10 C 35,14 28,22 26,32 C 24,42 32,54 50,60 Z"
        fill="#FFFFFF"
        fillOpacity="0.85"
      />
      {/* Tip Curving Flourish */}
      <path
        d="M 45,5 C 50,2 58,4 55,10 C 52,14 45,12 45,5 Z"
        fill={`url(#goldGrad-${direction})`}
      />
      {/* Delicate Filigree Beading */}
      <circle cx="45" cy="5" r="2" fill="#FFE8AA" stroke="#8C6627" strokeWidth="0.5" />
      <circle cx="35" cy="18" r="1.5" fill="#FFE8AA" />
      <circle cx="28" cy="30" r="1.5" fill="#FFE8AA" />
    </svg>
  );
}

