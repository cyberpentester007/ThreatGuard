import { Client } from "@elastic/elasticsearch";
import type { Threat, ThreatIndicator } from "@/types/schema";

export class ElasticsearchService {
  private client: Client;
  private readonly threatIndex = "threats";
  private readonly indicatorIndex = "indicators";

  constructor(config: {
    node: string;
    auth?: { username: string; password: string };
  }) {
    this.client = new Client(config);
  }

  async indexThreat(threat: Threat) {
    await this.client.index({
      index: this.threatIndex,
      id: threat.id,
      document: threat,
    });
  }

  async indexIndicator(indicator: ThreatIndicator) {
    await this.client.index({
      index: this.indicatorIndex,
      id: indicator.id,
      document: indicator,
    });
  }

  async searchThreats(query: string, filters?: Record<string, any>) {
    const should = [
      { match: { title: { query, boost: 2 } } },
      { match: { description: { query, boost: 1.5 } } },
      { match: { tags: { query, boost: 1 } } },
    ];

    const must = [];
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        must.push({ term: { [key]: value } });
      });
    }

    const response = await this.client.search({
      index: this.threatIndex,
      query: {
        bool: {
          should,
          must,
          minimum_should_match: 1,
        },
      },
    });

    return response.hits.hits.map((hit) => hit._source as Threat);
  }

  async searchIndicators(pattern: string) {
    const response = await this.client.search({
      index: this.indicatorIndex,
      query: {
        multi_match: {
          query: pattern,
          fields: ["value^2", "type"],
        },
      },
    });

    return response.hits.hits.map((hit) => hit._source as ThreatIndicator);
  }
}
