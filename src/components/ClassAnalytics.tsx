import React, { useState } from 'react';
import { Users, Award, AlertTriangle, TrendingUp, BookOpen, Download, ShieldAlert, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { StudentReport } from '../types';
import { downloadAnalyticsExcel } from '../utils/downloadAllReports';
import { downloadAnalyticsPdf } from '../utils/pdfGenerator';

interface ClassAnalyticsProps {
  reports: StudentReport[];
}

export const ClassAnalytics: React.FC<ClassAnalyticsProps> = ({ reports }) => {
  const [showDefaulters, setShowDefaulters] = useState(true);
  const [showShortage, setShowShortage] = useState(true);

  if (!reports || reports.length === 0) return null;

  const totalStudents = reports.length;

  // Calculate overall attendance
  const validAttd = reports.filter((r) => r.overallAttendance !== null && r.overallAttendance !== undefined);
  const avgClassAttendance = validAttd.length > 0
    ? Math.round(validAttd.reduce((acc, r) => acc + (r.overallAttendance || 0), 0) / validAttd.length)
    : 0;

  // Calculate average marks %
  const validMarks = reports.filter((r) => r.percentageMarks !== null && r.percentageMarks !== undefined);
  const avgClassMarks = validMarks.length > 0
    ? Math.round(validMarks.reduce((acc, r) => acc + (r.percentageMarks || 0), 0) / validMarks.length)
    : 0;

  // Low attendance count (<75%)
  const lowAttdStudents = reports.filter((r) => (r.overallAttendance || 0) < 75);

  // Low marks students (scored < 20 in any subject)
  const lowMarksStudents: { report: StudentReport; subjectCode: string; subjectName: string; marks: number }[] = [];
  reports.forEach((r) => {
    r.subjects.forEach((s) => {
      if (!s.isNotEnrolled && s.marksNum !== null && s.marksNum !== undefined && s.marksNum < 20) {
        lowMarksStudents.push({ report: r, subjectCode: s.code, subjectName: s.name, marks: s.marksNum });
      }
    });
  });

  // Subject-wise statistics (including Max & Min marks)
  const subjectMap = new Map<string, { name: string; enrolled: number; totalMarks: number; maxMarks: number; minMarks: number; totalAttd: number; passCount: number }>();

  reports.forEach((r) => {
    r.subjects.forEach((s) => {
      if (s.isNotEnrolled) return;
      if (!subjectMap.has(s.code)) {
        subjectMap.set(s.code, { name: s.name, enrolled: 0, totalMarks: 0, maxMarks: -1, minMarks: 999, totalAttd: 0, passCount: 0 });
      }
      const entry = subjectMap.get(s.code)!;
      entry.enrolled++;
      if (s.marksNum !== null && s.marksNum !== undefined) {
        entry.totalMarks += s.marksNum;
        if (entry.maxMarks === -1 || s.marksNum > entry.maxMarks) entry.maxMarks = s.marksNum;
        if (entry.minMarks === 999 || s.marksNum < entry.minMarks) entry.minMarks = s.marksNum;
        if (s.marksNum >= 20) entry.passCount++;
      }
      if (s.attendanceNum !== null && s.attendanceNum !== undefined) {
        entry.totalAttd += s.attendanceNum;
      }
    });
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Class Performance & Attendance Analytics Sheet
          </h3>
          <p className="text-xs text-slate-500">
            Comprehensive Department Analytics, Subject High/Lows, and Defaulter Lists ({totalStudents} Enrolled)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadAnalyticsPdf(reports)}
            id="download-analytics-pdf-btn"
            className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Download Analytics PDF
          </button>
          <button
            onClick={() => downloadAnalyticsExcel(reports)}
            id="download-analytics-excel-btn"
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Analytics Report (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Average Attendance</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {avgClassAttendance}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Dept benchmark: &gt;= 75%
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Average IA-1 Score</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {avgClassMarks}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Class Average ({Math.round(avgClassMarks * 0.5)}/50 marks)
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/70 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
            <span>Low Attendance</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900">
            {lowAttdStudents.length}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">
            Students below 75% threshold
          </div>
        </div>

        <div className="p-3.5 bg-rose-50/70 rounded-lg border border-rose-200">
          <div className="flex items-center justify-between text-rose-800 text-xs mb-1">
            <span>IA-1 Defaulters</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-900">
            {new Set(lowMarksStudents.map(l => l.report.id)).size}
          </div>
          <div className="text-[10px] text-rose-700 mt-0.5">
            Students scoring &lt; 20 in any subject
          </div>
        </div>
      </div>

      {/* Subject-Wise Summary Table with Max & Min Marks */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
          Subject-Wise Performance Breakdown (Max, Min & Averages)
        </h4>
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Subject Title</th>
                <th className="p-2.5 text-center">Enrolled</th>
                <th className="p-2.5 text-center">Max Marks</th>
                <th className="p-2.5 text-center">Min Marks</th>
                <th className="p-2.5 text-center">Avg Marks (50)</th>
                <th className="p-2.5 text-center">Avg Attd %</th>
                <th className="p-2.5 text-center">Pass Rate % (&gt;=20)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from(subjectMap.entries()).map(([code, data]) => {
                const avgAttd = data.enrolled > 0 ? Math.round(data.totalAttd / data.enrolled) : 0;
                const avgMarks = data.enrolled > 0 ? (data.totalMarks / data.enrolled).toFixed(1) : '0';
                const passRate = data.enrolled > 0 ? Math.round((data.passCount / data.enrolled) * 100) : 0;
                const maxVal = data.maxMarks === -1 ? 'N/A' : data.maxMarks;
                const minVal = data.minMarks === 999 ? 'N/A' : data.minMarks;

                return (
                  <tr key={code} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-semibold text-slate-900">{code}</td>
                    <td className="p-2.5 text-slate-800">{data.name}</td>
                    <td className="p-2.5 text-center font-mono">{data.enrolled}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{maxVal}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700">{minVal}</td>
                    <td className="p-2.5 text-center font-mono font-medium text-slate-900">{avgMarks}</td>
                    <td className="p-2.5 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded ${avgAttd < 75 ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-700'}`}>
                        {avgAttd}%
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-semibold ${passRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {passRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defaulter & Shortage Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Marks Students List (< 20) */}
        <div className="border border-rose-200 rounded-lg bg-rose-50/30 overflow-hidden">
          <div
            className="flex items-center justify-between p-3 bg-rose-100/70 border-b border-rose-200 cursor-pointer"
            onClick={() => setShowDefaulters(!showDefaulters)}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <h4 className="text-xs font-bold text-rose-900 uppercase">
                Students Scoring Below Passing Mark (&lt; 20 / 50) [{lowMarksStudents.length}]
              </h4>
            </div>
            {showDefaulters ? <ChevronUp className="w-4 h-4 text-rose-700" /> : <ChevronDown className="w-4 h-4 text-rose-700" />}
          </div>

          {showDefaulters && (
            <div className="p-3 max-h-64 overflow-y-auto">
              {lowMarksStudents.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium text-center py-4">
                  🎉 No students scored below passing mark in any subject!
                </p>
              ) : (
                <div className="space-y-2">
                  {lowMarksStudents.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded border border-rose-200 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.report.student.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.report.student.usn} • Proctor: {item.report.student.proctorName || 'N/A'}</div>
                        <div className="text-[11px] text-slate-700 font-medium mt-0.5">Subject: <span className="font-mono text-rose-800">{item.subjectCode}</span> ({item.subjectName})</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-rose-100 text-rose-800 font-mono font-bold rounded">
                          {item.marks} / 50
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attendance Shortage Students List (< 75%) */}
        <div className="border border-amber-200 rounded-lg bg-amber-50/30 overflow-hidden">
          <div
            className="flex items-center justify-between p-3 bg-amber-100/70 border-b border-amber-200 cursor-pointer"
            onClick={() => setShowShortage(!showShortage)}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold text-amber-900 uppercase">
                Attendance Shortage Students (&lt; 75%) [{lowAttdStudents.length}]
              </h4>
            </div>
            {showShortage ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
          </div>

          {showShortage && (
            <div className="p-3 max-h-64 overflow-y-auto">
              {lowAttdStudents.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium text-center py-4">
                  🎉 All students meet the 75% attendance criteria!
                </p>
              ) : (
                <div className="space-y-2">
                  {lowAttdStudents.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded border border-amber-200 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{r.student.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{r.student.usn} • Proctor: {r.student.proctorName || 'N/A'}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono font-bold rounded">
                          {r.overallAttendance}% Overall
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
