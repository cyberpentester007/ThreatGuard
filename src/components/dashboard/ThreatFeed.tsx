import React, { useEffect, useState } from "react";
import { FreeFeedsService } from "@/lib/services/feeds/free-feeds";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
}

interface ThreatFeedProps {
  alerts?: Alert[];
}

const defaultAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "DDoS Attack Detected",
    description:
      "Large scale DDoS attack detected from multiple IPs targeting main infrastructure.",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "warning",
    title: "Unusual Login Activity",
    description:
      "Multiple failed login attempts detected from unauthorized locations.",
    timestamp: "5 minutes ago",
  },
  {
    id: "3",
    type: "info",
    title: "System Update",
    description: "Security patches have been applied to all systems.",
    timestamp: "10 minutes ago",
  },
];

const ThreatFeed = ({ alerts = defaultAlerts }: ThreatFeedProps) => {
  const [expandedAlerts, setExpandedAlerts] = React.useState<Set<string>>(
    new Set(),
  );
  const [realtimeAlerts, setRealtimeAlerts] = useState<Alert[]>(alerts);

  useEffect(() => {
    const feedService = new FreeFeedsService();
    let interval: NodeJS.Timeout;

    const fetchThreats = async () => {
      try {
        const threats = await feedService.fetchFeeds();
        const newAlerts = threats.map((threat) => ({
          id: threat.id,
          type: mapSeverityToAlertType(threat.severity),
          title: threat.title,
          description: threat.description,
          timestamp: new Date(threat.timestamp).toLocaleString(),
        }));
        setRealtimeAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
      } catch (error) {
        console.error("Error fetching threats:", error);
      }
    };

    // Initial fetch
    fetchThreats();

    // Set up polling every 30 seconds
    interval = setInterval(fetchThreats, 30000);

    return () => clearInterval(interval);
  }, []);

  const mapSeverityToAlertType = (severity: string): AlertType => {
    switch (severity) {
      case "Critical":
        return "critical";
      case "High":
        return "warning";
      default:
        return "info";
    }
  };

  const toggleAlert = (id: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (expandedAlerts.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAlerts(newExpanded);
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "info":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    }
  };

  return (
    <Card className="w-[350px] h-full bg-background border-r">
      <div className="p-4 border-b flex items-center gap-2">
        <Bell className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Threat Feed</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4 space-y-4">
          {realtimeAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Card
                className={`p-4 cursor-pointer transition-colors ${getAlertColor(alert.type)}`}
                onClick={() => toggleAlert(alert.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getAlertColor(alert.type)}
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {alert.timestamp}
                      </span>
                    </div>
                    <h3 className="font-medium">{alert.title}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    {expandedAlerts.has(alert.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <AnimatePresence>
                  {expandedAlerts.has(alert.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-sm">{alert.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ThreatFeed;
