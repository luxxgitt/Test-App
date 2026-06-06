import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import MacroRing from '../components/nutrition/MacroRing';
import FoodSearch from '../components/nutrition/FoodSearch';
import type { FoodLogEntry } from '../types';

type MealType = FoodLogEntry['meal'];

const meals: { id: MealType; label: string; emoji: string }[] = [
  { id: 'petit-déjeuner', label: 'Petit-déjeuner', emoji: '🌅' },
  { id: 'déjeuner', label: 'Déjeuner', emoji: '☀️' },
  { id: 'dîner', label: 'Dîner', emoji: '🌙' },
  { id: 'collation', label: 'Collation', emoji: '🍎' },
];

export default function NutritionPage() {
  const { profile, foodLog, addFoodLogEntry, removeFoodLogEntry, getTodaysMacros } = useStore();
  const [showSearch, setShowSearch] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState<MealType>('déjeuner');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = useMemo(() => foodLog.filter((e) => e.date === todayStr), [foodLog, todayStr]);
  const macros = getTodaysMacros();

  // Targets (approximate): fat ~57g/day, carbs ~120g/day at 1700 kcal, 100g protein
  const fatTarget = Math.round((profile.dailyCalorieTarget * 0.3) / 9);
  const carbsTarget = Math.round(
    (profile.dailyCalorieTarget - profile.dailyProteinTarget * 4 - fatTarget * 9) / 4
  );

  const handleAdd = (entry: Omit<FoodLogEntry, 'id' | 'date'>) => {
    addFoodLogEntry({
      ...entry,
      id: `food-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: todayStr,
    });
  };

  const openSearch = (meal: MealType) => {
    setDefaultMeal(meal);
    setShowSearch(true);
  };

  const mealLogs = (meal: MealType) => todayLog.filter((e) => e.meal === meal);
  const mealCalories = (meal: MealType) =>
    mealLogs(meal).reduce((sum, e) => sum + e.macros.calories, 0);

  return (
    <>
      <div className="flex flex-col gap-4 px-4 pb-24">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-white">Nutrition</h1>
          <p className="text-text-secondary text-sm">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Macro ring summary */}
        <div className="bg-card rounded-2xl p-5">
          <MacroRing
            calories={macros.calories}
            calorieTarget={profile.dailyCalorieTarget}
            protein={macros.protein}
            proteinTarget={profile.dailyProteinTarget}
            fat={macros.fat}
            fatTarget={fatTarget}
            carbs={macros.carbs}
            carbsTarget={Math.max(carbsTarget, 50)}
          />
        </div>

        {/* Meal sections */}
        {meals.map((meal) => {
          const entries = mealLogs(meal.id);
          const totalCal = mealCalories(meal.id);

          return (
            <div key={meal.id} className="bg-card rounded-2xl overflow-hidden">
              {/* Meal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meal.emoji}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{meal.label}</p>
                    {totalCal > 0 && (
                      <p className="text-text-secondary text-xs">{Math.round(totalCal)} kcal</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openSearch(meal.id)}
                  className="flex items-center gap-1 text-accent text-xs font-semibold py-1.5 px-3 rounded-full bg-accent/10"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {/* Food entries */}
              {entries.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{entry.foodName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-text-secondary text-xs">{entry.quantityG}g</span>
                          <span className="text-text-secondary text-xs">•</span>
                          <span className="text-accent text-xs font-semibold">
                            {Math.round(entry.macros.calories)} kcal
                          </span>
                          <span className="text-info text-xs">
                            P {Math.round(entry.macros.protein)}g
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFoodLogEntry(entry.id)}
                        className="p-2 text-text-secondary active:text-red-400 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-text-secondary text-sm">Aucun aliment enregistré</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Daily totals */}
        {todayLog.length > 0 && (
          <div className="bg-card rounded-2xl p-4">
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-3">
              Total journalier
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-accent">{Math.round(macros.calories)}</p>
                <p className="text-text-secondary text-xs">kcal</p>
              </div>
              <div>
                <p className="text-xl font-bold text-info">{Math.round(macros.protein)}g</p>
                <p className="text-text-secondary text-xs">Prot.</p>
              </div>
              <div>
                <p className="text-xl font-bold text-accent">{Math.round(macros.fat)}g</p>
                <p className="text-text-secondary text-xs">Lip.</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#AF52DE' }}>
                  {Math.round(macros.carbs)}g
                </p>
                <p className="text-text-secondary text-xs">Gluc.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => openSearch('déjeuner')}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-accent shadow-lg flex items-center justify-center"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
        aria-label="Ajouter un aliment"
      >
        <Plus size={26} className="text-white" />
      </button>

      {/* Food search modal */}
      {showSearch && (
        <FoodSearch
          onClose={() => setShowSearch(false)}
          onAdd={handleAdd}
          defaultMeal={defaultMeal}
        />
      )}
    </>
  );
}
