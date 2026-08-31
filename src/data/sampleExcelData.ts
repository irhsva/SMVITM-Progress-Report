import * as XLSX from 'xlsx';
import { StudentReport, SubjectDef } from '../types';
import { DEFAULT_CONFIG, INSTITUTION_INFO, DEFAULT_SUBJECTS } from './defaultSubjects';

export const SAMPLE_STUDENTS_RAW = [
  {
    usn: '4MW21AI001',
    name: 'ABHISHEK K',
    proctorName: 'Dr. Vasudeva',
    proctorNumber: '9845012341',
    bai701: { ch: 24, ca: 22, marks: 44 },
    bad702: { ch: 26, ca: 24, marks: 42 },
    bad703: { ch: 22, ca: 20, marks: 45 },
    bad714b: { ch: 24, ca: 23, marks: 46 },
    bec755a: { ch: 20, ca: 19, marks: 41 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 16, marks: 48 },
  },
  {
    usn: '4MW21AI002',
    name: 'ADITHYA PRABHU',
    proctorName: 'Dr. Vasudeva',
    proctorNumber: '9845012341',
    bai701: { ch: 24, ca: 20, marks: 38 },
    bad702: { ch: 26, ca: 21, marks: 36 },
    bad703: { ch: 22, ca: 18, marks: 39 },
    bad714b: { ch: 24, ca: 20, marks: 40 },
    bec755a: { ch: 0, ca: 0, marks: null },
    bme755a: { ch: 20, ca: 17, marks: 37 },
    bad786: { ch: 16, ca: 15, marks: 45 },
  },
  {
    usn: '4MW21AI003',
    name: 'AKSHATHA BHAT',
    proctorName: 'Ms. Tejaswini H',
    proctorNumber: '9448123456',
    bai701: { ch: 24, ca: 24, marks: 48 },
    bad702: { ch: 26, ca: 26, marks: 49 },
    bad703: { ch: 22, ca: 22, marks: 47 },
    bad714b: { ch: 24, ca: 24, marks: 48 },
    bec755a: { ch: 20, ca: 20, marks: 46 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 16, marks: 50 },
  },
  {
    usn: '4MW21AI004',
    name: 'ANANYA SHETTY',
    proctorName: 'Ms. Tejaswini H',
    proctorNumber: '9448123456',
    bai701: { ch: 24, ca: 23, marks: 45 },
    bad702: { ch: 26, ca: 25, marks: 44 },
    bad703: { ch: 22, ca: 21, marks: 43 },
    bad714b: { ch: 24, ca: 22, marks: 42 },
    bec755a: { ch: 20, ca: 19, marks: 44 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 16, marks: 47 },
  },
  {
    usn: '4MW21AI005',
    name: 'B K KARTHIK',
    proctorName: 'Prof. Savitha Shenoy',
    proctorNumber: '9740556677',
    bai701: { ch: 24, ca: 16, marks: 22 },
    bad702: { ch: 26, ca: 17, marks: 21 },
    bad703: { ch: 22, ca: 14, marks: 19 },
    bad714b: { ch: 24, ca: 15, marks: 23 },
    bec755a: { ch: 0, ca: 0, marks: null },
    bme755a: { ch: 20, ca: 13, marks: 18 },
    bad786: { ch: 16, ca: 11, marks: 32 },
  },
  {
    usn: '4MW21AI006',
    name: 'CHIRAG M NAYAK',
    proctorName: 'Prof. Savitha Shenoy',
    proctorNumber: '9740556677',
    bai701: { ch: 24, ca: 21, marks: 35 },
    bad702: { ch: 26, ca: 22, marks: 37 },
    bad703: { ch: 22, ca: 19, marks: 34 },
    bad714b: { ch: 24, ca: 21, marks: 38 },
    bec755a: { ch: 20, ca: 18, marks: 36 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 15, marks: 42 },
  },
  {
    usn: '4MW21AI007',
    name: 'DEEKSHA POOJARY',
    proctorName: 'Dr. Radhakrishna',
    proctorNumber: '9449887766',
    bai701: { ch: 24, ca: 23, marks: 46 },
    bad702: { ch: 26, ca: 24, marks: 43 },
    bad703: { ch: 22, ca: 21, marks: 44 },
    bad714b: { ch: 24, ca: 23, marks: 45 },
    bec755a: { ch: 0, ca: 0, marks: null },
    bme755a: { ch: 20, ca: 19, marks: 42 },
    bad786: { ch: 16, ca: 16, marks: 49 },
  },
  {
    usn: '4MW21AI008',
    name: 'GAUTHAM SHENOY',
    proctorName: 'Dr. Radhakrishna',
    proctorNumber: '9449887766',
    bai701: { ch: 24, ca: 20, marks: 39 },
    bad702: { ch: 26, ca: 22, marks: 40 },
    bad703: { ch: 22, ca: 19, marks: 37 },
    bad714b: { ch: 24, ca: 21, marks: 41 },
    bec755a: { ch: 20, ca: 17, marks: 38 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 15, marks: 44 },
  },
  {
    usn: '4MW21AI009',
    name: 'HRITHIK SHETTY',
    proctorName: 'Prof. Chaitra',
    proctorNumber: '9845998811',
    bai701: { ch: 24, ca: 21, marks: 34 },
    bad702: { ch: 26, ca: 22, marks: 32 },
    bad703: { ch: 22, ca: 19, marks: 30 },
    bad714b: { ch: 24, ca: 20, marks: 35 },
    bec755a: { ch: 0, ca: 0, marks: null },
    bme755a: { ch: 20, ca: 17, marks: 33 },
    bad786: { ch: 16, ca: 14, marks: 40 },
  },
  {
    usn: '4MW21AI010',
    name: 'KAVANA ACHARYA',
    proctorName: 'Prof. Chaitra',
    proctorNumber: '9845998811',
    bai701: { ch: 24, ca: 24, marks: 47 },
    bad702: { ch: 26, ca: 25, marks: 46 },
    bad703: { ch: 22, ca: 22, marks: 48 },
    bad714b: { ch: 24, ca: 24, marks: 47 },
    bec755a: { ch: 20, ca: 20, marks: 45 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 16, marks: 50 },
  },
  {
    usn: '4MW21AI011',
    name: 'MANISH RAO',
    proctorName: 'Dr. Vasudeva',
    proctorNumber: '9845012341',
    bai701: { ch: 24, ca: 15, marks: 17 },
    bad702: { ch: 26, ca: 16, marks: 18 },
    bad703: { ch: 22, ca: 13, marks: 15 },
    bad714b: { ch: 24, ca: 14, marks: 16 },
    bec755a: { ch: 20, ca: 12, marks: 14 },
    bme755a: { ch: 0, ca: 0, marks: null },
    bad786: { ch: 16, ca: 12, marks: 30 },
  },
  {
    usn: '4MW21AI012',
    name: 'NIDHI HEGDE',
    proctorName: 'Ms. Tejaswini H',
    proctorNumber: '9448123456',
    bai701: { ch: 24, ca: 23, marks: 44 },
    bad702: { ch: 26, ca: 24, marks: 43 },
    bad703: { ch: 22, ca: 21, marks: 42 },
    bad714b: { ch: 24, ca: 23, marks: 45 },
    bec755a: { ch: 0, ca: 0, marks: null },
    bme755a: { ch: 20, ca: 19, marks: 41 },
    bad786: { ch: 16, ca: 16, marks: 48 },
  },
];

