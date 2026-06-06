export interface UserProfile {
  name: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  targetBodyFatPct: number;
  startDate: string; // ISO date
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
}

export interface Exercise {
  id: string;
  nameEN: string;
  nameFR: string;
  descriptionFR: string;
  muscleGroups: string[];
  youtubeSearchUrl: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
}

export interface WorkoutSet {
  exerciseId: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
}

export interface WorkoutDay {
  id: string;
  dayName: string;
  focusFR: string;
  focusEN: string;
  exercises: WorkoutSet[];
}

export interface WeekProgram {
  weekNumber: number;
  phaseName: string;
  days: WorkoutDay[];
  notes: string;
}

export interface FoodItem {
  id: string;
  nameFR: string;
  nameEN: string;
  category: string;
  per100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    fiber: number;
  };
}

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  foodId: string;
  foodName: string;
  quantityG: number;
  meal: 'petit-déjeuner' | 'déjeuner' | 'dîner' | 'collation';
  macros: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
  };
}

export interface WorkoutLog {
  id: string;
  date: string;
  weekNumber: number;
  dayId: string;
  completed: boolean;
  durationMinutes: number;
  caloriesBurned: number;
  exerciseLogs: {
    exerciseId: string;
    setsCompleted: number;
    repsCompleted: number[];
  }[];
}

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface MeasurementEntry {
  date: string;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  armCm?: number;
  thighCm?: number;
}

export interface WorkoutSession {
  active: boolean;
  dayId: string | null;
  weekNumber: number;
  currentExerciseIndex: number;
  currentSet: number;
  startTime: string | null;
  completedSets: { exerciseId: string; reps: number }[];
}

export interface AppState {
  profile: UserProfile;
  foodLog: FoodLogEntry[];
  workoutLog: WorkoutLog[];
  weightLog: WeightEntry[];
  measurements: MeasurementEntry[];
  currentWorkoutSession: WorkoutSession;
}
