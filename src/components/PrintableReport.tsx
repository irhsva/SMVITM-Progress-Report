import React from 'react';
import { MessageSquare } from 'lucide-react';
import { StudentReport, SubjectRecord } from '../types';
import { InstitutionalLogoRenderer } from './InstitutionalLogo';

// Helper to cleanly format percentage without duplicate %
const formatPercentage = (val: string | number | null | undefined, isNotEnrolled?: boolean): string => {
  if (isNotEnrolled || val === null || val === undefined || val === '' || val === 'N/A' || val === '-') return '-';
  const clean = String(val).trim().replace(/%+$/, '');
  if (!clean || clean === 'N/A' || clean === '-') return '-';
  return `${clean}%`;
};

// Helper to determine specific elective type label
const getElectiveLabel = (sub: SubjectRecord): string | null => {
  if (!sub.isElective) return null;
  const isOpen =
    sub.electiveType === 'open' ||
    sub.code === 'BEC755A' ||
    sub.code === 'BME755A' ||
    sub.code === 'BCV754A' ||
    sub.name.toLowerCase().includes('waste') ||
    sub.name.toLowerCase().includes('machining');

  if (isOpen) {
    return sub.isNotEnrolled ? '(Open Elective - Not Enrolled)' : '(Open Elective)';
  }
  return sub.isNotEnrolled ? '(Professional Elective - Not Enrolled)' : '(Professional Elective)';
};

