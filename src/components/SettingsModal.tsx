import React, { useState } from 'react';
import { X, Settings, Check, Image as ImageIcon } from 'lucide-react';
import { ReportConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReportConfig;
  onSaveConfig: (cfg: ReportConfig) => void;
  onOpenLogoSettings?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onOpenLogoSettings,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<ReportConfig>({ ...config });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#8b1d24]" />
            Report & Institutional Settings
          </h3>
          <button
            onClick={onClose}
            className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <span className="text-xs font-medium">Exit</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
            {/* Institutional Logos Quick Shortcut Banner */}
            {onOpenLogoSettings && (
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#8b1d24]" />
                  <div>
                    <p className="font-bold text-[#8b1d24]">Institutional Logos</p>
                    <p className="text-[11px] text-slate-600">Change SODE, SMVITM, VTU or upload custom emblem</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogoSettings();
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-red-50 text-[#8b1d24] font-bold border border-red-300 rounded text-[11px] transition-colors"
                >
                  Change Logo...
                </button>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">Test Name Header</label>
              <input
                type="text"
                value={form.testName}
                onChange={(e) => setForm({ ...form, testName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. IA TEST 1 / Internal Test: 1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Semester</label>
                <input
                  type="text"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  placeholder="7th Sem"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Academic Year</label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  placeholder="2026-27 (Odd Sem)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">In-charge HOD Name</label>
              <input
                type="text"
                value={form.hodName}
                onChange={(e) => setForm({ ...form, hodName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="Ms. Tejaswini H"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">HOD Designation / Title</label>
              <input
                type="text"
                value={form.hodTitle}
                onChange={(e) => setForm({ ...form, hodTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="In-charge HOD, AI and DS"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Department Name</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={form.autoRemarks}
                  onChange={(e) => setForm({ ...form, autoRemarks: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-slate-800 font-medium">Auto-generate academic remarks</span>
              </label>

              <div className="mb-3">
                <label className="block text-slate-700 font-medium mb-1">Attendance Warning Threshold (%)</label>
                <input
                  type="number"
                  value={form.attendanceWarningThreshold}
                  onChange={(e) => setForm({ ...form, attendanceWarningThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 85"
                  required
                />
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-2">Report Footer / Institution Info</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.institutionInfo.name}
                  onChange={(e) => setForm({ ...form, institutionInfo: { ...form.institutionInfo, name: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Institution Name"
                />
                <input
                  type="text"
                  value={form.institutionInfo.subHeading}
                  onChange={(e) => setForm({ ...form, institutionInfo: { ...form.institutionInfo, subHeading: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Sub-Heading"
                />
                <input
                  type="text"
                  value={form.institutionInfo.address}
                  onChange={(e) => setForm({ ...form, institutionInfo: { ...form.institutionInfo, address: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Address"
                />
                <input
                  type="text"
                  value={form.institutionInfo.contactEmail}
                  onChange={(e) => setForm({ ...form, institutionInfo: { ...form.institutionInfo, contactEmail: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Contact Email"
                />
                <input
                  type="text"
                  value={form.institutionInfo.fullContactText}
                  onChange={(e) => setForm({ ...form, institutionInfo: { ...form.institutionInfo, fullContactText: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Full Contact Text"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
