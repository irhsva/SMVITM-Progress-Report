import React, { useState, useEffect, useMemo } from 'react';
import {
  Printer,
  FileText,
  LayoutDashboard,
  Table as TableIcon,
  Settings as SettingsIcon,
  Sparkles,
  Download,
  Share2,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit3,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Award,
  Users,
  Search,
  Filter,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  Layers,
  Image as ImageIcon,
  FileDown,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentReport, ReportConfig, LogoSettings, SubjectDef } from './types';
import { DEFAULT_CONFIG, INSTITUTION_INFO, DEFAULT_SUBJECTS } from './data/defaultSubjects';
import { getSampleReports, generateSampleExcelWorkbook } from './data/sampleExcelData';
import { UploadSection } from './components/UploadSection';
import { PrintableReport } from './components/PrintableReport';
import { PlainTextView } from './components/PlainTextView';
import { ClassAnalytics } from './components/ClassAnalytics';
import { EditStudentModal } from './components/EditStudentModal';
import { SettingsModal } from './components/SettingsModal';
import { LogoSettingsModal } from './components/LogoSettingsModal';
import { DownloadAllModal } from './components/DownloadAllModal';
import { formatAllReportsPlainText } from './utils/reportFormatter';
import { downloadAllReportsZip } from './utils/downloadAllReports';
import { downloadSingleStudentPdf, downloadAllIndividualPdfsZip } from './utils/pdfGenerator';

