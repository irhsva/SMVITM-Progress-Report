export interface SubjectDef {
  code: string;
  name: string;
  defaultMaxMarks: number;
  isElective?: boolean;
  electiveType?: 'professional' | 'open';
}

export interface SubjectRecord {
  code: string;
  name: string;
  classHeld: number | string;
  classAttended: number | string;
  attendancePercentage: string; // e.g. "85%" or "-" or "N/A"
  attendanceNum: number | null; // numeric for analytics/checks (0-100)
  maxMarks: number; // default 50
  marksScored: number | string; // e.g. 42 or "AB" or "N/A"
  marksNum: number | null; // numeric for analytics
  remark: string;
  isElective?: boolean;
  electiveType?: 'professional' | 'open';
  isNotEnrolled?: boolean;
}

export interface StudentInfo {
  usn: string;
  name: string;
  semester: string;
  proctorName: string;
  proctorNumber: string;
  parentNumber: string;
}

export type LogoPreset = 'sode' | 'smvitm' | 'custom' | 'none';

export interface LogoSettings {
  leftPreset: LogoPreset;
  leftCustomUrl?: string;
  rightPreset: LogoPreset;
  rightCustomUrl?: string;
}

export interface InstitutionInfo {
  name: string;
  subHeading: string;
  trust: string;
  accreditation: string;
  address: string;
  deptText: string;
  contactTel: string;
  contactEmail: string;
  contactWeb: string;
  fullContactText: string;
}

export interface StudentReport {
  id: string;
  student: StudentInfo;
  testName: string;
  academicYear: string;
  department: string;
  institution: string;
  subInstitution: string;
  address: string;
  hodName: string;
  hodTitle: string;
  contactTel: string;
  contactEmail: string;
  contactWeb: string;
  subjects: SubjectRecord[];
  overallAttendance?: number | null;
  totalMarksScored?: number | null;
  totalMaxMarks?: number | null;
  percentageMarks?: number | null;
  statusRemark?: string;
  logos?: LogoSettings;
  institutionInfo?: InstitutionInfo;
}

export interface ReportConfig {
  testName: string; // e.g. "IA TEST 1" / "Internal Test: 1"
  semester: string; // "7th Sem"
  academicYear: string; // "2025-26"
  hodName: string; // "Ms. Tejaswini H"
  hodTitle: string; // "In-charge HOD, AI and DS"
  department: string; // "DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"
  autoRemarks: boolean;
  passThresholdMarks: number; // default 20/50 (40%)
  attendanceWarningThreshold: number; // default 75%
  logos?: LogoSettings;
  institutionInfo: InstitutionInfo;
}

export interface ClassStats {
  totalStudents: number;
  avgAttendance: number;
  avgMarksPercentage: number;
  lowAttendanceCount: number;
  lowMarksCount: number;
  subjectWise: {
    code: string;
    name: string;
    enrolledCount: number;
    avgAttd: number;
    avgMarks: number;
    passCount: number;
  }[];
}
