import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ExternalLink, CheckCircle, SkipForward, Trophy } from 'lucide-react';
import RestTimer from './RestTimer';
import { DurationTimer, RepMetronome } from './ExerciseTimer';
import { exercises } from '../../data/exercises';
import { workoutProgram, estimateCaloriesBurned } from '../../data/workoutProgram';
import type { WorkoutSet } from '../../types';

interface WorkoutSessionProps {
  weekNumber: number;
  dayId: string;
  onComplete: (durationMinutes: number, exerciseLogs: { exerciseId: string; setsCompleted: number; repsCompleted: number[] }[]) => void;
  onExit: () => void;
}

const muscleColors: Record<string, string> = {
  Pectoraux: 'bg-blue-500/20 text-blue-300',
  Épaules: 'bg-purple-500/20 text-purple-300',
  Triceps: 'bg-orange-500/20 text-orange-300',
  Biceps: 'bg-green-500/20 text-green-300',
  Dorsaux: 'bg-cyan-500/20 text-cyan-300',
  Abdominaux: 'bg-yellow-500/20 text-yellow-300',
  Gainage: 'bg-yellow-500/20 text-yellow-300',
  Quadriceps: 'bg-red-500/20 text-red-300',
  Fessiers: 'bg-pink-500/20 text-pink-300',
  Mollets: 'bg-teal-500/20 text-teal-300',
  'Corps entier': 'bg-orange-500/20 text-orange-300',
};

function getMuscleClass(muscle: string): string {
  return muscleColors[muscle] ?? 'bg-white/10 text-text-secondary';
}

const exerciseEmojis: Record<string, string> = {
  'push-up': '💪',
  'knee-push-up': '💪',
  'wall-push-up': '🤸',
  'pike-push-up': '🏋️',
  'diamond-push-up': '💎',
  'chair-dips': '🪑',
  'inverted-row': '🏃',
  'doorframe-row': '🚪',
  'dead-hang': '🧗',
  'negative-pull-up': '⬆️',
  squat: '🦵',
  'sumo-squat': '🤼',
  'reverse-lunge': '🚶',
  'glute-bridge': '🍑',
  'hip-thrust': '🔥',
  'calf-raise': '👟',
  'jump-squat': '⚡',
  'bulgarian-split-squat': '🎯',
  plank: '🧱',
  'side-plank': '↔️',
  'dead-bug': '🐛',
  'bird-dog': '🐦',
  'leg-raise': '🦵',
  'mountain-climbers': '⛰️',
  'hollow-body': '🌙',
  crunch: '💥',
  burpee: '🔥',
  'jumping-jacks': '⭐',
  'high-knees': '🏃',
  'worlds-greatest-stretch': '🌍',
  'hip-flexor-stretch': '🧘',
  'thoracic-rotation': '🔄',
};

