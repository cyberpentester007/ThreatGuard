export type ThreatSeverity = "Critical" | "High" | "Medium" | "Low";
export type AlertType = "critical" | "warning" | "info";

export interface Threat {
  id: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  type: string;
  source: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  indicators: {
    type: string;
    value: string;
  }[];
  tags: string[];
  status: "active" | "resolved" | "investigating";
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    severity?: string;
    date?: string;
    type?: string;
    [key: string]: any;
  };
}

export interface ThreatFeedAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  is_read: boolean;
}
