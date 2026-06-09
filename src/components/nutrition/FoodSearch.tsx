import { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus } from 'lucide-react';
import { foodDatabase } from '../../data/foodDatabase';
import type { FoodItem, FoodLogEntry } from '../../types';

type MealType = FoodLogEntry['meal'];

const mealOptions: { id: MealType; label: string }[] = [
  { id: 'petit-déjeuner', label: 'Petit-déj.' },
  { id: 'déjeuner', label: 'Déjeuner' },
  { id: 'dîner', label: 'Dîner' },
  { id: 'collation', label: 'Collation' },
];

interface FoodSearchProps {
  onClose: () => void;
  onAdd: (entry: Omit<FoodLogEntry, 'id' | 'date'>) => void;
  defaultMeal?: MealType;
}

export default function FoodSearch({ onClose, onAdd, defaultMeal = 'déjeuner' }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [meal, setMeal] = useState<MealType>(defaultMeal);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return foodDatabase.slice(0, 30);
    const q = query.toLowerCase();
    return foodDatabase.filter(
      (f) =>
        f.nameFR.toLowerCase().includes(q) ||
        f.nameEN.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [query]);

  const macrosPreview = useMemo(() => {
    if (!selectedFood) return null;
    const factor = quantity / 100;
    return {
      calories: Math.round(selectedFood.per100g.calories * factor),
      protein: Math.round(selectedFood.per100g.protein * factor * 10) / 10,
      fat: Math.round(selectedFood.per100g.fat * factor * 10) / 10,
      carbs: Math.round(selectedFood.per100g.carbs * factor * 10) / 10,
      sugar: Math.round(selectedFood.per100g.sugar * factor * 10) / 10,
    };
  }, [selectedFood, quantity]);

  const handleAdd = () => {
    if (!selectedFood || !macrosPreview) return;
    onAdd({
      foodId: selectedFood.id,
      foodName: selectedFood.nameFR,
      quantityG: quantity,
      meal,
      macros: macrosPreview,
    });
    onClose();
  };

  const handleBack = () => {
    setSelectedFood(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', backgroundColor: '#1C1C1E' }}
      >
        <h2 className="text-lg font-semibold text-white">Ajouter un aliment</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Meal selector */}
      <div className="flex gap-2 px-4 py-3 border-b border-white/10 flex-shrink-0">
        {mealOptions.map((m) => (
          <button
            key={m.id}
            onClick={() => setMeal(m.id)}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              meal === m.id
                ? 'bg-accent text-white'
                : 'bg-white/10 text-text-secondary'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {selectedFood ? (
        // Food detail / quantity selection
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <button
              onClick={handleBack}
              className="text-accent text-sm mb-3 flex items-center gap-1"
            >
              ← Retour
            </button>
            <h3 className="text-white font-semibold text-lg">{selectedFood.nameFR}</h3>
            <p className="text-text-secondary text-sm">{selectedFood.nameEN} • {selectedFood.category}</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Quantity input */}
            <div className="bg-card rounded-xl p-4">
              <label className="text-text-secondary text-sm font-medium block mb-2">
                Quantité (grammes)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(5, quantity - 25))}
                  className="w-10 h-10 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-white/10 text-white text-center text-xl font-bold rounded-xl py-2 border-0 outline-none"
                  min={1}
                />
                <button
                  onClick={() => setQuantity(quantity + 25)}
                  className="w-10 h-10 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mt-3">
                {[50, 100, 150, 200, 250].map((g) => (
                  <button
                    key={g}
                    onClick={() => setQuantity(g)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                      quantity === g ? 'bg-accent text-white' : 'bg-white/10 text-text-secondary'
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Macros preview */}
            {macrosPreview && (
              <div className="bg-card rounded-xl p-4">
                <p className="text-text-secondary text-sm font-medium mb-3">
                  Valeurs nutritionnelles pour {quantity}g
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{macrosPreview.calories}</p>
                    <p className="text-text-secondary text-xs">kcal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-info">{macrosPreview.protein}g</p>
                    <p className="text-text-secondary text-xs">Protéines</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{macrosPreview.fat}g</p>
                    <p className="text-text-secondary text-xs">Lipides</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: '#AF52DE' }}>{macrosPreview.carbs}g</p>
                    <p className="text-text-secondary text-xs">Glucides</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add button */}
          <div className="p-4 mt-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <button
              onClick={handleAdd}
              className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        // Search results
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search input */}
          <div className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5">
              <Search size={16} className="text-text-secondary flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un aliment..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-text-secondary text-sm border-0 outline-none"
                autoFocus
              />
              {query.length > 0 && (
                <button onClick={handleClear} className="p-1 -mr-1">
                  <X size={16} className="text-text-secondary" />
                </button>
              )}
            </div>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <p className="text-text-secondary text-sm text-center">
                  Aucun résultat pour «{query}»
                </p>
                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium"
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className="w-full bg-card rounded-xl p-3 flex items-center justify-between text-left active:opacity-70 transition-opacity"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{food.nameFR}</p>
                    <p className="text-text-secondary text-xs">{food.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-semibold text-sm">{food.per100g.calories} kcal</p>
                    <p className="text-text-secondary text-xs">{food.per100g.protein}g prot.</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
