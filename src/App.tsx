import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { loadCloudData, subscribeToCloudData } from './lib/firestoreSync';
import { useStore } from './store/useStore';
import Navigation, { type TabName } from './components/Navigation';
import Dashboard from './pages/Dashboard';
import WorkoutPage from './pages/WorkoutPage';
import NutritionPage from './pages/NutritionPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

// ── Sync status dot ──────────────────────────────────────────────────────────

function SyncIndicator() {
  const syncStatus = useStore((s) => s.syncStatus);

  if (syncStatus === 'idle') return null;

  return (
    <div className="fixed top-3 right-3 z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {syncStatus === 'syncing' && (
        <span
          className="block w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: '#FF9500' }}
          title="Synchronisation…"
        />
      )}
      {syncStatus === 'error' && (
        <span
          className="block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: '#FF3B30' }}
          title="Erreur de synchronisation"
        />
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<{ uid: string; email: string; name: string } | null>(null);

  const { setAuth, clearAuth, loadFromCloud } = useStore();
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up any previous snapshot listener
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (!firebaseUser) {
        clearAuth();
        setAuthedUser(null);
        setAuthChecked(true);
        return;
      }

      const uid = firebaseUser.uid;
      const email = firebaseUser.email ?? '';
      const name = firebaseUser.displayName ?? email.split('@')[0] ?? 'Utilisateur';

      setAuth(uid, email, name);
      setAuthedUser({ uid, email, name });

      // Load cloud data once on sign-in
      const cloudData = await loadCloudData(uid);
      if (cloudData) {
        loadFromCloud(cloudData);
      }

      // Set up real-time listener
      unsubscribeSnapshotRef.current = subscribeToCloudData(uid, (cloudSnap) => {
        const localTs = useStore.getState().lastSyncedAt;
        if (cloudSnap.updatedAt > localTs) {
          loadFromCloud(cloudSnap);
        }
      });

      setAuthChecked(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      clearAuth();
    } catch {
      // ignore sign-out errors
    }
  };

  // Still determining auth state
  if (!authChecked) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: '#0D0D0D' }}
      >
        <span
          className="w-8 h-8 rounded-full border-2 border-white/20 border-t-accent animate-spin"
          style={{ borderTopColor: '#FF6B35' }}
        />
      </div>
    );
  }

  // Not signed in
  if (!authedUser) {
    return <LoginPage />;
  }

  // Signed in — show main app
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'workout':
        return <WorkoutPage />;
      case 'nutrition':
        return <NutritionPage />;
      case 'progress':
        return <ProgressPage />;
      case 'profile':
        return <ProfilePage onSignOut={handleSignOut} />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <SyncIndicator />

      {/* Main content area — scrollable, with padding for nav bar */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
