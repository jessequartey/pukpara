"use client";

import {
  Activity,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Plus,
  Ruler,
  Sprout,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FarmsCardProps = {
  farmerId: string;
  orgId?: string;
};

type Farm = {
  id: string;
  name?: string;
  cropType: string;
  acreage: number;
  uom: string;
  latitude?: number;
  longitude?: number;
  soilType: string;
  status: "active" | "inactive";
  district: string;
  community: string;
  lastYield?: {
    quantity: number;
    uom: string;
    date: string;
    variety: string;
  };
  createdAt: string;
};

type FarmCoordinate = {
  id: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
};

type FarmYield = {
  id: string;
  season: string;
  variety: string;
  quantity: number;
  uom: string;
  harvestedAt: string;
};

export function FarmsCard({ farmerId, orgId }: FarmsCardProps) {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock farms data - replace with actual API call
  const farms: Farm[] = [
    {
      id: "1",
      name: "Main Cocoa Farm",
      cropType: "Cocoa",
      acreage: 5.2,
      uom: "acres",
      latitude: 6.6885,
      longitude: -1.6244,
      soilType: "Loamy",
      status: "active",
      district: "Asante Mampong Municipal",
      community: "Asante Mampong",
      lastYield: {
        quantity: 450,
        uom: "kg",
        date: "2024-02-15T10:30:00Z",
        variety: "Trinitario",
      },
      createdAt: "2023-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Secondary Plantation",
      cropType: "Oil Palm",
      acreage: 3.8,
      uom: "acres",
      soilType: "Clay",
      status: "active",
      district: "Asante Mampong Municipal",
      community: "Nsuta",
      lastYield: {
        quantity: 200,
        uom: "kg",
        date: "2024-01-20T14:45:00Z",
        variety: "Tenera",
      },
      createdAt: "2023-03-20T14:45:00Z",
    },
  ];

  // Mock data for farm drawer
  const farmCoordinates: FarmCoordinate[] = [
    {
      id: "1",
      latitude: 6.6885,
      longitude: -1.6244,
      capturedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      latitude: 6.689,
      longitude: -1.625,
      capturedAt: "2024-02-10T14:15:00Z",
    },
  ];

  const farmYields: FarmYield[] = [
    {
      id: "1",
      season: "2024 Main",
      variety: "Trinitario",
      quantity: 450,
      uom: "kg",
      harvestedAt: "2024-02-15T10:30:00Z",
    },
    {
      id: "2",
      season: "2023 Main",
      variety: "Trinitario",
      quantity: 380,
      uom: "kg",
      harvestedAt: "2023-11-20T09:15:00Z",
    },
    {
      id: "3",
      season: "2023 Light",
      variety: "Trinitario",
      quantity: 120,
      uom: "kg",
      harvestedAt: "2023-06-10T15:30:00Z",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLocation = (farm: Farm) => {
    if (farm.latitude && farm.longitude) {
      return (
        <div className="flex items-center gap-1">
          <Badge className="text-xs" variant="outline">
            {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
          </Badge>
        </div>
      );
    }
    return `${farm.community} → ${farm.district}`;
  };

  const handleFarmClick = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsDrawerOpen(true);
  };

  if (farms.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Farms
            </CardTitle>
            <CardDescription>
              Farms owned and managed by this farmer
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Farm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sprout className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-medium">No Farms</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              This farmer hasn't registered any farms yet.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Farm
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Farms
            </CardTitle>
            <CardDescription>
              Farms owned and managed by this farmer ({farms.length})
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Farm
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Crops</TableHead>
                <TableHead>Acreage</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Yield</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm) => (
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  key={farm.id}
                  onClick={() => handleFarmClick(farm)}
                >
                  <TableCell>
                    <span className="font-medium">
                      {farm.name || `Farm #${farm.id}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{farm.cropType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      {farm.acreage} {farm.uom}
                    </div>
                  </TableCell>
                  <TableCell>{formatLocation(farm)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        farm.status === "active" ? "default" : "secondary"
                      }
                    >
                      {farm.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {farm.lastYield ? (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {farm.lastYield.quantity} {farm.lastYield.uom}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(farm.lastYield.date)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No yields
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Farm
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Farm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Farm Details Drawer */}
      <Sheet onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {selectedFarm?.name || `Farm #${selectedFarm?.id}`}
            </SheetTitle>
            <SheetDescription>
              Farm details and management information
            </SheetDescription>
          </SheetHeader>

          {selectedFarm && (
            <div className="mt-6 space-y-6">
              {/* Overview */}
              <div className="space-y-3">
                <h4 className="font-medium">Overview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Acreage
                    </Label>
                    <p>
                      {selectedFarm.acreage} {selectedFarm.uom}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Crop Type
                    </Label>
                    <p>{selectedFarm.cropType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Soil Type
                    </Label>
                    <p>{selectedFarm.soilType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Status
                    </Label>
                    <Badge
                      variant={
                        selectedFarm.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedFarm.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <div className="space-y-2">
                  {selectedFarm.latitude && selectedFarm.longitude ? (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Coordinates
                      </Label>
                      <p className="font-mono text-sm">
                        {selectedFarm.latitude.toFixed(6)},{" "}
                        {selectedFarm.longitude.toFixed(6)}
                      </p>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">
                      Recent Coordinate Captures ({farmCoordinates.length})
                    </Label>
                    <div className="space-y-1">
                      {farmCoordinates.slice(0, 3).map((coord) => (
                        <div
                          className="flex items-center justify-between text-sm"
                          key={coord.id}
                        >
                          <span className="font-mono">
                            {coord.latitude.toFixed(4)},{" "}
                            {coord.longitude.toFixed(4)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatDate(coord.capturedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Yields */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <Activity className="h-4 w-4" />
                  Recent Yields
                </h4>
                <div className="space-y-2">
                  {farmYields.slice(0, 3).map((yield_) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={yield_.id}
                    >
                      <div>
                        <p className="font-medium text-sm">{yield_.season}</p>
                        <p className="text-muted-foreground text-xs">
                          {yield_.variety}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {yield_.quantity} {yield_.uom}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(yield_.harvestedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Add Coordinates
                  </Button>
                  <Button size="sm" variant="outline">
                    <Activity className="mr-2 h-4 w-4" />
                    Add Yield
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Farm
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
