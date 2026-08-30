import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Upload, RefreshCw, Check, Eye, Trash2 } from 'lucide-react';
import { LogoPreset, LogoSettings } from '../types';
import { InstitutionalLogoRenderer } from './InstitutionalLogo';

interface LogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logos: LogoSettings;
  onSaveLogos: (logos: LogoSettings) => void;
}

const PRESET_OPTIONS: { id: LogoPreset; name: string; description: string }[] = [
  { id: 'sode', name: 'SODE Group Emblem', description: 'Official Sode Group of Institutions round seal' },
  { id: 'smvitm', name: 'SMVITM Emblem', description: 'Official SMVITM geometric institutional logo' },
  { id: 'custom', name: 'Custom Upload / URL', description: 'Upload your own PNG, JPG, or SVG logo' },
  { id: 'none', name: 'None / Hidden', description: 'Leave this side empty' },
];

export const LogoSettingsModal: React.FC<LogoSettingsModalProps> = ({
  isOpen,
  onClose,
  logos,
  onSaveLogos,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<LogoSettings>({
    leftPreset: logos.leftPreset || 'sode',
    leftCustomUrl: logos.leftCustomUrl || '',
    rightPreset: logos.rightPreset || 'smvitm',
    rightCustomUrl: logos.rightCustomUrl || '',
  });

  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (side === 'left') {
        setForm((prev) => ({
          ...prev,
          leftPreset: 'custom',
          leftCustomUrl: result,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          rightPreset: 'custom',
          rightCustomUrl: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    setForm({
      leftPreset: 'sode',
      leftCustomUrl: '',
      rightPreset: 'smvitm',
      rightCustomUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLogos(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-[#8b1d24] rounded-lg border border-red-100">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Change Report Logos
              </h3>
              <p className="text-xs text-slate-500">
                Customize institutional logos displayed on all official academic reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Header Preview */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Live Header Preview
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Changes reflect across all reports
            </span>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-300 shadow-xs flex items-center justify-between gap-2">
            {/* Left Preview */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border border-dashed border-slate-200 rounded p-1 bg-slate-50/50">
                <InstitutionalLogoRenderer
                  preset={form.leftPreset}
                  customUrl={form.leftCustomUrl}
                  defaultPreset="sode"
                  className="w-12 h-12 sm:w-14 sm:h-14"
                  alt="Left Logo Preview"
                />
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Left Logo</span>
            </div>

            {/* Institution Text */}
            <div className="text-center flex-1 px-2">
              <h4 className="text-[10px] sm:text-xs font-extrabold text-[#8b1d24] uppercase font-serif leading-tight">
                Shri Madhwa Vadiraja Institute of Technology & Management
              </h4>
              <p className="text-[9px] font-bold text-slate-700">Bantakal, Udupi - 574115</p>
              <p className="text-[8px] text-slate-500">SMVITM Bantakal</p>
            </div>

            {/* Right Preview */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border border-dashed border-slate-200 rounded p-1 bg-slate-50/50">
                <InstitutionalLogoRenderer
                  preset={form.rightPreset}
                  customUrl={form.rightCustomUrl}
                  defaultPreset="smvitm"
                  className="w-12 h-12 sm:w-14 sm:h-14"
                  alt="Right Logo Preview"
                />
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Right Logo</span>
            </div>
          </div>
        </div>

        {/* Tab Selection for Left vs Right Logo */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSide('left')}
              className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeSide === 'left'
                  ? 'bg-white text-blue-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Left Logo (Trust / Group)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                {form.leftPreset}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('right')}
              className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeSide === 'right'
                  ? 'bg-white text-blue-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Right Logo (College / Dept)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                {form.rightPreset}
              </span>
            </button>
          </div>

          {/* Preset Selection Options */}
          <div className="space-y-3 text-xs">
            <label className="block font-bold text-slate-800">
              Select Logo for {activeSide === 'left' ? 'Left Position' : 'Right Position'}:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_OPTIONS.map((opt) => {
                const currentPreset = activeSide === 'left' ? form.leftPreset : form.rightPreset;
                const isSelected = currentPreset === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (activeSide === 'left') {
                        setForm((prev) => ({ ...prev, leftPreset: opt.id }));
                      } else {
                        setForm((prev) => ({ ...prev, rightPreset: opt.id }));
                      }
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded">
                      <InstitutionalLogoRenderer
                        preset={opt.id}
                        customUrl={activeSide === 'left' ? form.leftCustomUrl : form.rightCustomUrl}
                        defaultPreset={activeSide === 'left' ? 'sode' : 'smvitm'}
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {opt.name}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Upload Box when 'custom' is active or for direct uploading */}
            {(activeSide === 'left' ? form.leftPreset === 'custom' : form.rightPreset === 'custom') && (
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Custom Logo Image
                  </span>
                  {(activeSide === 'left' ? form.leftCustomUrl : form.rightCustomUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSide === 'left') {
                          setForm((prev) => ({ ...prev, leftCustomUrl: '', leftPreset: 'sode' }));
                        } else {
                          setForm((prev) => ({ ...prev, rightCustomUrl: '', rightPreset: 'smvitm' }));
                        }
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Image
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="file"
                    ref={activeSide === 'left' ? leftFileInputRef : rightFileInputRef}
                    onChange={(e) => handleFileUpload(e, activeSide)}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSide === 'left') {
                        leftFileInputRef.current?.click();
                      } else {
                        rightFileInputRef.current?.click();
                      }
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Choose Image File...</span>
                  </button>

                  <span className="text-[11px] text-slate-500">or enter image URL:</span>

                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={activeSide === 'left' ? form.leftCustomUrl : form.rightCustomUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeSide === 'left') {
                        setForm((prev) => ({ ...prev, leftCustomUrl: val }));
                      } else {
                        setForm((prev) => ({ ...prev, rightCustomUrl: val }));
                      }
                    }}
                    className="flex-1 w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Supports PNG, JPG, SVG, WebP with transparent background recommended.
                </p>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-logo-settings-btn"
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Logos</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
