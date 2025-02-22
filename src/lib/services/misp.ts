import axios from "axios";

interface MispConfig {
  url: string;
  apiKey: string;
}

export class MispService {
  private config: MispConfig;

  constructor(config: MispConfig) {
    this.config = config;
  }

  private get headers() {
    return {
      Authorization: this.config.apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  async getEvents(limit = 100): Promise<any[]> {
    const response = await axios.get(
      `${this.config.url}/events/index/limit:${limit}`,
      { headers: this.headers },
    );
    return response.data;
  }

  async getAttributes(eventId: string): Promise<any[]> {
    const response = await axios.get(
      `${this.config.url}/attributes/event/${eventId}`,
      { headers: this.headers },
    );
    return response.data;
  }

  async searchAttributes(query: string): Promise<any[]> {
    const response = await axios.post(
      `${this.config.url}/attributes/restSearch`,
      { value: query },
      { headers: this.headers },
    );
    return response.data;
  }

  async createEvent(event: any): Promise<any> {
    const response = await axios.post(`${this.config.url}/events/add`, event, {
      headers: this.headers,
    });
    return response.data;
  }
}
