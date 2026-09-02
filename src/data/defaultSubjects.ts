import { SubjectDef, ReportConfig } from '../types';

export const DEFAULT_SUBJECTS: SubjectDef[] = [
  {
    code: 'BAI701',
    name: 'Deep Learning and Reinforcement Learning',
    defaultMaxMarks: 25,
    isElective: false,
  },
  {
    code: 'BAD702',
    name: 'Statistical Machine Learning for Data Science',
    defaultMaxMarks: 25,
    isElective: false,
  },
  {
    code: 'BAD703',
    name: 'Data Security and Privacy',
    defaultMaxMarks: 25,
    isElective: false,
  },
  {
    code: 'BAD714B',
    name: 'Big Data Analytics',
    defaultMaxMarks: 25,
    isElective: true,
    electiveType: 'professional',
  },
  {
    code: 'BEC755A',
    name: 'Waste Management',
    defaultMaxMarks: 25,
    isElective: true,
    electiveType: 'open',
  },
  {
    code: 'BME755A',
    name: 'Introduction to Non-Traditional Machining',
    defaultMaxMarks: 25,
    isElective: true,
    electiveType: 'open',
  },
  {
    code: 'BAD786',
    name: 'Major Project Phase-II',
    defaultMaxMarks: 25,
    isElective: false,
  },
];

export const INSTITUTION_INFO = {
  name: 'SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT',
  subHeading: 'An Autonomous Institute Affiliated to VTU, Belagavi',
  trust: 'A Unit of Shri Sode Vadiraja Mutt Education Trust®, Udupi',
  accreditation: 'Approved by AICTE, New Delhi | Accredited by NAAC with ‘A’ Grade',
  address: 'Vishwothama Nagar, Bantakal – 574115, Udupi District, Karnataka',
  deptText: 'SMVITM BANTAKAL',
  contactTel: '+91 7483031199 | 0820-2589182/183 | Ext: 248',
  contactEmail: 'ds@sode-edu.in',
  contactWeb: 'https://sode-edu.in',
  fullContactText: 'Tel: +91 7483031199 | 0820-2589182/183 | Ext: 248 • E-mail: ds@sode-edu.in • Web: https://sode-edu.in/departments/artificial-intelligence-and-data-science',
};

export const DEFAULT_CONFIG: ReportConfig = {
  testName: 'IA TEST 1',
  semester: '7th Sem',
  academicYear: '2026-27 (Odd Sem)',
  hodName: 'Ms. Tejaswini H',
  hodTitle: 'In-charge HOD',
  department: 'SMVITM BANTAKAL',
  autoRemarks: true,
  passThresholdMarks: 20,
  attendanceWarningThreshold: 85,
  institutionInfo: INSTITUTION_INFO,
};
