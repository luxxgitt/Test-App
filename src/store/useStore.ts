import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  FoodLogEntry,
  WorkoutLog,
  WeightEntry,
  MeasurementEntry,
  WorkoutSession,
  ActivityLog,
} from '../types';
import { saveCloudData, type CloudData } from '../lib/firestoreSync';

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

// ── Store types ─────────────────────────────────────────────────────────────

interface StoreState {
  // Auth
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt: number;
  isSyncingFromCloud: boolean;

  // Data
  profile: UserProfile;
  foodLog: FoodLogEntry[];
  workoutLog: WorkoutLog[];
  weightLog: WeightEntry[];
  measurements: MeasurementEntry[];
  currentWorkoutSession: WorkoutSession;
  activityLog: ActivityLog[];
}

interface StoreActions {
  // Auth actions
  setAuth: (uid: string, email: string, name: string) => void;
  clearAuth: () => void;

  // Cloud sync
  loadFromCloud: (data: CloudData) => void;
  syncToCloud: () => void;

  // Data mutations
  updateProfile: (updates: Partial<UserProfile>) => void;
  addFoodLogEntry: (entry: FoodLogEntry) => void;
  removeFoodLogEntry: (id: string) => void;
  logWorkout: (log: WorkoutLog) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  addMeasurement: (entry: MeasurementEntry) => void;
  setCurrentWorkoutSession: (session: Partial<WorkoutSession>) => void;
  clearCurrentWorkoutSession: () => void;
  addActivityLog: (entry: ActivityLog) => void;
  removeActivityLog: (id: string) => void;
  completeOnboarding: (profileUpdates: Partial<UserProfile>) => void;

  // Selectors
  getTodaysFoodLog: () => FoodLogEntry[];
  getTodaysMacros: () => { calories: number; protein: number; fat: number; carbs: number };
  getCurrentWeek: () => number;
  getCompletedWorkoutDates: () => string[];
}

type Store = StoreState & StoreActions;

// ── Debounce timer (module-level) ────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null;

// ── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Auth defaults
      userId: null,
      userEmail: null,
      userName: null,
      syncStatus: 'idle',
      lastSyncedAt: 0,
      isSyncingFromCloud: false,

      // Data defaults
      profile: defaultUserProfile,
      foodLog: [],
      workoutLog: [],
      weightLog: [{ date: today(), weightKg: defaultUserProfile.weightKg }],
      measurements: [],
      currentWorkoutSession: defaultSession,
      activityLog: [],

      // ── Auth actions ────────────────────────────────────────────────────

      setAuth: (uid, email, name) => {
        set((state) => ({
          userId: uid,
          userEmail: email,
          userName: name,
          profile: state.profile.name === 'Utilisateur'
            ? { ...state.profile, name: name.split(' ')[0] }
            : state.profile,
        }));
      },

      clearAuth: () => {
        set({
          userId: null,
          userEmail: null,
          userName: null,
          syncStatus: 'idle',
          lastSyncedAt: 0,
        });
      },

      // ── Cloud sync ──────────────────────────────────────────────────────

      loadFromCloud: (data: CloudData) => {
        set({
          isSyncingFromCloud: true,
          profile: data.profile,
          foodLog: data.foodLog,
          workoutLog: data.workoutLog,
          weightLog: data.weightLog,
          measurements: data.measurements,
          activityLog: data.activityLog ?? [],
          lastSyncedAt: data.updatedAt,
          syncStatus: 'idle',
        });
        // Clear flag after state is applied
        set({ isSyncingFromCloud: false });
      },

      syncToCloud: () => {
        const state = get();
        if (!state.userId) return;
        if (state.isSyncingFromCloud) return;
        if (syncTimer) clearTimeout(syncTimer);
        set({ syncStatus: 'syncing' });
        syncTimer = setTimeout(async () => {
          const currentState = get();
          if (!currentState.userId) return;
          try {
            const now = Date.now();
            await saveCloudData(currentState.userId, {
              profile: currentState.profile,
              foodLog: currentState.foodLog,
              workoutLog: currentState.workoutLog,
              weightLog: currentState.weightLog,
              measurements: currentState.measurements,
              activityLog: currentState.activityLog,
              updatedAt: now,
            });
            useStore.setState({ syncStatus: 'idle', lastSyncedAt: now });
          } catch {
            useStore.setState({ syncStatus: 'error' });
          }
        }, 1500);
      },

      // ── Mutations ───────────────────────────────────────────────────────

      updateProfile: (updates) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
        get().syncToCloud();
      },

      addFoodLogEntry: (entry) => {
        set((state) => ({ foodLog: [...state.foodLog, entry] }));
        get().syncToCloud();
      },

      removeFoodLogEntry: (id) => {
        set((state) => ({ foodLog: state.foodLog.filter((e) => e.id !== id) }));
        get().syncToCloud();
      },

      logWorkout: (log) => {
        set((state) => {
          const existing = state.workoutLog.findIndex((w) => w.id === log.id);
          const newLog =
            existing >= 0
              ? state.workoutLog.map((w, i) => (i === existing ? log : w))
              : [...state.workoutLog, log];
          return { workoutLog: newLog };
        });
        get().syncToCloud();
      },

      addWeightEntry: (entry) => {
        set((state) => {
          const existing = state.weightLog.findIndex((w) => w.date === entry.date);
          const newLog =
            existing >= 0
              ? state.weightLog.map((w, i) => (i === existing ? entry : w))
              : [...state.weightLog, entry].sort((a, b) => a.date.localeCompare(b.date));
          return { weightLog: newLog };
        });
        get().syncToCloud();
      },

      addMeasurement: (entry) => {
        set((state) => {
          const existing = state.measurements.findIndex((m) => m.date === entry.date);
          const newList =
            existing >= 0
              ? state.measurements.map((m, i) => (i === existing ? { ...m, ...entry } : m))
              : [...state.measurements, entry].sort((a, b) => a.date.localeCompare(b.date));
          return { measurements: newList };
        });
        get().syncToCloud();
      },

      setCurrentWorkoutSession: (session) => {
        set((state) => ({
          currentWorkoutSession: { ...state.currentWorkoutSession, ...session },
        }));
        // currentWorkoutSession is ephemeral — not synced
      },

      clearCurrentWorkoutSession: () => {
        set({ currentWorkoutSession: defaultSession });
        get().syncToCloud();
      },

      addActivityLog: (entry) => {
        set((state) => ({ activityLog: [...state.activityLog, entry] }));
        get().syncToCloud();
      },

      removeActivityLog: (id) => {
        set((state) => ({ activityLog: state.activityLog.filter((e) => e.id !== id) }));
        get().syncToCloud();
      },

      completeOnboarding: (profileUpdates) => {
        set((state) => ({
          profile: { ...state.profile, ...profileUpdates, onboardingComplete: true },
        }));
        get().syncToCloud();
      },

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
      version: 3,
      // Only persist data fields (not transient auth/sync state)
      partialize: (state) => ({
        profile: state.profile,
        foodLog: state.foodLog,
        workoutLog: state.workoutLog,
        weightLog: state.weightLog,
        measurements: state.measurements,
        currentWorkoutSession: state.currentWorkoutSession,
        activityLog: state.activityLog,
        lastSyncedAt: state.lastSyncedAt,
      }),
      migrate: (persisted: unknown, version: number) => {
        const old = persisted as Record<string, unknown>;

        if (version < 2) {
          // v1 → flat single profile (already flat, just ensure gender field)
          if (old.profile) {
            const p = old.profile as UserProfile;
            if (!p.gender) p.gender = 'homme';
          }
          return old;
        }

        if (version < 3) {
          // v2 → multi-profile to single profile
          if (old.profiles && Array.isArray(old.profiles) && old.profiles.length > 0) {
            const firstProfile = old.profiles[0] as Record<string, unknown>;
            const info = (firstProfile.info ?? {}) as UserProfile;
            if (!info.gender) info.gender = 'homme';
            return {
              profile: info,
              foodLog: (firstProfile.foodLog as FoodLogEntry[]) ?? [],
              workoutLog: (firstProfile.workoutLog as WorkoutLog[]) ?? [],
              weightLog: (firstProfile.weightLog as WeightEntry[]) ?? [],
              measurements: (firstProfile.measurements as MeasurementEntry[]) ?? [],
              currentWorkoutSession: defaultSession,
              activityLog: [],
              lastSyncedAt: 0,
            };
          }
        }

        // Ensure activityLog exists for any persisted state
        if (!old.activityLog) {
          old.activityLog = [];
        }

        return persisted;
      },
    }
  )
);
