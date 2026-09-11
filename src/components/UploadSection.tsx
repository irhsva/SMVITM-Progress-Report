import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Download, CheckCircle2, AlertCircle, RefreshCw, Layers, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { parseExcelBuffer } from '../utils/excelParser';
import { generateCustomExcelWorkbook, getSampleReports } from '../data/sampleExcelData';
import { DEFAULT_SUBJECTS } from '../data/defaultSubjects';
import { StudentReport, ReportConfig, SubjectDef } from '../types';

interface UploadSectionProps {
  onReportsLoaded: (reports: StudentReport[], filename: string, rawBuffer?: ArrayBuffer) => void;
  currentFilename: string | null;
  reportCount: number;
  config: ReportConfig;
  customSubjects: SubjectDef[];
  onSubjectsChange: (subjects: SubjectDef[]) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onReportsLoaded,
  currentFilename,
  reportCount,
  config,
  customSubjects,
  onSubjectsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSubjectConfig, setShowSubjectConfig] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Form state for adding/editing new subject
  const [editingSubject, setEditingSubject] = useState<SubjectDef | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState(25);
  const [newIsElective, setNewIsElective] = useState(false);

  const handleFileProcess = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Please upload a valid Excel spreadsheet (.xlsx or .xls file).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const reports = parseExcelBuffer(buffer, config, customSubjects);
      if (reports.length === 0) {
        throw new Error('No student records found in the uploaded file.');
      }
      onReportsLoaded(reports, file.name, buffer);
    } catch (err: any) {
      console.error('Error parsing excel:', err);
      setErrorMsg(err?.message || 'Failed to process Excel file. Please ensure sheet headers match subject codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const loadDemoData = () => {
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const sample = getSampleReports(customSubjects);
      onReportsLoaded(sample, 'Custom-Department-Dataset.xlsx (Sample)');
      setLoading(false);
    }, 200);
  };

  const handleDownloadCustomTemplate = () => {
    const buffer = generateCustomExcelWorkbook(customSubjects);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Custom_Department_Marks_Template.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startEditSubject = (subj: SubjectDef) => {
    setEditingSubject(subj);
    setNewCode(subj.code);
    setNewName(subj.name);
    setNewMaxMarks(subj.defaultMaxMarks);
    setNewIsElective(subj.isElective || false);
    setShowSubjectConfig(true);
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setNewCode('');
    setNewName('');
    setNewMaxMarks(25);
    setNewIsElective(false);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const formattedCode = newCode.trim().toUpperCase();

    // Check for duplicate code if adding a new subject
    if (!editingSubject && customSubjects.some((s) => s.code === formattedCode)) {
      setErrorMsg(`Subject code ${formattedCode} already exists.`);
      return;
    }

    const newSubject: SubjectDef = {
      code: formattedCode,
      name: newName.trim(),
      defaultMaxMarks: Number(newMaxMarks) || 25,
      isElective: newIsElective,
      electiveType: newIsElective ? (formattedCode.includes('755') ? 'open' : 'professional') : undefined,
    };

    let updated: SubjectDef[];
    if (editingSubject) {
      updated = customSubjects.map((s) => (s.code === editingSubject.code ? newSubject : s));
      setEditingSubject(null);
    } else {
      updated = [...customSubjects, newSubject];
    }

    onSubjectsChange(updated);
    localStorage.setItem('customSubjects', JSON.stringify(updated));
    setErrorMsg(null);
    setNewCode('');
    setNewName('');
    setNewMaxMarks(25);
    setNewIsElective(false);

    setSaveNotification(`Subject "${formattedCode}" saved and synced to reports!`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const moveSubject = (index: number, direction: 'up' | 'down') => {
    const newSubjects = [...customSubjects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newSubjects.length) {
      [newSubjects[index], newSubjects[targetIndex]] = [newSubjects[targetIndex], newSubjects[index]];
      onSubjectsChange(newSubjects);
      localStorage.setItem('customSubjects', JSON.stringify(newSubjects));
    }
  };

  const handleDeleteSubject = (code: string) => {
    const updated = customSubjects.filter((s) => s.code !== code);
    onSubjectsChange(updated);
    localStorage.setItem('customSubjects', JSON.stringify(updated));
    setSaveNotification(`Subject "${code}" removed and reports updated.`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleClearAllSubjects = () => {
    if (window.confirm('Are you sure you want to clear all subjects? You can add new ones or click "Reset to Defaults".')) {
      onSubjectsChange([]);
      localStorage.setItem('customSubjects', JSON.stringify([]));
    }
  };

  const handleResetSubjects = () => {
    onSubjectsChange(DEFAULT_SUBJECTS);
    localStorage.setItem('customSubjects', JSON.stringify(DEFAULT_SUBJECTS));
    setSaveNotification('Reset to default 9 department subjects.');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleSaveConfiguration = () => {
    localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
    onSubjectsChange([...customSubjects]);
    setSaveNotification('Configuration successfully saved and synced to all reports!');
    setTimeout(() => setSaveNotification(null), 3500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#8b1d24]" />
            Excel Data Ingestion & Subject Template Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure department subject codes & names, generate matching Excel templates, and upload marks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configure Subjects Toggle Button */}
          <button
            onClick={() => setShowSubjectConfig(!showSubjectConfig)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSubjectConfig ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{showSubjectConfig ? 'Hide Subject Setup' : 'Configure Subjects & Template'}</span>
          </button>

          {/* Quick Demo Button */}
          <button
            id="load-demo-data-btn"
            onClick={loadDemoData}
            disabled={loading}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Load Sample Dataset</span>
          </button>

          {/* Download Custom Template */}
          <button
            id="download-excel-template-btn"
            onClick={handleDownloadCustomTemplate}
            className="px-3.5 py-2 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download Excel template matching configured subjects"
          >
            <Download className="w-4 h-4 text-red-200" />
            <span>Download Custom Template (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Subject Configuration Panel */}
      {showSubjectConfig && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Department Subjects Configuration</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                  {customSubjects.length} Subjects
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, delete, edit, or reorder subjects. All changes are automatically synchronized to student reports, Master Grid, and downloaded Excel templates.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveConfiguration}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Save subject configuration and apply to reports"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
              <button
                type="button"
                onClick={handleResetSubjects}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                title="Reset to default 9 curriculum subjects"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={handleClearAllSubjects}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                title="Clear all subjects"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveNotification && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveNotification}</span>
            </div>
          )}

          {/* Current Subjects List */}
          {customSubjects.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
              No subjects configured yet. Add subjects below or click <strong>Reset to Defaults</strong> to restore standard semester subjects.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
              {customSubjects.map((subj, index) => {
                const isCurrentEdit = editingSubject?.code === subj.code;
                const isLab = subj.code.toUpperCase().endsWith('L') || subj.name.toLowerCase().includes('lab');
                return (
                  <div
                    key={subj.code}
                    className={`bg-white p-3 rounded-lg border transition-all shadow-xs flex items-start justify-between gap-2 ${
                      isCurrentEdit ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-mono text-[11px] font-bold">
                          {subj.code}
                        </span>
                        <span className="text-[10.5px] font-semibold text-slate-600">
                          Max: {subj.defaultMaxMarks}
                        </span>
                        {isLab && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9.5px] font-bold">
                            LAB
                          </span>
                        )}
                        {subj.isElective && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[9.5px] font-medium">
                            {subj.electiveType === 'open' ? 'Open Elective' : 'Elective'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-900 mt-1 line-clamp-2 leading-tight" title={subj.name}>
                        {subj.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveSubject(index, 'up')}
                          disabled={index === 0}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-1 rounded transition-colors"
                          title="Move earlier in report"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSubject(index, 'down')}
                          disabled={index === customSubjects.length - 1}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-1 rounded transition-colors"
                          title="Move later in report"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => startEditSubject(subj)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded transition-colors"
                          title="Edit this subject"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(subj.code)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete this subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add / Edit Subject Form */}
          <form onSubmit={handleAddSubject} className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                {editingSubject ? `Edit Subject (${editingSubject.code})` : 'Add New Subject'}
              </span>
              {editingSubject && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-end gap-2.5">
              <div className="w-28">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. BAI701"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Deep Learning & Reinforcement Learning"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="w-24">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono focus:ring-1 focus:ring-blue-500"
                  min="5"
                  max="100"
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 pb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newIsElective}
                    onChange={(e) => setNewIsElective(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Elective</span>
                </label>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingSubject ? 'Save Changes' : 'Add Subject'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
          id="excel-file-input"
        />

        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#8b1d24] border border-red-100 shadow-inner">
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-[#8b1d24]" />
            ) : (
              <UploadCloud className="w-6 h-6 text-[#8b1d24]" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {loading ? 'Processing Excel rows and mapping subjects...' : 'Drop custom Excel spreadsheet here, or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Processes student marks and attendance based on your configured subject list
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-1">
            {customSubjects.map((s) => (
              <span key={s.code} className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-mono">
                {s.code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Import Warning:</strong> {errorMsg}
          </div>
        </div>
      )}

      {/* Current File Status Badge */}
      {currentFilename && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Loaded File: <strong className="font-semibold text-emerald-950">{currentFilename}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-900 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {reportCount} Students Processed
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
            >
              Upload Different File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