export default function App() {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'batch' | 'plaintext' | 'analytics' | 'grid' | 'upload'>('preview');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProctor, setSelectedProctor] = useState('');
  const [filterLowAttendance, setFilterLowAttendance] = useState(false);
  const [filterLowMarks, setFilterLowMarks] = useState(false);
  const [sortBy, setSortBy] = useState<'usn' | 'name' | 'attendance' | 'marks'>('usn');
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [customSubjects, setCustomSubjects] = useState<SubjectDef[]>(DEFAULT_SUBJECTS);
  const [logos, setLogos] = useState<LogoSettings>({
    leftPreset: 'sode',
    rightPreset: 'smvitm',
  });

  // Modals state
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGeneratingSinglePdf, setIsGeneratingSinglePdf] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // ... (existing code)

  const toggleStudentSelection = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleWhatsAppSend = () => {
    selectedStudentIds.forEach(id => {
      const studentReport = reports.find(r => r.id === id);
      if (studentReport && studentReport.student.parentNumber) {
        const msg = `Hello, here is the academic progress report for ${studentReport.student.name} (${studentReport.student.usn}). Attendance: ${studentReport.overallAttendance}%, Total Marks: ${studentReport.totalMarksScored}/${studentReport.totalMaxMarks}. Please find the detailed report attached.`;
        window.open(`https://wa.me/${studentReport.student.parentNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    });
  };
  useEffect(() => {
    const sample = getSampleReports(customSubjects);
    const reportsWithLogos = sample.map((r) => ({ ...r, logos, institutionInfo: config.institutionInfo }));
    setReports(reportsWithLogos);
    setCurrentFilename('AIML-7th SEM-ATTENDANCE & IA -1 Marks_Odd_26-27.xlsx (Sample)');
    if (reportsWithLogos.length > 0) {
      setSelectedStudentId(reportsWithLogos[0].id);
    }
  }, []);

  const handleReportsLoaded = (newReports: StudentReport[], filename: string) => {
    const withLogos = newReports.map((r) => ({ ...r, logos, institutionInfo: config.institutionInfo }));
    setReports(withLogos);
    setCurrentFilename(filename);
    if (withLogos.length > 0) {
      setSelectedStudentId(withLogos[0].id);
    }
    setActiveTab('preview');
    // celebrate smooth load
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  // Distinct proctors list
  const proctors = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.student.proctorName).filter(Boolean)));
  }, [reports]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchUsn = r.student.usn.toLowerCase().includes(q);
          const matchName = r.student.name.toLowerCase().includes(q);
          if (!matchUsn && !matchName) return false;
        }

        // Proctor filter
        if (selectedProctor && r.student.proctorName !== selectedProctor) {
          return false;
        }

        // Low attendance filter (<75%)
        if (filterLowAttendance && (r.overallAttendance === null || r.overallAttendance >= config.attendanceWarningThreshold)) {
          return false;
        }

        // Low IA marks filter (<40%)
        if (filterLowMarks && (r.percentageMarks === null || r.percentageMarks >= 40)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'usn') return a.student.usn.localeCompare(b.student.usn);
        if (sortBy === 'name') return a.student.name.localeCompare(b.student.name);
        if (sortBy === 'attendance') return (b.overallAttendance || 0) - (a.overallAttendance || 0);
        if (sortBy === 'marks') return (b.percentageMarks || 0) - (a.percentageMarks || 0);
        return 0;
      });
  }, [reports, searchQuery, selectedProctor, filterLowAttendance, filterLowMarks, sortBy, config]);

  // Keep selected student synced
  const selectedStudent = useMemo(() => {
    return reports.find((r) => r.id === selectedStudentId) || filteredReports[0] || reports[0] || null;
  }, [reports, selectedStudentId, filteredReports]);

  // Current student index in filtered list
  const currentStudentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return filteredReports.findIndex((r) => r.id === selectedStudent.id);
  }, [filteredReports, selectedStudent]);

  // Update a student
  const handleSaveStudent = (updated: StudentReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...updated, logos: updated.logos || logos } : r)));
  };

  // Update config
  const handleSaveConfig = (newConfig: ReportConfig) => {
    setConfig(newConfig);
    // Apply changes across existing reports
    setReports((prev) =>
      prev.map((r) => ({
        ...r,
        testName: newConfig.testName,
        student: { ...r.student, semester: newConfig.semester },
        academicYear: newConfig.academicYear,
        hodName: newConfig.hodName,
        hodTitle: newConfig.hodTitle,
        department: newConfig.department,
        institutionInfo: newConfig.institutionInfo,
      }))
    );
  };

  // Update logos across all reports
  const handleSaveLogos = (newLogos: LogoSettings) => {
    setLogos(newLogos);
    setReports((prev) =>
      prev.map((r) => ({
        ...r,
        logos: newLogos,
      }))
    );
    setConfig((prev) => ({
      ...prev,
      logos: newLogos,
    }));
  };

  // Trigger print
  const handlePrint = (mode: 'single' | 'all') => {
    setPrintMode(mode);
    // Allow DOM to update and images/SVGs to lay out before triggering print
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Download Individual PDF for the currently selected student
  const handleDownloadSinglePdf = async () => {
    if (!selectedStudent || isGeneratingSinglePdf) return;
    setIsGeneratingSinglePdf(true);
    try {
      await downloadSingleStudentPdf(selectedStudent, config.attendanceWarningThreshold);
    } catch (err) {
      console.error('Error generating single student PDF:', err);
    } finally {
      setIsGeneratingSinglePdf(false);
    }
  };

  // Download All as Combined Plain Text
  const handleDownloadAllText = () => {
    const listToExport = filteredReports.length > 0 ? filteredReports : reports;
    const text = formatAllReportsPlainText(listToExport);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SMVITM_AI_DS_7thSem_IA1_All_Reports.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-slate-200 text-slate-900 font-sans p-2 sm:p-4 overflow-hidden select-none sm:select-auto">
      {/* High Density Left Sidebar (Student Explorer & Batch Actions) */}
      <aside className={`fixed inset-y-2 left-2 z-40 w-72 sm:w-80 bg-white rounded-xl sm:rounded-l-xl sm:rounded-r-none border-r border-slate-300 flex flex-col shadow-xl sm:shadow-lg transition-transform duration-200 sm:static sm:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 rounded-t-xl sm:rounded-tl-xl sm:rounded-tr-none flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Academic Report Gen
            </h2>
            <p className="text-base sm:text-lg font-black text-blue-900 tracking-tight leading-tight">
              SMVITM Bantakal
            </p>
            <p className="text-[11px] text-[#8b1d24] font-bold">
              Academic Report Generator
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="sidebar-logo-btn"
              onClick={() => setIsLogoModalOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md border border-slate-200 transition-colors"
              title="Change Report Logos"
            >
              <ImageIcon className="w-4 h-4 text-[#8b1d24]" />
            </button>
            <button
              id="sidebar-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md border border-slate-200 transition-colors"
              title="Report Config (HOD, Semester, Year)"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="sm:hidden p-1.5 text-slate-600 hover:bg-slate-200 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-2.5 bg-slate-50/70 border-b border-slate-200 space-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="sidebar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search USN or Name..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Proctor Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              id="sidebar-proctor-select"
              value={selectedProctor}
              onChange={(e) => setSelectedProctor(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-[11px] text-slate-700 focus:outline-none truncate"
            >
              <option value="">All Proctors ({proctors.length})</option>
              {proctors.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterLowAttendance(!filterLowAttendance)}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                filterLowAttendance
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={`Filter low attendance (<${config.attendanceWarningThreshold}%)`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Attd &lt;{config.attendanceWarningThreshold}%</span>
            </button>

            <button
              onClick={() => setFilterLowMarks(!filterLowMarks)}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                filterLowMarks
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Filter low marks (<40% of max)"
            >
              <AlertCircle className="w-3 h-3" />
              <span>IA &lt;40%</span>
            </button>
          </div>
        </div>

        {/* Student List Count / Subhead */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100/60 border-b border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            GENERATED REPORTS ({filteredReports.length})
          </span>
          <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
            {config.semester || 'Odd 25-26'}
          </span>
        </div>

        {/* High Density Scrollable Student List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredReports.map((r, idx) => {
            const isSelected = selectedStudent?.id === r.id;
            const isWarningAttd = (r.overallAttendance || 0) < config.attendanceWarningThreshold;
            const isLowScore = (r.percentageMarks || 0) < 40;

            return (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedStudentId(r.id);
                  if (activeTab === 'upload') setActiveTab('preview');
                  setIsMobileSidebarOpen(false);
                }}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.has(r.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleStudentSelection(r.id);
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div
                    className="flex-1 flex items-center justify-between gap-1"
                    onClick={() => {
                      setSelectedStudentId(r.id);
                      if (activeTab === 'upload') setActiveTab('preview');
                      setIsMobileSidebarOpen(false);
                    }}
                  >
                    <p className={`text-xs font-mono font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {r.student.usn}
                    </p>
                    <span
                      className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                        isSelected
                          ? 'bg-blue-700 text-blue-100'
                          : isWarningAttd
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.overallAttendance}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 mt-0.5" onClick={() => {
                    setSelectedStudentId(r.id);
                    if (activeTab === 'upload') setActiveTab('preview');
                    setIsMobileSidebarOpen(false);
                }}>
                  <p className={`text-[10px] truncate italic ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {r.student.name}
                  </p>
                  <span className={`text-[9px] font-mono ${isSelected ? 'text-blue-100' : isLowScore ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                    {r.totalMarksScored}/{r.totalMaxMarks}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs">
              No students match criteria.
            </div>
          )}
        </div>

        {/* Sidebar Sticky Bottom Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 rounded-b-xl sm:rounded-bl-xl sm:rounded-br-none space-y-1.5">
          <button
            id="sidebar-download-all-btn"
            onClick={() => setIsDownloadModalOpen(true)}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs py-2 px-3 rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
            title="Download all student reports (ZIP, TXT, HTML, Excel, or PDF)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD ALL ({filteredReports.length})</span>
          </button>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setActiveTab('upload')}
              className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-medium flex items-center justify-center gap-1 truncate"
            >
              <UploadCloud className="w-3 h-3 text-blue-600" />
              <span>Import Sheet</span>
            </button>
            <button
              onClick={() => downloadAllIndividualPdfsZip(filteredReports.length > 0 ? filteredReports : reports, config.attendanceWarningThreshold)}
              className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-medium flex items-center justify-center gap-1 truncate"
              title="Download all individual student PDF reports in a ZIP archive"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>PDFs ZIP</span>
            </button>
          </div>
        </div>
      </aside>

      {/* High Density Main Workspace */}
      <main className="flex-1 bg-white rounded-xl sm:rounded-l-none sm:rounded-r-xl shadow-xl flex flex-col overflow-hidden min-w-0">
        {/* Top Control & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-white gap-2">
          {/* Left: Mobile Toggle & Document Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="sm:hidden p-1.5 bg-slate-100 rounded-md text-slate-700 border border-slate-200"
              title="Open Student List"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="bg-blue-50 p-2 rounded-lg text-blue-700 border border-blue-100 hidden xs:flex">
              <FileCheck2 className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Report Preview:</span>
                <span className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {selectedStudent ? selectedStudent.student.usn : 'No Student Selected'}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                {selectedStudent ? `${selectedStudent.student.name} • Document ready for signature` : 'Upload or select a student'}
              </p>
            </div>
          </div>

          {/* Center Tabs: High Density View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              id="tab-preview-btn"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Single Report</span>
              <span className="md:hidden">Single</span>
            </button>

            <button
              id="tab-batch-btn"
              onClick={() => setActiveTab('batch')}
              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'batch'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">All Reports ({filteredReports.length})</span>
              <span className="md:hidden">All ({filteredReports.length})</span>
            </button>

            <button
              id="tab-plaintext-btn"
              onClick={() => setActiveTab('plaintext')}
              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'plaintext'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Plain-Text</span>
              <span className="md:hidden">Text</span>
            </button>

            <button
              id="tab-analytics-btn"
              onClick={() => setActiveTab('analytics')}
              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Analytics</span>
              <span className="md:hidden">Stats</span>
            </button>

            <button
              id="tab-grid-btn"
              onClick={() => setActiveTab('grid')}
              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Master Grid</span>
              <span className="md:hidden">Grid</span>
            </button>

            <button
              id="tab-upload-btn"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-[#8b1d24] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="header-change-logo-btn"
              onClick={() => setIsLogoModalOpen(true)}
              className="text-xs border border-slate-200 px-2.5 py-1.5 rounded-md hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change or customize report institutional logos"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8b1d24]" />
              <span className="hidden sm:inline">Change Logo</span>
            </button>

            {selectedStudent && (
              <button
                id="header-edit-student-btn"
                onClick={() => setIsEditingStudent(true)}
                className="text-xs border border-slate-200 px-2.5 py-1.5 rounded-md hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-1 transition-colors"
                title="Edit student attendance and scores"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {selectedStudent && (
              <button
                id="header-download-single-pdf-btn"
                onClick={handleDownloadSinglePdf}
                disabled={isGeneratingSinglePdf}
                className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
                title="Download individual PDF file for current student"
              >
                {isGeneratingSinglePdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            )}

            <button
              id="header-print-single-btn"
              onClick={() => handlePrint('single')}
              disabled={!selectedStudent}
              className="text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
              title="Print or export current student report to PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print Current</span>
            </button>

            <button
              id="header-download-all-btn"
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
              title="Download all student reports (ZIP, TXT, HTML, Excel, or PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All ({filteredReports.length})</span>
            </button>
          </div>
        </div>

        {/* High Density Canvas Body */}
        <div className="flex-1 p-3 sm:p-6 bg-slate-50 flex flex-col overflow-y-auto">
          {/* TAB 1: Report Preview */}
          {activeTab === 'preview' && (
            <div className="w-full flex-1 flex flex-col justify-start">
              {selectedStudent ? (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  {/* The Document */}
                  <PrintableReport report={selectedStudent} />

                  {/* Compact Bottom Switcher Bar */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm sticky bottom-0 z-20">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Viewing:</span>
                      <span className="font-bold text-slate-800">{selectedStudent.student.name}</span>
                      <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {selectedStudent.student.usn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (currentStudentIndex > 0) {
                            setSelectedStudentId(filteredReports[currentStudentIndex - 1].id);
                          }
                        }}
                        disabled={currentStudentIndex <= 0}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1 text-slate-700"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>

                      <span className="text-[11px] text-slate-500 font-mono px-1">
                        {currentStudentIndex + 1} / {filteredReports.length}
                      </span>

                      <button
                        onClick={() => {
                          if (currentStudentIndex < filteredReports.length - 1) {
                            setSelectedStudentId(filteredReports[currentStudentIndex + 1].id);
                          }
                        }}
                        disabled={currentStudentIndex >= filteredReports.length - 1}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1 text-slate-700"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200 my-auto">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">No Student Selected</h3>
                  <p className="text-xs text-slate-500 mt-1">Please select a student from the left sidebar.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Batch All Reports View */}
          {activeTab === 'batch' && (
            <div className="w-full max-w-4xl mx-auto space-y-6">

              {/* List of all printable student cards */}
              {filteredReports.map((report, idx) => (
                <div key={report.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-2">
                    <span className="font-bold text-slate-700">Document {idx + 1} of {filteredReports.length}</span>
                    <span>{report.student.usn} — {report.student.name}</span>
                  </div>
                  <PrintableReport report={report} />
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">No Reports Found</h3>
                  <p className="text-xs text-slate-500 mt-1">Please clear filters or upload a spreadsheet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Plain-Text Output */}
          {activeTab === 'plaintext' && (
            <div className="max-w-4xl mx-auto w-full">
              <PlainTextView
                reports={filteredReports.length > 0 ? filteredReports : reports}
                selectedStudent={selectedStudent}
                currentStudentIndex={currentStudentIndex}
                onNext={() => {
                  const reportsList = filteredReports.length > 0 ? filteredReports : reports;
                  if (currentStudentIndex < reportsList.length - 1) {
                    setSelectedStudentId(reportsList[currentStudentIndex + 1].id);
                  }
                }}
                onPrev={() => {
                  const reportsList = filteredReports.length > 0 ? filteredReports : reports;
                  if (currentStudentIndex > 0) {
                    setSelectedStudentId(reportsList[currentStudentIndex - 1].id);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 3: Class Analytics */}
          {activeTab === 'analytics' && (
            <div className="max-w-4xl mx-auto w-full">
              <ClassAnalytics reports={reports} />
            </div>
          )}

          {/* TAB 4: Master Marks Grid */}
          {activeTab === 'grid' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-purple-600" />
                    Master Academic & Attendance Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Department • 7th Sem IA-1 Master Sheet ({reports.length} records)
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                      <th className="p-2">#</th>
                      <th className="p-2">USN</th>
                      <th className="p-2">Student Name</th>
                      <th className="p-2">Proctor</th>
                      <th className="p-2 text-center font-mono">BAI701</th>
                      <th className="p-2 text-center font-mono">BAD702</th>
                      <th className="p-2 text-center font-mono">BAD703</th>
                      <th className="p-2 text-center font-mono">BAD714B</th>
                      <th className="p-2 text-center font-mono">BEC755A</th>
                      <th className="p-2 text-center font-mono">BME755A</th>
                      <th className="p-2 text-center font-mono">BAD786</th>
                      <th className="p-2 text-center">Attd%</th>
                      <th className="p-2 text-center">Score</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((r, idx) => {
                      const getSub = (code: string) => r.subjects.find((s) => s.code === code);
                      const bai = getSub('BAI701');
                      const bad2 = getSub('BAD702');
                      const bad3 = getSub('BAD703');
                      const bad4 = getSub('BAD714B');
                      const bec = getSub('BEC755A');
                      const bme = getSub('BME755A');
                      const bad8 = getSub('BAD786');

                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2 font-mono font-semibold text-slate-900">{r.student.usn}</td>
                          <td className="p-2 font-medium text-slate-900">{r.student.name}</td>
                          <td className="p-2 text-slate-600 truncate max-w-[110px]">{r.student.proctorName}</td>
                          <td className="p-2 text-center font-mono">{bai?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono">{bad2?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono">{bad3?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono">{bad4?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono text-slate-500">{bec?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono text-slate-500">{bme?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono">{bad8?.marksScored || '-'}</td>
                          <td className="p-2 text-center font-mono font-semibold">
                            <span className={`${(r.overallAttendance || 0) < config.attendanceWarningThreshold ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                              {r.overallAttendance}%
                            </span>
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-blue-700">
                            {r.totalMarksScored}/{r.totalMaxMarks}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => {
                                setSelectedStudentId(r.id);
                                setActiveTab('preview');
                              }}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold transition-colors"
                            >
                              Preview
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Excel Ingestion */}
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto w-full">
              <UploadSection
                onReportsLoaded={handleReportsLoaded}
                currentFilename={currentFilename}
                reportCount={reports.length}
                config={config}
                customSubjects={customSubjects}
                onSubjectsChange={setCustomSubjects}
              />
            </div>
          )}
        </div>
      </main>

      {/* DEDICATED HIDDEN PRINT ENGINE (Activated exclusively on window.print()) */}
      <div className="hidden print:block print-only-container">
        {printMode === 'single' && selectedStudent ? (
          <div className="print-page-break">
            <PrintableReport report={selectedStudent} />
          </div>
        ) : (
          (filteredReports.length > 0 ? filteredReports : reports).map((report) => (
            <div key={report.id} className="print-page-break">
              <PrintableReport report={report} />
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {selectedStudent && (
        <EditStudentModal
          report={selectedStudent}
          isOpen={isEditingStudent}
          onClose={() => setIsEditingStudent(false)}
          onSave={handleSaveStudent}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onOpenLogoSettings={() => setIsLogoModalOpen(true)}
      />

      <LogoSettingsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        logos={logos}
        onSaveLogos={handleSaveLogos}
      />

      <DownloadAllModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        reports={filteredReports.length > 0 ? filteredReports : reports}
        allReports={reports}
        initialProctor={selectedProctor}
        config={config}
        onTriggerPrintAll={() => handlePrint('all')}
      />
    </div>
  );
}
