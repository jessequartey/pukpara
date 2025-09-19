"use client";

import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type UploadedFarmer,
  useFarmerCreateStore,
} from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";

type FarmerEditModalProps = {
  farmer: UploadedFarmer | null;
  open: boolean;
  onClose: () => void;
};

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const idTypeOptions = [
  { value: "ghana_card", label: "Ghana Card" },
  { value: "voters_id", label: "Voter's ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
];

const soilTypeOptions = [
  { value: "sandy", label: "Sandy" },
  { value: "clay", label: "Clay" },
  { value: "loamy", label: "Loamy" },
  { value: "silt", label: "Silt" },
  { value: "rocky", label: "Rocky" },
];

export const FarmerEditModal = ({
  farmer,
  open,
  onClose,
}: FarmerEditModalProps) => {
  const updateUploadedFarmer = useFarmerCreateStore(
    (state) => state.updateUploadedFarmer
  );
  const updateUploadedFarm = useFarmerCreateStore(
    (state) => state.updateUploadedFarm
  );
  const deleteUploadedFarm = useFarmerCreateStore(
    (state) => state.deleteUploadedFarm
  );
  const validateUploadedFarmers = useFarmerCreateStore(
    (state) => state.validateUploadedFarmers
  );

  const [editingFarmIndex, setEditingFarmIndex] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: "male" as "male" | "female" | "other",
      community: "",
      address: "",
      districtName: "",
      organizationName: "",
      idType: "ghana_card" as
        | "ghana_card"
        | "voters_id"
        | "passport"
        | "drivers_license",
      idNumber: "",
      householdSize: "",
      isLeader: false,
      isPhoneSmart: false,
      legacyFarmerId: "",
    },
  });

  // Reset form when farmer changes
  useEffect(() => {
    if (farmer) {
      form.reset({
        firstName: farmer.data.firstName,
        lastName: farmer.data.lastName,
        phone: farmer.data.phone,
        email: farmer.data.email,
        dateOfBirth: farmer.data.dateOfBirth,
        gender: farmer.data.gender,
        community: farmer.data.community,
        address: farmer.data.address,
        districtName: farmer.data.districtName,
        organizationName: farmer.data.organizationName,
        idType: farmer.data.idType,
        idNumber: farmer.data.idNumber,
        householdSize: farmer.data.householdSize?.toString() || "",
        isLeader: farmer.data.isLeader,
        isPhoneSmart: farmer.data.isPhoneSmart,
        legacyFarmerId: farmer.data.legacyFarmerId || "",
      });
    }
  }, [farmer, form]);

  const handleSave = () => {
    if (!farmer) {
      return;
    }

    const formData = form.getValues();
    const updatedData = {
      ...formData,
      householdSize: formData.householdSize
        ? Number(formData.householdSize)
        : null,
    };

    updateUploadedFarmer(farmer.id, updatedData);
    validateUploadedFarmers();
    onClose();
  };

  const handleFarmUpdate = (
    farmIndex: number,
    field: string,
    value: unknown
  ) => {
    if (!farmer) {
      return;
    }

    const farm = farmer.farms[farmIndex];
    if (!farm) {
      return;
    }

    updateUploadedFarm(farmer.id, farm.id, { [field]: value });
    validateUploadedFarmers();
  };

  const handleDeleteFarm = (farmIndex: number) => {
    if (!farmer) {
      return;
    }

    const farm = farmer.farms[farmIndex];
    if (!farm) {
      return;
    }

    deleteUploadedFarm(farmer.id, farm.id);
    validateUploadedFarmers();
  };

  if (!farmer) {
    return null;
  }

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Edit Farmer: {farmer.data.firstName} {farmer.data.lastName}
          </DialogTitle>
          <DialogDescription>
            Make changes to the farmer details and farms. All changes are
            automatically validated.
          </DialogDescription>
        </DialogHeader>

        <Tabs className="w-full" defaultValue="farmer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="flex items-center gap-2" value="farmer">
              Farmer Details
              {farmer.errors.length > 0 && (
                <Badge className="text-xs" variant="destructive">
                  {farmer.errors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="farms">
              Farms ({farmer.farms.length})
              {farmer.farms.some((f) => !f.isValid) && (
                <Badge className="text-xs" variant="destructive">
                  Errors
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="farmer">
            <ScrollArea className="h-[400px] pr-4">
              <Form {...form}>
                <div className="space-y-4">
                  {/* Validation errors */}
                  {farmer.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600 text-sm">
                        Validation Errors:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {farmer.errors.map((error, index) => (
                          <Badge
                            className="text-xs"
                            key={index}
                            variant="destructive"
                          >
                            {error.field}: {error.message}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">
                      Personal Information
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {genderOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of birth *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    variant="outline"
                                  >
                                    {field.value ? (
                                      new Date(field.value).toLocaleDateString()
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                className="w-auto p-0"
                              >
                                <Calendar
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  mode="single"
                                  onSelect={(date) =>
                                    field.onChange(
                                      date?.toISOString().split("T")[0]
                                    )
                                  }
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone number *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+233244123456" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">
                      Location Information
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="community"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="districtName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Organization */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Organization</h4>
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Identification */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Identification</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="idType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {idTypeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID number *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">
                      Additional Information
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="householdSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Household size</FormLabel>
                            <FormControl>
                              <Input {...field} min="1" type="number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="legacyFarmerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Legacy farmer ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="isLeader"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Community leader</FormLabel>
                              <div className="text-[0.8rem] text-muted-foreground">
                                Mark as community or group leader
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isPhoneSmart"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Has smartphone</FormLabel>
                              <div className="text-[0.8rem] text-muted-foreground">
                                Has access to a smartphone
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Form>
            </ScrollArea>
          </TabsContent>

          <TabsContent className="space-y-4" value="farms">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {farmer.farms.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No farms for this farmer</p>
                  </div>
                ) : (
                  farmer.farms.map((farm, index) => (
                    <div
                      className={cn(
                        "rounded-lg border p-4",
                        farm.isValid ? "border-green-200" : "border-red-200"
                      )}
                      key={farm.id}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">Farm #{index + 1}</h5>
                          <Badge
                            variant={farm.isValid ? "success" : "destructive"}
                          >
                            {farm.isValid ? "Valid" : "Errors"}
                          </Badge>
                        </div>
                        <Button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteFarm(index)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {!farm.isValid && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {farm.errors.map((error, errorIndex) => (
                            <Badge
                              className="text-xs"
                              key={errorIndex}
                              variant="destructive"
                            >
                              {error.field}: {error.message}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label
                            className="font-medium text-sm"
                            htmlFor={`farm-name-${index}`}
                          >
                            Farm name *
                          </label>
                          <Input
                            id={`farm-name-${index}`}
                            onChange={(e) =>
                              handleFarmUpdate(index, "name", e.target.value)
                            }
                            placeholder="Farm name"
                            value={farm.name}
                          />
                        </div>
                        <div>
                          <label
                            className="font-medium text-sm"
                            htmlFor={`farm-acreage-${index}`}
                          >
                            Acreage
                          </label>
                          <Input
                            id={`farm-acreage-${index}`}
                            min="0"
                            onChange={(e) =>
                              handleFarmUpdate(
                                index,
                                "acreage",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="2.5"
                            step="0.1"
                            type="number"
                            value={farm.acreage || ""}
                          />
                        </div>
                        <div>
                          <label
                            className="font-medium text-sm"
                            htmlFor={`farm-croptype-${index}`}
                          >
                            Crop type
                          </label>
                          <Input
                            id={`farm-croptype-${index}`}
                            onChange={(e) =>
                              handleFarmUpdate(
                                index,
                                "cropType",
                                e.target.value
                              )
                            }
                            placeholder="Maize, Rice, Cassava"
                            value={farm.cropType}
                          />
                        </div>
                        <div>
                          <label
                            className="font-medium text-sm"
                            htmlFor={`farm-soiltype-${index}`}
                          >
                            Soil type
                          </label>
                          <Select
                            onValueChange={(value) =>
                              handleFarmUpdate(index, "soilType", value)
                            }
                            value={farm.soilType}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                            <SelectContent>
                              {soilTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