export default function WorkoutSession({ weekNumber, dayId, onComplete, onExit }: WorkoutSessionProps) {
  const week = workoutProgram.find((w) => w.weekNumber === weekNumber);
  const day = week?.days.find((d) => d.id === dayId);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [exerciseLogs, setExerciseLogs] = useState<
    { exerciseId: string; setsCompleted: number; repsCompleted: number[] }[]
  >([]);

  // ── Wake lock — prevent screen sleep during session ─────────────────────────
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (
            navigator as Navigator & {
              wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> };
            }
          ).wakeLock.request('screen');
        }
      } catch {
        // not supported or permission denied
      }
    };
    acquire();
    const onVisibility = () => { if (document.visibilityState === 'visible') acquire(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      wakeLockRef.current?.release();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleRestComplete = useCallback(() => {
    setIsResting(false);
  }, []);

  if (!day) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-text-secondary">Séance introuvable</p>
      </div>
    );
  }

  const totalExercises = day.exercises.length;
  const workoutSet: WorkoutSet = day.exercises[currentExerciseIndex];
  const exercise = exercises.find((e) => e.id === workoutSet?.exerciseId);

  if (completed) {
    const durationMinutes = Math.round((Date.now() - startTime) / 60000);
    const totalSets = exerciseLogs.reduce((sum, log) => sum + log.setsCompleted, 0);
    const caloriesBurned = estimateCaloriesBurned(weekNumber, durationMinutes);

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <Trophy size={64} className="text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Séance terminée !</h2>
          <p className="text-text-secondary">Excellent travail, continuez ainsi !</p>
        </div>

        <div className="w-full bg-card rounded-2xl p-5 grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-accent">{durationMinutes}</p>
            <p className="text-text-secondary text-xs">min</p>
          </div>
          <div>
            <p className="text-xl font-bold text-orange-400">{caloriesBurned}</p>
            <p className="text-text-secondary text-xs">kcal 🔥</p>
          </div>
          <div>
            <p className="text-xl font-bold text-info">{totalSets}</p>
            <p className="text-text-secondary text-xs">séries</p>
          </div>
          <div>
            <p className="text-xl font-bold text-success">{totalExercises}</p>
            <p className="text-text-secondary text-xs">exercices</p>
          </div>
        </div>

        <button
          onClick={() => onComplete(durationMinutes, exerciseLogs)}
          className="w-full py-4 bg-accent rounded-2xl text-white font-bold text-lg"
        >
          Enregistrer la séance
        </button>
      </div>
    );
  }

  if (!exercise || !workoutSet) {
    return null;
  }

  const handleSetDone = () => {
    const currentLog = exerciseLogs.find((l) => l.exerciseId === workoutSet.exerciseId);
    const reps = workoutSet.reps ?? 0;

    if (currentLog) {
      setExerciseLogs((prev) =>
        prev.map((l) =>
          l.exerciseId === workoutSet.exerciseId
            ? { ...l, setsCompleted: l.setsCompleted + 1, repsCompleted: [...l.repsCompleted, reps] }
            : l
        )
      );
    } else {
      setExerciseLogs((prev) => [
        ...prev,
        { exerciseId: workoutSet.exerciseId, setsCompleted: 1, repsCompleted: [reps] },
      ]);
    }

    if (currentSet < workoutSet.sets) {
      setIsResting(true);
      setCurrentSet((s) => s + 1);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < totalExercises - 1) {
        setIsResting(true);
        setCurrentExerciseIndex((i) => i + 1);
        setCurrentSet(1);
      } else {
        setCompleted(true);
      }
    }
  };

  const handleSkip = () => {
    setIsResting(false);
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex((i) => i + 1);
      setCurrentSet(1);
    } else {
      setCompleted(true);
    }
  };

  const progressPct = ((currentExerciseIndex / totalExercises) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button
          onClick={onExit}
          className="p-2 rounded-full bg-white/10 text-white flex-shrink-0"
          aria-label="Quitter la séance"
        >
          <X size={18} />
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{day.dayName}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-text-secondary text-xs">
              {currentExerciseIndex + 1}/{totalExercises}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isResting ? (
          // Rest screen
          <div className="flex flex-col items-center justify-center p-6 min-h-[400px]">
            <h3 className="text-white font-semibold text-xl mb-6">Temps de repos</h3>
            <RestTimer
              seconds={workoutSet.restSeconds || 60}
              onComplete={handleRestComplete}
            />
            <button
              onClick={handleRestComplete}
              className="mt-6 px-6 py-3 bg-white/10 text-white rounded-xl font-medium"
            >
              Passer le repos
            </button>
          </div>
        ) : (
          // Exercise screen
          <div className="flex flex-col p-4 gap-4">
            {/* Exercise hero */}
            <div className="bg-card rounded-2xl p-6 text-center">
              <div className="text-6xl mb-3">
                {exerciseEmojis[exercise.id] ?? '💪'}
              </div>
              <h2 className="text-2xl font-bold text-white">{exercise.nameFR}</h2>
              <p className="text-text-secondary text-sm mt-1">{exercise.nameEN}</p>

              {/* Muscle pills */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {exercise.muscleGroups.map((muscle) => (
                  <span
                    key={muscle}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getMuscleClass(muscle)}`}
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Set counter + timer */}
            <div className="bg-card rounded-2xl p-4 text-center flex flex-col items-center gap-4">
              <p className="text-text-secondary text-sm">
                Série <span className="text-white font-bold">{currentSet}</span> sur {workoutSet.sets}
                <span className="text-text-secondary mx-2">·</span>
                Repos {workoutSet.restSeconds}s
              </p>

              {workoutSet.durationSeconds ? (
                <DurationTimer
                  key={`${workoutSet.exerciseId}-s${currentSet}`}
                  seconds={workoutSet.durationSeconds}
                  onComplete={handleSetDone}
                />
              ) : (
                <RepMetronome
                  key={`${workoutSet.exerciseId}-s${currentSet}`}
                  reps={workoutSet.reps ?? 10}
                />
              )}
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl p-4">
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wide mb-2">
                Comment faire
              </p>
              <p className="text-white text-sm leading-relaxed">{exercise.descriptionFR}</p>
              <a
                href={exercise.youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-info text-sm mt-3 font-medium"
              >
                <ExternalLink size={14} />
                Voir la vidéo explicative
              </a>
            </div>

            {/* Next exercise preview */}
            {currentExerciseIndex < totalExercises - 1 && (
              <div className="bg-card rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-text-secondary text-xs font-medium flex-shrink-0">
                  {currentExerciseIndex + 2}
                </div>
                <div className="flex-1">
                  <p className="text-text-secondary text-xs">Prochain exercice</p>
                  <p className="text-white text-sm font-medium">
                    {exercises.find((e) => e.id === day.exercises[currentExerciseIndex + 1]?.exerciseId)?.nameFR ?? '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {!isResting && (
        <div
          className="p-4 border-t border-white/10 flex gap-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        >
          <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 text-text-secondary font-medium"
          >
            <SkipForward size={18} />
            Passer
          </button>
          <button
            onClick={handleSetDone}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent text-white font-bold text-lg"
          >
            <CheckCircle size={22} />
            Série terminée ✓
          </button>
        </div>
      )}
    </div>
  );
}