interface PrintableReportProps {
  report: StudentReport;
  compact?: boolean;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report, compact = false }) => {
  const logos = report.logos || {
    leftPreset: 'sode',
    rightPreset: 'smvitm',
  };

  const totalHeld = report.subjects
    .filter((s) => !s.isNotEnrolled)
    .reduce((acc, s) => acc + (typeof s.classHeld === 'number' ? s.classHeld : 0), 0);
  const totalAttended = report.subjects
    .filter((s) => !s.isNotEnrolled)
    .reduce((acc, s) => acc + (typeof s.classAttended === 'number' ? s.classAttended : 0), 0);

  return (
    <div
      id={`printable-report-${report.student.usn.replace(/[^a-zA-Z0-9]/g, '_')}`}
      className={`bg-white text-slate-900 mx-auto transition-shadow ${
        compact
          ? 'p-4 sm:p-6 max-w-2xl text-xs'
          : 'p-6 sm:p-8 md:p-10 max-w-4xl text-sm shadow-md print:shadow-none print:p-2 print:max-w-none'
      } rounded-sm border border-slate-200 print:border-none print:m-0 print:w-full print:break-inside-avoid`}
    >
      {/* 0. Share Button */}
      <div className="flex justify-end mb-2 print:hidden">
        <button
          onClick={() => {
            const message = `Internal Progress Report for ${report.student.name} (USN: ${report.student.usn}). Attendance: ${report.overallAttendance}%. Marks: ${report.percentageMarks}%. Please check the internal progress report details.`;
            window.open(`https://wa.me/${report.student.parentNumber.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Share via WhatsApp
        </button>
      </div>
      {/* 1. Top Institution Header Banner with Logos */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#8b1d24] gap-2 sm:gap-4">
        {/* Left Institutional Logo (SODE Group of Institutions) */}
        <div className="flex-shrink-0 w-16 sm:w-20 md:w-22 flex items-center justify-center">
          <InstitutionalLogoRenderer
            preset={logos.leftPreset}
            customUrl={logos.leftCustomUrl}
            defaultPreset="sode"
            className="w-16 h-16 sm:w-20 sm:h-20"
            alt="Left Institutional Logo"
          />
        </div>

        {/* Center: Institutional Details & Hierarchy */}
        <div className="text-center flex-1 px-1 sm:px-2">
          <h1 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-[#8b1d24] tracking-tight uppercase leading-tight font-serif">
            {report.institution || 'SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT'}
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight mt-0.5">
            {report.subInstitution || 'A Unit of Shri Sode Vadiraja Mutt Education Trust®, Udupi'}
          </p>
          <p className="text-[8.5px] sm:text-[10.5px] text-slate-600 leading-tight mt-0.5">
            Approved by AICTE, New Delhi | Accredited by NAAC with ‘A’ Grade | Affiliated to VTU, Belagavi
          </p>
          <p className="text-[8.5px] sm:text-[10px] text-slate-600 leading-tight">
            {report.address || 'Vishwothama Nagar, Bantakal, Udupi - 574 115, Karnataka, India'}
          </p>
          <h2 className="text-[10.5px] sm:text-xs font-extrabold text-[#8b1d24] mt-1 uppercase tracking-wide">
            {report.department || 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE'}
          </h2>
        </div>

        {/* Right Institutional Logo (SMVITM Crest) */}
        <div className="flex-shrink-0 w-16 sm:w-20 md:w-22 flex items-center justify-center">
          <InstitutionalLogoRenderer
            preset={logos.rightPreset}
            customUrl={logos.rightCustomUrl}
            defaultPreset="smvitm"
            className="w-16 h-16 sm:w-20 sm:h-20"
            alt="Right Institutional Logo"
          />
        </div>
      </div>

      {/* 2. Report Title, Academic Year & Test Name Subheaders (in exact requested order with clear line spacing) */}
      <div className="text-center my-4 sm:my-5.5 space-y-1.5 sm:space-y-2">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-normal uppercase font-serif">
          INTERNAL PROGRESS REPORT
        </h2>
        <p className="text-xs sm:text-[13px] font-bold text-slate-800 uppercase tracking-wide">
          {report.academicYear
            ? (report.academicYear.toUpperCase().startsWith('ACADEMIC YEAR')
                ? report.academicYear
                : `ACADEMIC YEAR: ${report.academicYear}`)
            : 'ACADEMIC YEAR: 2026-27 (Odd Sem)'}
        </p>
        <p className="text-xs sm:text-[13.5px] font-extrabold text-[#8b1d24] uppercase tracking-wide">
          {report.testName || 'IA TEST 1'}
        </p>
      </div>

      {/* 3. Section 1: General Information (Structured Meta Table) */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 uppercase font-sans tracking-wide">
          1. GENERAL INFORMATION
        </h4>
        <div className="border border-slate-700 text-xs sm:text-[13px] rounded-xs overflow-hidden">
          <div className="grid grid-cols-12 border-b border-slate-700 divide-x divide-slate-700">
            <div className="col-span-4 sm:col-span-2 p-1.5 sm:p-2 font-bold bg-slate-50 text-slate-800">
              Student Name:
            </div>
            <div className="col-span-8 sm:col-span-4 p-1.5 sm:p-2 font-bold text-slate-900 uppercase">
              {report.student.name}
            </div>
            <div className="col-span-4 sm:col-span-2 p-1.5 sm:p-2 font-bold bg-slate-50 text-slate-800">
              University USN:
            </div>
            <div className="col-span-8 sm:col-span-4 p-1.5 sm:p-2 font-mono font-bold text-slate-900">
              {report.student.usn}
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-slate-700 divide-x divide-slate-700">
            <div className="col-span-4 sm:col-span-2 p-1.5 sm:p-2 font-bold bg-slate-50 text-slate-800">
              Semester / Class:
            </div>
            <div className="col-span-8 sm:col-span-4 p-1.5 sm:p-2 font-medium text-slate-900">
              {report.student.semester || '7th Semester'}
            </div>
            <div className="col-span-4 sm:col-span-2 p-1.5 sm:p-2 font-bold bg-slate-50 text-slate-800">
              Academic Year:
            </div>
            <div className="col-span-8 sm:col-span-4 p-1.5 sm:p-2 font-medium text-slate-900">
              {report.academicYear || '2026-27 (Odd Sem)'}
            </div>
          </div>

          <div className="grid grid-cols-12 divide-x divide-slate-700">
            <div className="col-span-4 sm:col-span-2 p-1.5 sm:p-2 font-bold bg-slate-50 text-slate-800">
              Faculty Proctor:
            </div>
            <div className="col-span-8 sm:col-span-4 p-1.5 sm:p-2 font-semibold text-slate-900">
              {report.student.proctorName || 'Department Faculty'}
            </div>
            <div className="col-span-4 sm:col-span-2 p-1.5 sm:p-2 font-bold bg-slate-50 text-slate-800">
              Proctor Contact:
            </div>
            <div className="col-span-8 sm:col-span-4 p-1.5 sm:p-2 font-mono text-slate-900">
              {report.student.proctorNumber || 'Dept. Contact'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Academic Performance & Attendance Record */}
      <div className="mb-5 sm:mb-6 pt-1">
        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 uppercase font-sans tracking-wide">
          2. ACADEMIC PERFORMANCE & ATTENDANCE RECORD
        </h4>
        <div className="border border-slate-700 overflow-x-auto text-[11px] sm:text-xs rounded-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-700 divide-x divide-slate-700 bg-slate-100/90 text-slate-900 font-bold text-center">
                <th className="p-1.5 sm:p-2 w-8 sm:w-10">Sl.</th>
                <th className="p-1.5 sm:p-2 text-left">Subject Code & Name</th>
                <th className="p-1.5 sm:p-2 w-14 sm:w-18">
                  Class Held<br /><span className="font-normal text-[10px]">(CH)</span>
                </th>
                <th className="p-1.5 sm:p-2 w-14 sm:w-18">
                  Class Attd<br /><span className="font-normal text-[10px]">(CA)</span>
                </th>
                <th className="p-1.5 sm:p-2 w-16 sm:w-20">
                  Attd %
                </th>
                <th className="p-1.5 sm:p-2 w-14 sm:w-18">
                  Max Marks
                </th>
                <th className="p-1.5 sm:p-2 w-16 sm:w-20">
                  Marks Scored
                </th>
                <th className="p-1.5 sm:p-2 w-20 sm:w-28">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {report.subjects.map((sub, idx) => {
                const isNotEnrolled = sub.isNotEnrolled;
                const isWarning = typeof sub.attendancePercentage === 'number' && sub.attendancePercentage < 75 && !isNotEnrolled;
                const isFail = typeof sub.marksScored === 'number' && sub.marksScored < 20 && !isNotEnrolled;

                return (
                  <tr key={sub.code || idx} className="divide-x divide-slate-300 hover:bg-slate-50/60">
                    <td className="p-1.5 sm:p-2 text-center align-middle font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 sm:p-2 text-slate-900 align-middle">
                      <div className="font-bold">
                        <span className="font-mono text-blue-900">{sub.code}</span> - {sub.name}
                      </div>
                      {sub.isElective && (
                        <span className="text-[9.5px] text-slate-500 italic block">
                          {getElectiveLabel(sub)}
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 sm:p-2 text-center align-middle font-mono">
                      {isNotEnrolled ? '-' : sub.classHeld}
                    </td>
                    <td className="p-1.5 sm:p-2 text-center align-middle font-mono">
                      {isNotEnrolled ? '-' : sub.classAttended}
                    </td>
                    <td
                      className={`p-1.5 sm:p-2 text-center align-middle font-mono font-bold ${
                        isWarning ? 'text-rose-700 bg-rose-50/50' : 'text-slate-900'
                      }`}
                    >
                      {isNotEnrolled ? '-' : sub.attendancePercentage}
                    </td>
                    <td className="p-1.5 sm:p-2 text-center align-middle font-mono">
                      {isNotEnrolled ? '-' : (sub.maxMarks ?? 50)}
                    </td>
                    <td
                      className={`p-1.5 sm:p-2 text-center align-middle font-mono font-bold ${
                        isFail ? 'text-rose-700 bg-rose-50/50' : 'text-blue-950 font-black'
                      }`}
                    >
                      {isNotEnrolled ? '-' : sub.marksScored}
                    </td>
                    <td className="p-1.5 sm:p-2 text-center align-middle text-[10.5px] text-slate-700">
                      {sub.remark ||
                        (isNotEnrolled
                          ? 'Not Enrolled'
                          : isFail || isWarning
                          ? 'Need Improvement'
                          : 'Satisfactory')}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer with Overall Attendance & Total Score */}
            <tfoot>
              <tr className="bg-slate-100 font-bold divide-x divide-slate-700 border-t-2 border-slate-700 text-slate-900">
                <td colSpan={2} className="p-2 text-right uppercase text-[10px] sm:text-xs">
                  AVERAGE ATTENDANCE & TOTAL MARKS
                </td>
                <td className="p-2 text-center font-mono text-[10px] sm:text-xs">
                  {totalHeld}
                </td>
                <td className="p-2 text-center font-mono text-[10px] sm:text-xs">
                  {totalAttended}
                </td>
                <td className="p-2 text-center font-mono font-black text-[10px] sm:text-xs text-blue-950">
                  {report.overallAttendance !== null ? report.overallAttendance : '-'}
                </td>
                <td className="p-2 text-center font-mono text-[10px] sm:text-xs">
                  {report.totalMaxMarks ?? '-'}
                </td>
                <td className="p-2 text-center font-mono font-black text-blue-950 text-[10px] sm:text-xs">
                  {report.totalMarksScored ?? '-'}
                </td>
                <td className="p-2 text-center font-mono text-[10px] sm:text-xs text-slate-800">
                  {report.percentageMarks !== null ? `${report.percentageMarks}% Score` : '-'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Section 3: Official Signatures Section (2 Symmetrical Columns) */}
      <div className="mt-8 sm:mt-12 pt-4 flex justify-between items-end gap-2 px-12">
        {/* Column 1: Proctor Signature */}
        <div className="text-center w-40 sm:w-48">
          <p className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1">
            Sd/-
          </p>
          <div className="h-10 sm:h-12 border-b border-dashed border-slate-500 mb-1.5 flex items-end justify-center">
          </div>
          <p className="text-xs sm:text-[13px] font-bold text-slate-900">
            Signature of Proctor
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600 truncate">
            ({report.student.proctorName || 'Faculty Proctor'})
          </p>
        </div>

        {/* Column 2: In-Charge HOD Signature */}
        <div className="text-center w-44 sm:w-56">
          <p className="text-xs sm:text-[13px] font-extrabold text-slate-900 mb-1">
            Sd/-
          </p>
          <div className="h-10 sm:h-12 border-b border-dashed border-slate-500 mb-1.5 flex items-end justify-center">
          </div>
          <p className="text-xs sm:text-[13px] font-extrabold text-slate-900">
            {report.hodTitle || 'In-charge HOD'}
          </p>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-700">
            ({report.hodName || 'Dr. Tejaswini H'})
          </p>
        </div>
      </div>

      {/* 6. Institutional Footer Banner */}
      <div className="mt-8 pt-2.5 border-t border-slate-300 text-[8.5px] sm:text-[10px] text-slate-600 text-center flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <span>Tel: {report.institutionInfo?.contactTel || report.contactTel || '+91 820 2589182'}</span>
        <span>•</span>
        <span>
          E-mail:{' '}
          <a href={`mailto:${report.institutionInfo?.contactEmail || report.contactEmail || 'hod.ai@sode-edu.in'}`} className="text-blue-700 hover:underline">
            {report.institutionInfo?.contactEmail || report.contactEmail || 'hod.ai@sode-edu.in'}
          </a>
        </span>
        <span>•</span>
        <span>
          Web:{' '}
          <a
            href={report.institutionInfo?.contactWeb || report.contactWeb || 'https://sode-edu.in'}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:underline truncate max-w-xs"
          >
            {report.institutionInfo?.contactWeb || report.contactWeb || 'https://sode-edu.in'}
          </a>
        </span>
      </div>
    </div>
  );
};

