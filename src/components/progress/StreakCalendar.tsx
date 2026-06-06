import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StreakCalendarProps {
  completedDates: string[];
}

const dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function toLocalDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function StreakCalendar({ completedDates }: StreakCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const completedSet = new Set(completedDates);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Monday = 0, ... Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayStr = toLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="bg-card rounded-2xl p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-full bg-white/10 text-white">
          <ChevronLeft size={16} />
        </button>
        <span className="text-white font-semibold">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-full bg-white/10 text-white">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-text-secondary text-xs font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const dateStr = toLocalDateStr(viewYear, viewMonth, day);
          const isCompleted = completedSet.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div key={dateStr} className="flex items-center justify-center py-0.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-accent text-white'
                    : isToday
                    ? 'border-2 border-accent text-accent'
                    : 'text-text-secondary'
                }`}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-accent" />
          <span className="text-text-secondary text-xs">Séance complétée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-accent" />
          <span className="text-text-secondary text-xs">Aujourd\'hui</span>
        </div>
      </div>
    </div>
  );
}
