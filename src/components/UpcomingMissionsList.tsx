import type { MissionLike } from "@/lib/types";
import { STATUS_ICONS } from "@/lib/types";
import { formatMissionDates } from "@/lib/missions";

export function UpcomingMissionsList<T extends MissionLike>({
  missions,
  onSelect,
}: {
  missions: T[];
  onSelect?: (mission: T) => void;
}) {
  if (missions.length === 0) {
    return <p className="text-sm text-neutral-400">Aucune mission à venir.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {missions.map((m) => (
        <li key={m.id}>
          <button
            onClick={() => onSelect?.(m)}
            disabled={!onSelect}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-neutral-50 disabled:active:bg-transparent"
          >
            <span className="text-xl leading-none" aria-hidden>
              {STATUS_ICONS[m.status]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{m.destination}</span>
              <span className="block text-sm text-neutral-500">
                {formatMissionDates(m)}
                {m.is_approximate && " · approximatif"}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
