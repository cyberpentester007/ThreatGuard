import axios from "axios";

interface OpenCTIConfig {
  url: string;
  token: string;
}

export class OpenCTIService {
  private config: OpenCTIConfig;

  constructor(config: OpenCTIConfig) {
    this.config = config;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.config.token}`,
      "Content-Type": "application/json",
    };
  }

  async query(query: string, variables = {}) {
    const response = await axios.post(
      `${this.config.url}/graphql`,
      { query, variables },
      { headers: this.headers },
    );
    return response.data;
  }

  async getThreats(first = 50) {
    const query = `
      query Threats($first: Int) {
        threats(first: $first) {
          edges {
            node {
              id
              name
              description
              created_at
              updated_at
              confidence
              threat_actor_types
              primary_motivation
              resource_level
              objectLabel {
                edges {
                  node {
                    value
                  }
                }
              }
            }
          }
        }
      }
    `;
    return this.query(query, { first });
  }

  async getIndicators(first = 50) {
    const query = `
      query Indicators($first: Int) {
        indicators(first: $first) {
          edges {
            node {
              id
              name
              description
              pattern
              pattern_type
              valid_from
              valid_until
              x_opencti_score
              created_at
              objectMarking {
                edges {
                  node {
                    definition
                  }
                }
              }
            }
          }
        }
      }
    `;
    return this.query(query, { first });
  }

  async createIndicator(input: any) {
    const query = `
      mutation CreateIndicator($input: IndicatorAddInput!) {
        indicatorAdd(input: $input) {
          id
          name
          description
          pattern
          pattern_type
        }
      }
    `;
    return this.query(query, { input });
  }

  async getRelationships(first = 50) {
    const query = `
      query Relationships($first: Int) {
        relationships(first: $first) {
          edges {
            node {
              id
              relationship_type
              confidence
              from {
                ... on BasicObject {
                  id
                  entity_type
                }
              }
              to {
                ... on BasicObject {
                  id
                  entity_type
                }
              }
            }
          }
        }
      }
    `;
    return this.query(query, { first });
  }
}
