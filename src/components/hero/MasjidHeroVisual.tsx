'use client';

import React from 'react';
import Image from 'next/image';

export function MasjidHeroVisual() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* High-res illuminated dome visual */}
      <img
        src="https://images.pexels.com/photos/38203059/pexels-photo-38203059/free-photo-of-majestic-mosque-dome-and-minaret-at-twilight.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Illuminated Mosque Dome"
        className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-40 mix-blend-luminosity scale-105"
      />

      {/* Atmospheric Emerald & Twilight Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08281F] via-emerald-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/70 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
    </div>
  );
}