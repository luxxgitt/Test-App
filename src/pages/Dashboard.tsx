import { useMemo } from 'react';
import { Flame, Dumbbell, Calendar, Scale } from 'lucide-react';
import { useStore } from '../store/useStore';
import { workoutProgram } from '../data/workoutProgram';
import type { TabName } from '../components/Navigation';

interface DashboardProps {
  onNavigate: (tab: TabName) => void;
}

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

interface CalorieRingProps {
  consumed: number;
  target: number;
}

function CalorieRing({ consumed, target }: CalorieRingProps) {
  const size = 130;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(consumed / target, 1);
  const offset = circumference - pct * circumference;
  const remaining = Math.max(target - consumed, 0);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2C2C2E" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FF6B35"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(consumed)}</span>
        <span className="text-xs text-text-secondary">kcal</span>
        <span className="text-xs font-medium mt-0.5" style={{ color: remaining > 0 ? '#34C759' : '#FF3B30' }}>
          {remaining > 0 ? `${remaining} restants` : 'OK!'}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const {
    profile,
    foodLog,
    workoutLog,
    weightLog,
    getTodaysMacros,
    getCurrentWeek,
    getCompletedWorkoutDates,
  } = useStore();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const macros = getTodaysMacros();
  const currentWeek = getCurrentWeek();
  const completedDates = getCompletedWorkoutDates();

  // Workouts this week (last 7 days)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const trainedThisWeek = workoutLog.filter(
    (w) => w.completed && w.date >= weekStartStr
  ).length;

  // Current workout to suggest
  const weekProgram = workoutProgram.find((w) => w.weekNumber === currentWeek);
  const completedTodayDayIds = workoutLog
    .filter((w) => w.date === todayStr && w.completed)
    .map((w) => w.dayId);
  const nextDay = weekProgram?.days.find((d) => !completedTodayDayIds.includes(d.id));

  // Last weight
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weightKg : profile.weightKg;

  // Recent food log
  const todayFoodLog = useMemo(
    () => foodLog.filter((e) => e.date === todayStr).slice(-3).reverse(),
    [foodLog, todayStr]
  );

  // Last workout
  const lastWorkout = useMemo(
    () =>
      [...workoutLog]
        .filter((w) => w.completed)
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    [workoutLog]
  );

  const lastWorkoutDay = lastWorkout
    ? workoutProgram.flatMap((w) => w.days).find((d) => d.id === lastWorkout.dayId)
    : null;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">
          Bonjour {profile.name.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary text-sm capitalize">{formatDateFR(today)}</p>
      </div>

      {/* Macros summary card */}
      <div className="bg-card rounded-2xl p-4">
        <h2 className="text-white font-semibold mb-4">Calories aujourd\'hui</h2>
        <div className="flex items-center gap-4">
          <CalorieRing consumed={macros.calories} target={profile.dailyCalorieTarget} />
          <div className="flex flex-col gap-2.5 flex-1">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">Protéines</span>
                <span className="text-white font-semibold">
                  {Math.round(macros.protein)}g / {profile.dailyProteinTarget}g
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2C2C2E] overflow-hidden">
                <div
                  className="h-full rounded-full bg-info transition-all duration-700"
                  style={{ width: `${Math.min((macros.protein / profile.dailyProteinTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">Lipides</span>
                <span className="text-white font-semibold">{Math.round(macros.fat)}g</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2C2C2E] overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-700"
                  style={{ width: `${Math.min((macros.fat / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">Glucides</span>
                <span className="text-white font-semibold">{Math.round(macros.carbs)}g</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2C2C2E] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((macros.carbs / 150) * 100, 100)}%`,
                    backgroundColor: '#AF52DE',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today\'s workout card */}
      {nextDay && (
        <div className="bg-card rounded-2xl p-4 border border-accent/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell size={16} className="text-accent" />
                <span className="text-accent text-xs font-semibold uppercase tracking-wide">
                  Séance du jour — Semaine {currentWeek}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg">{nextDay.dayName}</h3>
              <p className="text-text-secondary text-sm">{nextDay.focusFR}</p>
              <p className="text-text-secondary text-xs mt-1">
                {nextDay.exercises.length} exercices
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('workout')}
            className="mt-4 w-full py-3 rounded-xl bg-accent text-white font-bold text-sm"
          >
            Commencer l\'entraînement
          </button>
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-3 text-center">
          <Scale size={20} className="text-info mx-auto mb-1" />
          <p className="text-white font-bold text-lg">{currentWeight}kg</p>
          <p className="text-text-secondary text-xs">Poids actuel</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center">
          <Dumbbell size={20} className="text-success mx-auto mb-1" />
          <p className="text-white font-bold text-lg">{trainedThisWeek}/4</p>
          <p className="text-text-secondary text-xs">Séances/sem.</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center">
          <Calendar size={20} className="text-accent mx-auto mb-1" />
          <p className="text-white font-bold text-lg">S{currentWeek}</p>
          <p className="text-text-secondary text-xs">Semaine</p>
        </div>
      </div>

      {/* Streak */}
      {completedDates.length > 0 && (
        <div className="bg-card rounded-2xl p-4 flex items-center gap-3">
          <Flame size={28} className="text-accent flex-shrink-0" />
          <div>
            <p className="text-white font-bold">{completedDates.length} séances complétées</p>
            <p className="text-text-secondary text-sm">
              Continuez sur votre lancée !
            </p>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-card rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Activité récente</h3>

        {lastWorkout && lastWorkoutDay && (
          <div className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Dumbbell size={14} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{lastWorkoutDay.dayName}</p>
              <p className="text-text-secondary text-xs">
                {new Date(lastWorkout.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                • {lastWorkout.durationMinutes} min
              </p>
            </div>
          </div>
        )}

        {todayFoodLog.length > 0 ? (
          todayFoodLog.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
                <span className="text-info text-xs font-bold">🍽️</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{entry.foodName}</p>
                <p className="text-text-secondary text-xs">
                  {entry.quantityG}g • {Math.round(entry.macros.calories)} kcal
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-3 text-center">
            <p className="text-text-secondary text-sm">Aucun aliment enregistré aujourd\'hui</p>
            <button
              onClick={() => onNavigate('nutrition')}
              className="text-accent text-sm font-medium mt-1"
            >
              Ajouter un repas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
