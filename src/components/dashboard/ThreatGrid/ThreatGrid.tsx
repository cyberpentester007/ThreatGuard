import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Filter,
  Network,
  Shield,
  Tag,
  Target,
  Activity,
} from "lucide-react";
import ThreatDetails from "./ThreatDetails";
import ThreatFilters from "./ThreatFilters";

export interface StixIndicator {
  id: string;
  type: string;
  value: string;
  created: string;
  modified: string;
  valid_from: string;
  valid_until?: string;
  confidence: number;
}

export interface ThreatData {
  id: string;
  name: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: string;
  created: string;
  modified: string;
  confidence: number;
  status: "New" | "In Progress" | "Analyzed" | "Closed";
  indicators: StixIndicator[];
  tags: string[];
  tlp: "RED" | "AMBER" | "GREEN" | "WHITE";
  source: string;
}

interface ThreatGridProps {
  data?: ThreatData[];
  isLoading?: boolean;
  onFilterChange?: (filters: any) => void;
}

const defaultData: ThreatData[] = [
  {
    id: "threat--12345",
    name: "APT29 Campaign",
    description:
      "Sophisticated cyber espionage campaign targeting government entities",
    severity: "Critical",
    type: "campaign",
    created: "2024-03-21T14:30:00Z",
    modified: "2024-03-21T14:30:00Z",
    confidence: 85,
    status: "New",
    indicators: [
      {
        id: "indicator--67890",
        type: "domain-name",
        value: "malicious.example.com",
        created: "2024-03-21T14:30:00Z",
        modified: "2024-03-21T14:30:00Z",
        valid_from: "2024-03-21T14:30:00Z",
        confidence: 90,
      },
    ],
    tags: ["APT", "Espionage", "Government"],
    tlp: "AMBER",
    source: "MISP",
  },
];

const ThreatGrid = ({
  data = defaultData,
  isLoading = false,
  onFilterChange,
}: ThreatGridProps) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getTlpColor = (tlp: string) => {
    switch (tlp) {
      case "RED":
        return "bg-red-500/90 text-white";
      case "AMBER":
        return "bg-orange-500/90 text-white";
      case "GREEN":
        return "bg-green-500/90 text-white";
      case "WHITE":
        return "bg-gray-500/90 text-white";
      default:
        return "bg-gray-500/90 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500/90 text-white";
      case "In Progress":
        return "bg-yellow-500/90 text-white";
      case "Analyzed":
        return "bg-green-500/90 text-white";
      case "Closed":
        return "bg-gray-500/90 text-white";
      default:
        return "bg-gray-500/90 text-white";
    }
  };

  return (
    <Card className="w-full bg-background border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Threat Intelligence</CardTitle>
            <Badge variant="outline" className="ml-2">
              {data.length} threats
            </Badge>
          </div>
          <ThreatFilters onFilterChange={onFilterChange} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Indicators
            </TabsTrigger>
            <TabsTrigger
              value="relationships"
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              Relationships
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TLP</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((threat) => (
                    <TableRow
                      key={threat.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedThreat(threat)}
                    >
                      <TableCell className="font-medium">
                        {threat.name}
                      </TableCell>
                      <TableCell>{threat.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTlpColor(threat.tlp)}>
                          {threat.tlp}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${threat.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm">{threat.confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(threat.created).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="indicators">
            <ScrollArea className="h-[600px] w-full p-4">
              <div className="space-y-4">
                {data.flatMap((threat) =>
                  threat.indicators.map((indicator) => (
                    <Card
                      key={`${threat.id}-${indicator.type}-${indicator.value}`}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{indicator.value}</h4>
                          <p className="text-sm text-muted-foreground">
                            {indicator.type}
                          </p>
                        </div>
                        <Badge>{indicator.confidence}% Confidence</Badge>
                      </div>
                    </Card>
                  )),
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="relationships">
            <ScrollArea className="h-[600px] w-full p-4">
              <Card className="p-4">
                <div className="flex items-center justify-center h-40">
                  <div className="text-center space-y-2">
                    <Network className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No relationships found
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {selectedThreat && (
        <ThreatDetails
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
        />
      )}
    </Card>
  );
};

export default ThreatGrid;
