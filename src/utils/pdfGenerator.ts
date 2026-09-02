import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { StudentReport, LogoPreset } from '../types';

export interface ProgressCallback {
  (current: number, total: number, studentName: string): void;
}

// In-memory cache for resolved PNG data URLs of logos
const logoCache = new Map<string, string>();

/**
 * Generates vector SVG markup for institutional logo presets
 */
export function getPresetSvg(preset: LogoPreset): string {
  switch (preset) {
    case 'sode':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#ffffff"/>
        <!-- Outer Gold Rings -->
        <circle cx="100" cy="100" r="97" fill="#ffffff" stroke="#c89d42" stroke-width="2.2" />
        <circle cx="100" cy="100" r="92.5" fill="none" stroke="#c89d42" stroke-width="1" stroke-dasharray="2.5 1.5" />
        <circle cx="100" cy="100" r="67.5" fill="none" stroke="#c89d42" stroke-width="1.6" />

        <defs>
          <path id="sodePdfTopArcRef" d="M 20,100 A 80,80 0 1,1 180,100" fill="none" />
          <path id="sodePdfBottomArcRef" d="M 176,100 A 80,80 0 0,1 24,100" fill="none" />
        </defs>

        <!-- Top Arc Text -->
        <text font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="#7a182b" letter-spacing="1.2">
          <textPath href="#sodePdfTopArcRef" startOffset="50%" text-anchor="middle">
            SODE GROUP OF INSTITUTIONS
          </textPath>
        </text>

        <!-- Flanking Gold Dots -->
        <circle cx="36" cy="144" r="4.2" fill="#c89d42" />
        <circle cx="164" cy="144" r="4.2" fill="#c89d42" />

        <!-- Bottom Arc Text: UDUPI -->
        <text font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="900" fill="#7a182b" letter-spacing="3">
          <textPath href="#sodePdfBottomArcRef" startOffset="50%" text-anchor="middle">
            UDUPI
          </textPath>
        </text>

        <!-- Inner Golden Concentric Rays -->
        <g stroke="#c89d42" stroke-width="1" fill="none" opacity="0.8">
          <ellipse cx="100" cy="100" rx="18" ry="18" />
          <ellipse cx="100" cy="100" rx="28" ry="28" />
          <ellipse cx="100" cy="100" rx="38" ry="38" />
          <ellipse cx="100" cy="100" rx="48" ry="48" />
          <ellipse cx="100" cy="100" rx="58" ry="58" />
        </g>

        <!-- Sun at top center -->
        <circle cx="100" cy="58" r="6.5" fill="#c89d42" />
        <circle cx="100" cy="58" r="4" fill="#7a182b" />

        <!-- Interlocking Maroon Lotus Flower Petals -->
        <g stroke="#7a182b" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" fill="none">
          <path d="M100 68 L114 86 L100 112 L86 86 Z" fill="#ffffff" fill-opacity="0.6" />
          <path d="M68 84 L88 72 L103 98 L83 112 Z" />
          <path d="M132 84 L112 72 L97 98 L117 112 Z" />
          <path d="M62 98 C62 116 80 125 100 123 C76 117 72 96 70 84" />
          <path d="M138 98 C138 116 120 125 100 123 C124 117 128 96 130 84" />
          <path d="M78 98 C88 120 112 120 122 98" />
          <path d="M86 108 C93 122 107 122 114 108" />
        </g>

        <!-- Sanskrit Motto -->
        <text x="100" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#ab8130" letter-spacing="0.6">
          सर्वे भवन्तु सुखिनः
        </text>
      </svg>`;

    case 'smvitm':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="320" viewBox="0 0 200 215">
        <rect width="200" height="215" fill="#ffffff"/>
        <!-- Golden Concentric Arcs / Radiant Halo -->
        <g stroke="#c89d42" stroke-width="1.2" fill="none" opacity="0.85">
          <ellipse cx="100" cy="76" rx="20" ry="20" />
          <ellipse cx="100" cy="76" rx="34" ry="34" />
          <ellipse cx="100" cy="76" rx="48" ry="48" />
          <ellipse cx="100" cy="76" rx="62" ry="62" />
        </g>

        <!-- Sun Disc at Top Apex -->
        <circle cx="100" cy="20" r="9.5" fill="#c89d42" />
        <circle cx="100" cy="20" r="6" fill="#7a182b" />

        <!-- Interlocking Maroon Lotus Flower Geometry -->
        <g stroke="#7a182b" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round" fill="none">
          <path d="M100 36 L120 60 L100 96 L80 60 Z" fill="#ffffff" fill-opacity="0.5" />
          <path d="M54 58 L82 42 L104 80 L76 96 Z" />
          <path d="M146 58 L118 42 L96 80 L124 96 Z" />
          <path d="M46 78 C46 102 72 114 100 112 C68 104 60 78 56 58" />
          <path d="M154 78 C154 102 128 114 100 112 C132 104 140 78 144 58" />
          <path d="M68 76 C82 106 118 106 132 76" />
          <path d="M80 90 C90 110 110 110 120 90" />
        </g>

        <!-- Sanskrit Motto -->
        <text x="100" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#ab8130" letter-spacing="0.5">
          सर्वे भवन्तु सुखिनः
        </text>

        <!-- SMVITM Bold Text -->
        <text x="100" y="184" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#7a182b" letter-spacing="2.5">
          SMVITM
        </text>
      </svg>`;

    default:
      return '';
  }
}

