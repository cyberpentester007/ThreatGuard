import axios from "axios";
import type { Threat } from "@/types/schema";

export class ThreatFoxFeed {
  private readonly apiKey: string;
  private readonly baseUrl = "https://threatfox-api.abuse.ch/api/v1";

  constructor(apiKey: string = "") {
    this.apiKey = apiKey;
  }

  async getRecentIOCs(): Promise<Threat[]> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          query: "get_recent",
          days: 1,
        },
        {
          headers: {
            "API-KEY": this.apiKey,
          },
        },
      );

      return response.data.data.map((ioc: any) => ({
        id: `threatfox-${ioc.id}`,
        title: `${ioc.ioc_type} - ${ioc.ioc}`,
        description: ioc.threat_type_desc || "Malicious indicator detected",
        severity: this.mapConfidence(ioc.confidence_level),
        type: ioc.threat_type,
        source: "ThreatFox",
        timestamp: new Date(ioc.first_seen * 1000).toISOString(),
        location: { lat: 0, lng: 0, region: ioc.reporter_country || "Unknown" },
        indicators: [{ type: ioc.ioc_type, value: ioc.ioc }],
        tags: [ioc.malware, ioc.threat_type.toLowerCase()],
        status: "active",
        created_at: new Date(ioc.first_seen * 1000).toISOString(),
        updated_at: new Date(ioc.last_seen * 1000).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching ThreatFox data:", error);
      return [];
    }
  }

  private mapConfidence(level: number): "Critical" | "High" | "Medium" | "Low" {
    if (level >= 90) return "Critical";
    if (level >= 70) return "High";
    if (level >= 50) return "Medium";
    return "Low";
  }
}
