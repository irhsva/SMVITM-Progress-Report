import { StudentReport } from '../types';

/**
 * Pads or truncates a string to an exact width
 */
function pad(str: string | number | undefined | null, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  const s = str === undefined || str === null ? '' : String(str);
  if (s.length >= width) {
    return s.slice(0, width);
  }
  const diff = width - s.length;
  if (align === 'right') {
    return ' '.repeat(diff) + s;
  }
  if (align === 'center') {
    const left = Math.floor(diff / 2);
    const right = diff - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  }
  return s + ' '.repeat(diff);
}

/**
 * Formats a single student report in the exact plain text / markdown table template
 */
export function formatStudentReportPlainText(report: StudentReport): string {
  const divider = '+----------+-----------------------------------------------+----+----+-------+-----------+--------------+--------+';
  
  const headerRow = '| Subject  | Subject Name                                  | CH | CA | Attd% | Max Marks | Marks Scored | Remark |';

  const rows = report.subjects.map((sub) => {
    const code = pad(sub.code, 8);
    const name = pad(sub.name, 45);
    const ch = pad(sub.classHeld, 2, 'right');
    const ca = pad(sub.classAttended, 2, 'right');
    const attd = pad(sub.attendancePercentage, 5, 'right');
    const maxMarks = pad(sub.maxMarks, 9, 'right');
    const marks = pad(sub.marksScored, 12, 'right');
    const remark = pad(sub.remark, 6);

    return `| ${code} | ${name} | ${ch} | ${ca} | ${attd} | ${maxMarks} | ${marks} | ${remark} |`;
  });

  const text = [
    'SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT',
    'BANTAKAL, UDUPI',
    'DEPARTMENT OF SMVITM BANTAKAL',
    '',
    'INTERNAL PROGRESS REPORT',
    `ACADEMIC YEAR: ${report.academicYear || '2026-27 (Odd Sem)'}`,
    `${report.testName || 'IA TEST 1'}`,
    '',
    '1. General Information:',
    `Student Name   : ${report.student.name}`,
    `Student USN    : ${report.student.usn}`,
    `Semester       : ${report.student.semester}`,
    `Academic Year  : ${report.academicYear || '2026-27 (Odd Sem)'}`,
    `Proctor Name   : ${report.student.proctorName}`,
    `Proctor Number : ${report.student.proctorNumber}`,
    '',
    '2. Academic Information & Attendance Record:',
    divider,
    headerRow,
    divider,
    ...rows,
    divider,
    '',
    'In-charge HOD, AI and DS                                                 Proctor Signature',
  ].join('\n');

  return text;
}

/**
 * Formats all student reports separated by '--- page break ---'
 */
export function formatAllReportsPlainText(reports: StudentReport[]): string {
  return reports.map((r) => formatStudentReportPlainText(r)).join('\n\n--- page break ---\n\n');
}

/**
 * Formats a clean WhatsApp/SMS summary message for parents
 */
export function formatWhatsAppMessage(report: StudentReport): string {
  const lines = [
    `🎓 *SMVITM Bantakal*`,
    `📋 *Internal Progress Report (${report.testName})*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Student:* ${report.student.name} (${report.student.usn})`,
    `📚 *Semester:* ${report.student.semester}`,
    `👨‍🏫 *Proctor:* ${report.student.proctorName} (${report.student.proctorNumber})`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📊 *Academic Performance:*`,
  ];

  report.subjects.forEach((s) => {
    if (s.isNotEnrolled) return;
    lines.push(`• *${s.code}* (${s.name.slice(0, 22)}..): IA Marks: *${s.marksScored}/50* | Attd: *${s.attendancePercentage}* (${s.classAttended}/${s.classHeld})`);
  });

  if (report.overallAttendance !== null && report.overallAttendance !== undefined) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📈 *Overall Attendance:* ${report.overallAttendance}%`);
  }
  if (report.percentageMarks !== null && report.percentageMarks !== undefined) {
    lines.push(`🎯 *Overall IA-1 Marks:* ${report.percentageMarks}% (${report.totalMarksScored}/${report.totalMaxMarks})`);
  }
  lines.push(`\n- ${report.hodName}, ${report.hodTitle}`);

  return lines.join('\n');
}
