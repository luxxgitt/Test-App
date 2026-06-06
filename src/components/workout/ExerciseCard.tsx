import { ExternalLink } from 'lucide-react';
import type { Exercise, WorkoutSet } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  workoutSet: WorkoutSet;
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
  'Corps entier': 'bg-accent/20 text-orange-300',
};

function getMusclePillClass(muscle: string): string {
  return muscleColors[muscle] ?? 'bg-white/10 text-text-secondary';
}

export default function ExerciseCard({ exercise, workoutSet }: ExerciseCardProps) {
  const setsReps = workoutSet.durationSeconds
    ? `${workoutSet.sets} × ${workoutSet.durationSeconds}s`
    : `${workoutSet.sets} × ${workoutSet.reps} rép.`;

  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-white font-semibold leading-tight">{exercise.nameFR}</p>
          <p className="text-text-secondary text-xs mt-0.5">{exercise.nameEN}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-accent font-bold text-sm">{setsReps}</span>
          <p className="text-text-secondary text-xs">{workoutSet.restSeconds}s repos</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {exercise.muscleGroups.slice(0, 3).map((muscle) => (
          <span key={muscle} className={`text-xs px-2 py-0.5 rounded-full font-medium ${getMusclePillClass(muscle)}`}>
            {muscle}
          </span>
        ))}
      </div>

      <a
        href={exercise.youtubeSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-info text-xs mt-3 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={12} />
        Voir la vidéo
      </a>
    </div>
  );
}
