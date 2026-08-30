import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { StudentReport, ReportConfig } from '../types';
import { formatStudentReportPlainText, formatAllReportsPlainText } from './reportFormatter';

/**
 * Downloads a ZIP archive containing individual student report text files
 */
export async function downloadAllReportsZip(reports: StudentReport[], archiveName = 'SMVITM_All_Student_Reports.zip'): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Student_Reports');

  reports.forEach((report, index) => {
    const cleanName = report.student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${report.student.usn || `Student_${index + 1}`}_${cleanName}_Report.txt`;
    const content = formatStudentReportPlainText(report);
    folder?.file(filename, content);
  });

  // Add a Master Combined text file
  const masterContent = formatAllReportsPlainText(reports);
  zip.file('00_MASTER_ALL_REPORTS_COMBINED.txt', masterContent);

  // Add an index summary
  const indexSummary = [
    'SMVITM BANTAKAL - DEPARTMENT OF AI & DATA SCIENCE',
    'STUDENT INTERNAL PROGRESS REPORTS BATCH EXPORT',
    `Total Student Records: ${reports.length}`,
    `Export Timestamp: ${new Date().toLocaleString()}`,
    '=========================================================================',
    'USN           | Student Name                   | Attendance % | Scored Marks',
    '-------------------------------------------------------------------------',
    ...reports.map((r) => {
      const usn = (r.student.usn || '').padEnd(13, ' ');
      const name = (r.student.name || '').padEnd(30, ' ');
      const att = `${r.overallAttendance ?? '-'}%`.padEnd(12, ' ');
      const marks = `${r.totalMarksScored ?? '-'}/${r.totalMaxMarks ?? '-'}`;
      return `${usn} | ${name} | ${att} | ${marks}`;
    }),
    '=========================================================================',
  ].join('\n');

  zip.file('00_STUDENTS_INDEX_SUMMARY.txt', indexSummary);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = archiveName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a combined .txt file with all student reports
 */
export function downloadAllCombinedText(reports: StudentReport[], filename = 'SMVITM_All_Reports_Combined.txt'): void {
  const text = formatAllReportsPlainText(reports);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a standalone, offline printable HTML file containing all reports
 */
export function downloadAllReportsStandaloneHtml(
  reports: StudentReport[],
  _config?: ReportConfig,
  filename = 'SMVITM_All_Reports_Printable.html'
): void {
  const reportsHtml = reports.map((report, idx) => {
    const rows = report.subjects.map((sub, sIdx) => {
      const isNotEnrolled = sub.isNotEnrolled;
      const isLowMarks = typeof sub.marksScored === 'number' && sub.marksScored < 20;
      const isLowAtt = typeof sub.attendancePercentage === 'number' && sub.attendancePercentage < 75;

      return `
        <tr class="${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
          <td class="cell text-center font-mono">${sIdx + 1}</td>
          <td class="cell">
            <span class="font-bold font-mono text-blue-900">${sub.code}</span>
            <div class="text-[11px] font-semibold text-slate-800">${sub.name}</div>
          </td>
          <td class="cell text-center font-mono">${isNotEnrolled ? '-' : (sub.classHeld ?? '-')}</td>
          <td class="cell text-center font-mono">${isNotEnrolled ? '-' : (sub.classAttended ?? '-')}</td>
          <td class="cell text-center font-mono font-bold ${isLowAtt ? 'text-red-700 font-black' : ''}">
            ${isNotEnrolled ? '-' : `${sub.attendancePercentage}%`}
          </td>
          <td class="cell text-center font-mono">${sub.maxMarks}</td>
          <td class="cell text-center font-mono font-bold ${isLowMarks ? 'text-red-700 font-black' : 'text-blue-950'}">
            ${isNotEnrolled ? '-' : (sub.marksScored ?? '-')}
          </td>
          <td class="cell text-center font-semibold">
            ${sub.remark || (isNotEnrolled ? 'Not Enrolled' : isLowMarks || isLowAtt ? 'Needs Improvement' : 'Satisfactory')}
          </td>
        </tr>
      `;
    }).join('');

    const totalHeld = report.subjects.filter(s => !s.isNotEnrolled).reduce((acc, s) => acc + (typeof s.classHeld === 'number' ? s.classHeld : 0), 0);
    const totalAttended = report.subjects.filter(s => !s.isNotEnrolled).reduce((acc, s) => acc + (typeof s.classAttended === 'number' ? s.classAttended : 0), 0);

    return `
      <div class="report-page">
        <div class="report-container">
          <!-- Institution Header -->
          <div class="header-box">
            <div style="text-align: center; flex: 1;">
              <h1 class="inst-title">SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT</h1>
              <p class="inst-sub">Vishwothama Nagar, Bantakal, Udupi - 574115, Karnataka</p>
              <p class="inst-dept">DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE</p>
              <h2 class="test-badge">INTERNAL PROGRESS REPORT - ${report.testName.toUpperCase()}</h2>
            </div>
          </div>

          <!-- Student Meta Grid -->
          <div class="meta-section">
            <h3 class="meta-title">STUDENT INFORMATION</h3>
            <div class="meta-grid">
              <div><span class="label">Student Name:</span> <span class="val font-bold">${report.student.name}</span></div>
              <div><span class="label">University USN:</span> <span class="val font-mono font-bold">${report.student.usn}</span></div>
              <div><span class="label">Semester / Class:</span> <span class="val">${report.student.semester}</span></div>
              <div><span class="label">Academic Year:</span> <span class="val">${report.academicYear}</span></div>
              <div><span class="label">Faculty Proctor:</span> <span class="val font-bold">${report.student.proctorName}</span></div>
              <div><span class="label">Proctor Contact:</span> <span class="val font-mono">${report.student.proctorNumber || 'Dept. Contact'}</span></div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-section">
            <h3 class="meta-title">ACADEMIC PERFORMANCE & ATTENDANCE RECORD</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 35px;">Sl.</th>
                  <th>Course Code & Title</th>
                  <th style="width: 55px;">Classes Held</th>
                  <th style="width: 65px;">Attended</th>
                  <th style="width: 65px;">Attd %</th>
                  <th style="width: 65px;">Max Marks</th>
                  <th style="width: 75px;">Marks Scored</th>
                  <th style="width: 100px;">Remark</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
              <tfoot>
                <tr class="tfoot-row">
                  <td colspan="2" style="text-align: right; text-transform: uppercase; font-weight: bold;">
                    Average Attendance & Total Marks
                  </td>
                  <td style="text-align: center; font-family: monospace;">${totalHeld}</td>
                  <td style="text-align: center; font-family: monospace;">${totalAttended}</td>
                  <td style="text-align: center; font-family: monospace; font-weight: bold; color: #1e3a8a;">
                    ${report.overallAttendance !== null ? `${report.overallAttendance}%` : '-'}
                  </td>
                  <td style="text-align: center; font-family: monospace;">${report.totalMaxMarks ?? '-'}</td>
                  <td style="text-align: center; font-family: monospace; font-weight: 900; color: #1e3a8a;">
                    ${report.totalMarksScored ?? '-'}
                  </td>
                  <td style="text-align: center; font-family: monospace; font-weight: bold;">
                    ${report.percentageMarks !== null ? `${report.percentageMarks}% Overall` : '-'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Signatures -->
          <div class="sig-grid">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-label">Signature of Student</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-label">Signature of Proctor</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-label">In-charge HOD</div>
            </div>
          </div>

          <div class="footer-note">
            Document ${idx + 1} of ${reports.length} • Generated by SMVITM Academic Report System
          </div>
        </div>
      </div>
    `;
  }).join('');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SMVITM All Student Academic Reports (${reports.length})</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f1f5f9;
      color: #0f172a;
    }
    .report-page {
      page-break-after: always;
      break-after: page;
      margin-bottom: 24px;
      display: flex;
      justify-content: center;
    }
    .report-container {
      background: #ffffff;
      width: 100%;
      max-width: 800px;
      padding: 28px 36px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    .header-box {
      border-bottom: 2px solid #8b1d24;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .inst-title {
      font-size: 15px;
      font-weight: 900;
      color: #8b1d24;
      margin: 0 0 3px 0;
      letter-spacing: 0.5px;
    }
    .inst-sub {
      font-size: 11px;
      color: #334155;
      margin: 0 0 2px 0;
      font-weight: bold;
    }
    .inst-dept {
      font-size: 12px;
      color: #1e3a8a;
      font-weight: 800;
      margin: 0 0 6px 0;
    }
    .test-badge {
      display: inline-block;
      background: #8b1d24;
      color: white;
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 4px 0 0 0;
    }
    .meta-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      margin-bottom: 14px;
      border-radius: 4px;
    }
    .meta-title {
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      letter-spacing: 0.5px;
      margin: 0 0 6px 0;
      text-transform: uppercase;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 16px;
      font-size: 12px;
    }
    .label { color: #64748b; font-weight: 500; font-size: 11px; }
    .val { color: #0f172a; }
    .table-section { margin-bottom: 18px; }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #0f172a;
      font-size: 11px;
    }
    th {
      background: #f1f5f9;
      border: 1px solid #0f172a;
      padding: 6px 4px;
      font-weight: 800;
      text-align: center;
      color: #0f172a;
    }
    .cell {
      border: 1px solid #0f172a;
      padding: 5px 6px;
    }
    .tfoot-row td {
      background: #f8fafc;
      border: 1px solid #0f172a;
      border-top: 2px solid #0f172a;
      padding: 6px 6px;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 32px;
      padding-top: 10px;
    }
    .sig-box { text-align: center; }
    .sig-line { border-top: 1.5px dashed #475569; margin-bottom: 6px; }
    .sig-label { font-size: 10px; font-weight: bold; color: #1e293b; text-transform: uppercase; }
    .footer-note {
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      margin-top: 14px;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
    }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: bold; }
    .text-center { text-align: center; }
    .text-red-700 { color: #b91c1c; }
    .text-blue-900 { color: #1e3a8a; }
    .text-blue-950 { color: #172554; }

    @media print {
      body { background: white; padding: 0; }
      .report-page { page-break-after: always; break-after: page; margin: 0; }
      .report-container { border: none; box-shadow: none; padding: 0; max-width: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; background: #1e293b; color: white; padding: 12px 18px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
    <div>
      <strong>SMVITM Academic Reports (${reports.length} Students)</strong>
      <div style="font-size: 12px; color: #94a3b8;">Click the button on right to print or save all as PDF directly.</div>
    </div>
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
  </div>
  ${reportsHtml}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads structured master Excel sheet with all students, marks and attendance
 */
export function downloadAllExcelSummary(reports: StudentReport[], filename = 'SMVITM_Report_Master_Data.xlsx'): void {
  const data: Record<string, unknown>[] = [];

  reports.forEach((r, idx) => {
    const row: Record<string, unknown> = {
      'Sl No': idx + 1,
      'USN': r.student.usn,
      'Student Name': r.student.name,
      'Semester': r.student.semester,
      'Proctor Name': r.student.proctorName,
      'Proctor Number': r.student.proctorNumber,
      'Overall Attendance %': r.overallAttendance ?? '',
      'Total Marks Scored': r.totalMarksScored ?? '',
      'Total Max Marks': r.totalMaxMarks ?? '',
      'Percentage Marks %': r.percentageMarks ?? '',
      'Test / IA': r.testName,
    };

    // Add subject columns
    r.subjects.forEach((s) => {
      row[`${s.code} Name`] = s.name;
      row[`${s.code} Held`] = s.isNotEnrolled ? 'N/A' : (s.classHeld ?? '');
      row[`${s.code} Attd`] = s.isNotEnrolled ? 'N/A' : (s.classAttended ?? '');
      row[`${s.code} Attd%`] = s.isNotEnrolled ? 'N/A' : `${s.attendancePercentage}%`;
      row[`${s.code} Marks`] = s.isNotEnrolled ? 'N/A' : (s.marksScored ?? '');
      row[`${s.code} Max`] = s.maxMarks;
      row[`${s.code} Remark`] = s.remark;
    });

    data.push(row);
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Student_Reports_Data');
  XLSX.writeFile(wb, filename);
}

/**
 * Downloads a multi-sheet Excel workbook with a Master Sheet PLUS individual worksheets for each Proctor
 */
export function downloadProctorWiseExcelWorkbook(reports: StudentReport[], filename = 'SMVITM_Proctor_Wise_Reports_Data.xlsx'): void {
  const wb = XLSX.utils.book_new();

  // 1. Master Sheet
  const masterData: Record<string, unknown>[] = reports.map((r, idx) => ({
    'Sl No': idx + 1,
    'USN': r.student.usn,
    'Student Name': r.student.name,
    'Proctor Name': r.student.proctorName,
    'Proctor Contact': r.student.proctorNumber || '',
    'Overall Attd %': r.overallAttendance ?? '',
    'Total Marks': `${r.totalMarksScored ?? ''}/${r.totalMaxMarks ?? ''}`,
    'Percentage %': r.percentageMarks ?? '',
    'Status': (r.overallAttendance || 0) < 75 ? 'Low Attendance' : (r.percentageMarks || 0) < 40 ? 'Low Marks' : 'Good',
  }));

  const masterWs = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, masterWs, 'ALL_STUDENTS_SUMMARY');

  // 2. Individual Proctor Sheets
  const proctorGroups = new Map<string, StudentReport[]>();
  for (const r of reports) {
    const proctor = (r.student.proctorName || 'Unassigned').trim();
    if (!proctorGroups.has(proctor)) {
      proctorGroups.set(proctor, []);
    }
    proctorGroups.get(proctor)!.push(r);
  }

  proctorGroups.forEach((groupReports, proctorName) => {
    const proctorData: Record<string, unknown>[] = [];

    groupReports.forEach((r, idx) => {
      const row: Record<string, unknown> = {
        'Sl No': idx + 1,
        'USN': r.student.usn,
        'Student Name': r.student.name,
        'Overall Attd %': r.overallAttendance !== null ? `${r.overallAttendance}%` : '',
        'Total Scored': r.totalMarksScored ?? '',
        'Max Marks': r.totalMaxMarks ?? '',
        'Score %': r.percentageMarks !== null ? `${r.percentageMarks}%` : '',
      };

      r.subjects.forEach((s) => {
        row[`${s.code} Marks`] = s.isNotEnrolled ? 'N/A' : (s.marksScored ?? '');
        row[`${s.code} Attd%`] = s.isNotEnrolled ? 'N/A' : `${s.attendancePercentage}%`;
      });

      proctorData.push(row);
    });

    // Excel worksheet names have a 31 char limit
    const cleanSheetName = proctorName.replace(/[\\/?*[\]]/g, '').slice(0, 28) || 'Proctor';
    const ws = XLSX.utils.json_to_sheet(proctorData);
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
  });

  XLSX.writeFile(wb, filename);
}

/**
 * Downloads a comprehensive Analytics Excel workbook with Subject Statistics, Low Marks Defaulters, and Attendance Shortage students.
 */
export function downloadAnalyticsExcel(reports: StudentReport[], filename = 'SMVITM_Analytics_And_Defaulters_Report.xlsx'): void {
  const wb = XLSX.utils.book_new();

  // 1. Subject Statistics Sheet
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

  const subjectRows: Record<string, unknown>[] = [];
  subjectMap.forEach((data, code) => {
    const avgAttd = data.enrolled > 0 ? Math.round(data.totalAttd / data.enrolled) : 0;
    const avgMarks = data.enrolled > 0 ? Number((data.totalMarks / data.enrolled).toFixed(1)) : 0;
    const passRate = data.enrolled > 0 ? Math.round((data.passCount / data.enrolled) * 100) : 0;
    const maxVal = data.maxMarks === -1 ? 'N/A' : data.maxMarks;
    const minVal = data.minMarks === 999 ? 'N/A' : data.minMarks;

    subjectRows.push({
      'Subject Code': code,
      'Subject Title': data.name,
      'Total Enrolled': data.enrolled,
      'Max Marks (50)': maxVal,
      'Min Marks (50)': minVal,
      'Average Marks': avgMarks,
      'Average Attendance %': `${avgAttd}%`,
      'Pass Rate % (>=20)': `${passRate}%`,
    });
  });

  const subWs = XLSX.utils.json_to_sheet(subjectRows);
  XLSX.utils.book_append_sheet(wb, subWs, 'Subject_Performance_Stats');

  // 2. IA-1 Defaulters (< 20 Marks) Sheet
  const lowMarksRows: Record<string, unknown>[] = [];
  reports.forEach((r) => {
    r.subjects.forEach((s) => {
      if (!s.isNotEnrolled && s.marksNum !== null && s.marksNum !== undefined && s.marksNum < 20) {
        lowMarksRows.push({
          'USN': r.student.usn,
          'Student Name': r.student.name,
          'Proctor Name': r.student.proctorName,
          'Subject Code': s.code,
          'Subject Title': s.name,
          'Marks Scored (Max 50)': s.marksNum,
          'Deficit': 20 - s.marksNum,
        });
      }
    });
  });

  const lowMarksWs = XLSX.utils.json_to_sheet(lowMarksRows);
  XLSX.utils.book_append_sheet(wb, lowMarksWs, 'IA1_Defaulters_Below_20');

  // 3. Attendance Shortage (< 75%) Sheet
  const lowAttdRows: Record<string, unknown>[] = [];
  reports.forEach((r) => {
    if (r.overallAttendance !== null && r.overallAttendance !== undefined && r.overallAttendance < 75) {
      lowAttdRows.push({
        'USN': r.student.usn,
        'Student Name': r.student.name,
        'Proctor Name': r.student.proctorName,
        'Overall Attendance %': `${r.overallAttendance}%`,
        'Shortage %': `${75 - r.overallAttendance}%`,
      });
    }
  });

  const lowAttdWs = XLSX.utils.json_to_sheet(lowAttdRows);
  XLSX.utils.book_append_sheet(wb, lowAttdWs, 'Attendance_Shortage_Below_75');

  XLSX.writeFile(wb, filename);
}

