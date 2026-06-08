import { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Utensils } from 'lucide-react';

export interface DayFoodSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  entries: number;
}

interface StreakCalendarProps {
  completedDates: string[];
  foodSummaryByDate: Record<string, DayFoodSummary>;
  calorieTarget: number;
}

const dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function toLocalDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function StreakCalendar({ completedDates, foodSummaryByDate, calorieTarget }: StreakCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const completedSet = new Set(completedDates);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const todayStr = toLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedFood = selectedDate ? foodSummaryByDate[selectedDate] : null;
  const selectedWorkout = selectedDate ? completedSet.has(selectedDate) : false;

  return (
    <div className="bg-card rounded-2xl p-4 flex flex-col gap-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
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
      <div className="grid grid-cols-7">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-text-secondary text-xs font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = toLocalDateStr(viewYear, viewMonth, day);
          const hasWorkout = completedSet.has(dateStr);
          const hasFood = !!foodSummaryByDate[dateStr];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className="flex flex-col items-center py-0.5 gap-0.5"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  hasWorkout
                    ? 'bg-accent text-white'
                    : isToday
                    ? 'border-2 border-accent text-accent'
                    : isSelected
                    ? 'bg-white/10 text-white'
                    : 'text-text-secondary'
                }`}
              >
                {day}
              </div>
              {/* Food indicator dot */}
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${hasFood ? 'bg-green-500' : 'transparent'}`} />
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDate && (selectedFood || selectedWorkout) && (
        <div
          className="rounded-xl p-3 flex flex-col gap-2 border border-white/10"
          style={{ backgroundColor: '#2C2C2E' }}
        >
          <p className="text-white font-semibold text-sm">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
          <div className="flex gap-3">
            {selectedWorkout && (
              <div className="flex items-center gap-1.5">
                <Dumbbell size={13} className="text-accent" />
                <span className="text-white text-xs font-medium">Séance complétée</span>
              </div>
            )}
            {selectedFood && (
              <div className="flex items-center gap-1.5">
                <Utensils size={13} className="text-green-400" />
                <span className="text-white text-xs font-medium">{selectedFood.entries} repas</span>
              </div>
            )}
          </div>
          {selectedFood && (
            <div className="grid grid-cols-4 gap-2 mt-1">
              {[
                { label: 'Calories', value: `${Math.round(selectedFood.calories)}`, unit: 'kcal', color: calorieTarget > 0 && selectedFood.calories <= calorieTarget ? '#34C759' : '#FF6B35' },
                { label: 'Protéines', value: `${Math.round(selectedFood.protein)}`, unit: 'g', color: '#007AFF' },
                { label: 'Lipides', value: `${Math.round(selectedFood.fat)}`, unit: 'g', color: '#FF9500' },
                { label: 'Glucides', value: `${Math.round(selectedFood.carbs)}`, unit: 'g', color: '#AF52DE' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="flex flex-col items-center bg-black/20 rounded-lg py-2 px-1">
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  <span className="text-[10px] text-text-secondary">{unit}</span>
                  <span className="text-[9px] text-text-secondary mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/10 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-accent" />
          <span className="text-text-secondary text-xs">Séance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-accent" />
          <span className="text-text-secondary text-xs">Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-text-secondary text-xs">Repas enregistrés</span>
        </div>
      </div>
    </div>
  );
}
