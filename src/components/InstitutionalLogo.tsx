import React from 'react';
import { LogoPreset } from '../types';

export const InstitutionalLogoRenderer: React.FC<InstitutionalLogoRendererProps> = ({
  preset,
  customUrl,
  defaultPreset,
  className = 'w-16 h-16 sm:w-20 sm:h-20',
  alt = 'Institutional Logo'
}) => {
  if (preset === 'none') {
    return <div className={`${className} opacity-0 pointer-events-none`} />;
  }

  // Determine the effective image source, prioritizing customUrl over default preset images
  let imgSrc = customUrl;
  if (!imgSrc) {
    let effectivePreset = preset === 'custom' ? defaultPreset : preset;
    if (effectivePreset === 'sode') {
      imgSrc = '/smvitm_left.jpg';
    } else if (effectivePreset === 'smvitm') {
      imgSrc = '/smvitm_right.jpg';
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className="max-w-full max-h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}
    </div>
  );
};

export interface InstitutionalLogoRendererProps {
  preset: LogoPreset;
  customUrl?: string;
  defaultPreset: LogoPreset;
  className?: string;
  alt?: string;
}
