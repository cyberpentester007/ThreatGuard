import axios from "axios";
import type { Threat, ThreatSeverity } from "@/types/schema";

export class FreeFeedsService {
  private readonly feeds = {
    // Malware & URL Feeds
    urlhaus: "https://urlhaus-api.abuse.ch/v1/urls/recent/",
    openphish: "https://openphish.com/feed.txt",
    phishTank: "http://data.phishtank.com/data/online-valid.json",
    malwareBazaar: "https://mb-api.abuse.ch/api/v1/",

    // IP Reputation Feeds
    blocklistde: "https://lists.blocklist.de/lists/all.txt",
    emergingThreats:
      "https://rules.emergingthreats.net/blockrules/compromised-ips.txt",
    greensnow: "https://blocklist.greensnow.co/greensnow.txt",
    cinsscore: "https://cinsscore.com/list/ci-badguys.txt",

    // Botnet & C2 Feeds
    feodo: "https://feodotracker.abuse.ch/downloads/ipblocklist.txt",
    sslbl: "https://sslbl.abuse.ch/blacklist/sslipblacklist.txt",

    // Tor Exit Nodes
    torExitNodes: "https://check.torproject.org/torbulkexitlist",

    // Ransomware Feeds
    ransomwareTracker: "https://ransomwaretracker.abuse.ch/feeds/csv/",
  };

