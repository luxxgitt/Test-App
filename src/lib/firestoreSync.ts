import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile,
  FoodLogEntry,
  WorkoutLog,
  WeightEntry,
  MeasurementEntry,
  ActivityLog,
} from '../types';

export interface CloudData {
  profile: UserProfile;
  foodLog: FoodLogEntry[];
  workoutLog: WorkoutLog[];
  weightLog: WeightEntry[];
  measurements: MeasurementEntry[];
  activityLog?: ActivityLog[];
  updatedAt: number;
}

function getRef(uid: string) {
  return doc(db, 'users', uid, 'fitlife', 'data');
}

/** Read once — returns null if no cloud data exists yet */
export async function loadCloudData(uid: string): Promise<CloudData | null> {
  try {
    const snap = await getDoc(getRef(uid));
    if (!snap.exists()) return null;
    return snap.data() as CloudData;
  } catch {
    return null;
  }
}

/** Full overwrite (with merge so partial saves are safe) */
export async function saveCloudData(uid: string, data: CloudData): Promise<void> {
  await setDoc(getRef(uid), data, { merge: true });
}

/** Real-time listener — returns an unsubscribe function */
export function subscribeToCloudData(
  uid: string,
  onUpdate: (data: CloudData) => void
): Unsubscribe {
  return onSnapshot(getRef(uid), (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as CloudData);
    }
  });
}