export function getSampleReports(customSubjects: SubjectDef[] = DEFAULT_SUBJECTS): StudentReport[] {
  return SAMPLE_STUDENTS_RAW.map((s) => {
    const subjects = customSubjects.map((subj, idx) => {
      // map to sample raw data keys if available, or generate default values
      const rawKeyMap = ['bai701', 'bad702', 'bad703', 'bad714b', 'bec755a', 'bme755a', 'bad786'];
      const rawKey = rawKeyMap[idx % rawKeyMap.length];
      const dataObj = (s as any)[rawKey] || { ch: 24, ca: 20, marks: 38 };

      const ch = dataObj.ch;
      const ca = dataObj.ca;
      const marks = dataObj.marks;
      const isNotEnrolled = subj.isElective && ch === 0 && (marks === null || marks === undefined);

      const attdNum = ch > 0 ? Math.round((ca / ch) * 100) : null;
      const marksNum = marks !== null && marks !== undefined ? marks : null;

      return {
        code: subj.code,
        name: subj.name,
        classHeld: isNotEnrolled ? '-' : (ch > 0 ? ch : '-'),
        classAttended: isNotEnrolled ? '-' : (ca > 0 ? ca : '-'),
        attendancePercentage: attdNum !== null ? `${attdNum}%` : (isNotEnrolled ? 'N/A' : '-'),
        attendanceNum: attdNum,
        maxMarks: subj.defaultMaxMarks,
        marksScored: marksNum !== null ? marksNum : (isNotEnrolled ? 'N/A' : '-'),
        marksNum,
        remark: marksNum !== null ? (marksNum >= 40 ? 'Excellent' : marksNum >= 20 ? 'Satisfactory' : 'Needs Improvement') : '',
        isElective: subj.isElective,
        electiveType: subj.electiveType,
        isNotEnrolled,
      };
    });

    const enrolledSubjects = subjects.filter((sub) => !sub.isNotEnrolled);
    const totalMarks = enrolledSubjects.reduce((acc, sub) => acc + (sub.marksNum || 0), 0);
    const totalMax = enrolledSubjects.reduce((acc, sub) => acc + sub.maxMarks, 0);
    const avgAttd = enrolledSubjects.length > 0
      ? Math.round(enrolledSubjects.reduce((acc, sub) => acc + (sub.attendanceNum || 0), 0) / enrolledSubjects.length)
      : 0;

    return {
      id: s.usn,
      student: {
        usn: s.usn,
        name: s.name,
        semester: DEFAULT_CONFIG.semester,
        proctorName: s.proctorName,
        proctorNumber: s.proctorNumber,
        parentNumber: (s as any).parentNumber || '+91 XXXXXXXXXX',
      },
      testName: DEFAULT_CONFIG.testName,
      academicYear: DEFAULT_CONFIG.academicYear,
      department: INSTITUTION_INFO.deptText,
      institution: INSTITUTION_INFO.name,
      subInstitution: INSTITUTION_INFO.subHeading,
      address: INSTITUTION_INFO.address,
      hodName: DEFAULT_CONFIG.hodName,
      hodTitle: DEFAULT_CONFIG.hodTitle,
      contactTel: INSTITUTION_INFO.contactTel,
      contactEmail: INSTITUTION_INFO.contactEmail,
      contactWeb: INSTITUTION_INFO.contactWeb,
      institutionInfo: { ...INSTITUTION_INFO, fullContactText: INSTITUTION_INFO.fullContactText },
      subjects,
      overallAttendance: avgAttd,
      totalMarksScored: totalMarks,
      totalMaxMarks: totalMax,
      percentageMarks: totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0,
      statusRemark: avgAttd < 75 ? 'Low Attendance Warning' : 'Good',
    };
  });
}

