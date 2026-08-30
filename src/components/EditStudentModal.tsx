import React, { useState } from 'react';
import { X, Save, User, BookOpen } from 'lucide-react';
import { StudentReport, SubjectRecord } from '../types';

interface EditStudentModalProps {
  report: StudentReport;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: StudentReport) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  report,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<StudentReport>({ ...report });

  const handleStudentInfoChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        [field]: val,
      },
    }));
  };

  const handleSubjectChange = (idx: number, field: keyof SubjectRecord, val: any) => {
    setFormData((prev) => {
      const updatedSubjects = [...prev.subjects];
      const target = { ...updatedSubjects[idx], [field]: val };

      // Recalculate attendance % if CH / CA changed
      if (field === 'classHeld' || field === 'classAttended') {
        const ch = parseInt(String(field === 'classHeld' ? val : target.classHeld), 10);
        const ca = parseInt(String(field === 'classAttended' ? val : target.classAttended), 10);
        if (!isNaN(ch) && ch > 0 && !isNaN(ca)) {
          const pct = Math.round((ca / ch) * 100);
          target.attendancePercentage = `${pct}%`;
          target.attendanceNum = pct;
        }
      }

      // Recalculate numeric marks
      if (field === 'marksScored') {
        const num = parseFloat(String(val));
        target.marksNum = isNaN(num) ? null : num;
      }

      updatedSubjects[idx] = target;

      // Recalculate totals
      const enrolled = updatedSubjects.filter((s) => !s.isNotEnrolled);
      const totalMarks = enrolled.reduce((acc, s) => acc + (s.marksNum || 0), 0);
      const totalMax = enrolled.length * 50;
      const totalAttd = enrolled.reduce((acc, s) => acc + (s.attendanceNum || 0), 0);
      const avgAttd = enrolled.length > 0 ? Math.round(totalAttd / enrolled.length) : null;

      return {
        ...prev,
        subjects: updatedSubjects,
        totalMarksScored: totalMarks,
        totalMaxMarks: totalMax,
        percentageMarks: totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : null,
        overallAttendance: avgAttd,
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8b1d24]" />
              Edit Student Record: {report.student.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              USN: {report.student.usn}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          {/* General info fields */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              General Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Student Name</label>
                <input
                  type="text"
                  value={formData.student.name}
                  onChange={(e) => handleStudentInfoChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Student USN</label>
                <input
                  type="text"
                  value={formData.student.usn}
                  onChange={(e) => handleStudentInfoChange('usn', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Proctor Name</label>
                <input
                  type="text"
                  value={formData.student.proctorName}
                  onChange={(e) => handleStudentInfoChange('proctorName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Proctor Phone Number</label>
                <input
                  type="text"
                  value={formData.student.proctorNumber}
                  onChange={(e) => handleStudentInfoChange('proctorNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Subject-Wise marks and attendance */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Subject Marks & Attendance
            </h4>
            <div className="space-y-3">
              {formData.subjects.map((sub, idx) => (
                <div key={sub.code} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 font-mono">{sub.code}</span>
                    <span className="text-slate-600 truncate max-w-xs">{sub.name}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500">Class Held (CH)</label>
                      <input
                        type="text"
                        value={sub.classHeld}
                        onChange={(e) => handleSubjectChange(idx, 'classHeld', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Class Attd (CA)</label>
                      <input
                        type="text"
                        value={sub.classAttended}
                        onChange={(e) => handleSubjectChange(idx, 'classAttended', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Attd %</label>
                      <input
                        type="text"
                        value={sub.attendancePercentage}
                        onChange={(e) => handleSubjectChange(idx, 'attendancePercentage', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">IA-1 Marks (50)</label>
                      <input
                        type="text"
                        value={sub.marksScored}
                        onChange={(e) => handleSubjectChange(idx, 'marksScored', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] text-slate-500">Remark</label>
                      <input
                        type="text"
                        value={sub.remark}
                        onChange={(e) => handleSubjectChange(idx, 'remark', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                        placeholder="e.g. Good"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