  async fetchFeeds(): Promise<Threat[]> {
    try {
      const results = await Promise.allSettled([
        this.fetchUrlHaus(),
        this.fetchBlocklistDE(),
        this.fetchEmergingThreats(),
        this.fetchOpenPhish(),
        this.fetchFeodoTracker(),
        this.fetchTorExitNodes(),
        this.fetchGreenSnow(),
        this.fetchCINSscore(),
        this.fetchSSLBlacklist(),
        this.fetchMalwareBazaar(),
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

  private async fetchUrlHaus(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.urlhaus);
      return response.data.urls?.map((item: any) => ({
        id: `urlhaus-${item.id}`,
        title: `Malicious URL - ${item.url}`,
        description: `Malware URL: ${item.url} (Type: ${item.threat})`,
        description: `Malware URL: ${item.url} (Type: ${item.threat})`,
        severity: "High" as ThreatSeverity,
        type: "malware-url",
        source: "URLhaus",
        timestamp: new Date(item.date_added).toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "url", value: item.url }],
        tags: ["malware", "urlhaus", item.threat],
        status: "active",
        created_at: new Date(item.date_added).toISOString(),
        updated_at: new Date(item.date_added).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching URLhaus data:", error);
      return [];
    }
  }

  private async fetchBlocklistDE(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.blocklistde);
      const ips = response.data.split("\n").filter(Boolean);

      return ips.map((ip: string) => ({
        id: `blocklistde-${ip}`,
        title: `Malicious IP - ${ip}`,
        description: `IP address reported for malicious activity`,
        severity: "Medium" as ThreatSeverity,
        type: "malicious-ip",
        source: "Blocklist.de",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["abuse", "malicious-ip"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching Blocklist.de data:", error);
      return [];
    }
  }

  private async fetchEmergingThreats(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.emergingThreats);
      const ips = response.data
        .split("\n")
        .filter(Boolean)
        .filter((line: string) => !line.startsWith("#"));

      return ips.map((ip: string) => ({
        id: `et-${ip}`,
        title: `Compromised IP - ${ip}`,
        description: `IP identified in malicious activity by Emerging Threats`,
        severity: "High" as ThreatSeverity,
        type: "compromised-ip",
        source: "Emerging Threats",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["compromised", "emerging-threats"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching Emerging Threats data:", error);
      return [];
    }
  }

  private async fetchOpenPhish(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.openphish);
      const urls = response.data.split("\n").filter(Boolean);

      return urls.map((url: string) => ({
        id: `openphish-${Buffer.from(url).toString("base64")}`,
        title: `Phishing URL - ${new URL(url).hostname}`,
        description: `Active phishing site identified by OpenPhish`,
        severity: "High" as ThreatSeverity,
        type: "phishing",
        source: "OpenPhish",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "url", value: url }],
        tags: ["phishing", "openphish"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching OpenPhish data:", error);
      return [];
    }
  }

  private async fetchFeodoTracker(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.feodo);
      const ips = response.data
        .split("\n")
        .filter(Boolean)
        .filter((line: string) => !line.startsWith("#"));

      return ips.map((ip: string) => ({
        id: `feodo-${ip}`,
        title: `Botnet C2 - ${ip}`,
        description: `IP associated with Feodo/Emotet/Dridex botnet C2 server`,
        severity: "Critical" as ThreatSeverity,
        type: "c2-server",
        source: "Feodo Tracker",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["botnet", "c2", "feodo"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching Feodo Tracker data:", error);
      return [];
    }
  }

  private async fetchGreenSnow(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.greensnow);
      const ips = response.data.split("\n").filter(Boolean);

      return ips.map((ip: string) => ({
        id: `greensnow-${ip}`,
        title: `Malicious IP - ${ip}`,
        description: `IP address identified in malicious activities by GreenSnow`,
        severity: "High" as ThreatSeverity,
        type: "malicious-ip",
        source: "GreenSnow",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["malicious", "greensnow"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching GreenSnow data:", error);
      return [];
    }
  }

  private async fetchCINSscore(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.cinsscore);
      const ips = response.data.split("\n").filter(Boolean);

      return ips.map((ip: string) => ({
        id: `cinsscore-${ip}`,
        title: `Malicious IP - ${ip}`,
        description: `IP address identified in malicious activities by CINSscore`,
        severity: "Medium" as ThreatSeverity,
        type: "malicious-ip",
        source: "CINSscore",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["malicious", "cinsscore"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching CINSscore data:", error);
      return [];
    }
  }

  private async fetchSSLBlacklist(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.sslbl);
      const ips = response.data
        .split("\n")
        .filter(Boolean)
        .filter((line: string) => !line.startsWith("#"));

      return ips.map((ip: string) => ({
        id: `sslbl-${ip}`,
        title: `SSL Blacklisted IP - ${ip}`,
        description: `IP associated with malicious SSL certificates`,
        severity: "High" as ThreatSeverity,
        type: "ssl-blacklist",
        source: "SSL Blacklist",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["ssl", "blacklist"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching SSL Blacklist data:", error);
      return [];
    }
  }

  private async fetchMalwareBazaar(): Promise<Threat[]> {
    try {
      const response = await axios.post(this.feeds.malwareBazaar, {
        query: "get_recent",
        selector: "time",
      });

      return response.data.data.map((item: any) => ({
        id: `malwarebazaar-${item.sha256_hash}`,
        title: `Malware - ${item.file_name || item.sha256_hash}`,
        description: `Malware sample: ${item.signature || "Unknown"} (Type: ${item.file_type})`,
        severity: "Critical" as ThreatSeverity,
        type: "malware",
        source: "MalwareBazaar",
        timestamp: new Date(item.first_seen).toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [
          { type: "hash", value: item.sha256_hash },
          { type: "filename", value: item.file_name },
        ],
        tags: [
          "malware",
          item.file_type.toLowerCase(),
          item.signature?.toLowerCase(),
        ].filter(Boolean),
        status: "active",
        created_at: new Date(item.first_seen).toISOString(),
        updated_at: new Date(item.last_seen).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching MalwareBazaar data:", error);
      return [];
    }
  }

  private async fetchTorExitNodes(): Promise<Threat[]> {
    try {
      const response = await axios.get(this.feeds.torExitNodes);
      const ips = response.data
        .split("\n")
        .filter(Boolean)
        .filter((line: string) => !line.startsWith("#"));

      return ips.map((ip: string) => ({
        id: `tor-${ip}`,
        title: `Tor Exit Node - ${ip}`,
        description: `Active Tor exit node`,
        severity: "Low" as ThreatSeverity,
        type: "anonymity",
        source: "Tor Project",
        timestamp: new Date().toISOString(),
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [{ type: "ip", value: ip }],
        tags: ["tor", "anonymity"],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching Tor exit nodes:", error);
      return [];
    }
  }
}
