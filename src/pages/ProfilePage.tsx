import { useState } from 'react';
import { User, Target, Calendar, Info, ChevronRight, AlertTriangle, Plus, Trash2, Check, type LucideIcon } from 'lucide-react';
import { useStore, PROFILE_COLORS } from '../store/useStore';
import type { UserProfile } from '../types';

// ── Editable field ────────────────────────────────────────────────────────────

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

  const handleSave = () => { onSave(draft); setEditing(false); };

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

// ── New profile form ──────────────────────────────────────────────────────────

const defaultNewProfile: UserProfile = {
  name: '',
  age: 35,
  gender: 'femme',
  heightCm: 165,
  weightKg: 65,
  targetWeightKg: 58,
  targetBodyFatPct: 22,
  startDate: new Date().toISOString().split('T')[0],
  dailyCalorieTarget: 1400,
  dailyProteinTarget: 80,
};

function calcSuggestedCalories(info: UserProfile): { tdee: number; suggested: number; protein: number } {
  const bmr =
    info.gender === 'femme'
      ? 10 * info.weightKg + 6.25 * info.heightCm - 5 * info.age - 161
      : 10 * info.weightKg + 6.25 * info.heightCm - 5 * info.age + 5;
  const tdee = Math.round(bmr * 1.375);
  const suggested = Math.max(tdee - 500, 1200);
  const protein = Math.round(info.targetWeightKg * 2.0);
  return { tdee, suggested, protein };
}

interface NewProfileFormProps {
  onCancel: () => void;
  onSave: (info: UserProfile) => void;
}

