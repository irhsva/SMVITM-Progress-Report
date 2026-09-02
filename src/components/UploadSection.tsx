import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Download, CheckCircle2, AlertCircle, RefreshCw, Layers, Plus, Trash2 } from 'lucide-react';
import { parseExcelBuffer } from '../utils/excelParser';
import { generateCustomExcelWorkbook, getSampleReports } from '../data/sampleExcelData';
import { DEFAULT_SUBJECTS } from '../data/defaultSubjects';
import { StudentReport, ReportConfig, SubjectDef } from '../types';

interface UploadSectionProps {
  onReportsLoaded: (reports: StudentReport[], filename: string) => void;
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
      onReportsLoaded(reports, file.name);
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
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const newSubject = {
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        defaultMaxMarks: Number(newMaxMarks) || 25,
        isElective: newIsElective,
    };

    let updated: SubjectDef[];
    if (editingSubject) {
        updated = customSubjects.map(s => s.code === editingSubject.code ? newSubject : s);
        setEditingSubject(null);
    } else {
        updated = [...customSubjects, newSubject];
    }
    
    onSubjectsChange(updated);
    setNewCode('');
    setNewName('');
    setNewMaxMarks(25);
    setNewIsElective(false);
  };

  const handleDeleteSubject = (code: string) => {
    if (customSubjects.length <= 1) {
      setErrorMsg('You must have at least one subject.');
      return;
    }
    const updated = customSubjects.filter((s) => s.code !== code);
    onSubjectsChange(updated);
  };

  const handleResetSubjects = () => {
    onSubjectsChange(DEFAULT_SUBJECTS);
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Department Subjects Configuration</h3>
              <p className="text-xs text-slate-500">
                Add, remove, or modify subject codes and names. The custom template and parser will automatically adapt to these subjects.
              </p>
            </div>
            <button
              onClick={handleResetSubjects}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded transition-colors"
            >
              Reset to AIML Defaults
            </button>
          </div>

          {/* Current Subjects List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
            {customSubjects.map((subj) => (
              <div key={subj.code} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-mono text-[11px] font-bold">
                      {subj.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">Max: {subj.defaultMaxMarks}</span>
                    {subj.isElective && (
                      <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[10px] font-medium">
                        Elective
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-900 mt-1 line-clamp-2">{subj.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => startEditSubject(subj)}
                    className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                    title="Edit Subject"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subj.code)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                    title="Remove Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Subject Form */}
          <form onSubmit={handleAddSubject} className="flex flex-wrap items-end gap-2 pt-2 border-t border-slate-200">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. CS801"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Cloud Computing & Big Data"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Marks</label>
              <input
                type="number"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                min="10"
                max="100"
                required
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsElective}
                  onChange={(e) => setNewIsElective(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <span>Elective</span>
              </label>
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingSubject ? 'Update Subject' : 'Add Subject'}</span>
            </button>
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
