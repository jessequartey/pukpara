"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFarmerCreateStore } from "@/features/admin/farmers/store/farmer-create-store";

const soilTypeOptions = [
  { value: "sandy", label: "Sandy" },
  { value: "clay", label: "Clay" },
  { value: "loamy", label: "Loamy" },
  { value: "silt", label: "Silt" },
  { value: "rocky", label: "Rocky" },
];

type FarmsStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export const FarmsStep = ({ onBack, onNext }: FarmsStepProps) => {
  const farms = useFarmerCreateStore((state) => state.farms);
  const addFarm = useFarmerCreateStore((state) => state.addFarm);
  const removeFarm = useFarmerCreateStore((state) => state.removeFarm);
  const updateFarm = useFarmerCreateStore((state) => state.updateFarm);

  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {}
  );

  const validateFarms = () => {
    const newErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    farms.forEach((farm, index) => {
      const farmErrors: Record<string, string> = {};

      if (!farm.name.trim()) {
        farmErrors.name = "Farm name is required";
        hasErrors = true;
      }

      if (farm.acreage !== null && farm.acreage <= 0) {
        farmErrors.acreage = "Acreage must be greater than 0";
        hasErrors = true;
      }

      if (Object.keys(farmErrors).length > 0) {
        newErrors[index] = farmErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = () => {
    if (farms.length === 0 || validateFarms()) {
      onNext();
    }
  };

  const handleAddFarm = () => {
    addFarm({
      name: "",
      acreage: null,
      cropType: "",
      soilType: "",
    });
  };

  const handleRemoveFarm = (index: number) => {
    removeFarm(index);
    // Remove errors for this farm
    const newErrors = { ...errors };
    delete newErrors[index];
    // Shift error indices for farms after the removed one
    for (const key of Object.keys(newErrors)) {
      const idx = Number.parseInt(key, 10);
      if (idx > index) {
        newErrors[idx - 1] = newErrors[idx];
        delete newErrors[idx];
      }
    }
    setErrors(newErrors);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farm details</CardTitle>
        <CardDescription>
          Add farm information for this farmer. You can add multiple farms or
          skip this step and add them later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Farms ({farms.length})</h4>
          <Button
            onClick={handleAddFarm}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Farm
          </Button>
        </div>

        {farms.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-muted-foreground text-sm">
              No farms added yet. You can add farms now or skip this step and
              add them later.
            </p>
            <Button onClick={handleAddFarm} type="button" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Farm
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {farms.map((farm, index) => (
              <Card
                className="p-4"
                key={`farm-${index}-${farm.name || "unnamed"}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Farm #{index + 1}</h5>
                    <Button
                      onClick={() => handleRemoveFarm(index)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`farm-name-${index}`}>Farm name *</Label>
                      <Input
                        id={`farm-name-${index}`}
                        onChange={(e) => {
                          updateFarm(index, { name: e.target.value });
                          // Clear error when user starts typing
                          if (errors[index]?.name) {
                            const newErrors = { ...errors };
                            delete newErrors[index].name;
                            if (Object.keys(newErrors[index]).length === 0) {
                              delete newErrors[index];
                            }
                            setErrors(newErrors);
                          }
                        }}
                        placeholder="Main Farm"
                        value={farm.name}
                      />
                      {errors[index]?.name && (
                        <p className="text-destructive text-sm">
                          {errors[index].name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`farm-acreage-${index}`}>Acreage</Label>
                      <Input
                        id={`farm-acreage-${index}`}
                        min="0"
                        onChange={(e) => {
                          const value = e.target.value;
                          updateFarm(index, {
                            acreage: value ? Number(value) : null,
                          });
                          // Clear error when user starts typing
                          if (errors[index]?.acreage) {
                            const newErrors = { ...errors };
                            delete newErrors[index].acreage;
                            if (Object.keys(newErrors[index]).length === 0) {
                              delete newErrors[index];
                            }
                            setErrors(newErrors);
                          }
                        }}
                        placeholder="2.5"
                        step="0.1"
                        type="number"
                        value={farm.acreage || ""}
                      />
                      {errors[index]?.acreage && (
                        <p className="text-destructive text-sm">
                          {errors[index].acreage}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`farm-crop-${index}`}>Crop type</Label>
                      <Input
                        id={`farm-crop-${index}`}
                        onChange={(e) =>
                          updateFarm(index, { cropType: e.target.value })
                        }
                        placeholder="Maize, Rice, Cassava"
                        value={farm.cropType}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`farm-soil-${index}`}>Soil type</Label>
                      <Select
                        onValueChange={(value) =>
                          updateFarm(index, {
                            soilType: value as
                              | "sandy"
                              | "clay"
                              | "loamy"
                              | "silt"
                              | "rocky"
                              | "",
                          })
                        }
                        value={farm.soilType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          {soilTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
        <Button onClick={onBack} type="button" variant="ghost">
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          {farms.length === 0 ? "Skip & Create Farmer" : "Create Farmer"}
        </Button>
      </CardFooter>
    </Card>
  );
};
