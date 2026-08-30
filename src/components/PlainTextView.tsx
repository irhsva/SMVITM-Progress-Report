import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Share2, Layers, Archive } from 'lucide-react';
import { StudentReport } from '../types';
import { formatStudentReportPlainText, formatAllReportsPlainText, formatWhatsAppMessage } from '../utils/reportFormatter';
import { downloadAllReportsZip } from '../utils/downloadAllReports';

interface PlainTextViewProps {
  reports: StudentReport[];
  selectedStudent: StudentReport | null;
}

export const PlainTextView: React.FC<PlainTextViewProps> = ({ reports, selectedStudent }) => {
  const [viewMode, setViewMode] = useState<'selected' | 'all'>('all');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const currentReport = selectedStudent || reports[0];
  const plainTextContent = viewMode === 'all' 
    ? formatAllReportsPlainText(reports) 
    : (currentReport ? formatStudentReportPlainText(currentReport) : '');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top action bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Plain-Text / Markdown Formatted Output
            </h3>
            <p className="text-xs text-slate-400">
              Formatted according to SMVITM institutional template specifications
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs font-medium">
            <button
              id="view-all-reports-btn"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Students ({reports.length})
            </button>
            <button
              id="view-selected-report-btn"
              onClick={() => setViewMode('selected')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'selected' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Selected ({currentReport ? currentReport.student.usn : 'None'})
            </button>
          </div>
        </div>
      </div>

      {/* Secondary quick action toolbar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-400">
          {viewMode === 'all' ? (
            <span>Showing combined report for <strong className="text-emerald-400">{reports.length}</strong> students separated by <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">--- page break ---</code></span>
          ) : (
            <span>Showing single report for <strong className="text-emerald-400">{currentReport?.student.name}</strong> (<span className="font-mono text-slate-300">{currentReport?.student.usn}</span>)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp copy for selected */}
          {currentReport && (
            <button
              id="copy-whatsapp-btn"
              onClick={() => copyToClipboard(formatWhatsAppMessage(currentReport), 'whatsapp')}
              className="px-2.5 py-1.5 bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-100 rounded-md border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
              title="Copy WhatsApp parent notification summary"
            >
              {copiedType === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedType === 'whatsapp' ? 'Copied WhatsApp!' : 'WhatsApp Msg'}</span>
            </button>
          )}

          {/* Copy Text */}
          <button
            id="copy-plaintext-btn"
            onClick={() => copyToClipboard(plainTextContent, 'text')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copiedType === 'text' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedType === 'text' ? 'Copied to Clipboard!' : viewMode === 'all' ? 'Copy All Reports' : 'Copy This Report'}</span>
          </button>

          {/* Download Text */}
          {viewMode === 'all' && (
            <button
              id="download-zip-all-btn"
              onClick={() => downloadAllReportsZip(reports, `SMVITM_AI_DS_7thSem_IA1_${reports.length}_Reports.zip`)}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
              title="Download individual reports in a ZIP archive"
            >
              <Archive className="w-3.5 h-3.5 text-indigo-200" />
              <span>Download ZIP ({reports.length})</span>
            </button>
          )}

          <button
            id="download-txt-btn"
            onClick={() => downloadTextFile(
              plainTextContent, 
              viewMode === 'all' ? `SMVITM_AI_DS_7thSem_IA1_All_Reports.txt` : `${currentReport?.student.usn}_IA1_Report.txt`
            )}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>.txt</span>
          </button>

          <button
            id="download-md-btn"
            onClick={() => downloadTextFile(
              plainTextContent, 
              viewMode === 'all' ? `SMVITM_AI_DS_7thSem_IA1_All_Reports.md` : `${currentReport?.student.usn}_IA1_Report.md`
            )}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>.md</span>
          </button>
        </div>
      </div>

      {/* Monospace display box */}
      <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto bg-[#0a0f1d] font-mono text-[11px] sm:text-xs leading-relaxed text-slate-200 select-all border-t border-slate-800/80">
        <pre className="whitespace-pre">
          {plainTextContent}
        </pre>
      </div>
    </div>
  );
};
