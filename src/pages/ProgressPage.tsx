import { useState } from 'react';
import { useStore } from '../store/useStore';
import WeightChart from '../components/progress/WeightChart';
import StreakCalendar from '../components/progress/StreakCalendar';
import type { MeasurementEntry } from '../types';

type ProgressTab = 'poids' | 'mensurations' | 'seances';

const tabs: { id: ProgressTab; label: string }[] = [
  { id: 'poids', label: 'Poids' },
  { id: 'mensurations', label: 'Mensurations' },
  { id: 'seances', label: 'Séances' },
];

function StatCard({ label, value, unit, color = 'white' }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="bg-[#2C2C2E] rounded-xl p-3 text-center">
      <p className="text-2xl font-bold" style={{ color }}>{value}{unit && <span className="text-base font-normal text-text-secondary ml-0.5">{unit}</span>}</p>
      <p className="text-text-secondary text-xs mt-0.5">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const {
    profile,
    weightLog,
    measurements,
    workoutLog,
    addWeightEntry,
    addMeasurement,
    getCompletedWorkoutDates,
    getCurrentWeek,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProgressTab>('poids');
  const [newWeight, setNewWeight] = useState('');
  const [measureForm, setMeasureForm] = useState<Partial<MeasurementEntry>>({});

  const completedDates = getCompletedWorkoutDates();
  const currentWeek = getCurrentWeek();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weightKg : profile.weightKg;
  const weightChange = currentWeight - profile.weightKg;
  const completedWorkouts = workoutLog.filter((w) => w.completed);

  // Streak calculation
  const sortedDates = [...completedDates].sort().reverse();
  let streak = 0;
  if (sortedDates.length > 0) {
    const today = new Date();
    let checkDate = new Date(today);
    for (const date of sortedDates) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (date === checkStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow up to 1 day gap
        checkDate.setDate(checkDate.getDate() - 1);
        const nextCheckStr = checkDate.toISOString().split('T')[0];
        if (date === nextCheckStr) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  const handleAddWeight = () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) return;
    addWeightEntry({ date: todayStr, weightKg: w });
    setNewWeight('');
  };

  const handleAddMeasurement = () => {
    if (Object.keys(measureForm).length === 0) return;
    addMeasurement({ ...measureForm, date: todayStr });
    setMeasureForm({});
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Progrès</h1>
        <p className="text-text-secondary text-sm">Semaine {currentWeek} sur 8</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id ? 'bg-accent text-white' : 'text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* POIDS TAB */}
      {activeTab === 'poids' && (
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Départ" value={profile.weightKg} unit="kg" color="#8E8E93" />
            <StatCard label="Actuel" value={currentWeight} unit="kg" color="#FF6B35" />
            <StatCard
              label="Objectif"
              value={profile.targetWeightKg}
              unit="kg"
              color="#34C759"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Variation"
              value={`${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)}`}
              unit="kg"
              color={weightChange <= 0 ? '#34C759' : '#FF3B30'}
            />
            <StatCard
              label="Reste à perdre"
              value={Math.max(currentWeight - profile.targetWeightKg, 0).toFixed(1)}
              unit="kg"
              color="#007AFF"
            />
          </div>

          {/* Chart */}
          <div className="bg-card rounded-2xl p-4">
            <p className="text-white font-semibold mb-3">Courbe de poids</p>
            <WeightChart
              data={weightLog}
              startWeight={profile.weightKg}
              targetWeight={profile.targetWeightKg}
            />
          </div>

          {/* Add weight */}
          <div className="bg-card rounded-2xl p-4">
            <p className="text-white font-semibold mb-3">Enregistrer le poids aujourd\'hui</p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="ex: 89.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 bg-[#2C2C2E] text-white rounded-xl px-4 py-3 text-sm border-0 outline-none placeholder-text-secondary"
              />
              <span className="flex items-center text-text-secondary text-sm px-2">kg</span>
              <button
                onClick={handleAddWeight}
                disabled={!newWeight}
                className="px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm disabled:opacity-50"
              >
                OK
              </button>
            </div>
          </div>

          {/* Weight history */}
          {weightLog.length > 1 && (
            <div className="bg-card rounded-2xl overflow-hidden">
              <p className="text-white font-semibold px-4 pt-4 pb-2">Historique</p>
              <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                {[...weightLog]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((entry) => (
                    <div key={entry.date} className="flex justify-between px-4 py-3">
                      <span className="text-text-secondary text-sm">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-white font-semibold">{entry.weightKg} kg</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MENSURATIONS TAB */}
      {activeTab === 'mensurations' && (
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-2xl p-4">
            <p className="text-white font-semibold mb-4">Ajouter des mesures</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'waistCm', label: 'Tour de taille' },
                { key: 'chestCm', label: 'Poitrine' },
                { key: 'hipsCm', label: 'Hanches' },
                { key: 'armCm', label: 'Bras' },
                { key: 'thighCm', label: 'Cuisse' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-text-secondary text-xs block mb-1">{label} (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="—"
                    value={(measureForm[key as keyof MeasurementEntry] as string) || ''}
                    onChange={(e) =>
                      setMeasureForm((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || undefined,
                      }))
                    }
                    className="w-full bg-[#2C2C2E] text-white rounded-xl px-3 py-2.5 text-sm border-0 outline-none placeholder-text-secondary"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAddMeasurement}
              className="mt-4 w-full py-3 rounded-xl bg-accent text-white font-bold text-sm"
            >
              Enregistrer les mesures
            </button>
          </div>

          {/* Measurement history */}
          {measurements.length > 0 && (
            <div className="bg-card rounded-2xl overflow-hidden">
              <p className="text-white font-semibold px-4 pt-4 pb-2">Historique</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-text-secondary font-medium">Date</th>
                      <th className="px-2 py-2 text-center text-text-secondary font-medium">Taille</th>
                      <th className="px-2 py-2 text-center text-text-secondary font-medium">Poitrine</th>
                      <th className="px-2 py-2 text-center text-text-secondary font-medium">Hanches</th>
                      <th className="px-2 py-2 text-center text-text-secondary font-medium">Bras</th>
                      <th className="px-2 py-2 text-center text-text-secondary font-medium">Cuisse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...measurements]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((m) => (
                        <tr key={m.date}>
                          <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                            {new Date(m.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="px-2 py-2 text-center text-white">{m.waistCm ?? '—'}</td>
                          <td className="px-2 py-2 text-center text-white">{m.chestCm ?? '—'}</td>
                          <td className="px-2 py-2 text-center text-white">{m.hipsCm ?? '—'}</td>
                          <td className="px-2 py-2 text-center text-white">{m.armCm ?? '—'}</td>
                          <td className="px-2 py-2 text-center text-white">{m.thighCm ?? '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {measurements.length === 0 && (
            <div className="bg-card rounded-2xl p-6 text-center">
              <p className="text-text-secondary">Aucune mensuration enregistrée</p>
              <p className="text-text-secondary text-sm mt-1">
                Prenez vos mesures chaque semaine pour suivre vos progrès.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SÉANCES TAB */}
      {activeTab === 'seances' && (
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Séances totales" value={completedWorkouts.length} color="#FF6B35" />
            <StatCard label="Série actuelle" value={streak} color="#34C759" />
            <StatCard label="Semaine" value={currentWeek} unit="/8" color="#007AFF" />
          </div>

          {/* Calendar */}
          <StreakCalendar completedDates={completedDates} />

          {/* Recent workouts */}
          {completedWorkouts.length > 0 && (
            <div className="bg-card rounded-2xl overflow-hidden">
              <p className="text-white font-semibold px-4 pt-4 pb-2">Dernières séances</p>
              <div className="divide-y divide-white/5">
                {[...completedWorkouts]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 10)
                  .map((w) => (
                    <div key={w.id} className="flex justify-between items-center px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">
                          Semaine {w.weekNumber} — {w.dayId.split('-').pop()?.toUpperCase()}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {new Date(w.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <span className="text-text-secondary text-sm">{w.durationMinutes} min</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {completedWorkouts.length === 0 && (
            <div className="bg-card rounded-2xl p-6 text-center">
              <p className="text-text-secondary">Aucune séance terminée</p>
              <p className="text-text-secondary text-sm mt-1">
                Commencez votre première séance !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
