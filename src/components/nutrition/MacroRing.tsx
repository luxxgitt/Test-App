interface MacroRingProps {
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
  fat: number;
  fatTarget: number;
  carbs: number;
  carbsTarget: number;
}

function RingProgress({
  value,
  max,
  size = 160,
  strokeWidth = 14,
  color,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#2C2C2E"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

function MacroBar({ label, value, target, unit, color }: MacroBarProps) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="text-white font-semibold">
          {Math.round(value)}{unit}
          <span className="text-text-secondary font-normal"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#2C2C2E] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function MacroRing({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  fat,
  fatTarget,
  carbs,
  carbsTarget,
}: MacroRingProps) {
  const remaining = Math.max(calorieTarget - calories, 0);

  return (
    <div className="flex flex-col items-center gap-6">
      <RingProgress value={calories} max={calorieTarget} size={180} strokeWidth={16} color="#FF6B35">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white">{Math.round(calories)}</span>
          <span className="text-xs text-text-secondary">kcal</span>
          <span className="text-sm font-semibold mt-1" style={{ color: remaining > 0 ? '#34C759' : '#FF3B30' }}>
            {remaining > 0 ? `${remaining} restants` : 'Objectif atteint'}
          </span>
        </div>
      </RingProgress>

      <div className="w-full flex flex-col gap-3">
        <MacroBar
          label="Protéines"
          value={protein}
          target={proteinTarget}
          unit="g"
          color="#007AFF"
        />
        <MacroBar
          label="Lipides"
          value={fat}
          target={fatTarget}
          unit="g"
          color="#FF6B35"
        />
        <MacroBar
          label="Glucides"
          value={carbs}
          target={carbsTarget}
          unit="g"
          color="#AF52DE"
        />
      </div>
    </div>
  );
}
