export type MissionStatus = "possible" | "probable" | "confirmed" | "cancelled";

export interface Mission {
  id: string;
  owner_id: string;
  destination: string;
  start_date: string; // ISO date, e.g. "2026-09-12"
  end_date: string;
  is_approximate: boolean;
  approx_label: string | null;
  status: MissionStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** Minimal shape shared by calendar/list display components. */
export interface MissionLike {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  is_approximate: boolean;
  approx_label: string | null;
  status: MissionStatus;
}

/** Shape returned by the public get_shared_missions() RPC — intentionally narrow. */
export type SharedMission = MissionLike;

export interface Database {
  public: {
    Tables: {
      missions: {
        Row: Mission;
        Insert: Partial<Mission> &
          Pick<Mission, "owner_id" | "destination" | "start_date" | "end_date">;
        Update: Partial<Mission>;
        Relationships: [];
      };
      share_links: {
        Row: { owner_id: string; token: string; created_at: string };
        Insert: { owner_id: string; token: string };
        Update: { token?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_shared_missions: {
        Args: { p_token: string };
        Returns: SharedMission[];
      };
    };
  };
}

export const STATUS_LABELS: Record<MissionStatus, string> = {
  possible: "Possible",
  probable: "Probable",
  confirmed: "Confirmé",
  cancelled: "Annulé",
};

export const STATUS_ICONS: Record<MissionStatus, string> = {
  possible: "⚪",
  probable: "🟡",
  confirmed: "🟢",
  cancelled: "❌",
};
