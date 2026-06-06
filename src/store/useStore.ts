import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  FoodLogEntry,
  WorkoutLog,
  WeightEntry,
  MeasurementEntry,
  WorkoutSession,
  ProfileData,
} from '../types';

const today = () => new Date().toISOString().split('T')[0];

export const defaultSession: WorkoutSession = {
  active: false,
  dayId: null,
  weekNumber: 1,
  currentExerciseIndex: 0,
  currentSet: 1,
  startTime: null,
  completedSets: [],
};

const defaultUserProfile: UserProfile = {
  name: 'Utilisateur',
  age: 41,
  gender: 'homme',
  heightCm: 173,
  weightKg: 90,
  targetWeightKg: 78,
  targetBodyFatPct: 18,
  startDate: today(),
  dailyCalorieTarget: 1700,
  dailyProteinTarget: 100,
};

export const PROFILE_COLORS = ['#FF6B35', '#007AFF', '#34C759', '#AF52DE'];

export function makeNewProfile(info: UserProfile): ProfileData {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    info,
    foodLog: [],
    workoutLog: [],
    weightLog: [{ date: today(), weightKg: info.weightKg }],
    measurements: [],
    currentWorkoutSession: defaultSession,
  };
}

// ── Store types ─────────────────────────────────────────────────────────────

interface StoreState {
  // Multi-profile core
  profiles: ProfileData[];
  activeProfileId: string;

  // Flat mirrors of the active profile — pages read these directly
  profile: UserProfile;
  foodLog: FoodLogEntry[];
  workoutLog: WorkoutLog[];
  weightLog: WeightEntry[];
  measurements: MeasurementEntry[];
  currentWorkoutSession: WorkoutSession;
}

interface StoreActions {
  // Profile management
  addProfile: (info: UserProfile) => void;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;

  // Per-profile mutations (operate on active profile)
  updateProfile: (updates: Partial<UserProfile>) => void;
  addFoodLogEntry: (entry: FoodLogEntry) => void;
  removeFoodLogEntry: (id: string) => void;
  logWorkout: (log: WorkoutLog) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  addMeasurement: (entry: MeasurementEntry) => void;
  setCurrentWorkoutSession: (session: Partial<WorkoutSession>) => void;
  clearCurrentWorkoutSession: () => void;

  // Selectors
  getTodaysFoodLog: () => FoodLogEntry[];
  getTodaysMacros: () => { calories: number; protein: number; fat: number; carbs: number };
  getCurrentWeek: () => number;
  getCompletedWorkoutDates: () => string[];
}

type Store = StoreState & StoreActions;

// ── Helper: sync flat mirrors from a ProfileData ─────────────────────────────

function mirrorOf(p: ProfileData): Pick<StoreState,
  'profile' | 'foodLog' | 'workoutLog' | 'weightLog' | 'measurements' | 'currentWorkoutSession'
> {
  return {
    profile: p.info,
    foodLog: p.foodLog,
    workoutLog: p.workoutLog,
    weightLog: p.weightLog,
    measurements: p.measurements,
    currentWorkoutSession: p.currentWorkoutSession,
  };
}

// Patches the active profile in profiles[] and updates the flat mirrors
function patchActive(
  state: StoreState,
  patcher: (p: ProfileData) => Partial<ProfileData>
): Partial<StoreState> {
  const idx = state.profiles.findIndex((p) => p.id === state.activeProfileId);
  if (idx < 0) return {};
  const updated: ProfileData = { ...state.profiles[idx], ...patcher(state.profiles[idx]) };
  const newProfiles = [...state.profiles];
  newProfiles[idx] = updated;
  return { profiles: newProfiles, ...mirrorOf(updated) };
}

// ── Store ────────────────────────────────────────────────────────────────────

