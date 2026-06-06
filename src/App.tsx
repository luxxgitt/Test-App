import { useState } from 'react';
import Navigation, { type TabName } from './components/Navigation';
import Dashboard from './pages/Dashboard';
import WorkoutPage from './pages/WorkoutPage';
import NutritionPage from './pages/NutritionPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');

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
        return <ProfilePage />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: '#0D0D0D' }}
    >
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
