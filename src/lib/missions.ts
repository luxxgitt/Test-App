import { randomBytes } from "crypto";
import type { Mission, MissionStatus, SharedMission } from "@/lib/types";

/** Cryptographically random, URL-safe share token (256 bits of entropy). */
export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function parseISODate(iso: string): Date {
  const parts = iso.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDay(iso: string): { day: number; month: string } {
  const date = parseISODate(iso);
  return { day: date.getUTCDate(), month: MONTHS_FR[date.getUTCMonth()]! };
}

/** "12 → 15 septembre" / "28 septembre → 3 octobre" / "12 septembre" for single-day trips. */
export function formatDateRange(startISO: string, endISO: string): string {
  const start = formatDay(startISO);
  const end = formatDay(endISO);

  if (startISO === endISO) {
    return `${start.day} ${start.month}`;
  }
  if (start.month === end.month) {
    return `${start.day} → ${end.day} ${end.month}`;
  }
  return `${start.day} ${start.month} → ${end.day} ${end.month}`;
}

/** Prefers the approximate label when the mission's dates are a best guess. */
export function formatMissionDates(mission: Pick<Mission | SharedMission, "start_date" | "end_date" | "is_approximate" | "approx_label">): string {
  if (mission.is_approximate && mission.approx_label) {
    return mission.approx_label;
  }
  return formatDateRange(mission.start_date, mission.end_date);
}

export const STATUS_ORDER: Record<MissionStatus, number> = {
  confirmed: 0,
  probable: 1,
  possible: 2,
  cancelled: 3,
};
