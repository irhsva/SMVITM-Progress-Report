import React, { useState } from 'react';
import {
  X,
  Download,
  FileDown,
  Archive,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  Users,
  FolderArchive,
  FileCheck
} from 'lucide-react';
import { StudentReport, ReportConfig } from '../types';
import {
  downloadAllIndividualPdfsZip,
  downloadAllMergedPdf,
  downloadProctorWisePdfsZip,
  downloadSingleProctorPdfsZip,
  downloadSingleProctorMergedPdf
} from '../utils/pdfGenerator';
import {
  downloadAllReportsZip,
  downloadAllExcelSummary,
  downloadProctorWiseExcelWorkbook,
} from '../utils/downloadAllReports';

interface DownloadAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: StudentReport[];
  allReports?: StudentReport[];
  initialProctor?: string;
  config: ReportConfig;
  onTriggerPrintAll: () => void;
}

export const DownloadAllModal: React.FC<DownloadAllModalProps> = ({
  isOpen,
  onClose,
  reports,
  allReports,
  initialProctor = '',
  config: _config,
  onTriggerPrintAll,
}) => {
  if (!isOpen) return null;

  const datasetReports = allReports && allReports.length > 0 ? allReports : reports;
  const isFiltered = reports.length < datasetReports.length;

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'proctor'>(
    initialProctor ? 'proctor' : 'all'
  );
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  // Group by Proctors for proctor-wise downloads
  const proctorList = Array.from(
    new Set(datasetReports.map((r) => r.student.proctorName?.trim()).filter(Boolean))
  ).sort() as string[];

  const [selectedProctorForDownload, setSelectedProctorForDownload] = useState<string>(
    initialProctor || proctorList[0] || ''
  );

  const getProctorCount = (pName: string) => {
    return datasetReports.filter(
      (r) => (r.student.proctorName || 'Unassigned').trim().toLowerCase() === pName.trim().toLowerCase()
    ).length;
  };

  const handleDownload = async (
    format:
      | 'pdf-zip'
      | 'pdf-merged'
      | 'txt-zip'
      | 'excel'
      | 'print'
      | 'proctor-zip'
      | 'proctor-excel'
      | 'single-proctor-zip'
      | 'single-proctor-pdf',
    specificProctor?: string
  ) => {
    setDownloadingFormat(format);
    setDownloadSuccess(null);
    setProgress(null);

    try {
      if (format === 'pdf-zip') {
        await downloadAllIndividualPdfsZip(
          reports,
          `SMVITM_AI_DS_7thSem_Individual_PDF_Reports_${reports.length}.zip`,
          (current, total, name) => {
            setProgress({ current, total, name });
          }
        );
        setDownloadSuccess(`Successfully generated and downloaded ${reports.length} individual student PDF reports in ZIP!`);
      } else if (format === 'pdf-merged') {
        await downloadAllMergedPdf(
          reports,
          `SMVITM_AI_DS_7thSem_Master_All_Students_Reports.pdf`,
          (current, total, name) => {
            setProgress({ current, total, name });
          }
        );
        setDownloadSuccess(`Combined Master PDF with all ${reports.length} student pages downloaded successfully!`);
      } else if (format === 'proctor-zip') {
        await downloadProctorWisePdfsZip(
          datasetReports,
          `SMVITM_Proctor_Wise_Organized_Student_PDFs.zip`,
          (current, total, name) => {
            setProgress({ current, total, name });
          }
        );
        setDownloadSuccess(`Proctor-Wise ZIP generated! Reports organized into separate folders for each of the ${proctorList.length} proctors.`);
      } else if (format === 'proctor-excel') {
        downloadProctorWiseExcelWorkbook(datasetReports, `SMVITM_Proctor_Wise_Summary_Data.xlsx`);
        setDownloadSuccess('Proctor-Wise Excel workbook with separate worksheets for each proctor downloaded successfully!');
      } else if (format === 'single-proctor-zip') {
        const targetProctor = specificProctor || selectedProctorForDownload;
        if (!targetProctor) return;
        await downloadSingleProctorPdfsZip(datasetReports, targetProctor, (current, total, name) => {
          setProgress({ current, total, name });
        });
        setDownloadSuccess(`Downloaded student PDFs ZIP archive for proctor: ${targetProctor}!`);
      } else if (format === 'single-proctor-pdf') {
        const targetProctor = specificProctor || selectedProctorForDownload;
        if (!targetProctor) return;
        await downloadSingleProctorMergedPdf(datasetReports, targetProctor, (current, total, name) => {
          setProgress({ current, total, name });
        });
        setDownloadSuccess(`Downloaded combined Master PDF for proctor: ${targetProctor}!`);
      } else if (format === 'txt-zip') {
        await downloadAllReportsZip(reports, `SMVITM_AI_DS_7thSem_${reports.length}_Text_Reports.zip`);
        setDownloadSuccess('ZIP archive with all student text reports downloaded successfully!');
      } else if (format === 'excel') {
        downloadAllExcelSummary(reports, `SMVITM_AI_DS_7thSem_Student_Reports_Data.xlsx`);
        setDownloadSuccess('Master Excel spreadsheet downloaded successfully!');
      } else if (format === 'print') {
        onClose();
        onTriggerPrintAll();
        return;
      }
    } catch (err) {
      console.error('Error downloading:', err);
    } finally {
      setDownloadingFormat(null);
      setProgress(null);
    }
  };

  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-300 rounded-xl border border-blue-400/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Download Student Reports</span>
                <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                  {reports.length} Students
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Full class batch export & proctor-wise organized archives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={!!downloadingFormat}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Standard Batch vs Proctor-Wise */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1.5 text-xs font-bold">
          <button
            id="tab-download-all-batch"
            onClick={() => setActiveSubTab('all')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Complete Class Batch ({reports.length})</span>
          </button>

          <button
            id="tab-download-proctor-wise"
            onClick={() => setActiveSubTab('proctor')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'proctor'
                ? 'bg-white text-indigo-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-700" />
            <span>Proctor-Wise Downloads ({proctorList.length} Proctors)</span>
          </button>
        </div>

        {/* Progress Bar Active Status */}
        {downloadingFormat && progress && (
          <div className="bg-blue-50 border-b border-blue-200 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-950">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                <span>Generating PDFs ({progress.current} of {progress.total})</span>
              </span>
              <span className="font-mono text-blue-800 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-blue-200/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-700 h-2.5 rounded-full transition-all duration-150 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-blue-700 truncate font-mono">
              Current: {progress.name}
            </p>
          </div>
        )}

        {/* Status Notification */}
        {downloadSuccess && (
          <div className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="flex-1">{downloadSuccess}</span>
          </div>
        )}

        {/* SUBTAB 1: COMPLETE CLASS BATCH */}
        {activeSubTab === 'all' && (
          <div className="p-4 sm:p-5 space-y-3">
            {/* PRIMARY OPTION: Individual PDFs (ZIP of all .pdf files) */}
            <div
              id="download-option-pdf-zip"
              onClick={() => !downloadingFormat && handleDownload('pdf-zip')}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                downloadingFormat === 'pdf-zip'
                  ? 'border-blue-600 bg-blue-50/70'
                  : 'border-blue-300 bg-blue-50/30 hover:border-blue-600 hover:bg-blue-50/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-700 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900">
                      Individual PDFs (.zip archive)
                    </h4>
                    <span className="text-[10px] bg-blue-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Generates high-resolution <span className="font-mono text-slate-800 font-semibold">{`{USN}_{Name}_Report.pdf`}</span> for all students with institutional logos & signatures.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 flex-shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {downloadingFormat === 'pdf-zip' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressPercent}%</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDFs</span>
                  </>
                )}
              </button>
            </div>

            {/* OPTION 2: Merged Single Master PDF */}
            <div
              id="download-option-pdf-merged"
              onClick={() => !downloadingFormat && handleDownload('pdf-merged')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                    Combined Master PDF ({reports.length} Pages)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Single combined PDF file with one page per student report.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 shadow-2xs cursor-pointer"
              >
                {downloadingFormat === 'pdf-merged' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressPercent}%</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>.PDF (Single File)</span>
                  </>
                )}
              </button>
            </div>

            {/* OPTION 3: Master Excel Spreadsheet */}
            <div
              id="download-option-excel"
              onClick={() => !downloadingFormat && handleDownload('excel')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                    Master Excel Summary (.xlsx)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Structured spreadsheet with all attendance percentages, scores, and proctors.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.XLSX</span>
              </button>
            </div>

            {/* OPTION 4: Text Reports ZIP Archive */}
            <div
              id="download-option-txt-zip"
              onClick={() => !downloadingFormat && handleDownload('txt-zip')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 group-hover:bg-slate-700 group-hover:text-white transition-colors flex-shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Plain Text Reports (.zip / .txt)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Formatted text reports with ASCII tables and summary index.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>.ZIP (.txt)</span>
              </button>
            </div>

            {/* OPTION 5: Native Browser Print / PDF */}
            <div
              id="download-option-print"
              onClick={() => !downloadingFormat && handleDownload('print')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors flex-shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Print / Save via Browser Dialog
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Direct browser print dialog configured for multi-page A4 printing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3 py-1.5 bg-slate-800 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-300" />
                <span>Print Dialog</span>
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PROCTOR-WISE DOWNLOAD OPTIONS */}
        {activeSubTab === 'proctor' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* PROCTOR OPTION 1: Organized Folder ZIP */}
            <div
              id="download-proctor-organized-zip"
              onClick={() => !downloadingFormat && handleDownload('proctor-zip')}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                downloadingFormat === 'proctor-zip'
                  ? 'border-indigo-600 bg-indigo-50/70'
                  : 'border-indigo-300 bg-indigo-50/30 hover:border-indigo-600 hover:bg-indigo-50/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-indigo-700 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                      All Proctors in Folders (.zip)
                    </h4>
                    <span className="text-[10px] bg-indigo-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Auto Organized
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Creates dedicated subfolders for each proctor (<span className="font-mono text-slate-800 font-semibold">{`Proctor_{Name}/`}</span>) containing their students&apos; individual PDFs & an overall proctor summary.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 flex-shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {downloadingFormat === 'proctor-zip' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressPercent}%</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All</span>
                  </>
                )}
              </button>
            </div>

            {/* PROCTOR OPTION 2: Multi-Sheet Excel Workbook */}
            <div
              id="download-proctor-excel-workbook"
              onClick={() => !downloadingFormat && handleDownload('proctor-excel')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                    Proctor-Wise Excel Workbook (.xlsx)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Spreadsheet with a Master Overview tab + individual worksheets for each Faculty Proctor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!!downloadingFormat}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Multi-Sheet .XLSX</span>
              </button>
            </div>

            {/* PROCTOR OPTION 3: Specific Proctor Batch Export */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Download Specific Proctor Batch
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {proctorList.length} Proctors Available
                </span>
              </div>

              {/* Proctor Select Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Select Proctor:
                </label>
                <select
                  value={selectedProctorForDownload}
                  onChange={(e) => setSelectedProctorForDownload(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {proctorList.map((p) => (
                    <option key={p} value={p}>
                      {p} ({getProctorCount(p)} Students)
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons for chosen proctor */}
              {selectedProctorForDownload && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('single-proctor-zip', selectedProctorForDownload)}
                    disabled={!!downloadingFormat}
                    className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                    title={`Download ZIP of individual PDFs for ${selectedProctorForDownload}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDFs ZIP ({getProctorCount(selectedProctorForDownload)})</span>
                  </button>

                  <button
                    onClick={() => handleDownload('single-proctor-pdf', selectedProctorForDownload)}
                    disabled={!!downloadingFormat}
                    className="flex-1 py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                    title={`Download combined PDF document for ${selectedProctorForDownload}`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Merged PDF</span>
                  </button>
                </div>
              )}

              {/* Quick Proctor Chips */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[10.5px] font-semibold text-slate-500 mb-1.5">
                  Or click any proctor below to immediately export:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {proctorList.map((p) => {
                    const count = getProctorCount(p);
                    const isSelected = selectedProctorForDownload === p;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setSelectedProctorForDownload(p);
                          handleDownload('single-proctor-zip', p);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={`Click to download ${count} student PDFs for ${p}`}
                      >
                        <span className="truncate max-w-[140px]">{p}</span>
                        <span
                          className={`text-[9.5px] px-1 py-0.2 rounded-full font-mono font-bold ${
                            isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Official institutional header, crests & signatures included</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!!downloadingFormat}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-bold disabled:opacity-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

