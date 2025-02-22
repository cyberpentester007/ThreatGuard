import axios from "axios";
import { Threat } from "@/types/schema";
import { FreeFeedsService } from "./feeds/free-feeds";
import { AlienVaultFeed } from "./feeds/alienvault";

interface GeoIPResponse {
  ip: string;
  latitude: number;
  longitude: number;
  country_name: string;
  city: string;
  region: string;
  asn: string;
  org: string;
}

export class ThreatFeedService {
  private freeFeeds: FreeFeedsService;
  private alienVault: AlienVaultFeed;

  constructor() {
    this.freeFeeds = new FreeFeedsService();
    this.alienVault = new AlienVaultFeed();
  }

  private async enrichWithGeoIP(ip: string): Promise<GeoIPResponse> {
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      return response.data;
    } catch (error) {
      console.error(`Error enriching IP ${ip} with geo data:`, error);
      return {
        ip,
        latitude: 0,
        longitude: 0,
        country_name: "Unknown",
        city: "Unknown",
        region: "Unknown",
        asn: "Unknown",
        org: "Unknown",
      };
    }
  }

  async fetchFeeds(): Promise<Threat[]> {
    try {
      const results = await Promise.allSettled([
        this.freeFeeds.fetchFeeds(),
        this.alienVault.getPulses(),
      ]);

      const threats = results
        .filter(
          (result): result is PromiseFulfilledResult<Threat[]> =>
            result.status === "fulfilled",
        )
        .flatMap((result) => result.value);

      return this.deduplicateThreats(threats);
    } catch (error) {
      console.error("Error fetching threat feeds:", error);
      return [];
    }
  }

  private deduplicateThreats(threats: Threat[]): Threat[] {
    const seen = new Set<string>();
    return threats.filter((threat) => {
      const key = `${threat.type}-${threat.indicators.map((i) => i.value).join()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
