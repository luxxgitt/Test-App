"use client";

import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import type { MissionLike, MissionStatus } from "@/lib/types";

const STATUS_COLOR_CLASS: Record<MissionStatus, string> = {
  possible: "!bg-neutral-200 !text-neutral-700",
  probable: "!bg-amber-200 !text-amber-900",
  confirmed: "!bg-emerald-200 !text-emerald-900",
  cancelled: "!bg-red-100 !text-red-400 !line-through",
};

function parseISO(iso: string): Date {
  const parts = iso.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d);
}

function eachDateInRange(startISO: string, endISO: string): Date[] {
  const dates: Date[] = [];
  const cur = parseISO(startISO);
  const end = parseISO(endISO);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function MissionCalendar<T extends MissionLike>({
  missions,
  onSelectDay,
}: {
  missions: T[];
  onSelectDay?: (missionsOnDay: T[]) => void;
}) {
  const [month, setMonth] = useState<Date>(new Date());

  const modifiers = useMemo(() => {
    const groups: Record<MissionStatus, Date[]> = {
      possible: [],
      probable: [],
      confirmed: [],
      cancelled: [],
    };
    for (const m of missions) {
      for (const d of eachDateInRange(m.start_date, m.end_date)) {
        groups[m.status].push(d);
      }
    }
    return groups;
  }, [missions]);

  function handleDayClick(date: Date) {
    if (!onSelectDay) return;
    const onDay = missions.filter((m) =>
      eachDateInRange(m.start_date, m.end_date).some((d) => sameDay(d, date))
    );
    if (onDay.length > 0) onSelectDay(onDay);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        onDayClick={handleDayClick}
        modifiers={modifiers}
        modifiersClassNames={STATUS_COLOR_CLASS}
        showOutsideDays
        weekStartsOn={1}
        className="mx-auto"
      />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-neutral-100 px-2 pb-1 pt-3 text-xs text-neutral-500">
        <Legend color="bg-neutral-200" label="Possible" />
        <Legend color="bg-amber-200" label="Probable" />
        <Legend color="bg-emerald-200" label="Confirmé" />
        <Legend color="bg-red-100" label="Annulé" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