/**
 * Creates and downloads a real .xlsx workbook matching custom or default subject definitions
 */
export function generateCustomExcelWorkbook(subjects: SubjectDef[] = DEFAULT_SUBJECTS): Uint8Array {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [];

  rows.push(['SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT, BANTAKAL']);
  rows.push([INSTITUTION_INFO.deptText]);
  rows.push(['ATTENDANCE & IA MARKS REPORT TEMPLATE (ACADEMIC YEAR 2026-27)']);
  rows.push([]);

  // Row 4: Top Level Headers
  const topHeader: any[] = ['SL NO', 'USN', 'NAME', 'Proctor Name', 'Proctor Number', 'Parent Number'];
  subjects.forEach((subj) => {
    topHeader.push(`${subj.code} (${subj.name})`, '', '', '');
  });
  rows.push(topHeader);

  // Row 5: Sub Headers
  const subHeader: any[] = ['', '', '', '', '', ''];
  subjects.forEach((subj) => {
    subHeader.push(`IA1 (${subj.defaultMaxMarks})`, 'CH', 'CA', '%');
  });
  rows.push(subHeader);

  // Data rows
  SAMPLE_STUDENTS_RAW.forEach((s, idx) => {
    const rowData: any[] = [
      idx + 1,
      s.usn,
      s.name,
      s.proctorName,
      s.proctorNumber,
      (s as any).parentNumber || '+91 XXXXXXXXXX',
    ];
    subjects.forEach((subj, sIdx) => {
      const rawKeyMap = ['bai701', 'bad702', 'bad703', 'bad714b', 'bec755a', 'bme755a', 'bad786'];
      const rawKey = rawKeyMap[sIdx % rawKeyMap.length];
      const dataObj = (s as any)[rawKey] || { ch: 24, ca: 20, marks: 38 };
      const pct = dataObj.ch > 0 ? `${Math.round((dataObj.ca / dataObj.ch) * 100)}%` : 'N/A';
      rowData.push(dataObj.marks ?? '', dataObj.ch || '', dataObj.ca || '', pct);
    });
    rows.push(rowData);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = [
    { wch: 8 },  // SL NO
    { wch: 14 }, // USN
    { wch: 28 }, // NAME
    { wch: 22 }, // Proctor Name
    { wch: 16 }, // Proctor Number
    { wch: 16 }, // Parent Number
  ];
  for (let i = 0; i < subjects.length * 4; i++) {
    colWidths.push({ wch: 11 });
  }
  ws['!cols'] = colWidths;

  const totalCols = 6 + subjects.length * 4 - 1;
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } },
  ];

  let colIdx = 6;
  subjects.forEach(() => {
    merges.push({ s: { r: 4, c: colIdx }, e: { r: 4, c: colIdx + 3 } });
    colIdx += 4;
  });
  ws['!merges'] = merges;

  XLSX.utils.book_append_sheet(wb, ws, 'Marks & Attendance Template');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

export function generateSampleExcelWorkbook(): Uint8Array {
  return generateCustomExcelWorkbook(DEFAULT_SUBJECTS);
}
