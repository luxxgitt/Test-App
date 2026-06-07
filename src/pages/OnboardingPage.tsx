import { useState } from 'react';
import { useStore } from '../store/useStore';

const TOTAL_STEPS = 6;

interface OnboardingPageProps {
  onComplete: () => void;
}

type Goal = 'perte-poids' | 'prise-muscle' | 'maintien' | 'endurance';
type WorkoutType =
  | 'calisthenics'
  | 'yoga'
  | 'pilates-reformer'
  | 'course-pied'
  | 'cyclisme'
  | 'tennis'
  | 'football'
  | 'natation'
  | 'hiit'
  | 'musculation'
  | 'autre';
type FitnessLevel = 'débutant' | 'intermédiaire' | 'avancé';
type Gender = 'homme' | 'femme' | 'autre';

const goalOptions: { value: Goal; emoji: string; label: string }[] = [
  { value: 'perte-poids', emoji: '🔥', label: 'Perdre du poids' },
  { value: 'prise-muscle', emoji: '💪', label: 'Prendre du muscle' },
  { value: 'maintien', emoji: '⚖️', label: 'Maintenir ma forme' },
  { value: 'endurance', emoji: '🏃', label: 'Améliorer mon endurance' },
];

const activityOptions: { value: WorkoutType; emoji: string; label: string }[] = [
  { value: 'calisthenics', emoji: '🤸', label: 'Calisthenics / Gym' },
  { value: 'yoga', emoji: '🧘', label: 'Yoga' },
  { value: 'pilates-reformer', emoji: '🏋️', label: 'Pilates / Reformer' },
  { value: 'course-pied', emoji: '🏃', label: 'Course à pied' },
  { value: 'cyclisme', emoji: '🚴', label: 'Cyclisme' },
  { value: 'tennis', emoji: '🎾', label: 'Tennis' },
  { value: 'football', emoji: '⚽', label: 'Football' },
  { value: 'natation', emoji: '🏊', label: 'Natation' },
  { value: 'hiit', emoji: '⚡', label: 'HIIT' },
  { value: 'musculation', emoji: '💪', label: 'Musculation' },
  { value: 'autre', emoji: '🏃', label: 'Autre' },
];

