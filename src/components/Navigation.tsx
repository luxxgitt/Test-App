import { Home, Dumbbell, Apple, TrendingUp, User, type LucideIcon } from 'lucide-react';

export type TabName = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'profile';

interface NavigationProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { id: TabName; label: string; Icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Accueil', Icon: Home },
  { id: 'workout', label: 'Entraînement', Icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', Icon: Apple },
  { id: 'progress', label: 'Progrès', Icon: TrendingUp },
  { id: 'profile', label: 'Profil', Icon: User },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10"
      style={{ backgroundColor: '#1C1C1E', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors"
              aria-label={label}
            >
              <Icon
                size={22}
                className={isActive ? 'text-accent' : 'text-text-secondary'}
              />
              <span
                className={`text-[10px] font-medium leading-tight ${
                  isActive ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
