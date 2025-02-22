import axios from "axios";
import type { Threat } from "@/types/schema";

export class AbuseIPDBFeed {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.abuseipdb.com/api/v2";

  constructor(apiKey: string = "") {
    this.apiKey = apiKey;
  }

  async getBlacklist(): Promise<Threat[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/blacklist`, {
        headers: {
          Key: this.apiKey,
          Accept: "application/json",
        },
        params: {
          confidenceMinimum: 90,
          limit: 1000,
        },
      });

      return response.data.data.map((item: any) => ({
        id: `abuseipdb-${item.ipAddress}`,
        title: `Malicious IP - ${item.ipAddress}`,
        description: `IP address reported for abuse ${item.totalReports} times`,
        severity:
          item.abuseConfidenceScore > 90
            ? "Critical"
            : item.abuseConfidenceScore > 80
              ? "High"
              : "Medium",
        type: "malicious-ip",
        source: "AbuseIPDB",
        timestamp: new Date().toISOString(),
        location: {
          lat: item.latitude || 0,
          lng: item.longitude || 0,
          region: `${item.countryCode || "Unknown"}`,
        },
        indicators: [{ type: "ip", value: item.ipAddress }],
        tags: ["abuse", "malicious-ip", item.countryCode?.toLowerCase()].filter(
          Boolean,
        ),
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching AbuseIPDB data:", error);
      return [];
    }
  }
}