/**
 * Converts SVG markup string to PNG Base64 Data URL using HTML Canvas
 */
export async function svgToPngDataUrl(svgString: string, width = 300, height = 300): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve('');
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png', 1.0));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('');
      };

      img.src = url;
    } catch {
      resolve('');
    }
  });
}

/**
 * Loads and normalizes a custom image URL/dataURL into a clean PNG data URL
 */
export async function loadCustomImageDataUrl(src: string): Promise<string> {
  if (!src) return '';

  const tryLoad = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 200;
            canvas.height = img.naturalHeight || 200;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png', 1.0));
              return;
            }
          } catch {
            // cross origin fallback
          }
          resolve('');
        };
        img.onerror = () => resolve('');
        img.src = url;
      } catch {
        resolve('');
      }
    });
  };

  if (src.startsWith('data:image/')) {
    return await tryLoad(src);
  }

  const paths = [
    src,
    src.startsWith('/') ? src.slice(1) : '/' + src,
    `./${src.startsWith('/') ? src.slice(1) : src}`
  ];

  for (const p of paths) {
    const res = await tryLoad(p);
    if (res) return res;
  }
  return '';
}

/**
 * Resolves a LogoPreset or custom URL into a reusable, cached PNG data URL
 */
export async function getResolvedLogoDataUrl(
  preset: LogoPreset,
  customUrl?: string,
  defaultPreset: LogoPreset = 'sode'
): Promise<string> {
  if (preset === 'none') return '';

  if (customUrl) {
    const cacheKey = `custom_${customUrl.slice(0, 80)}`;
    if (logoCache.has(cacheKey)) {
      return logoCache.get(cacheKey)!;
    }
    const dataUrl = await loadCustomImageDataUrl(customUrl);
    if (dataUrl) {
      logoCache.set(cacheKey, dataUrl);
      return dataUrl;
    }
  }

  const effectivePreset = preset === 'custom' ? defaultPreset : preset;
  
  // Use custom image loading for default institutional presets
  if (effectivePreset === 'sode') return await loadCustomImageDataUrl('/smvitm_left.jpg');
  if (effectivePreset === 'smvitm') return await loadCustomImageDataUrl('/smvitm_right.jpg');

  if (logoCache.has(effectivePreset)) {
    return logoCache.get(effectivePreset)!;
  }

  const svg = getPresetSvg(effectivePreset);
  if (!svg) return '';

  const dataUrl = await svgToPngDataUrl(svg, 300, 300);
  if (dataUrl) {
    logoCache.set(effectivePreset, dataUrl);
  }
  return dataUrl;
}

/**
 * Pre-resolves both left and right logos for a student report
 */
export async function resolveReportLogos(report: StudentReport): Promise<{ left?: string; right?: string }> {
  const leftPreset = report.logos?.leftPreset || 'sode';
  const leftCustomUrl = report.logos?.leftCustomUrl;
  const rightPreset = report.logos?.rightPreset || 'smvitm';
  const rightCustomUrl = report.logos?.rightCustomUrl;

  const [left, right] = await Promise.all([
    getResolvedLogoDataUrl(leftPreset, leftCustomUrl, 'sode'),
    getResolvedLogoDataUrl(rightPreset, rightCustomUrl, 'smvitm'),
  ]);

  return { left, right };
}

/**
 * Builds an authentic, vector-sharp PDF document for a student report using jsPDF + autoTable.
 * Renders high-resolution institutional crests/logos, metadata tables, and official signatures.
 */
