import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { NetworkVisualization } from "@/lib/services/visualization";
import type { Threat, ThreatRelationship } from "@/types/schema";

interface ThreatNetworkProps {
  threats: Threat[];
  relationships: ThreatRelationship[];
  width?: number;
  height?: number;
}

const ThreatNetwork = ({
  threats,
  relationships,
  width = 800,
  height = 600,
}: ThreatNetworkProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<NetworkVisualization | null>(null);

  useEffect(() => {
    if (containerRef.current && !vizRef.current) {
      vizRef.current = new NetworkVisualization(
        "#network-container",
        width,
        height,
      );
    }

    if (vizRef.current) {
      vizRef.current.clear();
      vizRef.current.drawNetwork(threats, relationships);
    }

    return () => {
      if (vizRef.current) {
        vizRef.current.clear();
      }
    };
  }, [threats, relationships, width, height]);

  return (
    <Card className="w-full h-full bg-background p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Threat Network Analysis</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Medium</span>
          </div>
        </div>
      </div>
      <div
        id="network-container"
        ref={containerRef}
        className="w-full h-[calc(100%-2rem)] bg-background/50 rounded-lg overflow-hidden"
      />
    </Card>
  );
};

export default ThreatNetwork;