function NewProfileForm({ onCancel, onSave }: NewProfileFormProps) {
  const [form, setForm] = useState<UserProfile>(defaultNewProfile);
  const { tdee, suggested, protein } = calcSuggestedCalories(form);

  const set = (key: keyof UserProfile, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setNum = (key: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, parseFloat(e.target.value) || 0);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, dailyCalorieTarget: suggested, dailyProteinTarget: protein });
  };

  return (
    <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Nouveau profil</h3>
        <button onClick={onCancel} className="text-text-secondary text-sm">Annuler</button>
      </div>

      <div className="px-4 py-2 space-y-0">
        {/* Name */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Prénom</span>
          <input
            type="text"
            placeholder="Prénom"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-32 text-right border-0 outline-none"
          />
        </div>

        {/* Gender */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Genre</span>
          <div className="flex gap-1">
            {(['homme', 'femme', 'autre'] as const).map((g) => (
              <button
                key={g}
                onClick={() => set('gender', g)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: form.gender === g ? '#FF6B35' : '#2C2C2E',
                  color: form.gender === g ? '#fff' : '#8E8E93',
                }}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Âge</span>
          <div className="flex items-center gap-1">
            <input type="number" value={form.age} onChange={setNum('age')}
              className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-16 text-right border-0 outline-none" />
            <span className="text-text-secondary text-sm">ans</span>
          </div>
        </div>

        {/* Height */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Taille</span>
          <div className="flex items-center gap-1">
            <input type="number" value={form.heightCm} onChange={setNum('heightCm')}
              className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-16 text-right border-0 outline-none" />
            <span className="text-text-secondary text-sm">cm</span>
          </div>
        </div>

        {/* Weight */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Poids actuel</span>
          <div className="flex items-center gap-1">
            <input type="number" step="0.1" value={form.weightKg} onChange={setNum('weightKg')}
              className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-16 text-right border-0 outline-none" />
            <span className="text-text-secondary text-sm">kg</span>
          </div>
        </div>

        {/* Target weight */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Poids cible</span>
          <div className="flex items-center gap-1">
            <input type="number" step="0.1" value={form.targetWeightKg} onChange={setNum('targetWeightKg')}
              className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-16 text-right border-0 outline-none" />
            <span className="text-text-secondary text-sm">kg</span>
          </div>
        </div>

        {/* Target body fat */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Masse grasse cible</span>
          <div className="flex items-center gap-1">
            <input type="number" step="0.5" value={form.targetBodyFatPct} onChange={setNum('targetBodyFatPct')}
              className="bg-[#2C2C2E] text-white rounded-lg px-2 py-1 text-sm w-16 text-right border-0 outline-none" />
            <span className="text-text-secondary text-sm">%</span>
          </div>
        </div>

        {/* Auto-calculated suggestion */}
        <div className="py-3">
          <div className="bg-[#2C2C2E] rounded-xl p-3 space-y-1.5 text-sm">
            <p className="text-text-secondary text-xs mb-1">Calculé automatiquement :</p>
            <div className="flex justify-between">
              <span className="text-text-secondary">TDEE estimé</span>
              <span className="text-white font-medium">{tdee} kcal/j</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Objectif calorique</span>
              <span className="text-accent font-bold">{suggested} kcal/j</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Protéines</span>
              <span className="text-info font-bold">{protein} g/j</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          disabled={!form.name.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-40"
        >
          <Check size={16} />
          Créer le profil
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const {
    profile, updateProfile, getCurrentWeek, weightLog, workoutLog,
    profiles, activeProfileId, switchProfile, deleteProfile, addProfile,
  } = useStore();

  const [showNewForm, setShowNewForm] = useState(false);
  const currentWeek = getCurrentWeek();
  const weeksRemaining = Math.max(8 - currentWeek, 0);
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weightKg : profile.weightKg;

  const bmi = currentWeight / Math.pow(profile.heightCm / 100, 2);
  const bmr = profile.gender === 'femme'
    ? 10 * currentWeight + 6.25 * profile.heightCm - 5 * profile.age - 161
    : 10 * currentWeight + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const tdee = Math.round(bmr * 1.375);
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
    if (confirm('Réinitialiser les données de ce profil ? Cette action est irréversible.')) {
      if (confirm('Dernière confirmation : toutes les données seront supprimées.')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer le profil de ${name} ? Toutes ses données seront perdues.`)) {
      deleteProfile(id);
    }
  };

  const handleAddProfile = (info: UserProfile) => {
    addProfile(info);
    setShowNewForm(false);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Profil</h1>
        <p className="text-text-secondary text-sm">Paramètres et objectifs</p>
      </div>

      {/* ── Profiles section ── */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <User size={16} className="text-accent" />
            <h2 className="text-white font-semibold text-sm">Mes Profils</h2>
          </div>
          {profiles.length < 4 && !showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-1 text-accent text-xs font-semibold"
            >
              <Plus size={14} /> Ajouter
            </button>
          )}
        </div>

        <div className="px-4 py-3 flex flex-col gap-2">
          {profiles.map((p, i) => {
            const color = PROFILE_COLORS[i % PROFILE_COLORS.length];
            const isActive = p.id === activeProfileId;
            return (
              <button
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{ backgroundColor: isActive ? color + '18' : '#2C2C2E' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: color + '33', color }}
                >
                  {initials(p.info.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{p.info.name}</p>
                  <p className="text-text-secondary text-xs">
                    {p.info.age} ans · {p.info.heightCm} cm · {p.info.weightKg} kg
                  </p>
                </div>
                {isActive ? (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: color + '33', color }}
                  >
                    Actif
                  </span>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.info.name); }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* New profile form */}
      {showNewForm && (
        <NewProfileForm onCancel={() => setShowNewForm(false)} onSave={handleAddProfile} />
      )}

      {/* Active profile avatar card */}
      <div className="bg-card rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-accent text-2xl font-bold">{initials(profile.name)}</span>
        </div>
        <div>
          <p className="text-white font-bold text-lg">{profile.name}</p>
          <p className="text-text-secondary text-sm">
            {profile.age} ans · {profile.heightCm} cm · {currentWeight} kg
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

      {/* Profile fields */}
      <Section title="Mon Profil" icon={User}>
        <EditableField label="Prénom" value={profile.name} onSave={up('name')} />
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <span className="text-text-secondary text-sm">Genre</span>
          <div className="flex gap-1">
            {(['homme', 'femme', 'autre'] as const).map((g) => (
              <button
                key={g}
                onClick={() => updateProfile({ gender: g })}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: profile.gender === g ? '#FF6B35' : '#2C2C2E',
                  color: profile.gender === g ? '#fff' : '#8E8E93',
                }}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <EditableField label="Âge" value={profile.age} unit="ans" type="number" onSave={up('age')} />
        <EditableField label="Taille" value={profile.heightCm} unit="cm" type="number" step="0.5" onSave={up('heightCm')} />
        <EditableField label="Poids actuel" value={profile.weightKg} unit="kg" type="number" step="0.1" onSave={up('weightKg')} />
      </Section>

      {/* Goals */}
      <Section title="Mes Objectifs" icon={Target}>
        <EditableField label="Poids cible" value={profile.targetWeightKg} unit="kg" type="number" step="0.1" onSave={up('targetWeightKg')} />
        <EditableField label="Masse grasse cible" value={profile.targetBodyFatPct} unit="%" type="number" step="0.5" onSave={up('targetBodyFatPct')} />
        <EditableField label="Calories/jour" value={profile.dailyCalorieTarget} unit="kcal" type="number" onSave={up('dailyCalorieTarget')} />
        <EditableField label="Protéines/jour" value={profile.dailyProteinTarget} unit="g" type="number" onSave={up('dailyProteinTarget')} />
        <div className="py-3">
          <div className="bg-[#2C2C2E] rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">TDEE estimé</span>
              <span className="text-white font-medium">{tdee} kcal/j</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Objectif calorique</span>
              <span className="text-white font-medium">{profile.dailyCalorieTarget} kcal/j</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
              <span className="text-text-secondary font-medium">Déficit</span>
              <span className="text-success font-bold">{deficit} kcal/j</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Program */}
      <Section title="Programme" icon={Calendar}>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Date de début</span>
          <span className="text-white font-medium">
            {new Date(profile.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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

      {/* About */}
      <Section title="À propos" icon={Info}>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Application</span>
          <span className="text-white">FitLife</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Version</span>
          <span className="text-white">2.0.0</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10 text-sm">
          <span className="text-text-secondary">Profils</span>
          <span className="text-white">{profiles.length} / 4</span>
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
