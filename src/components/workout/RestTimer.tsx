import { useEffect, useState } from 'react';

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
}

export default function RestTimer({ seconds, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const progress = (remaining / seconds) * 100;
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const isAlmostDone = remaining <= 5;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2C2C2E"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isAlmostDone ? '#FF3B30' : '#34C759'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {remaining > 0 ? (
            <>
              <span
                className={`text-4xl font-bold ${isAlmostDone ? 'text-red-400' : 'text-white'}`}
              >
                {remaining}
              </span>
              <span className="text-text-secondary text-xs">secondes</span>
            </>
          ) : (
            <span className="text-success text-lg font-bold">C\'est parti !</span>
          )}
        </div>
      </div>
      <p className="text-text-secondary text-sm font-medium">
        {remaining > 0 ? 'Temps de repos' : 'Récupération terminée'}
      </p>
    </div>
  );
}
