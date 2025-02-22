import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Save, Clock } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: SearchFilters) => void;
  savedSearches?: SavedSearch[];
}

interface SearchFilters {
  severity?: string;
  date?: string;
  type?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
}

const defaultSavedSearches: SavedSearch[] = [
  {
    id: "1",
    name: "Critical Threats",
    query: "severity:critical",
    filters: { severity: "critical" },
  },
  {
    id: "2",
    name: "Last 24h Alerts",
    query: "date:24h",
    filters: { date: "24h" },
  },
];

const SearchBar = ({
  onSearch = () => {},
  onFilter = () => {},
  savedSearches = defaultSavedSearches,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="w-full bg-background p-4 border-b border-border">
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filters</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        handleFilterChange({ ...filters, severity: "critical" })
                      }
                    >
                      Critical
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        handleFilterChange({ ...filters, severity: "warning" })
                      }
                    >
                      Warning
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        handleFilterChange({ ...filters, severity: "info" })
                      }
                    >
                      Info
                    </Badge>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Save className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Saved Searches</h4>
                <div className="space-y-2">
                  {savedSearches.map((saved) => (
                    <Card
                      key={saved.id}
                      className="p-3 cursor-pointer hover:bg-accent"
                      onClick={() => {
                        setSearchQuery(saved.query);
                        setFilters(saved.filters);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{saved.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
};

export default SearchBar;
