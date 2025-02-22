import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AlertCircle, Calendar, Shield, Tag, Target, Link } from "lucide-react";
import type { ThreatData } from "./ThreatGrid";

interface ThreatDetailsProps {
  threat: ThreatData;
  onClose: () => void;
}

const ThreatDetails = ({ threat, onClose }: ThreatDetailsProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {threat.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Type
                      </span>
                      <p>{threat.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Description
                      </span>
                      <p>{threat.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Source
                      </span>
                      <p>{threat.source}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Created
                      </span>
                      <p>{new Date(threat.created).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Modified
                      </span>
                      <p>{new Date(threat.modified).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {threat.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Indicators Summary
                  </h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {threat.indicators.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Indicators
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="indicators" className="space-y-4">
              {threat.indicators.map((indicator) => (
                <Card key={indicator.id} className="p-4">
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
              ))}
            </TabsContent>

            <TabsContent value="relationships" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-center h-40">
                  <div className="text-center space-y-2">
                    <Link className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No relationships found
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ThreatDetails;
