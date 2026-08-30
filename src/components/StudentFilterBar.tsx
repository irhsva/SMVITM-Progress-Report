import React from 'react';
import { Search, Filter, AlertTriangle, UserCheck, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentReport } from '../types';

interface StudentFilterBarProps {
  reports: StudentReport[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedProctor: string;
  onProctorChange: (p: string) => void;
  filterLowAttendance: boolean;
  onToggleLowAttendance: () => void;
  filterLowMarks: boolean;
  onToggleLowMarks: () => void;
  sortBy: 'usn' | 'name' | 'attendance' | 'marks';
  onSortChange: (s: 'usn' | 'name' | 'attendance' | 'marks') => void;
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  filteredReports: StudentReport[];
}

export const StudentFilterBar: React.FC<StudentFilterBarProps> = ({
  reports,
  searchQuery,
  onSearchChange,
  selectedProctor,
  onProctorChange,
  filterLowAttendance,
  onToggleLowAttendance,
  filterLowMarks,
  onToggleLowMarks,
  sortBy,
  onSortChange,
  selectedStudentId,
  onSelectStudent,
  filteredReports,
}) => {
  // Extract distinct proctor names
  const proctors = Array.from(
    new Set(reports.map((r) => r.student.proctorName).filter(Boolean))
  );

  const currentIndex = filteredReports.findIndex((r) => r.id === selectedStudentId);
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStudent(filteredReports[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredReports.length - 1) {
      onSelectStudent(filteredReports[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search USN / Name */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-students-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search USN (e.g. 4MW21AI...) or Name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Proctor Filter */}
        <div className="md:col-span-3">
          <select
            id="proctor-select-filter"
            value={selectedProctor}
            onChange={(e) => onProctorChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="">All Proctors ({proctors.length})</option>
            {proctors.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Badges */}
        <div className="md:col-span-3 flex flex-wrap items-center gap-1.5">
          <button
            id="filter-low-attd-btn"
            onClick={onToggleLowAttendance}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
              filterLowAttendance
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Show students with attendance < 75%"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Attd (&lt;75%)</span>
          </button>

          <button
            id="filter-low-marks-btn"
            onClick={onToggleLowMarks}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
              filterLowMarks
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Show students with IA score < 20/50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Low IA (&lt;20)</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="md:col-span-2 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="usn">Sort: USN</option>
            <option value="name">Sort: Name</option>
            <option value="attendance">Sort: Attendance</option>
            <option value="marks">Sort: IA Marks</option>
          </select>
        </div>
      </div>

      {/* Student Pagination / Quick Switcher Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredReports.length}</span> of <span className="text-slate-700">{reports.length}</span> students
          {selectedStudentId && currentIndex !== -1 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold border border-blue-100">
              Selected: #{currentIndex + 1} of {filteredReports.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="prev-student-btn"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            title="Previous Student"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Quick Dropdown of students */}
          <select
            id="quick-student-select"
            value={selectedStudentId || ''}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-800 focus:outline-none max-w-[220px] sm:max-w-xs truncate"
          >
            {filteredReports.map((r, i) => (
              <option key={r.id} value={r.id}>
                {i + 1}. {r.student.usn} - {r.student.name}
              </option>
            ))}
          </select>

          <button
            id="next-student-btn"
            onClick={handleNext}
            disabled={currentIndex >= filteredReports.length - 1}
            className="p-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            title="Next Student"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
