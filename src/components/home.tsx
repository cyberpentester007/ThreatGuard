import React from "react";
import ThreatMap from "./dashboard/ThreatMap";
import ThreatFeed from "./dashboard/ThreatFeed";
import ThreatGrid from "./dashboard/ThreatGrid/ThreatGrid";
import SearchBar from "./dashboard/SearchBar";
import { useEffect, useState } from "react";
import { ThreatFeedService } from "@/lib/services/feeds";
import type { Threat, ThreatSeverity, AlertType } from "@/types/schema";

const Home = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const feedService = new ThreatFeedService();
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await feedService.fetchFeeds();
        setThreats(data);
      } catch (error) {
        console.error("Error fetching threat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredThreats = threats.filter((threat) => {
    // Apply search
    if (
      searchQuery &&
      !threat.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !threat.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && threat[key] !== value) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <SearchBar onSearch={setSearchQuery} onFilter={setFilters} />

          {/* Main Content Area */}
          <div className="flex gap-4">
            {/* Left Side - Threat Map and Grid */}
            <div className="flex-1 space-y-4">
              {/* Threat Map */}
              <div className="h-[600px]">
                <ThreatMap
                  threats={filteredThreats.map((t) => ({
                    id: t.id,
                    lat: t.location.lat,
                    lng: t.location.lng,
                    severity: t.severity.toLowerCase() as
                      | "high"
                      | "medium"
                      | "low",
                    type: t.type,
                  }))}
                />
              </div>

              {/* Threat Grid */}
              <ThreatGrid data={filteredThreats} isLoading={isLoading} />
            </div>

            {/* Right Side - Threat Feed */}
            <ThreatFeed
              alerts={filteredThreats.map((t) => ({
                id: t.id,
                type: mapSeverityToAlertType(t.severity),
                title: t.title,
                description: t.description,
                timestamp: new Date(t.timestamp).toLocaleString(),
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapSeverityToAlertType = (severity: ThreatSeverity): AlertType => {
  switch (severity) {
    case "Critical":
      return "critical";
    case "High":
      return "warning";
    default:
      return "info";
  }
};

export default Home;
