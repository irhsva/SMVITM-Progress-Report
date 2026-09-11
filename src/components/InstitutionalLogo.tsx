import React from 'react';
import { LogoPreset } from '../types';
import { SodeEmblem } from './SodeEmblem';

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

  // Prioritize user uploaded custom URL or image data
  if (customUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={customUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  const effectivePreset = preset === 'custom' ? defaultPreset : preset;

  // Direct high-fidelity vector SODE emblem rendering
  if (effectivePreset === 'sode') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <SodeEmblem className="max-w-full max-h-full object-contain filter drop-shadow-xs" />
      </div>
    );
  }

  const imgSrc = effectivePreset === 'smvitm' ? '/smvitm_right.jpg' : '';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className="max-w-full max-h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
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
