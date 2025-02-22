import { v4 as uuidv4 } from "uuid";

export interface StixObject {
  id: string;
  type: string;
  created: string;
  modified: string;
  spec_version: string;
}

export interface StixIndicator extends StixObject {
  type: "indicator";
  pattern: string;
  pattern_type: string;
  valid_from: string;
  valid_until?: string;
  confidence: number;
}

export interface StixThreat extends StixObject {
  type: "threat-actor" | "intrusion-set" | "malware" | "campaign";
  name: string;
  description: string;
  aliases?: string[];
  first_seen?: string;
  last_seen?: string;
}

export const createStixIndicator = (
  data: Partial<StixIndicator>,
): StixIndicator => {
  const now = new Date().toISOString();
  return {
    id: `indicator--${uuidv4()}`,
    type: "indicator",
    created: now,
    modified: now,
    spec_version: "2.1",
    pattern: data.pattern || "",
    pattern_type: data.pattern_type || "stix",
    valid_from: data.valid_from || now,
    valid_until: data.valid_until,
    confidence: data.confidence || 75,
  };
};

export const createStixThreat = (data: Partial<StixThreat>): StixThreat => {
  const now = new Date().toISOString();
  return {
    id: `threat-actor--${uuidv4()}`,
    type: "threat-actor",
    created: now,
    modified: now,
    spec_version: "2.1",
    name: data.name || "",
    description: data.description || "",
    aliases: data.aliases || [],
    first_seen: data.first_seen || now,
    last_seen: data.last_seen || now,
  };
};
