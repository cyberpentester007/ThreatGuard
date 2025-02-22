import { supabase } from "./supabase";
import {
  Threat,
  SavedSearch,
  ThreatFeedAlert,
  ThreatIndicator,
} from "@/types/schema";

// Threats API
export const threatsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("threats")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Threat[];
  },

  async search(query: string, filters: any = {}) {
    let queryBuilder = supabase.from("threats").select("*");

    if (filters.severity) {
      queryBuilder = queryBuilder.eq("severity", filters.severity);
    }

    if (filters.type) {
      queryBuilder = queryBuilder.eq("type", filters.type);
    }

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`,
      );
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data as Threat[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("threats")
      .select(
        `
        *,
        indicators:threat_indicators(*),
        relationships:threat_relationships(*)
      `,
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Threat & { indicators: ThreatIndicator[] };
  },
};

// Saved Searches API
export const savedSearchesApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as SavedSearch[];
  },

  async create(search: Omit<SavedSearch, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("saved_searches")
      .insert(search)
      .select()
      .single();
    if (error) throw error;
    return data as SavedSearch;
  },
};

// Alerts API
export const alertsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("threat_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ThreatFeedAlert[];
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from("threat_alerts")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  },
};

// Real-time subscriptions
export const subscribeToAlerts = (
  callback: (alert: ThreatFeedAlert) => void,
) => {
  return supabase
    .channel("threat_alerts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "threat_alerts",
      },
      (payload) => {
        callback(payload.new as ThreatFeedAlert);
      },
    )
    .subscribe();
};

export const subscribeToThreats = (callback: (threat: Threat) => void) => {
  return supabase
    .channel("threats")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "threats",
      },
      (payload) => {
        callback(payload.new as Threat);
      },
    )
    .subscribe();
};
