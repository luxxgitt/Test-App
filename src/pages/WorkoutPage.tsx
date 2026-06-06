import { useState } from 'react';
import { ChevronRight, Clock, Dumbbell, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { workoutProgram, estimateWorkoutDuration } from '../data/workoutProgram';
import WorkoutSession from '../components/workout/WorkoutSession';
import ExerciseCard from '../components/workout/ExerciseCard';
import { exercises } from '../data/exercises';
import type { WorkoutLog } from '../types';

export default function WorkoutPage() {
  const {
    getCurrentWeek,
    currentWorkoutSession,
    setCurrentWorkoutSession,
    clearCurrentWorkoutSession,
    logWorkout,
  } = useStore();

  const currentWeek = getCurrentWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const weekProgram = workoutProgram.find((w) => w.weekNumber === selectedWeek);

  const startSession = (dayId: string, weekNum: number) => {
    setCurrentWorkoutSession({
      active: true,
      dayId,
      weekNumber: weekNum,
      currentExerciseIndex: 0,
      currentSet: 1,
      startTime: new Date().toISOString(),
      completedSets: [],
    });
  };

  const handleComplete = (
    durationMinutes: number,
    exerciseLogs: { exerciseId: string; setsCompleted: number; repsCompleted: number[] }[]
  ) => {
    if (!currentWorkoutSession.dayId) return;

    const log: WorkoutLog = {
      id: `workout-${Date.now()}`,
      date: todayStr,
      weekNumber: currentWorkoutSession.weekNumber,
      dayId: currentWorkoutSession.dayId,
      completed: true,
      durationMinutes,
      exerciseLogs,
    };
    logWorkout(log);
    clearCurrentWorkoutSession();
  };

  const handleExit = () => {
    if (confirm('Quitter la séance ? La progression ne sera pas sauvegardée.')) {
      clearCurrentWorkoutSession();
    }
  };

  // Active session view
  if (currentWorkoutSession.active && currentWorkoutSession.dayId) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden h-full">
        <WorkoutSession
          weekNumber={currentWorkoutSession.weekNumber}
          dayId={currentWorkoutSession.dayId}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Entraînement</h1>
        <p className="text-text-secondary text-sm">Programme 8 semaines • Callisthénie</p>
      </div>

      {/* Week selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {workoutProgram.map((week) => {
          const isActive = week.weekNumber === selectedWeek;
          const isCurrent = week.weekNumber === currentWeek;
          return (
            <button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-card text-text-secondary'
              }`}
            >
              <span className="text-xs font-medium">S{week.weekNumber}</span>
              {isCurrent && (
                <span
                  className={`text-[9px] font-semibold mt-0.5 ${isActive ? 'text-white/80' : 'text-accent'}`}
                >
                  Actuelle
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week info */}
      {weekProgram && (
        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-accent text-xs font-semibold uppercase tracking-wide">
              {weekProgram.phaseName}
            </span>
            <span className="text-text-secondary text-xs">Semaine {selectedWeek}/8</span>
          </div>
          <p className="text-white font-semibold">Semaine {weekProgram.weekNumber}</p>
          <p className="text-text-secondary text-sm mt-1">{weekProgram.notes}</p>
        </div>
      )}

      {/* Day cards */}
      {weekProgram && (
        <div className="flex flex-col gap-3">
          {weekProgram.days.map((day, dayIndex) => {
            const isExpanded = expandedDayId === day.id;
            const isCompletedToday = useStore
              .getState()
              .workoutLog.some((w) => w.date === todayStr && w.dayId === day.id && w.completed);
            const estimatedDuration = estimateWorkoutDuration(dayIndex, selectedWeek);

            return (
              <div
                key={day.id}
                className={`bg-card rounded-2xl overflow-hidden transition-all ${
                  selectedWeek === currentWeek && !isCompletedToday ? 'border border-accent/30' : ''
                }`}
              >
                {/* Day header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompletedToday ? 'bg-success/20' : 'bg-accent/20'
                    }`}
                  >
                    {isCompletedToday ? (
                      <CheckCircle size={20} className="text-success" />
                    ) : (
                      <Dumbbell size={18} className="text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{day.dayName}</p>
                      <span className="text-text-secondary text-xs">
                        {(['Lundi', 'Mardi', 'Jeudi', 'Samedi'])[dayIndex]}
                      </span>
                      {isCompletedToday && (
                        <span className="text-success text-xs font-semibold">✓ Fait</span>
                      )}
                    </div>
                    <p className="text-text-secondary text-xs">{day.focusFR}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-text-secondary text-xs flex items-center gap-1">
                        <Dumbbell size={10} />
                        {day.exercises.length} exercices
                      </span>
                      <span className="text-text-secondary text-xs flex items-center gap-1">
                        <Clock size={10} />
                        ~{estimatedDuration} min
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-text-secondary transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Expanded: exercise list + start button */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/10">
                    <div className="pt-3 space-y-2">
                      {day.exercises.map((ws) => {
                        const ex = exercises.find((e) => e.id === ws.exerciseId);
                        if (!ex) return null;
                        return <ExerciseCard key={ws.exerciseId} exercise={ex} workoutSet={ws} />;
                      })}
                    </div>
                    <button
                      onClick={() => startSession(day.id, selectedWeek)}
                      className="w-full mt-3 py-3.5 rounded-xl bg-accent text-white font-bold text-sm"
                    >
                      {isCompletedToday ? 'Refaire la séance' : 'Commencer cette séance'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
