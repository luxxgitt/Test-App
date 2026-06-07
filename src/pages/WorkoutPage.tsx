import { useState } from 'react';
import { ChevronRight, Clock, Dumbbell, CheckCircle, Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { workoutProgram, estimateWorkoutDuration, estimateCaloriesBurned } from '../data/workoutProgram';
import WorkoutSession from '../components/workout/WorkoutSession';
import ExerciseCard from '../components/workout/ExerciseCard';
import { exercises } from '../data/exercises';
import type { WorkoutLog, ActivityLog } from '../types';

// ── MET values ─────────────────────────────────────────────────────────────────

const ACTIVITY_METS: Record<
  string,
  { label: string; met: { légère: number; modérée: number; intense: number } }
> = {
  yoga: { label: 'Yoga', met: { légère: 2.0, modérée: 2.5, intense: 3.5 } },
  'pilates-reformer': { label: 'Pilates / Reformer', met: { légère: 2.5, modérée: 3.5, intense: 4.5 } },
  'course-pied': { label: 'Course à pied', met: { légère: 5.0, modérée: 7.0, intense: 10.0 } },
  cyclisme: { label: 'Cyclisme', met: { légère: 4.0, modérée: 6.0, intense: 8.0 } },
  tennis: { label: 'Tennis', met: { légère: 4.0, modérée: 6.0, intense: 7.5 } },
  football: { label: 'Football', met: { légère: 4.5, modérée: 7.0, intense: 9.0 } },
  natation: { label: 'Natation', met: { légère: 4.0, modérée: 6.0, intense: 8.0 } },
  hiit: { label: 'HIIT', met: { légère: 6.0, modérée: 8.5, intense: 12.0 } },
  musculation: { label: 'Musculation', met: { légère: 3.0, modérée: 4.0, intense: 5.5 } },
  calisthenics: { label: 'Calisthenics', met: { légère: 3.5, modérée: 4.5, intense: 6.0 } },
  marche: { label: 'Marche', met: { légère: 2.5, modérée: 3.5, intense: 4.5 } },
  autre: { label: 'Autre', met: { légère: 3.0, modérée: 4.5, intense: 6.0 } },
};

type Intensity = 'légère' | 'modérée' | 'intense';

// ── Activity log form ─────────────────────────────────────────────────────────

interface ActivityFormProps {
  weightKg: number;
  onSave: (entry: ActivityLog) => void;
  onCancel: () => void;
}

function ActivityForm({ weightKg, onSave, onCancel }: ActivityFormProps) {
  const [activityType, setActivityType] = useState<string>('course-pied');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<Intensity>('modérée');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const durationNum = parseInt(duration, 10) || 30;
    const metInfo = ACTIVITY_METS[activityType];
    const met = metInfo?.met[intensity] ?? 4.0;
    const calories = Math.round(met * weightKg * (durationNum / 60));
    const entry: ActivityLog = {
      id: `activity-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      activityType,
      activityLabel: metInfo?.label ?? activityType,
      durationMinutes: durationNum,
      caloriesBurned: calories,
      intensity,
      notes: notes.trim() || undefined,
    };
    onSave(entry);
  };

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-4"
      style={{ backgroundColor: '#1C1C1E' }}
    >
      {/* Activity type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
          Type d'activité
        </label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none border-0 appearance-none"
          style={{ backgroundColor: '#2C2C2E' }}
        >
          {Object.entries(ACTIVITY_METS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
          Durée (minutes)
        </label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          max="600"
          className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none border-0"
          style={{ backgroundColor: '#2C2C2E' }}
        />
      </div>

      {/* Intensity */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
          Intensité
        </label>
        <div className="flex gap-2">
          {(['légère', 'modérée', 'intense'] as Intensity[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setIntensity(lvl)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
              style={{
                backgroundColor: intensity === lvl ? '#FF6B35' : '#2C2C2E',
                color: intensity === lvl ? '#fff' : '#8E8E93',
              }}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
          Notes (optionnel)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: jogging matinal, pluie légère..."
          className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none border-0"
          style={{ backgroundColor: '#2C2C2E' }}
        />
      </div>

      {/* Calorie preview */}
      {(() => {
        const durationNum = parseInt(duration, 10) || 30;
        const met = ACTIVITY_METS[activityType]?.met[intensity] ?? 4.0;
        const calories = Math.round(met * weightKg * (durationNum / 60));
        return (
          <p className="text-xs text-center" style={{ color: '#8E8E93' }}>
            Estimation : <span className="text-white font-semibold">{calories} kcal</span>
          </p>
        );
      })()}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#2C2C2E', color: '#8E8E93' }}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: '#FF6B35' }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const {
    profile,
    activityLog,
    addActivityLog,
    removeActivityLog,
    getCurrentWeek,
    currentWorkoutSession,
    setCurrentWorkoutSession,
    clearCurrentWorkoutSession,
    logWorkout,
  } = useStore();

  const currentWeek = getCurrentWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activityLog.filter((e) => e.date === todayStr);

  const weekProgram = workoutProgram.find((w) => w.weekNumber === selectedWeek);

  const isCalisthenicsUser =
    !profile.onboardingComplete || profile.workoutType === 'calisthenics';

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
      caloriesBurned: estimateCaloriesBurned(currentWorkoutSession.weekNumber, durationMinutes),
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

  const handleActivitySave = (entry: ActivityLog) => {
    addActivityLog(entry);
    setShowActivityForm(false);
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
        <p className="text-text-secondary text-sm">
          {isCalisthenicsUser
            ? 'Programme 8 semaines • Callisthénie'
            : `${ACTIVITY_METS[profile.workoutType ?? 'autre']?.label ?? 'Activité'} • Suivi personnalisé`}
        </p>
      </div>

      {/* ── Ajouter une activité ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Ajouter une activité</h2>
          {!showActivityForm && (
            <button
              onClick={() => setShowActivityForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#FF6B35', color: '#fff' }}
            >
              <Plus size={14} />
              Ajouter
            </button>
          )}
        </div>

        {showActivityForm && (
          <ActivityForm
            weightKg={profile.weightKg}
            onSave={handleActivitySave}
            onCancel={() => setShowActivityForm(false)}
          />
        )}

        {/* Today's logged activities */}
        {todayActivities.length > 0 && (
          <div className="flex flex-col gap-2">
            {todayActivities.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: '#1C1C1E' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,107,53,0.2)' }}
                >
                  <Dumbbell size={14} style={{ color: '#FF6B35' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{entry.activityLabel}</p>
                  <p className="text-xs" style={{ color: '#8E8E93' }}>
                    {entry.durationMinutes} min • {entry.caloriesBurned} kcal •{' '}
                    {entry.intensity.charAt(0).toUpperCase() + entry.intensity.slice(1)}
                  </p>
                </div>
                <button
                  onClick={() => removeActivityLog(entry.id)}
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: '#2C2C2E' }}
                >
                  <X size={12} style={{ color: '#8E8E93' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!showActivityForm && todayActivities.length === 0 && (
          <p className="text-sm text-center py-2" style={{ color: '#8E8E93' }}>
            Aucune activité enregistrée aujourd'hui
          </p>
        )}
      </div>

      {/* ── Calisthenics program (only for calisthenics users) ───────────── */}
      {isCalisthenicsUser && (
        <>
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
                    isActive ? 'bg-accent text-white' : 'bg-card text-text-secondary'
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
                const estimatedCalories = estimateCaloriesBurned(selectedWeek, estimatedDuration);

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
                          <span className="text-orange-400 text-xs flex items-center gap-1">
                            🔥 ~{estimatedCalories} kcal
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
        </>
      )}

      {/* Non-calisthenics users: encouragement */}
      {!isCalisthenicsUser && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ backgroundColor: '#1C1C1E' }}
        >
          <p className="text-white font-semibold mb-1">
            Suivez vos activités ci-dessus
          </p>
          <p className="text-sm" style={{ color: '#8E8E93' }}>
            Enregistrez chaque séance pour suivre vos calories brûlées et votre progression.
          </p>
        </div>
      )}
    </div>
  );
}
