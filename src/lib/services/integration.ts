import { OpenCTIService } from "./opencti";
import { MispService } from "./misp";
import { TaxiiService } from "./taxii";
import { ElasticsearchService } from "./elasticsearch";
import { KafkaService } from "./kafka";
import type { Threat, ThreatIndicator } from "@/types/schema";

export class IntegrationService {
  private opencti: OpenCTIService;
  private misp: MispService;
  private taxii: TaxiiService;
  private elasticsearch: ElasticsearchService;
  private kafka: KafkaService;

  constructor(config: {
    opencti: { url: string; token: string };
    misp: { url: string; apiKey: string };
    taxii: {
      url: string;
      apiRoot: string;
      collection: string;
      version: "2.0" | "2.1";
      auth?: { username: string; password: string };
    };
    elasticsearch: {
      node: string;
      auth?: { username: string; password: string };
    };
    kafka: { brokers: string[]; clientId: string };
  }) {
    this.opencti = new OpenCTIService(config.opencti);
    this.misp = new MispService(config.misp);
    this.taxii = new TaxiiService(config.taxii);
    this.elasticsearch = new ElasticsearchService(config.elasticsearch);
    this.kafka = new KafkaService(config.kafka);
  }

  async initialize() {
    await this.kafka.initialize();
    // Set up real-time alert handling
    this.kafka.consumeAlerts(async (alert) => {
      await this.elasticsearch.indexThreat(alert as unknown as Threat);
    });
  }

  async aggregateThreats() {
    const [openctiThreats, mispEvents, taxiiObjects] = await Promise.all([
      this.opencti.getThreats(),
      this.misp.getEvents(),
      this.taxii.getObjects(),
    ]);

    // Transform and normalize data from different sources
    const threats = [
      ...this.transformOpenCTIThreats(openctiThreats),
      ...this.transformMISPEvents(mispEvents),
      ...this.transformTAXIIObjects(taxiiObjects),
    ];

    // Index aggregated threats in Elasticsearch
    await Promise.all(
      threats.map((threat) => this.elasticsearch.indexThreat(threat)),
    );

    return threats;
  }

  private transformOpenCTIThreats(threats: any[]): Threat[] {
    return threats.map((threat) => ({
      id: threat.id,
      title: threat.name,
      description: threat.description,
      severity: this.mapConfidenceToSeverity(threat.confidence),
      type: threat.threat_actor_types?.[0] || "unknown",
      source: "OpenCTI",
      timestamp: threat.created_at,
      location: { lat: 0, lng: 0, region: "Unknown" }, // Extract if available
      indicators: [],
      tags: threat.objectLabel?.edges?.map((e: any) => e.node.value) || [],
      status: "active",
      created_at: threat.created_at,
      updated_at: threat.updated_at,
    }));
  }

  private transformMISPEvents(events: any[]): Threat[] {
    return events.map((event) => ({
      id: event.uuid,
      title: event.info,
      description: event.description || "",
      severity: this.mapThreatLevelToSeverity(event.threat_level_id),
      type: event.type || "unknown",
      source: "MISP",
      timestamp: event.timestamp,
      location: { lat: 0, lng: 0, region: "Unknown" },
      indicators:
        event.Attribute?.map((attr: any) => ({
          type: attr.type,
          value: attr.value,
        })) || [],
      tags: event.Tag?.map((tag: any) => tag.name) || [],
      status: "active",
      created_at: event.date,
      updated_at: event.timestamp,
    }));
  }

  private transformTAXIIObjects(objects: any[]): Threat[] {
    return objects
      .filter(
        (obj) => obj.type === "threat-actor" || obj.type === "intrusion-set",
      )
      .map((obj) => ({
        id: obj.id,
        title: obj.name,
        description: obj.description,
        severity: this.mapConfidenceToSeverity(obj.confidence),
        type: obj.type,
        source: "TAXII",
        timestamp: obj.created,
        location: { lat: 0, lng: 0, region: "Unknown" },
        indicators: [],
        tags: obj.labels || [],
        status: "active",
        created_at: obj.created,
        updated_at: obj.modified,
      }));
  }

  private mapConfidenceToSeverity(
    confidence: number,
  ): "Critical" | "High" | "Medium" | "Low" {
    if (confidence >= 90) return "Critical";
    if (confidence >= 70) return "High";
    if (confidence >= 50) return "Medium";
    return "Low";
  }

  private mapThreatLevelToSeverity(
    level: number,
  ): "Critical" | "High" | "Medium" | "Low" {
    switch (level) {
      case 1:
        return "High";
      case 2:
        return "Medium";
      case 3:
        return "Low";
      case 4:
        return "Critical";
      default:
        return "Medium";
    }
  }
}
