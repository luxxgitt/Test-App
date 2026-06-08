import { useEffect, useState, useCallback } from 'react';

// ── Duration timer (for exercises measured in seconds) ────────────────────────

interface DurationTimerProps {
  seconds: number;
  onComplete: () => void;
}

export function DurationTimer({ seconds, onComplete }: DurationTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  const handleComplete = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) { handleComplete(); return; }
    const t = setInterval(() => setRemaining((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [remaining, running, handleComplete]);

  const size = 160;
  const sw = 12;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = running ? remaining / seconds : 1;
  const offset = circ - progress * circ;
  const almost = running && remaining <= 5;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2C2C2E" strokeWidth={sw} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={almost ? '#FF3B30' : '#FF6B35'}
            strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold tabular-nums ${almost ? 'text-red-400' : 'text-white'}`}>
            {remaining > 0 ? remaining : '✓'}
          </span>
          <span className="text-text-secondary text-xs mt-1">
            {running ? 'secondes' : `${seconds}s`}
          </span>
        </div>
      </div>

      {!running && (
        <button
          onClick={() => setRunning(true)}
          className="px-10 py-3 rounded-2xl font-bold text-white text-base"
          style={{ backgroundColor: '#FF6B35' }}
        >
          ▶ Commencer
        </button>
      )}
    </div>
  );
}

// ── Rep metronome (for rep-based exercises) ───────────────────────────────────

interface RepMetronomeProps {
  reps: number;
  repDurationSeconds?: number; // seconds per rep for the beat
}

export function RepMetronome({ reps, repDurationSeconds = 2 }: RepMetronomeProps) {
  const [beat, setBeat] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (currentRep >= reps) return;

    const t = setInterval(() => {
      setBeat(true);
      if ('vibrate' in navigator) navigator.vibrate(40);
      setTimeout(() => setBeat(false), 150);
      setCurrentRep((p) => {
        if (p + 1 >= reps) {
          setRunning(false);
          if ('vibrate' in navigator) setTimeout(() => navigator.vibrate([200, 80, 200]), 200);
        }
        return p + 1;
      });
    }, repDurationSeconds * 1000);

    return () => clearInterval(t);
  }, [running, currentRep, reps, repDurationSeconds]);

  const handleStart = () => {
    setCurrentRep(0);
    setRunning(true);
  };

  const done = currentRep >= reps && reps > 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Rep counter */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold tabular-nums" style={{ color: done ? '#34C759' : '#FF6B35' }}>
          {currentRep}
        </span>
        <span className="text-2xl font-bold text-white/40">/ {reps}</span>
      </div>
      <span className="text-text-secondary text-xs -mt-1">répétitions</span>

      {/* Beat circle */}
      <div
        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-100 ${
          beat
            ? 'scale-110 border-accent bg-accent/20'
            : done
            ? 'border-green-500/50 bg-green-500/10'
            : running
            ? 'border-white/20'
            : 'border-white/10'
        }`}
      >
        {done ? (
          <span className="text-2xl">✓</span>
        ) : running ? (
          <span className="text-white text-xs font-medium">
            {repDurationSeconds}s
          </span>
        ) : (
          <button onClick={handleStart} className="text-text-secondary text-xs font-medium">
            START
          </button>
        )}
      </div>

      <p className="text-text-secondary text-xs text-center">
        {done
          ? 'Toutes les répétitions complètes !'
          : running
          ? `Rythme : 1 rép. toutes les ${repDurationSeconds}s`
          : 'Appuyer pour démarrer le rythme'}
      </p>
    </div>
  );
}
