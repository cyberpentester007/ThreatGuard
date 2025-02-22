import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FreeFeedsService } from "@/lib/services/feeds/free-feeds";
import { getLocationFromIP } from "@/lib/services/geo-ip";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe, Shield, Activity } from "lucide-react";

export interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  severity: "high" | "medium" | "low";
  type: string;
  region: string;
}

interface ThreatMapProps {
  threats?: ThreatLocation[];
  onThreatClick?: (threat: ThreatLocation) => void;
  width?: number;
  height?: number;
}

const defaultThreats: ThreatLocation[] = [
  {
    id: "1",
    lat: 40.7128,
    lng: -74.006,
    severity: "high",
    type: "DDoS Attack",
    region: "United States",
  },
  {
    id: "2",
    lat: 51.5074,
    lng: -0.1278,
    severity: "medium",
    type: "Data Breach",
    region: "United Kingdom",
  },
  {
    id: "3",
    lat: 35.6762,
    lng: 139.6503,
    severity: "low",
    type: "Malware Detection",
    region: "Japan",
  },
];

const ThreatMap = ({
  threats: initialThreats = defaultThreats,
  onThreatClick = () => {},
  width = 1000,
  height = 600,
}: ThreatMapProps) => {
  const [threats, setThreats] = useState(initialThreats);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLocation | null>(
    null,
  );
  const [stats, setStats] = useState({
    total: initialThreats.length,
    critical: initialThreats.filter((t) => t.severity === "high").length,
    regions: new Set(initialThreats.map((t) => t.region)).size,
  });

  const updateThreats = useCallback(async () => {
    const feedService = new FreeFeedsService();
    try {
      const newThreats = await feedService.fetchFeeds();
      const mappedThreats = await Promise.all(
        newThreats.map(async (t) => {
          let location;
          if (t.indicators.some((i) => i.type === "ip")) {
            const ip = t.indicators.find((i) => i.type === "ip")?.value;
            if (ip) {
              location = await getLocationFromIP(ip);
            }
          }
          return {
            id: t.id,
            lat: location?.lat || t.location.lat || Math.random() * 180 - 90,
            lng: location?.lng || t.location.lng || Math.random() * 360 - 180,
            severity: t.severity.toLowerCase() as "high" | "medium" | "low",
            type: t.type,
            region: location?.country || t.location.region || "Unknown",
          };
        }),
      );

      setThreats((prev) => {
        const combined = [...mappedThreats, ...prev];
        const unique = combined
          .filter((t, i) => combined.findIndex((x) => x.id === t.id) === i)
          .slice(0, 100); // Keep only latest 100 threats
        return unique;
      });

      setStats({
        total: mappedThreats.length,
        critical: mappedThreats.filter((t) => t.severity === "high").length,
        regions: new Set(mappedThreats.map((t) => t.region)).size,
      });
    } catch (error) {
      console.error("Error fetching threats:", error);
    }
  }, []);

  useEffect(() => {
    updateThreats(); // Initial fetch
    const interval = setInterval(updateThreats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [updateThreats]);

  return (
    <Card className="w-full h-full bg-slate-900 p-4 relative overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Global Threat Map
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-300">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-300">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-300">Info</span>
            </div>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-800 rounded-lg overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.5,
            }}
          />

          <AnimatePresence>
            {threats.map((threat) => (
              <TooltipProvider key={threat.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <motion.div
                      className="absolute"
                      style={{
                        left: `${(threat.lng + 180) * (100 / 360)}%`,
                        top: `${(90 - threat.lat) * (100 / 180)}%`,
                        zIndex: selectedThreat?.id === threat.id ? 10 : 1,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale:
                          selectedThreat?.id === threat.id ? 1.5 : [1, 1.2, 1],
                        opacity: [0.8, 0.4, 0.8],
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: selectedThreat?.id === threat.id ? 0 : Infinity,
                        ease: "easeInOut",
                      }}
                      onClick={() => {
                        setSelectedThreat(threat);
                        onThreatClick(threat);
                      }}
                      onMouseEnter={() => setSelectedThreat(threat)}
                      onMouseLeave={() => setSelectedThreat(null)}
                    >
                      <div className="relative">
                        <div
                          className={`absolute w-12 h-12 rounded-full -left-6 -top-6 animate-ping-slow opacity-30 ${threat.severity === "high" ? "bg-red-500" : threat.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"}`}
                        />
                        <div
                          className={`absolute w-8 h-8 rounded-full -left-4 -top-4 animate-ping-medium opacity-40 ${threat.severity === "high" ? "bg-red-500" : threat.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"}`}
                        />
                        <div
                          className={`w-4 h-4 rounded-full cursor-pointer relative ${threat.severity === "high" ? "bg-red-500" : threat.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"}`}
                        />
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="w-64 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">{threat.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>{threat.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <Badge
                        variant="outline"
                        className={
                          threat.severity === "high"
                            ? "border-red-500 text-red-500"
                            : threat.severity === "medium"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-blue-500 text-blue-500"
                        }
                      >
                        {threat.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Active Threats</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Critical Alerts</div>
            <div className="text-2xl font-bold text-red-500">
              {stats.critical}
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Regions Affected</div>
            <div className="text-2xl font-bold text-white">{stats.regions}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ThreatMap;
