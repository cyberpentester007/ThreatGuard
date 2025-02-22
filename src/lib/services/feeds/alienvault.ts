import axios from "axios";
import type { Threat } from "@/types/schema";

export class AlienVaultFeed {
  private readonly apiKey: string;
  private readonly baseUrl = "https://otx.alienvault.com/api/v1";

  constructor(apiKey: string = "") {
    this.apiKey = apiKey;
  }

  async getPulses(): Promise<Threat[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/pulses/subscribed`, {
        headers: {
          "X-OTX-API-KEY": this.apiKey,
        },
      });

      return response.data.results.map((pulse: any) => ({
        id: `alienvault-${pulse.id}`,
        title: pulse.name,
        description: pulse.description,
        severity: this.mapThreatLevel(pulse.TLP),
        type: "pulse",
        source: "AlienVault OTX",
        timestamp: pulse.created,
        location: {
          lat: 0,
          lng: 0,
          region: "Unknown",
        },
        indicators: pulse.indicators.map((ind: any) => ({
          type: ind.type,
          value: ind.indicator,
        })),
        tags: [...pulse.tags, pulse.TLP?.toLowerCase()].filter(Boolean),
        status: "active",
        created_at: pulse.created,
        updated_at: pulse.modified,
      }));
    } catch (error) {
      console.error("Error fetching AlienVault data:", error);
      return [];
    }
  }

  private mapThreatLevel(tlp: string): "Critical" | "High" | "Medium" | "Low" {
    switch (tlp?.toUpperCase()) {
      case "RED":
        return "Critical";
      case "AMBER":
        return "High";
      case "GREEN":
        return "Medium";
      default:
        return "Low";
    }
  }
}
