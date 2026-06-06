import type { WeekProgram } from '../types';

const REST_BEGINNER = 60;
const REST_MODERATE = 45;

// MET-based calorie estimate (kcal = MET × weightKg × durationHours)
export function estimateCaloriesBurned(weekNumber: number, durationMinutes: number, weightKg = 90): number {
  const met = weekNumber <= 2 ? 2.8 : weekNumber <= 4 ? 3.8 : weekNumber <= 6 ? 5.0 : 6.5;
  return Math.round(met * weightKg * (durationMinutes / 60));
}

// Helper to build a workout day
const makeDay = (
  id: string,
  dayName: string,
  focusFR: string,
  focusEN: string,
  exercises: {
    exerciseId: string;
    sets: number;
    reps?: number;
    durationSeconds?: number;
    restSeconds?: number;
  }[],
  defaultRest: number
) => ({
  id,
  dayName,
  focusFR,
  focusEN,
  exercises: exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    sets: ex.sets,
    reps: ex.reps,
    durationSeconds: ex.durationSeconds,
    restSeconds: ex.restSeconds ?? defaultRest,
  })),
});

export const workoutProgram: WeekProgram[] = [
  // ===================== WEEKS 1-2: FONDATION =====================
  {
    weekNumber: 1,
    phaseName: 'Fondation',
    notes:
      'Semaine de fondation — objectif: réapprendre les mouvements de base. Intensité très faible, focus sur la technique.',
    days: [
      makeDay(
        'w1-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'wall-push-up', sets: 3, reps: 10 },
          { exerciseId: 'chair-dips', sets: 3, reps: 8 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 20 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w1-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 3, reps: 12 },
          { exerciseId: 'reverse-lunge', sets: 3, reps: 8 },
          { exerciseId: 'glute-bridge', sets: 3, reps: 12 },
          { exerciseId: 'calf-raise', sets: 3, reps: 15 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w1-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 3, reps: 8 },
          { exerciseId: 'dead-bug', sets: 3, reps: 10 },
          { exerciseId: 'bird-dog', sets: 3, reps: 8 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w1-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'jumping-jacks', sets: 3, durationSeconds: 30 },
          { exerciseId: 'high-knees', sets: 3, durationSeconds: 20 },
          { exerciseId: 'worlds-greatest-stretch', sets: 3, reps: 5 },
          { exerciseId: 'hip-flexor-stretch', sets: 2, durationSeconds: 30 },
        ],
        REST_BEGINNER
      ),
    ],
  },
  {
    weekNumber: 2,
    phaseName: 'Fondation',
    notes:
      'Semaine 2 — même programme. Cherchez à améliorer la technique et ajouter 1-2 répétitions si possible.',
    days: [
      makeDay(
        'w2-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'wall-push-up', sets: 3, reps: 12 },
          { exerciseId: 'chair-dips', sets: 3, reps: 10 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 25 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w2-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 3, reps: 15 },
          { exerciseId: 'reverse-lunge', sets: 3, reps: 10 },
          { exerciseId: 'glute-bridge', sets: 3, reps: 15 },
          { exerciseId: 'calf-raise', sets: 3, reps: 20 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w2-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 3, reps: 10 },
          { exerciseId: 'dead-bug', sets: 3, reps: 12 },
          { exerciseId: 'bird-dog', sets: 3, reps: 10 },
          { exerciseId: 'crunch', sets: 2, reps: 15 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w2-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'jumping-jacks', sets: 3, durationSeconds: 40 },
          { exerciseId: 'high-knees', sets: 3, durationSeconds: 30 },
          { exerciseId: 'worlds-greatest-stretch', sets: 3, reps: 6 },
          { exerciseId: 'thoracic-rotation', sets: 3, reps: 8 },
        ],
        REST_BEGINNER
      ),
    ],
  },

  // ===================== WEEKS 3-4: CONSTRUCTION =====================
  {
    weekNumber: 3,
    phaseName: 'Construction',
    notes:
      'Phase Construction — ajout de répétitions et introduction de variations plus difficiles. Réduire progressivement le temps de repos.',
    days: [
      makeDay(
        'w3-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'knee-push-up', sets: 3, reps: 12 },
          { exerciseId: 'chair-dips', sets: 3, reps: 10 },
          { exerciseId: 'pike-push-up', sets: 3, reps: 8 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 30 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w3-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 4, reps: 15 },
          { exerciseId: 'sumo-squat', sets: 3, reps: 12 },
          { exerciseId: 'hip-thrust', sets: 3, reps: 15 },
          { exerciseId: 'jump-squat', sets: 3, reps: 8 },
        ],
        REST_BEGINNER
      ),
      makeDay(
        'w3-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 4, reps: 10 },
          { exerciseId: 'side-plank', sets: 3, durationSeconds: 25 },
          { exerciseId: 'leg-raise', sets: 3, reps: 10 },
          { exerciseId: 'dead-bug', sets: 3, reps: 12 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w3-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'burpee', sets: 3, reps: 6 },
          { exerciseId: 'mountain-climbers', sets: 3, durationSeconds: 30 },
          { exerciseId: 'high-knees', sets: 3, durationSeconds: 30 },
          { exerciseId: 'worlds-greatest-stretch', sets: 3, reps: 5 },
        ],
        REST_BEGINNER
      ),
    ],
  },
  {
    weekNumber: 4,
    phaseName: 'Construction',
    notes:
      'Semaine 4 — consolidation. Augmentez les répétitions là où c\'est possible. Le corps s\'adapte bien.',
    days: [
      makeDay(
        'w4-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'knee-push-up', sets: 4, reps: 15 },
          { exerciseId: 'chair-dips', sets: 4, reps: 12 },
          { exerciseId: 'pike-push-up', sets: 3, reps: 10 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 35 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w4-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 4, reps: 18 },
          { exerciseId: 'sumo-squat', sets: 3, reps: 15 },
          { exerciseId: 'hip-thrust', sets: 4, reps: 15 },
          { exerciseId: 'jump-squat', sets: 3, reps: 10 },
          { exerciseId: 'calf-raise', sets: 3, reps: 20 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w4-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 4, reps: 12 },
          { exerciseId: 'side-plank', sets: 3, durationSeconds: 30 },
          { exerciseId: 'leg-raise', sets: 3, reps: 12 },
          { exerciseId: 'hollow-body', sets: 3, durationSeconds: 20 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w4-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'burpee', sets: 3, reps: 8 },
          { exerciseId: 'mountain-climbers', sets: 3, durationSeconds: 35 },
          { exerciseId: 'jumping-jacks', sets: 3, durationSeconds: 45 },
          { exerciseId: 'hip-flexor-stretch', sets: 2, durationSeconds: 30 },
        ],
        REST_MODERATE
      ),
    ],
  },

  // ===================== WEEKS 5-6: PROGRESSION =====================
  {
    weekNumber: 5,
    phaseName: 'Progression',
    notes:
      'Phase Progression — les vraies pompes font leur apparition. Concentration maximale sur la qualité du mouvement.',
    days: [
      makeDay(
        'w5-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'push-up', sets: 3, reps: 10 },
          { exerciseId: 'chair-dips', sets: 4, reps: 12 },
          { exerciseId: 'pike-push-up', sets: 3, reps: 10 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 40 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w5-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 4, reps: 20 },
          { exerciseId: 'bulgarian-split-squat', sets: 3, reps: 8 },
          { exerciseId: 'hip-thrust', sets: 4, reps: 15 },
          { exerciseId: 'jump-squat', sets: 3, reps: 12 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w5-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 4, reps: 12 },
          { exerciseId: 'negative-pull-up', sets: 3, reps: 4 },
          { exerciseId: 'hollow-body', sets: 3, durationSeconds: 20 },
          { exerciseId: 'mountain-climbers', sets: 3, durationSeconds: 40 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w5-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'burpee', sets: 4, reps: 8 },
          { exerciseId: 'jumping-jacks', sets: 3, durationSeconds: 45 },
          { exerciseId: 'high-knees', sets: 3, durationSeconds: 45 },
          { exerciseId: 'thoracic-rotation', sets: 3, reps: 10 },
        ],
        REST_MODERATE
      ),
    ],
  },
  {
    weekNumber: 6,
    phaseName: 'Progression',
    notes:
      'Semaine 6 — milieu du programme. Vous devriez sentir une vraie progression. Augmentez les répétitions.',
    days: [
      makeDay(
        'w6-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'push-up', sets: 4, reps: 12 },
          { exerciseId: 'chair-dips', sets: 4, reps: 14 },
          { exerciseId: 'pike-push-up', sets: 3, reps: 12 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 45 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w6-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 4, reps: 22 },
          { exerciseId: 'bulgarian-split-squat', sets: 3, reps: 10 },
          { exerciseId: 'hip-thrust', sets: 4, reps: 18 },
          { exerciseId: 'jump-squat', sets: 3, reps: 14 },
          { exerciseId: 'calf-raise', sets: 3, reps: 25 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w6-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 4, reps: 14 },
          { exerciseId: 'negative-pull-up', sets: 3, reps: 5 },
          { exerciseId: 'leg-raise', sets: 3, reps: 12 },
          { exerciseId: 'hollow-body', sets: 3, durationSeconds: 25 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w6-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'burpee', sets: 4, reps: 10 },
          { exerciseId: 'mountain-climbers', sets: 3, durationSeconds: 45 },
          { exerciseId: 'high-knees', sets: 3, durationSeconds: 45 },
          { exerciseId: 'worlds-greatest-stretch', sets: 3, reps: 6 },
        ],
        REST_MODERATE
      ),
    ],
  },

  // ===================== WEEKS 7-8: INTENSIFICATION =====================
  {
    weekNumber: 7,
    phaseName: 'Intensification',
    notes:
      'Phase Intensification — performance maximale. Temps de repos réduit, plus de séries. Vous êtes capable !',
    days: [
      makeDay(
        'w7-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'push-up', sets: 4, reps: 15 },
          { exerciseId: 'diamond-push-up', sets: 3, reps: 8 },
          { exerciseId: 'chair-dips', sets: 4, reps: 15 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 60 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w7-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 4, reps: 25 },
          { exerciseId: 'bulgarian-split-squat', sets: 4, reps: 10 },
          { exerciseId: 'hip-thrust', sets: 4, reps: 20 },
          { exerciseId: 'jump-squat', sets: 4, reps: 15 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w7-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 4, reps: 15 },
          { exerciseId: 'negative-pull-up', sets: 3, reps: 6 },
          { exerciseId: 'dead-hang', sets: 3, durationSeconds: 20 },
          { exerciseId: 'leg-raise', sets: 4, reps: 12 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w7-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'burpee', sets: 4, reps: 12 },
          { exerciseId: 'mountain-climbers', sets: 4, durationSeconds: 45 },
          { exerciseId: 'high-knees', sets: 4, durationSeconds: 45 },
          { exerciseId: 'thoracic-rotation', sets: 3, reps: 12 },
        ],
        REST_MODERATE
      ),
    ],
  },
  {
    weekNumber: 8,
    phaseName: 'Intensification',
    notes:
      'Dernière semaine — donnez tout ! Célébrez vos progrès à la fin. Pensez à votre prochain cycle de 8 semaines.',
    days: [
      makeDay(
        'w8-day-a',
        'Poussée',
        'Poitrine, Épaules, Triceps',
        'Chest, Shoulders, Triceps',
        [
          { exerciseId: 'push-up', sets: 5, reps: 15 },
          { exerciseId: 'diamond-push-up', sets: 3, reps: 10 },
          { exerciseId: 'chair-dips', sets: 4, reps: 18 },
          { exerciseId: 'pike-push-up', sets: 3, reps: 12 },
          { exerciseId: 'plank', sets: 3, durationSeconds: 60 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w8-day-b',
        'Jambes',
        'Quadriceps, Fessiers, Mollets',
        'Quads, Glutes, Calves',
        [
          { exerciseId: 'squat', sets: 5, reps: 25 },
          { exerciseId: 'bulgarian-split-squat', sets: 4, reps: 12 },
          { exerciseId: 'hip-thrust', sets: 4, reps: 20 },
          { exerciseId: 'jump-squat', sets: 4, reps: 15 },
          { exerciseId: 'calf-raise', sets: 3, reps: 30 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w8-day-c',
        'Traction & Abdos',
        'Dorsaux, Biceps, Gainage',
        'Back, Biceps, Core',
        [
          { exerciseId: 'inverted-row', sets: 5, reps: 15 },
          { exerciseId: 'negative-pull-up', sets: 3, reps: 6 },
          { exerciseId: 'dead-hang', sets: 3, durationSeconds: 25 },
          { exerciseId: 'leg-raise', sets: 4, reps: 15 },
          { exerciseId: 'hollow-body', sets: 3, durationSeconds: 30 },
        ],
        REST_MODERATE
      ),
      makeDay(
        'w8-day-d',
        'Cardio & Mobilité',
        'Corps entier, Conditionnement',
        'Full Body, Conditioning',
        [
          { exerciseId: 'burpee', sets: 5, reps: 12 },
          { exerciseId: 'mountain-climbers', sets: 4, durationSeconds: 45 },
          { exerciseId: 'high-knees', sets: 4, durationSeconds: 45 },
          { exerciseId: 'worlds-greatest-stretch', sets: 3, reps: 8 },
          { exerciseId: 'hip-flexor-stretch', sets: 2, durationSeconds: 45 },
        ],
        REST_MODERATE
      ),
    ],
  },
];

export const getWeekProgram = (weekNumber: number): WeekProgram => {
  const clampedWeek = Math.min(Math.max(weekNumber, 1), 8);
  return workoutProgram[clampedWeek - 1];
};

export const getNextWorkoutDay = (
  completedDates: string[],
  weekNumber: number
): { weekNumber: number; dayIndex: number } => {
  const week = getWeekProgram(weekNumber);
  const completedSet = new Set(completedDates);

  // Find the first day in current week not completed today
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < week.days.length; i++) {
    // Check if there\'s a workout log for today with this day
    if (!completedSet.has(today)) {
      return { weekNumber, dayIndex: i };
    }
  }
  return { weekNumber, dayIndex: 0 };
};

export const estimateWorkoutDuration = (dayIndex: number, weekNumber: number): number => {
  const week = getWeekProgram(weekNumber);
  const day = week.days[dayIndex];
  if (!day) return 20;

  let totalSeconds = 0;
  for (const ex of day.exercises) {
    const setTime = ex.durationSeconds ?? 30; // assume ~30s per set of reps
    totalSeconds += ex.sets * setTime;
    totalSeconds += ex.sets * ex.restSeconds;
  }
  return Math.round(totalSeconds / 60);
};
