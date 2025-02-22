import axios from "axios";
import type { Threat } from "@/types/schema";

export class VirusTotalFeed {
  private readonly apiKey: string;
  private readonly baseUrl = "https://www.virustotal.com/vtapi/v2";

  constructor(apiKey: string = "") {
    this.apiKey = apiKey;
  }

  async getLatestDetections(): Promise<Threat[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/file/reports`, {
        params: {
          apikey: this.apiKey,
          allinfo: true,
        },
      });

      return response.data.data.map((item: any) => ({
        id: `virustotal-${item.sha256}`,
        title: `Malware Detection - ${item.name || item.sha256}`,
        description: `Detected by ${item.positives} out of ${item.total} engines`,
        severity:
          item.positives > 20
            ? "Critical"
            : item.positives > 10
              ? "High"
              : "Medium",
        type: "malware",
        source: "VirusTotal",
        timestamp: new Date(item.scan_date).toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [
          { type: "hash-sha256", value: item.sha256 },
          { type: "hash-md5", value: item.md5 },
        ],
        tags: ["malware", "virustotal"],
        status: "active",
        created_at: new Date(item.scan_date).toISOString(),
        updated_at: new Date(item.scan_date).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching VirusTotal data:", error);
      return [];
    }
  }
}
