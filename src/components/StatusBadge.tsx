import { STATUS_ICONS, STATUS_LABELS, type MissionStatus } from "@/lib/types";

export function StatusBadge({
  status,
  className = "",
}: {
  status: MissionStatus;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span aria-hidden>{STATUS_ICONS[status]}</span>
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
}
