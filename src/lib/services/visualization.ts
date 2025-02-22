import { Network, Node, Edge, Options } from "vis-network";
import { DataSet } from "vis-data";
import type { ThreatRelationship, Threat } from "@/types/schema";

export class NetworkVisualization {
  private network: Network | null = null;
  private nodes: DataSet<Node> | null = null;
  private edges: DataSet<Edge> | null = null;

  constructor(containerId: string, width: number, height: number) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.nodes = new DataSet<Node>();
    this.edges = new DataSet<Edge>();

    const options: Options = {
      nodes: {
        shape: "dot",
        size: 16,
        font: {
          size: 12,
          color: "#ffffff",
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 2,
        color: { inherit: "both" },
        smooth: {
          type: "continuous",
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 },
        },
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -80000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
        },
        stabilization: { iterations: 100 },
      },
      interaction: {
        tooltipDelay: 200,
        hideEdgesOnDrag: true,
        hover: true,
      },
    };

    this.network = new Network(
      container,
      { nodes: this.nodes, edges: this.edges },
      options,
    );

    // Add event listeners
    this.network.on("selectNode", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = this.nodes?.get(nodeId);
        console.log("Selected node:", node);
      }
    });

    this.network.on("stabilized", () => {
      console.log("Network stabilized");
    });
  }

  drawNetwork(threats: Threat[], relationships: ThreatRelationship[]) {
    if (!this.nodes || !this.edges) return;

    // Clear existing data
    this.nodes.clear();
    this.edges.clear();

    // Add nodes
    const nodes = threats.map((threat) => ({
      id: threat.id,
      label: threat.title,
      title: `${threat.title}\n${threat.description}`,
      color: this.getNodeColor(threat.severity),
      value: threat.indicators.length, // Node size based on indicator count
      group: threat.type,
      data: threat, // Store full threat data
    }));

    // Add edges
    const edges = relationships.map((rel) => ({
      id: rel.id,
      from: rel.source_threat_id,
      to: rel.target_threat_id,
      label: rel.relationship_type,
      title: `Confidence: ${rel.confidence_score}%`,
      width: Math.max(1, rel.confidence_score / 20), // Edge width based on confidence
      dashes: rel.confidence_score < 50, // Dashed lines for low confidence
    }));

    this.nodes.add(nodes);
    this.edges.add(edges);
  }

  private getNodeColor(severity: string): {
    background: string;
    border: string;
  } {
    switch (severity) {
      case "Critical":
        return { background: "#ef4444", border: "#dc2626" };
      case "High":
        return { background: "#f97316", border: "#ea580c" };
      case "Medium":
        return { background: "#eab308", border: "#ca8a04" };
      case "Low":
        return { background: "#3b82f6", border: "#2563eb" };
      default:
        return { background: "#6b7280", border: "#4b5563" };
    }
  }

  setFilter(type: string | null) {
    if (!this.nodes) return;

    if (type) {
      this.nodes.forEach((node) => {
        if (node.group !== type) {
          this.nodes?.update({ id: node.id, hidden: true });
        } else {
          this.nodes?.update({ id: node.id, hidden: false });
        }
      });
    } else {
      this.nodes.forEach((node) => {
        this.nodes?.update({ id: node.id, hidden: false });
      });
    }
  }

  focusNode(nodeId: string) {
    if (!this.network) return;
    this.network.focus(nodeId, {
      scale: 1.5,
      animation: {
        duration: 1000,
        easingFunction: "easeInOutQuad",
      },
    });
  }

  clear() {
    if (this.nodes && this.edges) {
      this.nodes.clear();
      this.edges.clear();
    }
  }
}
