import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  UserProfile,
  FoodLogEntry,
  WorkoutLog,
  WeightEntry,
  MeasurementEntry,
} from '../types';

const today = new Date().toISOString().split('T')[0];

interface StoreActions {
  updateProfile: (profile: Partial<UserProfile>) => void;
  addFoodLogEntry: (entry: FoodLogEntry) => void;
  removeFoodLogEntry: (id: string) => void;
  logWorkout: (log: WorkoutLog) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  addMeasurement: (entry: MeasurementEntry) => void;
  setCurrentWorkoutSession: (session: Partial<AppState['currentWorkoutSession']>) => void;
  clearCurrentWorkoutSession: () => void;
  getTodaysFoodLog: () => FoodLogEntry[];
  getTodaysMacros: () => { calories: number; protein: number; fat: number; carbs: number };
  getCurrentWeek: () => number;
  getCompletedWorkoutDates: () => string[];
}

type Store = AppState & StoreActions;

const defaultSession: AppState['currentWorkoutSession'] = {
  active: false,
  dayId: null,
  weekNumber: 1,
  currentExerciseIndex: 0,
  currentSet: 1,
  startTime: null,
  completedSets: [],
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'Utilisateur',
        age: 41,
        heightCm: 173,
        weightKg: 90,
        targetWeightKg: 78,
        targetBodyFatPct: 18,
        startDate: today,
        dailyCalorieTarget: 1700,
        dailyProteinTarget: 100,
      },
      foodLog: [],
      workoutLog: [],
      weightLog: [{ date: today, weightKg: 90 }],
      measurements: [],
      currentWorkoutSession: defaultSession,

      updateProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),

      addFoodLogEntry: (entry) =>
        set((state) => ({ foodLog: [...state.foodLog, entry] })),

      removeFoodLogEntry: (id) =>
        set((state) => ({ foodLog: state.foodLog.filter((e) => e.id !== id) })),

      logWorkout: (log) =>
        set((state) => {
          const existing = state.workoutLog.findIndex((w) => w.id === log.id);
          if (existing >= 0) {
            const updated = [...state.workoutLog];
            updated[existing] = log;
            return { workoutLog: updated };
          }
          return { workoutLog: [...state.workoutLog, log] };
        }),

      addWeightEntry: (entry) =>
        set((state) => {
          const existing = state.weightLog.findIndex((w) => w.date === entry.date);
          if (existing >= 0) {
            const updated = [...state.weightLog];
            updated[existing] = entry;
            return { weightLog: updated };
          }
          return { weightLog: [...state.weightLog, entry].sort((a, b) => a.date.localeCompare(b.date)) };
        }),

      addMeasurement: (entry) =>
        set((state) => {
          const existing = state.measurements.findIndex((m) => m.date === entry.date);
          if (existing >= 0) {
            const updated = [...state.measurements];
            updated[existing] = { ...updated[existing], ...entry };
            return { measurements: updated };
          }
          return { measurements: [...state.measurements, entry].sort((a, b) => a.date.localeCompare(b.date)) };
        }),

      setCurrentWorkoutSession: (session) =>
        set((state) => ({
          currentWorkoutSession: { ...state.currentWorkoutSession, ...session },
        })),

      clearCurrentWorkoutSession: () =>
        set({ currentWorkoutSession: defaultSession }),

      getTodaysFoodLog: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().foodLog.filter((e) => e.date === todayStr);
      },

      getTodaysMacros: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = get().foodLog.filter((e) => e.date === todayStr);
        return todayLog.reduce(
          (acc, entry) => ({
            calories: acc.calories + entry.macros.calories,
            protein: acc.protein + entry.macros.protein,
            fat: acc.fat + entry.macros.fat,
            carbs: acc.carbs + entry.macros.carbs,
          }),
          { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );
      },

      getCurrentWeek: () => {
        const startDate = new Date(get().profile.startDate);
        const now = new Date();
        const diffMs = now.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const week = Math.floor(diffDays / 7) + 1;
        return Math.min(Math.max(week, 1), 8);
      },

      getCompletedWorkoutDates: () => {
        return get()
          .workoutLog.filter((w) => w.completed)
          .map((w) => w.date);
      },
    }),
    {
      name: 'fitlife-storage',
    }
  )
);
