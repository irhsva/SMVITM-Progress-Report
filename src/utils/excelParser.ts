import * as XLSX from 'xlsx';
import { StudentReport, SubjectRecord, ReportConfig, SubjectDef } from '../types';
import { DEFAULT_SUBJECTS, DEFAULT_CONFIG, INSTITUTION_INFO } from '../data/defaultSubjects';

/**
 * Normalizes text for matching column headers
 */
function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().replace(/\s+/g, ' ');
}

function calculateRemark(marks: number | null, attd: number | null, config: ReportConfig): string {
  if (marks === null && attd === null) return '';
  if (attd !== null && attd < config.attendanceWarningThreshold) {
    if (marks !== null && marks < config.passThresholdMarks) {
      return 'Low Attd & Needs Impr.';
    }
    return 'Low Attendance';
  }
  if (marks !== null) {
    if (marks >= 45) return 'Excellent';
    if (marks >= 38) return 'Very Good';
    if (marks >= 30) return 'Good';
    if (marks >= config.passThresholdMarks) return 'Satisfactory';
    return 'Needs Improvement';
  }
  return '';
}

/**
 * Comprehensive parser for AIML / AI&DS Excel sheets
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
  customConfig: Partial<ReportConfig> = {},
  customSubjects: SubjectDef[] = DEFAULT_SUBJECTS
): StudentReport[] {
  const subjectsToUse = customSubjects && customSubjects.length > 0 ? customSubjects : DEFAULT_SUBJECTS;
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('No sheet found in Excel workbook');

  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded sheet appears to be empty');
  }

  const config: ReportConfig = { ...DEFAULT_CONFIG, ...customConfig };

  // Find header rows. Typically row 4 and 5 (0-indexed: row 3, 4 or 4, 5)
  // Let's locate the row that contains 'USN' or 'SL NO' or 'NAME'
  let headerRowIdx = -1;
  for (let r = 0; r < Math.min(15, rawRows.length); r++) {
    const row = rawRows[r];
    if (!row) continue;
    const rowStr = row.map(cleanStr).join(' ').toUpperCase();
    if (rowStr.includes('USN') || (rowStr.includes('NAME') && (rowStr.includes('BAI701') || rowStr.includes('SL') || rowStr.includes(subjectsToUse[0]?.code?.toUpperCase() || '')))) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) {
    // fallback to row 0 if not found
    headerRowIdx = 0;
  }

  // Check if next row contains sub-headers like CH, CA, %, IA1
  const topHeader = rawRows[headerRowIdx] || [];
  const subHeader = rawRows[headerRowIdx + 1] || [];
  const thirdHeader = rawRows[headerRowIdx + 2] || [];

  // Determine if subHeader has CH, CA, etc.
  const subHeaderStr = subHeader.map(cleanStr).join(' ').toUpperCase();
  const isMultiHeader = subHeaderStr.includes('CH') || subHeaderStr.includes('CA') || subHeaderStr.includes('IA') || subHeaderStr.includes('%');
  
  const dataStartRow = isMultiHeader ? (
    // Check if 3rd row is also a subheader
    thirdHeader.map(cleanStr).join(' ').toUpperCase().includes('IA1') || thirdHeader.map(cleanStr).join(' ').toUpperCase().includes('ATTENDANCE')
      ? headerRowIdx + 3
      : headerRowIdx + 2
  ) : headerRowIdx + 1;

  // Build column map
  // We want to identify:
  // - USN col
  // - Name col
  // - Proctor Name col
  // - Proctor Number col
  // - For each subject code: CH col, CA col, Attd % col, IA Marks col

  let usnCol = -1;
  let nameCol = -1;
  let proctorNameCol = -1;
  let proctorNumCol = -1;

  // Track subject column clusters
  interface SubjectColMap {
    code: string;
    name: string;
    startCol: number;
    endCol: number;
    chCol: number;
    caCol: number;
    attdPctCol: number;
    iaMarksCol: number;
  }

  const subjectColMaps: Map<string, SubjectColMap> = new Map();

  // Initialize for all subjects
  subjectsToUse.forEach((subj) => {
    subjectColMaps.set(subj.code, {
      code: subj.code,
      name: subj.name,
      startCol: -1,
      endCol: -1,
      chCol: -1,
      caCol: -1,
      attdPctCol: -1,
      iaMarksCol: -1,
    });
  });

  // Scan top header for known columns and subjects
  const maxCols = Math.max(topHeader.length, subHeader.length);

  let currentSubjectCode: string | null = null;

  for (let c = 0; c < maxCols; c++) {
    const topCell = cleanStr(topHeader[c]).toUpperCase();
    const subCell = cleanStr(subHeader[c]).toUpperCase();
    const thirdCell = cleanStr(thirdHeader[c]).toUpperCase();
    const combinedCell = `${topCell} ${subCell} ${thirdCell}`;

    if (topCell.includes('USN') || subCell === 'USN') {
      usnCol = c;
    } else if ((topCell.includes('NAME') || subCell === 'NAME') && !topCell.includes('PROCTOR') && !subCell.includes('PROCTOR') && !topCell.includes('SUBJECT')) {
      nameCol = c;
    } else if (combinedCell.includes('PROCTOR NAME') || (combinedCell.includes('PROCTOR') && !combinedCell.includes('NO') && !combinedCell.includes('NUM') && !combinedCell.includes('PHONE') && !combinedCell.includes('MOB'))) {
      proctorNameCol = c;
    } else if (combinedCell.includes('PROCTOR NO') || combinedCell.includes('PROCTOR NUM') || combinedCell.includes('PROCTOR MOB') || combinedCell.includes('PROCTOR PHONE') || combinedCell.includes('CONTACT')) {
      proctorNumCol = c;
    }

    // Check if topCell has a subject code
    for (const [code, map] of subjectColMaps.entries()) {
      if (topCell.includes(code.toUpperCase()) || topCell.includes(code.toUpperCase().replace('B', '')) || topCell.includes(map.name.toUpperCase().slice(0, 8))) {
        currentSubjectCode = code;
        if (map.startCol === -1) map.startCol = c;
        break;
      }
    }

    // If currentSubjectCode is active, assign subcolumns
    if (currentSubjectCode && subjectColMaps.has(currentSubjectCode)) {
      const map = subjectColMaps.get(currentSubjectCode)!;
      map.endCol = c;

      if (subCell === 'CH' || subCell.includes('HELD') || combinedCell.includes('CLASS HELD')) {
        map.chCol = c;
      } else if (subCell === 'CA' || subCell.includes('ATTENDED') || combinedCell.includes('CLASS ATTENDED')) {
        map.caCol = c;
      } else if (subCell.includes('%') || subCell.includes('ATTD') || subCell.includes('ATTENDANCE') || combinedCell.includes('ATTENDANCE %')) {
        map.attdPctCol = c;
      } else if (subCell.includes('IA') || subCell.includes('MARKS') || subCell.includes('TEST') || subCell.includes('SCORE') || combinedCell.includes('IA1') || combinedCell.includes('IA-1')) {
        map.iaMarksCol = c;
      }
    }
  }

  // If specific subject columns weren't resolved by exact subCell match, attempt fallback column grouping
  subjectColMaps.forEach((map) => {
    if (map.startCol !== -1) {
      if (map.iaMarksCol === -1 && map.startCol < maxCols) map.iaMarksCol = map.startCol;
      if (map.chCol === -1 && map.startCol + 1 < maxCols) map.chCol = map.startCol + 1;
      if (map.caCol === -1 && map.startCol + 2 < maxCols) map.caCol = map.startCol + 2;
      if (map.attdPctCol === -1 && map.startCol + 3 < maxCols) map.attdPctCol = map.startCol + 3;
    }
  });

  // Fallback for USN / Name columns if still not found
  if (usnCol === -1) {
    for (let r = dataStartRow; r < Math.min(dataStartRow + 5, rawRows.length); r++) {
      const row = rawRows[r] || [];
      for (let c = 0; c < row.length; c++) {
        const val = cleanStr(row[c]);
        if (/^4[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/i.test(val) || val.toUpperCase().includes('4MW') || val.length >= 8) {
          usnCol = c;
          break;
        }
      }
      if (usnCol !== -1) break;
    }
    if (usnCol === -1) usnCol = 1;
  }

  if (nameCol === -1) {
    nameCol = usnCol + 1;
  }

  // Now process student rows
  const students: StudentReport[] = [];

  for (let r = dataStartRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const usnRaw = cleanStr(row[usnCol]);
    const nameRaw = cleanStr(row[nameCol]);

    // Skip blank or footer rows
    if (!usnRaw && !nameRaw) continue;
    if (usnRaw.toLowerCase().includes('total') || usnRaw.toLowerCase().includes('average') || nameRaw.toLowerCase().includes('staff') || nameRaw.toLowerCase().includes('signature')) {
      continue;
    }
    if (usnRaw.length < 3 && nameRaw.length < 2) continue;

    const proctorName = proctorNameCol !== -1 ? cleanStr(row[proctorNameCol]) : 'Dr. / Prof. Faculty Advisor';
    const proctorNumber = proctorNumCol !== -1 ? cleanStr(row[proctorNumCol]) : '+91 98450 XXXXX';

    // Extract subjects
    const subjectsList: SubjectRecord[] = [];
    let totalMarks = 0;
    let totalMaxMarks = 0;
    let validMarksCount = 0;
    let totalAttd = 0;
    let validAttdCount = 0;

    subjectsToUse.forEach((subj) => {
      const colMap = subjectColMaps.get(subj.code);
      let chVal: any = '';
      let caVal: any = '';
      let attdVal: any = '';
      let marksVal: any = '';

      if (colMap && colMap.startCol !== -1) {
        if (colMap.chCol !== -1) chVal = row[colMap.chCol];
        if (colMap.caCol !== -1) caVal = row[colMap.caCol];
        if (colMap.attdPctCol !== -1) attdVal = row[colMap.attdPctCol];
        if (colMap.iaMarksCol !== -1) marksVal = row[colMap.iaMarksCol];
      }

      // Clean & parse numbers
      let chNum = typeof chVal === 'number' ? chVal : parseInt(String(chVal).replace(/[^\d]/g, ''), 10);
      let caNum = typeof caVal === 'number' ? caVal : parseInt(String(caVal).replace(/[^\d]/g, ''), 10);
      if (isNaN(chNum)) chNum = 0;
      if (isNaN(caNum)) caNum = 0;

      let attdPercentageStr = '';
      let attdNumeric: number | null = null;

      if (typeof attdVal === 'number') {
        const pct = attdVal <= 1 && attdVal > 0 ? Math.round(attdVal * 100) : Math.round(attdVal);
        attdPercentageStr = `${pct}%`;
        attdNumeric = pct;
      } else if (cleanStr(attdVal)) {
        const cleaned = cleanStr(attdVal).replace('%', '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
          const pct = parsed <= 1 && parsed > 0 ? Math.round(parsed * 100) : Math.round(parsed);
          attdPercentageStr = `${pct}%`;
          attdNumeric = pct;
        } else {
          attdPercentageStr = cleanStr(attdVal);
        }
      } else if (chNum > 0) {
        const pct = Math.round((caNum / chNum) * 100);
        attdPercentageStr = `${pct}%`;
        attdNumeric = pct;
      }

      let marksScoredStr = cleanStr(marksVal);
      let marksNumeric: number | null = null;

      if (typeof marksVal === 'number') {
        marksNumeric = marksVal;
        marksScoredStr = String(marksVal);
      } else if (marksScoredStr) {
        const parsed = parseFloat(marksScoredStr);
        if (!isNaN(parsed)) {
          marksNumeric = parsed;
        }
      }

      const isElective = !!subj.isElective;
      let isNotEnrolled = false;

      if (isElective && (chNum === 0 && caNum === 0 && (!marksScoredStr || marksScoredStr === 'N/A' || marksScoredStr === '-'))) {
        isNotEnrolled = true;
        chVal = '-';
        caVal = '-';
        attdPercentageStr = 'N/A';
        marksScoredStr = 'N/A';
      }

      if (!isNotEnrolled) {
        if (marksNumeric !== null) {
          totalMarks += marksNumeric;
          totalMaxMarks += subj.defaultMaxMarks;
          validMarksCount++;
        }
        if (attdNumeric !== null) {
          totalAttd += attdNumeric;
          validAttdCount++;
        }
      }

      const remark = config.autoRemarks && !isNotEnrolled
        ? calculateRemark(marksNumeric, attdNumeric, config)
        : '';

      subjectsList.push({
        code: subj.code,
        name: subj.name,
        classHeld: isNotEnrolled ? '-' : (chNum || (chVal ? cleanStr(chVal) : '-')),
        classAttended: isNotEnrolled ? '-' : (caNum || (caVal ? cleanStr(caVal) : '-')),
        attendancePercentage: attdPercentageStr || (isNotEnrolled ? 'N/A' : '-'),
        attendanceNum: attdNumeric,
        maxMarks: subj.defaultMaxMarks,
        marksScored: marksScoredStr || (isNotEnrolled ? 'N/A' : '-'),
        marksNum: marksNumeric,
        remark,
        isElective,
        electiveType: subj.electiveType,
        isNotEnrolled,
      });
    });

    const avgAttendance = validAttdCount > 0 ? Math.round(totalAttd / validAttdCount) : null;
    const percentageMarks = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : null;

    let statusRemark = 'Good';
    if (avgAttendance !== null && avgAttendance < config.attendanceWarningThreshold) {
      statusRemark = 'Low Attendance Warning';
    } else if (percentageMarks !== null && percentageMarks < 40) {
      statusRemark = 'Academic Performance Alert';
    }

    students.push({
      id: usnRaw || `student-${r}`,
      student: {
        usn: usnRaw || `4MW21AI${String(r - dataStartRow + 1).padStart(3, '0')}`,
        name: nameRaw || `Student ${r - dataStartRow + 1}`,
        semester: config.semester,
        proctorName: proctorName || 'Prof. Faculty Advisor',
        proctorNumber: proctorNumber || '+91 98450 12345',
      },
      testName: config.testName,
      academicYear: config.academicYear,
      department: config.department || INSTITUTION_INFO.deptText,
      institution: INSTITUTION_INFO.name,
      subInstitution: INSTITUTION_INFO.subHeading,
      address: INSTITUTION_INFO.address,
      hodName: config.hodName,
      hodTitle: config.hodTitle,
      contactTel: INSTITUTION_INFO.contactTel,
      contactEmail: INSTITUTION_INFO.contactEmail,
      contactWeb: INSTITUTION_INFO.contactWeb,
      institutionInfo: config.institutionInfo,
      subjects: subjectsList,
      overallAttendance: avgAttendance,
      totalMarksScored: validMarksCount > 0 ? totalMarks : null,
      totalMaxMarks: totalMaxMarks > 0 ? totalMaxMarks : null,
      percentageMarks,
      statusRemark,
    });
  }

  return students;
}