const initialProfile = makeNewProfile(defaultUserProfile);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      profiles: [initialProfile],
      activeProfileId: initialProfile.id,
      ...mirrorOf(initialProfile),

      // ── Profile management ──────────────────────────────────────────────

      addProfile: (info) => {
        const newP = makeNewProfile(info);
        set((state) => ({
          profiles: [...state.profiles, newP],
          activeProfileId: newP.id,
          ...mirrorOf(newP),
        }));
      },

      switchProfile: (id) => {
        set((state) => {
          const p = state.profiles.find((p) => p.id === id);
          if (!p) return {};
          return { activeProfileId: id, ...mirrorOf(p) };
        });
      },

      deleteProfile: (id) => {
        set((state) => {
          if (state.profiles.length <= 1) return {}; // must keep at least one
          const newProfiles = state.profiles.filter((p) => p.id !== id);
          const newActiveId =
            state.activeProfileId === id ? newProfiles[0].id : state.activeProfileId;
          const active = newProfiles.find((p) => p.id === newActiveId)!;
          return { profiles: newProfiles, activeProfileId: newActiveId, ...mirrorOf(active) };
        });
      },

      // ── Mutations ───────────────────────────────────────────────────────

      updateProfile: (updates) =>
        set((state) =>
          patchActive(state, (p) => ({ info: { ...p.info, ...updates } }))
        ),

      addFoodLogEntry: (entry) =>
        set((state) =>
          patchActive(state, (p) => ({ foodLog: [...p.foodLog, entry] }))
        ),

      removeFoodLogEntry: (id) =>
        set((state) =>
          patchActive(state, (p) => ({ foodLog: p.foodLog.filter((e) => e.id !== id) }))
        ),

      logWorkout: (log) =>
        set((state) =>
          patchActive(state, (p) => {
            const existing = p.workoutLog.findIndex((w) => w.id === log.id);
            const newLog =
              existing >= 0
                ? p.workoutLog.map((w, i) => (i === existing ? log : w))
                : [...p.workoutLog, log];
            return { workoutLog: newLog };
          })
        ),

      addWeightEntry: (entry) =>
        set((state) =>
          patchActive(state, (p) => {
            const existing = p.weightLog.findIndex((w) => w.date === entry.date);
            const newLog =
              existing >= 0
                ? p.weightLog.map((w, i) => (i === existing ? entry : w))
                : [...p.weightLog, entry].sort((a, b) => a.date.localeCompare(b.date));
            return { weightLog: newLog };
          })
        ),

      addMeasurement: (entry) =>
        set((state) =>
          patchActive(state, (p) => {
            const existing = p.measurements.findIndex((m) => m.date === entry.date);
            const newList =
              existing >= 0
                ? p.measurements.map((m, i) => (i === existing ? { ...m, ...entry } : m))
                : [...p.measurements, entry].sort((a, b) => a.date.localeCompare(b.date));
            return { measurements: newList };
          })
        ),

      setCurrentWorkoutSession: (session) =>
        set((state) =>
          patchActive(state, (p) => ({
            currentWorkoutSession: { ...p.currentWorkoutSession, ...session },
          }))
        ),

      clearCurrentWorkoutSession: () =>
        set((state) =>
          patchActive(state, () => ({ currentWorkoutSession: defaultSession }))
        ),

      // ── Selectors ───────────────────────────────────────────────────────

      getTodaysFoodLog: () => {
        const t = today();
        return get().foodLog.filter((e) => e.date === t);
      },

      getTodaysMacros: () => {
        const t = today();
        return get()
          .foodLog.filter((e) => e.date === t)
          .reduce(
            (acc, e) => ({
              calories: acc.calories + e.macros.calories,
              protein: acc.protein + e.macros.protein,
              fat: acc.fat + e.macros.fat,
              carbs: acc.carbs + e.macros.carbs,
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
          );
      },

      getCurrentWeek: () => {
        const start = new Date(get().profile.startDate);
        const diff = Date.now() - start.getTime();
        const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
        return Math.min(Math.max(week, 1), 8);
      },

      getCompletedWorkoutDates: () =>
        get()
          .workoutLog.filter((w) => w.completed)
          .map((w) => w.date),
    }),
    {
      name: 'fitlife-storage',
      version: 2,
      // Migrate from v1 (flat single-profile) to v2 (multi-profile)
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          const old = persisted as Record<string, unknown>;
          if (old.profile) {
            const legacyProfile: ProfileData = {
              id: 'p-legacy',
              info: old.profile as UserProfile,
              foodLog: (old.foodLog as FoodLogEntry[]) ?? [],
              workoutLog: (old.workoutLog as WorkoutLog[]) ?? [],
              weightLog: (old.weightLog as WeightEntry[]) ?? [],
              measurements: (old.measurements as MeasurementEntry[]) ?? [],
              currentWorkoutSession: defaultSession,
            };
            // Ensure gender field exists (added in v2)
            if (!legacyProfile.info.gender) legacyProfile.info.gender = 'homme';
            return {
              profiles: [legacyProfile],
              activeProfileId: legacyProfile.id,
              ...mirrorOf(legacyProfile),
            };
          }
        }
        return persisted;
      },
    }
  )
);