export function buildStudentReportPdf(
  report: StudentReport,
  attendanceWarningThreshold: number,
  existingDoc?: jsPDF,
  logoImages?: { left?: string; right?: string }
): jsPDF {
  const doc = existingDoc || new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 190mm
  const headerTopY = 7;
  const logoSize = 19; // 19mm x 19mm crests

  // 1. Render Left & Right Institutional Crests / Logos
  if (logoImages?.left) {
    try {
      doc.addImage(logoImages.left, 'PNG', margin, headerTopY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not render left logo:', e);
    }
  }

  if (logoImages?.right) {
    try {
      doc.addImage(logoImages.right, 'PNG', pageWidth - margin - logoSize, headerTopY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not render right logo:', e);
    }
  }

  // 2. Institutional Header Text (Balanced Center Alignment)
  const textCenterWidth = contentWidth - logoSize * 2 - 4; // Width between logos
  const textCenterX = pageWidth / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(139, 29, 36); // Institutional Maroon
  doc.text(
    (report.institution || 'SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT').toUpperCase(),
    textCenterX,
    headerTopY + 3.8,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(
    report.subInstitution || 'A Unit of Shri Sode Vadiraja Mutt Education Trust®, Udupi',
    textCenterX,
    headerTopY + 7.8,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(
    'Approved by AICTE, New Delhi | Accredited by NAAC with ‘A’ Grade | Affiliated to VTU, Belagavi',
    textCenterX,
    headerTopY + 11.2,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.text(
    report.address || 'Vishwothama Nagar, Bantakal, Udupi - 574 115, Karnataka, India',
    textCenterX,
    headerTopY + 14.6,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(139, 29, 36); // Institutional Maroon
  doc.text(
    (report.department || 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE').toUpperCase(),
    textCenterX,
    headerTopY + 18.8,
    { align: 'center', maxWidth: textCenterWidth }
  );

  // Maroon separator line beneath header
  const separatorY = headerTopY + 21.5;
  doc.setDrawColor(139, 29, 36);
  doc.setLineWidth(0.65);
  doc.line(margin, separatorY, margin + contentWidth, separatorY);

  // 3. Report Title, Academic Year, and IA Test Name (in exact requested order with clean line spacing)
  let currentY = separatorY + 4.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('INTERNAL PROGRESS REPORT', textCenterX, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(30, 41, 59);
  const rawAcadYear = report.academicYear || '2026-27 (Odd Sem)';
  const acadYearLabel = rawAcadYear.toUpperCase().startsWith('ACADEMIC YEAR')
    ? rawAcadYear.toUpperCase()
    : `ACADEMIC YEAR: ${rawAcadYear.toUpperCase()}`;
  doc.text(acadYearLabel, textCenterX, currentY, { align: 'center' });

  currentY += 4.3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(139, 29, 36);
  const testLabel = (report.testName || 'IA TEST 1').toUpperCase();
  doc.text(testLabel, textCenterX, currentY, { align: 'center' });

  // 4. General Information Section (Structured Meta Table)
  currentY += 4.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('1. GENERAL INFORMATION', margin, currentY);

  currentY += 1.8;
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [100, 116, 139],
      lineWidth: 0.15,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      1: { cellWidth: 63, fontStyle: 'bold', textColor: [15, 23, 42] },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      3: { cellWidth: 63 },
    },
    body: [
      [
        'Student Name:',
        (report.student.name || '').toUpperCase(),
        'University USN:',
        report.student.usn || '',
      ],
      [
        'Semester / Class:',
        report.student.semester || '7th Semester',
        'Academic Year:',
        report.academicYear || '2026-27 (Odd Sem)',
      ],
      [
        'Faculty Proctor:',
        report.student.proctorName || 'Department Faculty',
        'Proctor Contact:',
        report.student.proctorNumber || 'Dept. Contact',
      ],
    ],
  });

  // 5. Academic Performance Table - Generous vertical space after General Information is over
  // @ts-expect-error autoTable plugin stores lastAutoTable
  currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 25) + 8.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ACADEMIC PERFORMANCE & ATTENDANCE RECORD', margin, currentY);

  currentY += 2;

  const tableBody = report.subjects.map((sub, idx) => {
    const isNotEnrolled = sub.isNotEnrolled;
    const isLowAtt = typeof sub.attendancePercentage === 'number' && sub.attendancePercentage < attendanceWarningThreshold && !isNotEnrolled;
    const isLowMarks = typeof sub.marksScored === 'number' && sub.marksScored < (sub.maxMarks ?? 50) * 0.4 && !isNotEnrolled;

    return [
      { content: String(idx + 1), styles: { halign: 'center' as const } },
      {
        content: `${sub.code} - ${sub.name}${sub.isElective ? (isNotEnrolled ? ' (Not Enrolled)' : ' (Elective)') : ''}`,
        styles: { fontStyle: 'bold' as const },
      },
      { content: isNotEnrolled ? '-' : String(sub.classHeld ?? '-'), styles: { halign: 'center' as const } },
      { content: isNotEnrolled ? '-' : String(sub.classAttended ?? '-'), styles: { halign: 'center' as const } },
      {
        content: isNotEnrolled ? '-' : sub.attendancePercentage,
        styles: {
          halign: 'center' as const,
          fontStyle: 'bold' as const,
          textColor: isLowAtt ? ([185, 28, 28] as [number, number, number]) : ([15, 23, 42] as [number, number, number]),
        },
      },
      { content: isNotEnrolled ? '-' : String(sub.maxMarks ?? 50), styles: { halign: 'center' as const } },
      {
        content: isNotEnrolled ? '-' : String(sub.marksScored ?? '-'),
        styles: {
          halign: 'center' as const,
          fontStyle: 'bold' as const,
          textColor: isLowMarks ? ([185, 28, 28] as [number, number, number]) : ([23, 37, 84] as [number, number, number]),
        },
      },
      {
        content: sub.remark || (isNotEnrolled ? 'Not Enrolled' : isLowMarks || isLowAtt ? 'Need Improvement' : 'Satisfactory'),
        styles: { halign: 'center' as const, fontSize: 7.5 },
      },
    ];
  });

  const totalHeld = report.subjects.filter(s => !s.isNotEnrolled).reduce((acc, s) => acc + (typeof s.classHeld === 'number' ? s.classHeld : 0), 0);
  const totalAttended = report.subjects.filter(s => !s.isNotEnrolled).reduce((acc, s) => acc + (typeof s.classAttended === 'number' ? s.classAttended : 0), 0);

  const tableFoot = [
    [
      { content: 'AVERAGE ATTENDANCE & TOTAL MARKS', colSpan: 2, styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
      { content: '-', styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
      { content: '-', styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
      {
        content: '-',
        styles: { halign: 'center' as const, fontStyle: 'bold' as const, textColor: [30, 58, 138] as [number, number, number] },
      },
      { content: String(report.totalMaxMarks ?? '-'), styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
      {
        content: String(report.totalMarksScored ?? '-'),
        styles: { halign: 'center' as const, fontStyle: 'bold' as const, textColor: [30, 58, 138] as [number, number, number] },
      },
      {
        content: '-',
        styles: { halign: 'center' as const, fontStyle: 'bold' as const },
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [
      [
        { content: 'Sl.', styles: { halign: 'center' as const } },
        { content: 'Subject Code & Name' },
        { content: 'Class Held\n(CH)', styles: { halign: 'center' as const } },
        { content: 'Class Attd\n(CA)', styles: { halign: 'center' as const } },
        { content: 'Attd %', styles: { halign: 'center' as const } },
        { content: 'Max Marks', styles: { halign: 'center' as const } },
        { content: 'Marks Scored', styles: { halign: 'center' as const } },
        { content: 'Remark', styles: { halign: 'center' as const } },
      ],
    ],
    body: tableBody,
    foot: tableFoot,
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      lineColor: [100, 116, 139],
      lineWidth: 0.2,
      fontSize: 7.5,
      cellPadding: 2,
    },
    bodyStyles: {
      lineColor: [148, 163, 184],
      lineWidth: 0.15,
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: 2,
    },
    footStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      lineColor: [100, 116, 139],
      lineWidth: 0.25,
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 68 },
      2: { cellWidth: 16 },
      3: { cellWidth: 16 },
      4: { cellWidth: 16 },
      5: { cellWidth: 16 },
      6: { cellWidth: 20 },
      7: { cellWidth: 30 },
    },
  });

  // 6. Official Signatures Section
  // @ts-expect-error autoTable plugin stores lastAutoTable
  currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 60) + 16;

  // Keep signatures neatly on the page
  if (currentY > 260) {
    currentY = 260;
  }

  const sigWidth = contentWidth / 2; // Split into two columns for Proctor and HOD
  const col1Center = margin + sigWidth * 0.5; // Proctor left
  const col2Center = margin + sigWidth * 1.5; // HOD right

  // Dotted lines for signatures (only for Proctor and HOD)
  doc.setDrawColor(100, 116, 139);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.setLineWidth(0.3);

  doc.line(col1Center - 22, currentY, col1Center + 22, currentY);
  doc.line(col2Center - 25, currentY, col2Center + 25, currentY);

  doc.setLineDashPattern([], 0); // reset line dash

  // Signature Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  doc.text('Sd/-', col1Center, currentY - 2, { align: 'center' });
  doc.text('Sd/-', col2Center, currentY - 2, { align: 'center' });

  doc.text('Signature of Proctor', col1Center, currentY + 4, { align: 'center' });
  doc.text(report.hodTitle || 'In-charge HOD', col2Center, currentY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`(${report.student.proctorName || 'Proctor'})`, col1Center, currentY + 7.5, { align: 'center' });
  doc.text(`(${report.hodName || 'Dr. Tejaswini H'})`, col2Center, currentY + 7.5, { align: 'center' });

  // 7. Institutional Footer Banner
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(margin, 282, margin + contentWidth, 282);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Tel: ${report.contactTel || '+91 820 2589182'} • E-mail: ${report.contactEmail || 'hod.ai@sode-edu.in'} • Web: ${report.contactWeb || 'https://sode-edu.in'}`,
    textCenterX,
    286,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads a single student report directly as a crisp vector PDF with institutional logos
 */
export async function downloadSingleStudentPdf(report: StudentReport, attendanceWarningThreshold: number): Promise<void> {
  const logos = await resolveReportLogos(report);
  const doc = buildStudentReportPdf(report, attendanceWarningThreshold, undefined, logos);
  const cleanName = (report.student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const usn = report.student.usn || 'STUDENT';
  const filename = `${usn}_${cleanName}_Report.pdf`;

  doc.save(filename);
}

/**
 * Generates individual PDFs for ALL students and downloads them in a single ZIP file
 */
export async function downloadAllIndividualPdfsZip(
  reports: StudentReport[],
  attendanceWarningThreshold: number,
  archiveName = 'SMVITM_All_Individual_Student_PDFs.zip',
  onProgress?: ProgressCallback
): Promise<void> {
  if (!reports || reports.length === 0) return;

  // Pre-resolve all logos
  const logoMap = new Map<string, { left?: string; right?: string }>();
  for (const report of reports) {
    const key = `${report.logos?.leftPreset || 'sode'}_${report.logos?.leftCustomUrl || ''}_${report.logos?.rightPreset || 'smvitm'}_${report.logos?.rightCustomUrl || ''}`;
    if (!logoMap.has(key)) {
      const logos = await resolveReportLogos(report);
      logoMap.set(key, logos);
    }
  }

  const zip = new JSZip();
  const folder = zip.folder('Individual_Student_PDF_Reports');

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    if (onProgress) {
      onProgress(i + 1, reports.length, report.student.name);
    }

    try {
      const key = `${report.logos?.leftPreset || 'sode'}_${report.logos?.leftCustomUrl || ''}_${report.logos?.rightPreset || 'smvitm'}_${report.logos?.rightCustomUrl || ''}`;
      const logos = logoMap.get(key) || (await resolveReportLogos(report));

      const doc = buildStudentReportPdf(report, attendanceWarningThreshold, undefined, logos);
      const cleanName = (report.student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const usn = report.student.usn || `STUDENT_${i + 1}`;
      const filename = `${usn}_${cleanName}_Report.pdf`;

      const arrayBuffer = doc.output('arraybuffer');
      folder?.file(filename, arrayBuffer);
    } catch (err) {
      console.error(`Failed to generate PDF for ${report.student.name}:`, err);
    }

    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = archiveName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Combines all student reports into a single multi-page PDF document
 */
export async function downloadAllMergedPdf(
  reports: StudentReport[],
  attendanceWarningThreshold: number,
  filename = 'SMVITM_All_Students_Master_Report.pdf',
  onProgress?: ProgressCallback
): Promise<void> {
  if (!reports || reports.length === 0) return;

  // Pre-resolve all logos
  const logoMap = new Map<string, { left?: string; right?: string }>();
  for (const report of reports) {
    const key = `${report.logos?.leftPreset || 'sode'}_${report.logos?.leftCustomUrl || ''}_${report.logos?.rightPreset || 'smvitm'}_${report.logos?.rightCustomUrl || ''}`;
    if (!logoMap.has(key)) {
      const logos = await resolveReportLogos(report);
      logoMap.set(key, logos);
    }
  }

  const mergedDoc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    if (onProgress) {
      onProgress(i + 1, reports.length, report.student.name);
    }

    if (i > 0) {
      mergedDoc.addPage('a4', 'portrait');
    }

    const key = `${report.logos?.leftPreset || 'sode'}_${report.logos?.leftCustomUrl || ''}_${report.logos?.rightPreset || 'smvitm'}_${report.logos?.rightCustomUrl || ''}`;
    const logos = logoMap.get(key) || (await resolveReportLogos(report));

    buildStudentReportPdf(report, attendanceWarningThreshold, mergedDoc, logos);

    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  mergedDoc.save(filename);
}

/**
 * Generates individual PDFs organized into separate PROCTOR FOLDERS in a single ZIP file
 */
export async function downloadProctorWisePdfsZip(
  reports: StudentReport[],
  attendanceWarningThreshold: number,
  archiveName = 'SMVITM_Proctor_Wise_Student_PDF_Reports.zip',
  onProgress?: ProgressCallback
): Promise<void> {
  if (!reports || reports.length === 0) return;

  // Group reports by proctor
  const proctorGroups = new Map<string, StudentReport[]>();
  for (const r of reports) {
    const proctor = (r.student.proctorName || 'Unassigned_Proctor').trim();
    if (!proctorGroups.has(proctor)) {
      proctorGroups.set(proctor, []);
    }
    proctorGroups.get(proctor)!.push(r);
  }

  // Pre-resolve all logos
  const logoMap = new Map<string, { left?: string; right?: string }>();
  for (const report of reports) {
    const key = `${report.logos?.leftPreset || 'sode'}_${report.logos?.leftCustomUrl || ''}_${report.logos?.rightPreset || 'smvitm'}_${report.logos?.rightCustomUrl || ''}`;
    if (!logoMap.has(key)) {
      const logos = await resolveReportLogos(report);
      logoMap.set(key, logos);
    }
  }

  const zip = new JSZip();
  let processedCount = 0;
  const totalCount = reports.length;

  const proctorSummaryLines: string[] = [
    '=========================================================================',
    'SMVITM BANTAKAL - DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
    'PROCTOR-WISE INTERNAL ASSESSMENT PROGRESS REPORTS INDEX',
    `Total Students: ${reports.length} | Total Proctors: ${proctorGroups.size}`,
    `Generated on: ${new Date().toLocaleString()}`,
    '=========================================================================\n',
  ];

  for (const [proctorName, groupReports] of proctorGroups.entries()) {
    const cleanProctorFolder = `Proctor_${proctorName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const folder = zip.folder(cleanProctorFolder);

    proctorSummaryLines.push(`📁 PROCTOR: ${proctorName} (${groupReports.length} Students)`);
    proctorSummaryLines.push('-------------------------------------------------------------------------');
    proctorSummaryLines.push('USN           | Student Name                   | Attd % | Marks');
    proctorSummaryLines.push('-------------------------------------------------------------------------');

    for (let j = 0; j < groupReports.length; j++) {
      const report = groupReports[j];
      processedCount++;

      if (onProgress) {
        onProgress(processedCount, totalCount, `${proctorName} - ${report.student.name}`);
      }

      try {
        const key = `${report.logos?.leftPreset || 'sode'}_${report.logos?.leftCustomUrl || ''}_${report.logos?.rightPreset || 'smvitm'}_${report.logos?.rightCustomUrl || ''}`;
        const logos = logoMap.get(key) || (await resolveReportLogos(report));

        const doc = buildStudentReportPdf(report, attendanceWarningThreshold, undefined, logos);
        const cleanName = (report.student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
        const usn = report.student.usn || `STUDENT_${processedCount}`;
        const filename = `${usn}_${cleanName}_Report.pdf`;

        const arrayBuffer = doc.output('arraybuffer');
        folder?.file(filename, arrayBuffer);

        const usnPad = (report.student.usn || '').padEnd(13, ' ');
        const namePad = (report.student.name || '').padEnd(30, ' ');
        const attPad = `${report.overallAttendance ?? '-'}%`.padEnd(8, ' ');
        const marksPad = `${report.totalMarksScored ?? '-'}/${report.totalMaxMarks ?? '-'}`;
        proctorSummaryLines.push(`${usnPad} | ${namePad} | ${attPad} | ${marksPad}`);
      } catch (err) {
        console.error(`Failed to generate PDF for ${report.student.name}:`, err);
      }

      if (processedCount % 5 === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    proctorSummaryLines.push('\n');
  }

  // Add the proctor index summary
  zip.file('00_PROCTOR_SUMMARY_INDEX.txt', proctorSummaryLines.join('\n'));

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = archiveName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads individual PDFs for a single specific proctor in a ZIP file
 */
export async function downloadSingleProctorPdfsZip(
  reports: StudentReport[],
  proctorName: string,
  attendanceWarningThreshold: number,
  onProgress?: ProgressCallback
): Promise<void> {
  const proctorReports = reports.filter(
    (r) => (r.student.proctorName || 'Unassigned_Proctor').trim().toLowerCase() === proctorName.trim().toLowerCase()
  );

  if (proctorReports.length === 0) return;

  const cleanProctor = proctorName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const archiveName = `Proctor_${cleanProctor}_Student_PDF_Reports_${proctorReports.length}.zip`;

  await downloadAllIndividualPdfsZip(proctorReports, attendanceWarningThreshold, archiveName, onProgress);
}

/**
 * Combines all reports belonging to a single specific proctor into a merged multi-page PDF
 */
export async function downloadSingleProctorMergedPdf(
  reports: StudentReport[],
  proctorName: string,
  attendanceWarningThreshold: number,
  onProgress?: ProgressCallback
): Promise<void> {
  const proctorReports = reports.filter(
    (r) => (r.student.proctorName || 'Unassigned_Proctor').trim().toLowerCase() === proctorName.trim().toLowerCase()
  );

  if (proctorReports.length === 0) return;

  const cleanProctor = proctorName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Proctor_${cleanProctor}_Combined_Reports_${proctorReports.length}.pdf`;

  await downloadAllMergedPdf(proctorReports, attendanceWarningThreshold, filename, onProgress);
}

/**
 * Generates and downloads a comprehensive Analytics PDF report
 */
export async function downloadAnalyticsPdf(reports: StudentReport[], filename = 'SMVITM_Class_Analytics_Report.pdf'): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const headerTopY = 7;
  const logoSize = 19;

  // Resolve logos using first report or default
  const sampleReport = (reports[0] || { logos: { leftPreset: 'sode', rightPreset: 'smvitm' } }) as any;
  const logoImages = await resolveReportLogos(sampleReport as StudentReport);

  // 1. Render Left & Right Institutional Crests / Logos
  if (logoImages?.left) {
    try {
      doc.addImage(logoImages.left, 'PNG', margin, headerTopY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not render left logo:', e);
    }
  }
  if (logoImages?.right) {
    try {
      doc.addImage(logoImages.right, 'PNG', pageWidth - margin - logoSize, headerTopY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not render right logo:', e);
    }
  }

  // 2. Institutional Header Text (Balanced Center Alignment)
  const textCenterWidth = contentWidth - logoSize * 2 - 4;
  const textCenterX = pageWidth / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(139, 29, 36); // Institutional Maroon
  doc.text(
    (sampleReport.institutionInfo?.name || sampleReport.institution || 'SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT').toUpperCase(),
    textCenterX,
    headerTopY + 3.8,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59);
  doc.text(
    sampleReport.institutionInfo?.subHeading || sampleReport.subInstitution || 'A Unit of Shri Sode Vadiraja Mutt Education Trust®, Udupi',
    textCenterX,
    headerTopY + 7.8,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    sampleReport.institutionInfo?.accreditation || 'Approved by AICTE, New Delhi | Accredited by NAAC with ‘A’ Grade | Affiliated to VTU, Belagavi',
    textCenterX,
    headerTopY + 11.2,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.text(
    sampleReport.institutionInfo?.address || sampleReport.address || 'Vishwothama Nagar, Bantakal, Udupi - 574 115, Karnataka, India',
    textCenterX,
    headerTopY + 14.6,
    { align: 'center', maxWidth: textCenterWidth }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(139, 29, 36);
  doc.text(
    (sampleReport.department || 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE').toUpperCase(),
    textCenterX,
    headerTopY + 18.8,
    { align: 'center', maxWidth: textCenterWidth }
  );

  // Maroon separator line beneath header
  const separatorY = headerTopY + 21.5;
  doc.setDrawColor(139, 29, 36);
  doc.setLineWidth(0.65);
  doc.line(margin, separatorY, margin + contentWidth, separatorY);

  // 3. Report Title and Academic Year
  let currentY = separatorY + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CLASS PERFORMANCE & ATTENDANCE ANALYTICS REPORT', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(139, 29, 36);
  doc.text('7TH SEMESTER (ACADEMIC YEAR 2026-27)', pageWidth / 2, currentY, { align: 'center' });

  currentY += 6;

  // Compute stats
  const totalStudents = reports.length;
  const validAttd = reports.filter((r) => r.overallAttendance !== null && r.overallAttendance !== undefined);
  const avgClassAttendance = validAttd.length > 0
    ? Math.round(validAttd.reduce((acc, r) => acc + (r.overallAttendance || 0), 0) / validAttd.length)
    : 0;

  const validMarks = reports.filter((r) => r.percentageMarks !== null && r.percentageMarks !== undefined);
  const avgClassMarks = validMarks.length > 0
    ? Math.round(validMarks.reduce((acc, r) => acc + (r.percentageMarks || 0), 0) / validMarks.length)
    : 0;

  const lowAttdStudents = reports.filter((r) => (r.overallAttendance || 0) < 75);

  const lowMarksStudents: { name: string; usn: string; proctor: string; subjectCode: string; subjectName: string; marks: number }[] = [];
  reports.forEach((r) => {
    r.subjects.forEach((s) => {
      if (!s.isNotEnrolled && s.marksNum !== null && s.marksNum !== undefined && s.marksNum < (s.maxMarks ?? 50) * 0.4) {
        lowMarksStudents.push({
          name: r.student.name,
          usn: r.student.usn,
          proctor: r.student.proctorName || 'N/A',
          subjectCode: s.code,
          subjectName: s.name,
          marks: s.marksNum,
        });
      }
    });
  });

  // Summary box table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [15, 23, 42] },
    headStyles: { fillColor: [139, 29, 36], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Total Enrolled', 'Avg Class Attendance', 'Avg IA-1 Score', 'Attendance Shortage (<75%)', 'IA-1 Defaulters (<40%)']],
    body: [[
      String(totalStudents),
      `${avgClassAttendance}%`,
      `${avgClassMarks}%`,
      String(lowAttdStudents.length),
      String(new Set(lowMarksStudents.map(l => l.usn)).size),
    ]],
  });

  // @ts-expect-error autoTable plugin stores lastAutoTable
  currentY = doc.lastAutoTable.finalY + 6;

  // Subject-wise performance table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SUBJECT-WISE PERFORMANCE & STATISTICS', margin, currentY);
  currentY += 2;

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
        if (s.marksNum >= (s.maxMarks ?? 50) * 0.4) entry.passCount++;
      }
      if (s.attendanceNum !== null && s.attendanceNum !== undefined) {
        entry.totalAttd += s.attendanceNum;
      }
    });
  });

  const subjectRows: (string | number)[][] = [];
  subjectMap.forEach((data, code) => {
    const avgAttd = data.enrolled > 0 ? Math.round(data.totalAttd / data.enrolled) : 0;
    const avgMarks = data.enrolled > 0 ? (data.totalMarks / data.enrolled).toFixed(1) : '0';
    const passRate = data.enrolled > 0 ? Math.round((data.passCount / data.enrolled) * 100) : 0;
    const maxVal = data.maxMarks === -1 ? 'N/A' : data.maxMarks;
    const minVal = data.minMarks === 999 ? 'N/A' : data.minMarks;

    subjectRows.push([
      code,
      data.name,
      data.enrolled,
      maxVal,
      minVal,
      avgMarks,
      `${avgAttd}%`,
      `${passRate}%`,
    ]);
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Code', 'Subject Title', 'Enrolled', 'Max', 'Min', 'Avg (50)', 'Avg Attd', 'Pass Rate']],
    body: subjectRows,
  });

  // @ts-expect-error autoTable plugin stores lastAutoTable
  currentY = doc.lastAutoTable.finalY + 6;

  // IA-1 Defaulters Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. IA-1 DEFAULTERS LIST (SCORING < 40% OF MAX MARKS) [Total: ${lowMarksStudents.length}]`, margin, currentY);
  currentY += 2;

  const lowMarksRows = lowMarksStudents.map((item, idx) => [
    String(idx + 1),
    item.usn,
    item.name,
    item.subjectCode,
    String(item.marks),
    item.proctor,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8, textColor: [15, 23, 42] },
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['#', 'USN', 'Student Name', 'Subject Code', 'Marks (50)', 'Proctor']],
    body: lowMarksRows.length > 0 ? lowMarksRows : [['-', 'No defaulters found in this category.', '', '', '', '']],
  });

  // @ts-expect-error autoTable plugin stores lastAutoTable
  currentY = doc.lastAutoTable.finalY + 6;

  // Check if page break needed or add Attendance shortage table
  if (currentY > 230) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. ATTENDANCE SHORTAGE STUDENTS (< 75%) [Total: ${lowAttdStudents.length}]`, margin, currentY);
  currentY += 2;

  const lowAttdRows = lowAttdStudents.map((r, idx) => [
    String(idx + 1),
    r.student.usn,
    r.student.name,
    `${r.overallAttendance}%`,
    r.student.proctorName || 'N/A',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8, textColor: [15, 23, 42] },
    headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['#', 'USN', 'Student Name', 'Overall Attendance', 'Proctor']],
    body: lowAttdRows.length > 0 ? lowAttdRows : [['-', 'No students with attendance shortage.', '', '', '']],
  });

  // Institutional Footer Banner on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, 282, margin + contentWidth, 282);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      sampleReport.institutionInfo?.fullContactText || `Tel: ${sampleReport.institutionInfo?.contactTel || sampleReport.contactTel || '+91 820 2589182'} • E-mail: ${sampleReport.institutionInfo?.contactEmail || sampleReport.contactEmail || 'hod.ai@sode-edu.in'} • Web: ${sampleReport.institutionInfo?.contactWeb || sampleReport.contactWeb || 'https://sode-edu.in'}`,
      textCenterX,
      286,
      { align: 'center' }
    );
  }

  doc.save(filename);
}