const levelOptions: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'débutant', label: 'Débutant', description: 'Je commence ou reprends le sport' },
  { value: 'intermédiaire', label: 'Intermédiaire', description: "J'ai une pratique régulière" },
  { value: 'avancé', label: 'Avancé', description: 'Je m\'entraîne intensément' },
];

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { profile, userName, completeOnboarding } = useStore();
  const initialName = (userName ?? profile.name) === 'Utilisateur'
    ? (userName ?? '').split(' ')[0] || ''
    : (userName ?? profile.name).split(' ')[0];

  const [step, setStep] = useState(1);

  // Step 1
  const [firstName, setFirstName] = useState(initialName);

  // Step 2
  const [gender, setGender] = useState<Gender>(profile.gender ?? 'homme');
  const [age, setAge] = useState(String(profile.age ?? 30));

  // Step 3
  const [height, setHeight] = useState(String(profile.heightCm ?? 170));
  const [weight, setWeight] = useState(String(profile.weightKg ?? 70));
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeightKg ?? 65));

  // Step 4
  const [goal, setGoal] = useState<Goal>(profile.fitnessGoal ?? 'perte-poids');

  // Step 5
  const [workoutType, setWorkoutType] = useState<WorkoutType>(profile.workoutType ?? 'calisthenics');

  // Step 6
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(profile.fitnessLevel ?? 'débutant');

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const weightNum = parseFloat(weight) || 70;
  const heightNum = parseFloat(height) || 170;
  const ageNum = parseInt(age, 10) || 30;
  const targetWeightNum = parseFloat(targetWeight) || 65;

  // Compute derived values for summary (step 6)
  const bmr =
    gender === 'femme'
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;

  const activityMultiplier =
    fitnessLevel === 'débutant' ? 1.375 : fitnessLevel === 'intermédiaire' ? 1.55 : 1.725;
  const tdee = Math.round(bmr * activityMultiplier);

  const calorieTarget =
    goal === 'perte-poids'
      ? Math.max(tdee - 500, 1200)
      : goal === 'prise-muscle'
      ? tdee + 250
      : goal === 'endurance'
      ? tdee + 100
      : tdee;

  const proteinTarget = Math.round(
    goal === 'perte-poids'
      ? weightNum * 2.0
      : goal === 'prise-muscle'
      ? weightNum * 2.2
      : goal === 'endurance'
      ? weightNum * 1.6
      : weightNum * 1.8
  );

  const handleFinish = () => {
    completeOnboarding({
      name: firstName || profile.name,
      gender,
      age: ageNum,
      heightCm: heightNum,
      weightKg: weightNum,
      targetWeightKg: targetWeightNum,
      fitnessGoal: goal,
      workoutType,
      fitnessLevel,
      dailyCalorieTarget: calorieTarget,
      dailyProteinTarget: proteinTarget,
    });
    onComplete();
  };

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div
      className="min-h-dvh flex flex-col px-4 py-6"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: '#8E8E93' }}>
          <span>Étape {step} / {TOTAL_STEPS}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: '#2C2C2E' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: '#FF6B35' }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Bienvenue sur FitLife !</h1>
              <p style={{ color: '#8E8E93' }} className="text-sm leading-relaxed">
                Quelques questions pour personnaliser votre expérience.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                Votre prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                className="w-full rounded-xl px-4 py-3 text-white text-base outline-none border-0"
                style={{ backgroundColor: '#1C1C1E' }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">À votre sujet</h1>
              <p style={{ color: '#8E8E93' }} className="text-sm">
                Ces informations nous permettent de calibrer vos objectifs.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                Genre
              </label>
              <div className="flex gap-3">
                {(['homme', 'femme', 'autre'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: gender === g ? '#FF6B35' : '#1C1C1E',
                      color: gender === g ? '#fff' : '#8E8E93',
                    }}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                Âge
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="10"
                  max="100"
                  className="flex-1 rounded-xl px-4 py-3 text-white text-base outline-none border-0"
                  style={{ backgroundColor: '#1C1C1E' }}
                />
                <span style={{ color: '#8E8E93' }} className="text-sm">ans</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Vos mensurations</h1>
              <p style={{ color: '#8E8E93' }} className="text-sm">
                Pour calculer votre IMC et vos besoins caloriques.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                  Taille
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="100"
                    max="250"
                    className="flex-1 rounded-xl px-4 py-3 text-white text-base outline-none border-0"
                    style={{ backgroundColor: '#1C1C1E' }}
                  />
                  <span style={{ color: '#8E8E93' }} className="text-sm">cm</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                  Poids actuel
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="30"
                    max="300"
                    step="0.1"
                    className="flex-1 rounded-xl px-4 py-3 text-white text-base outline-none border-0"
                    style={{ backgroundColor: '#1C1C1E' }}
                  />
                  <span style={{ color: '#8E8E93' }} className="text-sm">kg</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                  Poids cible
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    min="30"
                    max="300"
                    step="0.1"
                    className="flex-1 rounded-xl px-4 py-3 text-white text-base outline-none border-0"
                    style={{ backgroundColor: '#1C1C1E' }}
                  />
                  <span style={{ color: '#8E8E93' }} className="text-sm">kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Votre objectif principal</h1>
              <p style={{ color: '#8E8E93' }} className="text-sm">
                Choisissez ce qui vous motive le plus.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all"
                  style={{
                    backgroundColor: goal === opt.value ? '#FF6B35' : '#1C1C1E',
                    border: goal === opt.value ? '2px solid #FF6B35' : '2px solid transparent',
                  }}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: goal === opt.value ? '#fff' : '#8E8E93' }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Votre activité préférée</h1>
              <p style={{ color: '#8E8E93' }} className="text-sm">
                Sélectionnez votre sport principal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {activityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setWorkoutType(opt.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all"
                  style={{
                    backgroundColor: workoutType === opt.value ? '#FF6B35' : '#1C1C1E',
                    border: workoutType === opt.value ? '2px solid #FF6B35' : '2px solid transparent',
                  }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: workoutType === opt.value ? '#fff' : '#8E8E93' }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Votre niveau</h1>
              <p style={{ color: '#8E8E93' }} className="text-sm">
                Pour adapter l'intensité de votre programme.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {levelOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFitnessLevel(opt.value)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{
                    backgroundColor: fitnessLevel === opt.value ? '#FF6B35' : '#1C1C1E',
                    border: fitnessLevel === opt.value ? '2px solid #FF6B35' : '2px solid transparent',
                  }}
                >
                  <div className="flex-1">
                    <p
                      className="font-semibold"
                      style={{ color: fitnessLevel === opt.value ? '#fff' : '#fff' }}
                    >
                      {opt.label}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: fitnessLevel === opt.value ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}
                    >
                      {opt.description}
                    </p>
                  </div>
                  {fitnessLevel === opt.value && (
                    <span className="text-white font-bold text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ backgroundColor: '#1C1C1E' }}
            >
              <p className="text-white font-semibold mb-3">Vos objectifs calculés</p>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8E8E93' }}>Calories cibles</span>
                <span className="text-white font-bold">{calorieTarget} kcal/j</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8E8E93' }}>Protéines cibles</span>
                <span className="text-white font-bold">{proteinTarget} g/j</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8E8E93' }}>TDEE estimé</span>
                <span className="text-white font-bold">{tdee} kcal/j</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={step === TOTAL_STEPS ? handleFinish : goNext}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {step === TOTAL_STEPS ? 'Commencer' : 'Continuer'}
        </button>

        {step > 1 && (
          <button
            onClick={goPrev}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-all"
            style={{ color: '#8E8E93', backgroundColor: '#1C1C1E' }}
          >
            Précédent
          </button>
        )}
      </div>
    </div>
  );
}
