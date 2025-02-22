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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, SortAsc, SortDesc, Filter } from "lucide-react";

interface ThreatData {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: string;
  source: string;
  timestamp: string;
  description: string;
}

interface ThreatGridProps {
  data?: ThreatData[];
  isLoading?: boolean;
}

const defaultData: ThreatData[] = [
  {
    id: "1",
    severity: "Critical",
    type: "Malware",
    source: "External Network",
    timestamp: "2024-03-21 14:30:00",
    description: "Suspicious malware activity detected from external IP",
  },
  {
    id: "2",
    severity: "High",
    type: "Phishing",
    source: "Email Gateway",
    timestamp: "2024-03-21 14:25:00",
    description: "Potential phishing campaign targeting employees",
  },
  {
    id: "3",
    severity: "Medium",
    type: "Unauthorized Access",
    source: "Internal Network",
    timestamp: "2024-03-21 14:20:00",
    description: "Multiple failed login attempts detected",
  },
];

const ThreatGrid: React.FC<ThreatGridProps> = ({
  data = defaultData,
  isLoading = false,
}) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredData = data.filter((threat) =>
    Object.values(threat).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <Card className="w-full bg-gray-900 text-white border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle>Threat Intelligence Data</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search threats..."
                className="pl-8 bg-gray-800 border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <SortAsc className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((threat) => (
                <TableRow
                  key={threat.id}
                  className="cursor-pointer hover:bg-gray-800"
                  onClick={() => setSelectedThreat(threat)}
                >
                  <TableCell>
                    <Badge className={`${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{threat.type}</TableCell>
                  <TableCell>{threat.source}</TableCell>
                  <TableCell>{threat.timestamp}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {threat.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      <Dialog
        open={!!selectedThreat}
        onOpenChange={() => setSelectedThreat(null)}
      >
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Threat Details</DialogTitle>
          </DialogHeader>
          {selectedThreat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Severity</p>
                  <Badge
                    className={`${getSeverityColor(selectedThreat.severity)} mt-1`}
                  >
                    {selectedThreat.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p>{selectedThreat.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Source</p>
                  <p>{selectedThreat.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Timestamp</p>
                  <p>{selectedThreat.timestamp}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="mt-1">{selectedThreat.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ThreatGrid;
