import React from 'react';
import { AppMode } from '../types';

interface BackgroundAuraProps {
  mode: AppMode;
}

export const BackgroundAura: React.FC<BackgroundAuraProps> = ({ mode }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* ELDER CARE ATMOSPHERE: Warm Golden Sunrise, Soothing Honey Radiance */}
      {mode === 'elder' && (
        <>
          {/* Top-Left Radiant Sunlight Orb */}
          <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-amber-300/35 via-orange-200/25 to-transparent blur-3xl animate-ambientFloat1 transform-gpu" />

          {/* Top-Right Soft Peach Mote */}
          <div className="absolute top-1/4 -right-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-bl from-amber-200/30 via-yellow-100/20 to-transparent blur-3xl animate-ambientFloat2 transform-gpu" />

          {/* Bottom-Center Warm Healing Hearth Glow */}
          <div className="absolute -bottom-20 left-1/3 w-[36rem] h-[36rem] rounded-full bg-gradient-to-t from-orange-200/25 via-amber-100/30 to-transparent blur-3xl animate-ambientPulseSoft transform-gpu" />

          {/* Subtle Decorative Golden Radiance Ring */}
          <div className="absolute top-12 right-12 w-96 h-96 rounded-full border border-amber-300/20 opacity-40 blur-xs hidden md:block" />
          <div className="absolute top-20 right-20 w-80 h-80 rounded-full border border-amber-400/15 opacity-30 blur-xs hidden md:block" />
        </>
      )}

      {/* HOSTEL & FLATMATES ATMOSPHERE: Cyberpunk Midnight, Neon Indigo & Electric Cyan Nebula */}
      {mode === 'hostel' && (
        <>
          {/* Cyber Dot-Matrix Overlay Pattern */}
          <div
            className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]"
          />

          {/* Top-Left Electric Indigo Nebula */}
          <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-indigo-600/30 via-indigo-900/20 to-transparent blur-3xl animate-ambientFloat1 transform-gpu" />

          {/* Top-Right Cyber Violet Glow */}
          <div className="absolute top-1/6 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-purple-600/25 via-fuchsia-900/15 to-transparent blur-3xl animate-ambientFloat2 transform-gpu" />

          {/* Center-Right Cyan Energy Flash */}
          <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl animate-ambientPulseSoft transform-gpu" />

          {/* Bottom-Left Midnight Indigo Base */}
          <div className="absolute -bottom-24 left-1/4 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-indigo-700/20 via-purple-900/20 to-transparent blur-3xl transform-gpu" />

          {/* Subtle Cyber Grid Lines Accent */}
          <div className="absolute bottom-10 left-10 w-72 h-72 border border-indigo-500/10 rounded-3xl rotate-12 hidden md:block" />
        </>
      )}

      {/* FAMILY HOUSEHOLD ATMOSPHERE: Fresh Botanical Emerald, Mint Dew Sanctuary */}
      {mode === 'family' && (
        <>
          {/* Top-Left Fresh Mint Flora Orb */}
          <div className="absolute -top-28 -left-28 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-emerald-400/35 via-teal-200/25 to-transparent blur-3xl animate-ambientFloat1 transform-gpu" />

          {/* Top-Right Soft Botanical Dew */}
          <div className="absolute top-1/5 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-teal-300/30 via-emerald-100/25 to-transparent blur-3xl animate-ambientFloat2 transform-gpu" />

          {/* Bottom-Center Living Garden Warmth */}
          <div className="absolute -bottom-24 left-1/4 w-[36rem] h-[36rem] rounded-full bg-gradient-to-t from-emerald-300/25 via-teal-100/30 to-transparent blur-3xl animate-ambientPulseSoft transform-gpu" />

          {/* Subtle Botanical Concentric Halo */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full border border-emerald-300/15 opacity-50 blur-xs hidden md:block" />
        </>
      )}

      {/* Ultra-Fine Micro-Texture Grain Overlay (Physical high-end depth) */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay" />
    </div>
  );
};
