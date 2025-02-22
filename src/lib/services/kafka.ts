import { Kafka, Producer, Consumer } from "kafkajs";
import type { ThreatFeedAlert } from "@/types/schema";

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly alertsTopic = "threat-alerts";

  constructor(config: { brokers: string[]; clientId: string }) {
    this.kafka = new Kafka(config);
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "tip-consumer-group" });
  }

  async initialize() {
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.alertsTopic });
  }

  async publishAlert(alert: ThreatFeedAlert) {
    await this.producer.send({
      topic: this.alertsTopic,
      messages: [
        {
          key: alert.id,
          value: JSON.stringify(alert),
          headers: {
            type: alert.type,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    });
  }

  async consumeAlerts(callback: (alert: ThreatFeedAlert) => void) {
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const alert = JSON.parse(message.value.toString()) as ThreatFeedAlert;
          callback(alert);
        }
      },
    });
  }

  async disconnect() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }
}
