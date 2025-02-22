import axios from "axios";
import type { StixObject } from "./stix";

interface TaxiiConfig {
  url: string;
  apiRoot: string;
  collection: string;
  version: "2.0" | "2.1";
  auth?: {
    username: string;
    password: string;
  };
}

export class TaxiiService {
  private config: TaxiiConfig;
  private baseURL: string;

  constructor(config: TaxiiConfig) {
    this.config = config;
    this.baseURL = `${config.url}/${config.apiRoot}`;
  }

  private async getHeaders() {
    const headers: Record<string, string> = {
      Accept: "application/taxii+json;version=2.1",
      "Content-Type": "application/taxii+json;version=2.1",
    };

    if (this.config.auth) {
      const { username, password } = this.config.auth;
      const token = btoa(`${username}:${password}`);
      headers["Authorization"] = `Basic ${token}`;
    }

    return headers;
  }

  async getObjects(): Promise<StixObject[]> {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `${this.baseURL}/collections/${this.config.collection}/objects/`,
      { headers },
    );
    return response.data.objects;
  }

  async addObject(object: StixObject): Promise<void> {
    const headers = await this.getHeaders();
    await axios.post(
      `${this.baseURL}/collections/${this.config.collection}/objects/`,
      { objects: [object] },
      { headers },
    );
  }

  async getCollections(): Promise<any[]> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.baseURL}/collections/`, {
      headers,
    });
    return response.data.collections;
  }
}
