import { useState } from 'react';
import { User, Target, Calendar, Info, ChevronRight, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { UserProfile } from '../types';

interface EditableFieldProps {
  label: string;
  value: string | number;
  unit?: string;
  type?: 'text' | 'number';
  step?: string;
  onSave: (value: string) => void;
}

function EditableField({ label, value, unit, type = 'text', step, onSave }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <span className="text-text-secondary text-sm">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type={type}
            step={step}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-24 text-right border-0 outline-none"
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          {unit && <span className="text-text-secondary text-sm">{unit}</span>}
        </div>
      ) : (
        <button
          onClick={() => { setDraft(String(value)); setEditing(true); }}
          className="flex items-center gap-1 text-white font-medium text-sm"
        >
          {value}{unit && <span className="text-text-secondary ml-0.5">{unit}</span>}
          <ChevronRight size={14} className="text-text-secondary ml-1" />
        </button>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Icon size={16} className="text-accent" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, updateProfile, getCurrentWeek, weightLog, workoutLog } = useStore();
  const currentWeek = getCurrentWeek();

  const weeksRemaining = Math.max(8 - currentWeek, 0);
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weightKg : profile.weightKg;

  // BMI
  const bmi = currentWeight / Math.pow(profile.heightCm / 100, 2);

  // TDEE estimate (Mifflin-St Jeor for men, sedentary+ = light activity)
  // For simplicity we estimate ~2200-2400 for this profile
  const bmr = 10 * currentWeight + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const tdee = Math.round(bmr * 1.375); // light activity
  const deficit = tdee - profile.dailyCalorieTarget;

  const completedWorkouts = workoutLog.filter((w) => w.completed).length;

  const up = (key: keyof UserProfile) => (value: string) => {
    const numericKeys: (keyof UserProfile)[] = [
      'age', 'heightCm', 'weightKg', 'targetWeightKg', 'targetBodyFatPct',
      'dailyCalorieTarget', 'dailyProteinTarget',
    ];
    if (numericKeys.includes(key)) {
      updateProfile({ [key]: parseFloat(value) || 0 } as Partial<UserProfile>);
    } else {
      updateProfile({ [key]: value } as Partial<UserProfile>);
    }
  };

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser toutes les données ? Cette action est irréversible.')) {
      if (confirm('Dernière confirmation : toutes vos données seront supprimées.')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Profil</h1>
        <p className="text-text-secondary text-sm">Vos paramètres personnels</p>
      </div>

      {/* Avatar / name card */}
      <div className="bg-card rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-accent" />
        </div>
        <div>
          <p className="text-white font-bold text-lg">{profile.name}</p>
          <p className="text-text-secondary text-sm">
            {profile.age} ans • {profile.heightCm} cm • {currentWeight} kg
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
              IMC: {bmi.toFixed(1)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-info/20 text-info font-medium">
              {completedWorkouts} séances
            </span>
          </div>
        </div>
      </div>

      {/* Profile section */}
      <Section title="Mon Profil" icon={User}>
        <EditableField label="Prénom" value={profile.name} onSave={up('name')} />
        <EditableField label="Âge" value={profile.age} unit="ans" type="number" onSave={up('age')} />
        <EditableField label="Taille" value={profile.heightCm} unit="cm" type="number" step="0.5" onSave={up('heightCm')} />
        <EditableField label="Poids actuel" value={profile.weightKg} unit="kg" type="number" step="0.1" onSave={up('weightKg')} />
      </Section>

      {/* Goals section */}
      <Section title="Mes Objectifs" icon={Target}>
        <EditableField label="Poids cible" value={profile.targetWeightKg} unit="kg" type="number" step="0.1" onSave={up('targetWeightKg')} />
        <EditableField label="Masse grasse cible" value={profile.targetBodyFatPct} unit="%" type="number" step="0.5" onSave={up('targetBodyFatPct')} />
        <EditableField label="Calories/jour" value={profile.dailyCalorieTarget} unit="kcal" type="number" onSave={up('dailyCalorieTarget')} />
        <EditableField label="Protéines/jour" value={profile.dailyProteinTarget} unit="g" type="number" onSave={up('dailyProteinTarget')} />

        {/* Deficit info */}
        <div className="py-3">
          <div className="bg-[#2C2C2E] rounded-xl p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">TDEE estimé</span>
              <span className="text-white font-medium">{tdee} kcal/j</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Objectif calorique</span>
              <span className="text-white font-medium">{profile.dailyCalorieTarget} kcal/j</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
              <span className="text-text-secondary font-medium">Déficit</span>
              <span className="text-success font-bold">{deficit} kcal/j</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Program section */}
      <Section title="Programme" icon={Calendar}>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Date de début</span>
          <span className="text-white font-medium">
            {new Date(profile.startDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Semaine actuelle</span>
          <span className="text-white font-medium">Semaine {currentWeek} / 8</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Semaines restantes</span>
          <span className="text-white font-medium">{weeksRemaining} semaine{weeksRemaining > 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between py-3 text-sm">
          <span className="text-text-secondary">Séances complétées</span>
          <span className="text-white font-medium">{completedWorkouts}</span>
        </div>

        {/* Progress bar */}
        <div className="pb-4">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>Progression du programme</span>
            <span>{Math.round(((currentWeek - 1) / 8) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#2C2C2E] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${((currentWeek - 1) / 8) * 100}%` }}
            />
          </div>
        </div>
      </Section>

      {/* About section */}
      <Section title="À propos" icon={Info}>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Application</span>
          <span className="text-white">FitLife</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Version</span>
          <span className="text-white">1.0.0</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Stockage</span>
          <span className="text-white">Local (localStorage)</span>
        </div>
        <div className="py-3">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold text-sm"
          >
            <AlertTriangle size={16} />
            Réinitialiser toutes les données
          </button>
        </div>
      </Section>
    </div>
  );
}
