import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";

interface ThreatFiltersProps {
  onFilterChange?: (filters: any) => void;
}

const ThreatFilters = ({ onFilterChange }: ThreatFiltersProps) => {
  const [activeFilters, setActiveFilters] = React.useState<{
    [key: string]: string[];
  }>({
    severity: [],
    type: [],
    status: [],
    tlp: [],
  });

  const handleFilterChange = (category: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter((v) => v !== value);
    } else {
      newFilters[category] = [...newFilters[category], value];
    }
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = Object.keys(activeFilters).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {},
    );
    setActiveFilters(emptyFilters);
    onFilterChange?.(emptyFilters);
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2">
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Clear Filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 rounded-sm px-1 font-normal lg:hidden"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Severity</h4>
              <div className="flex flex-wrap gap-2">
                {["Critical", "High", "Medium", "Low"].map((severity) => (
                  <Badge
                    key={severity}
                    variant={
                      activeFilters.severity.includes(severity)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("severity", severity)}
                  >
                    {severity}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Status</h4>
              <div className="flex flex-wrap gap-2">
                {["New", "In Progress", "Analyzed", "Closed"].map((status) => (
                  <Badge
                    key={status}
                    variant={
                      activeFilters.status.includes(status)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("status", status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">TLP</h4>
              <div className="flex flex-wrap gap-2">
                {["RED", "AMBER", "GREEN", "WHITE"].map((tlp) => (
                  <Badge
                    key={tlp}
                    variant={
                      activeFilters.tlp.includes(tlp) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("tlp", tlp)}
                  >
                    {tlp}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ThreatFilters;
