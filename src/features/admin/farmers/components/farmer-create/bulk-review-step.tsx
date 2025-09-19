"use client";

import { AlertCircle, CheckCircle2, Edit, Plus, Trash2, User, Users } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useFarmerCreateStore, type UploadedFarmer } from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";

import { FarmerEditModal } from "./farmer-edit-modal";

type BulkReviewStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export const BulkReviewStep = ({ onBack, onNext }: BulkReviewStepProps) => {
  const parsedFarmers = useFarmerCreateStore((state) => state.bulkUpload.parsedFarmers);
  const deleteUploadedFarmer = useFarmerCreateStore((state) => state.deleteUploadedFarmer);
  const validateUploadedFarmers = useFarmerCreateStore((state) => state.validateUploadedFarmers);

  const [editingFarmer, setEditingFarmer] = useState<UploadedFarmer | null>(null);
  const [expandedFarmers, setExpandedFarmers] = useState<Set<string>>(new Set());

  const validFarmers = parsedFarmers.filter((farmer) => farmer.isValid);
  const invalidFarmers = parsedFarmers.filter((farmer) => !farmer.isValid);

  const toggleFarmer = (farmerId: string) => {
    const newExpanded = new Set(expandedFarmers);
    if (newExpanded.has(farmerId)) {
      newExpanded.delete(farmerId);
    } else {
      newExpanded.add(farmerId);
    }
    setExpandedFarmers(newExpanded);
  };

  const handleDeleteFarmer = (farmerId: string) => {
    deleteUploadedFarmer(farmerId);
  };

  const handleContinue = () => {
    // Validate all farmers before proceeding
    validateUploadedFarmers();

    const hasValidFarmers = parsedFarmers.some((farmer) => farmer.isValid);
    if (!hasValidFarmers) {
      return; // Let user fix errors first
    }

    onNext();
  };

  if (parsedFarmers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review farmers</CardTitle>
          <CardDescription>
            No farmers found in the uploaded file. Please go back and upload a valid file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} variant="outline">
            Back to upload
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Review farmers ({parsedFarmers.length})
          </CardTitle>
          <CardDescription>
            Review and edit the farmers from your upload before creating them in the system.
            Fix any validation errors before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Valid farmers</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{validFarmers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Need attention</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{invalidFarmers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total farmers</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{parsedFarmers.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Farmers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Farmers</h4>
              <div className="flex gap-2">
                <Button
                  onClick={() => setExpandedFarmers(new Set(parsedFarmers.map(f => f.id)))}
                  size="sm"
                  variant="outline"
                >
                  Expand All
                </Button>
                <Button
                  onClick={() => setExpandedFarmers(new Set())}
                  size="sm"
                  variant="outline"
                >
                  Collapse All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {parsedFarmers.map((farmer) => (
                  <FarmerCard
                    key={farmer.id}
                    farmer={farmer}
                    isExpanded={expandedFarmers.has(farmer.id)}
                    onToggle={() => toggleFarmer(farmer.id)}
                    onEdit={() => setEditingFarmer(farmer)}
                    onDelete={() => handleDeleteFarmer(farmer.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Button onClick={onBack} type="button" variant="ghost">
              Back
            </Button>
            <Button
              onClick={handleContinue}
              size="lg"
              disabled={validFarmers.length === 0}
            >
              Create {validFarmers.length} Farmer{validFarmers.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <FarmerEditModal
        farmer={editingFarmer}
        open={!!editingFarmer}
        onClose={() => setEditingFarmer(null)}
      />
    </>
  );
};

type FarmerCardProps = {
  farmer: UploadedFarmer;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const FarmerCard = ({ farmer, isExpanded, onToggle, onEdit, onDelete }: FarmerCardProps) => {
  const totalFarms = farmer.farms.length;
  const validFarms = farmer.farms.filter(f => f.isValid).length;
  const invalidFarms = totalFarms - validFarms;

  return (
    <Card className={cn(
      "transition-colors",
      farmer.isValid ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
    )}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={farmer.isValid ? "success" : "destructive"}>
                    {farmer.isValid ? "Valid" : "Errors"}
                  </Badge>
                  <span className="font-medium">
                    Row {farmer.rowNumber}: {farmer.data.firstName} {farmer.data.lastName}
                  </span>
                </div>
                {totalFarms > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalFarms} farm{totalFarms !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={onEdit}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  onClick={onDelete}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {!farmer.isValid && (
              <div className="flex flex-wrap gap-1 mt-2">
                {farmer.errors.map((error, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {error.field}: {error.message}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Farmer Details */}
              <div className="grid gap-2 text-sm">
                <div className="grid gap-1 md:grid-cols-2">
                  <div><strong>Phone:</strong> {farmer.data.phone}</div>
                  <div><strong>Email:</strong> {farmer.data.email || "—"}</div>
                  <div><strong>Gender:</strong> {farmer.data.gender}</div>
                  <div><strong>DOB:</strong> {farmer.data.dateOfBirth}</div>
                  <div><strong>Community:</strong> {farmer.data.community}</div>
                  <div><strong>District:</strong> {farmer.data.districtName}</div>
                  <div><strong>ID Type:</strong> {farmer.data.idType}</div>
                  <div><strong>ID Number:</strong> {farmer.data.idNumber}</div>
                </div>
                <div><strong>Address:</strong> {farmer.data.address}</div>
                <div><strong>Organization:</strong> {farmer.data.organizationName}</div>
              </div>

              {/* Farms */}
              {farmer.farms.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-sm">
                        Farms ({totalFarms})
                      </h5>
                      {invalidFarms > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {invalidFarms} error{invalidFarms !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {farmer.farms.map((farm, index) => (
                        <Card key={farm.id} className={cn(
                          "p-3",
                          farm.isValid ? "border-green-200" : "border-red-200"
                        )}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{farm.name}</span>
                                <Badge variant={farm.isValid ? "success" : "destructive"} className="text-xs">
                                  {farm.isValid ? "Valid" : "Error"}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground">
                                {farm.acreage ? `${farm.acreage} acres` : "No acreage"} •
                                {farm.cropType || "No crop type"} •
                                {farm.soilType || "No soil type"}
                              </div>
                              {!farm.isValid && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {farm.errors.map((error, errorIndex) => (
                                    <Badge key={errorIndex} variant="destructive" className="text-xs">
                                      {error.message}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};