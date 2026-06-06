import { useStore, PROFILE_COLORS } from '../store/useStore';

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileSwitcher() {
  const { profiles, activeProfileId, switchProfile } = useStore();

  if (profiles.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {profiles.map((p, i) => {
        const color = PROFILE_COLORS[i % PROFILE_COLORS.length];
        const isActive = p.id === activeProfileId;
        return (
          <button
            key={p.id}
            onClick={() => switchProfile(p.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              backgroundColor: isActive ? color + '33' : '#2C2C2E',
              color: isActive ? color : '#8E8E93',
              border: `2px solid ${isActive ? color : 'transparent'}`,
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: color + '44', color }}
            >
              {initials(p.info.name)}
            </span>
            {p.info.name.split(' ')[0]}
          </button>
        );
      })}
    </div>
  );
}
