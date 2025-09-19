/** biome-ignore-all lint/performance/noNamespaceImport: <necessary>*/
"use client";

import { CheckCircle2, Download, Upload, XCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type UploadedFarmer,
  useFarmerCreateStore,
} from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";

type BulkUploadStepProps = {
  onNext: () => void;
  onBack: () => void;
};

const acceptedFileTypes = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
};

const maxFileSize = 10 * 1024 * 1024; // 10MB

export const BulkUploadStep = ({ onBack, onNext }: BulkUploadStepProps) => {
  const bulkUpload = useFarmerCreateStore((state) => state.bulkUpload);
  const setBulkUploadData = useFarmerCreateStore(
    (state) => state.setBulkUploadData
  );
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setIsDragActive(false);

      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0]?.errors?.[0];
        if (error?.code === "file-too-large") {
          toast.error("File size must be less than 10MB");
        } else if (error?.code === "file-invalid-type") {
          toast.error("Please upload an Excel (.xlsx, .xls) or CSV file");
        } else {
          toast.error("Invalid file. Please check the file and try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setBulkUploadData({
          file,
          uploadProgress: 0,
          isUploading: false,
          uploadResults: null,
        });
        toast.success(`File "${file.name}" selected successfully`);
      }
    },
    [setBulkUploadData]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: false,
  });

  const parseExcelFile = async (file: File): Promise<UploadedFarmer[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });

          // Get Farmers sheet
          const farmersSheetName = "Farmers";
          const farmsSheetName = "Farms";

          if (!workbook.SheetNames.includes(farmersSheetName)) {
            reject(
              new Error(
                "Farmers sheet not found. Please use the correct template."
              )
            );
            return;
          }

          const farmersSheet = workbook.Sheets[farmersSheetName];
          const farmersData = XLSX.utils.sheet_to_json(farmersSheet, {
            header: 1,
          }) as any[][];

          // Get Farms sheet (optional)
          let farmsData: any[][] = [];
          if (workbook.SheetNames.includes(farmsSheetName)) {
            const farmsSheet = workbook.Sheets[farmsSheetName];
            farmsData = XLSX.utils.sheet_to_json(farmsSheet, {
              header: 1,
            }) as any[][];
          }

          // Parse farmers (skip header row)
          const farmers: UploadedFarmer[] = [];
          const farmerHeaders = farmersData[0] || [];

          for (let i = 1; i < farmersData.length; i++) {
            const row = farmersData[i];
            if (!row || row.every((cell) => !cell && cell !== 0)) continue; // Skip empty rows

            const farmer: UploadedFarmer = {
              id: nanoid(),
              rowNumber: i + 1,
              isValid: true,
              errors: [],
              data: {
                firstName: String(row[0] || "").trim(),
                lastName: String(row[1] || "").trim(),
                phone: String(row[2] || "").trim(),
                email: String(row[3] || "").trim(),
                dateOfBirth: String(row[4] || "").trim(),
                gender: String(row[5] || "male").toLowerCase() as
                  | "male"
                  | "female"
                  | "other",
                community: String(row[6] || "").trim(),
                address: String(row[7] || "").trim(),
                districtName: String(row[8] || "").trim(),
                idType: String(row[9] || "ghana_card").toLowerCase() as
                  | "ghana_card"
                  | "voters_id"
                  | "passport"
                  | "drivers_license",
                idNumber: String(row[10] || "").trim(),
                householdSize:
                  row[11] && !isNaN(Number(row[11])) ? Number(row[11]) : null,
                isLeader: String(row[12] || "No").toLowerCase() === "yes",
                isPhoneSmart: String(row[13] || "No").toLowerCase() === "yes",
                legacyFarmerId: String(row[14] || "").trim(),
              },
              farms: [],
            };

            farmers.push(farmer);
          }

          // Parse farms if sheet exists
          if (farmsData.length > 1) {
            const farmHeaders = farmsData[0] || [];

            for (let i = 1; i < farmsData.length; i++) {
              const row = farmsData[i];
              if (!row || row.every((cell) => !cell && cell !== 0)) continue; // Skip empty rows

              const farmerRowNumber = Number(row[0]); // This is the Excel row number (2, 3, 4, etc.)
              // Find farmer by matching the Excel row number (farmer's rowNumber is i+1 where i is the data row index)
              const farmerIndex = farmers.findIndex(
                (f) => f.rowNumber === farmerRowNumber
              );

              if (farmerIndex !== -1) {
                const farm = {
                  id: nanoid(),
                  name: String(row[1] || "").trim(),
                  acreage:
                    row[2] && !isNaN(Number(row[2])) ? Number(row[2]) : null,
                  cropType: String(row[3] || "").trim(),
                  soilType: String(row[4] || "").toLowerCase() as
                    | "sandy"
                    | "clay"
                    | "loamy"
                    | "silt"
                    | "rocky"
                    | "",
                  locationLat:
                    row[5] && !isNaN(Number(row[5]))
                      ? Number(row[5])
                      : undefined,
                  locationLng:
                    row[6] && !isNaN(Number(row[6]))
                      ? Number(row[6])
                      : undefined,
                  errors: [],
                  isValid: true,
                };

                farmers[farmerIndex].farms.push(farm);
              }
            }
          }

          resolve(farmers);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!bulkUpload.file) {
      toast.error("Please select a file first");
      return;
    }

    setBulkUploadData({
      isUploading: true,
      isProcessing: true,
      uploadProgress: 0,
    });

    try {
      // Simulate upload progress
      setBulkUploadData({ uploadProgress: 25 });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Parse the Excel file
      setBulkUploadData({ uploadProgress: 50 });
      const parsedFarmers = await parseExcelFile(bulkUpload.file);

      setBulkUploadData({ uploadProgress: 75 });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Store parsed farmers
      setBulkUploadData({
        isUploading: false,
        isProcessing: false,
        uploadProgress: 100,
        parsedFarmers,
      });

      toast.success(
        `Successfully parsed ${parsedFarmers.length} farmers from file`
      );
    } catch (error) {
      setBulkUploadData({
        isUploading: false,
        isProcessing: false,
        uploadProgress: 0,
        parsedFarmers: [],
      });

      const message =
        error instanceof Error ? error.message : "Failed to parse file";
      toast.error(message);
    }
  };

  const downloadTemplate = () => {
    // Download the generated template
    const link = document.createElement("a");
    link.href = "/templates/farmer-bulk-upload-template-with-validation.xlsx";
    link.download = "farmer-bulk-upload-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template downloaded successfully");
  };

  const removeFile = () => {
    setBulkUploadData({
      file: null,
      uploadProgress: 0,
      isUploading: false,
      isProcessing: false,
      parsedFarmers: [],
      uploadResults: null,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk upload farmers</CardTitle>
        <CardDescription>
          Upload multiple farmers using an Excel or CSV file. Download the
          template to ensure your data is formatted correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <Alert>
          <Download className="h-4 w-4" />
          <AlertTitle>Download template first</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Use our template to ensure your farmer data is formatted correctly
              for upload.
            </span>
            <Button onClick={downloadTemplate} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </AlertDescription>
        </Alert>

        {/* File Upload Area */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Upload file</h4>
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/60 hover:bg-primary/5",
              bulkUpload.file && "border-primary bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            {bulkUpload.file ? (
              <div className="space-y-2">
                <p className="font-medium">{bulkUpload.file.name}</p>
                <p className="text-muted-foreground text-sm">
                  {formatFileSize(bulkUpload.file.size)}
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  size="sm"
                  variant="outline"
                >
                  Remove file
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">
                  {isDragActive
                    ? "Drop your file here"
                    : "Drag & drop your file here, or click to browse"}
                </p>
                <p className="text-muted-foreground text-sm">
                  Supports Excel (.xlsx, .xls) and CSV files up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {(bulkUpload.isUploading || bulkUpload.isProcessing) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {bulkUpload.isProcessing
                  ? "Processing file..."
                  : "Uploading..."}
              </span>
              <span className="text-muted-foreground text-sm">
                {bulkUpload.uploadProgress}%
              </span>
            </div>
            <Progress value={bulkUpload.uploadProgress} />
          </div>
        )}

        {/* Upload Results */}
        {bulkUpload.uploadResults && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Upload Results</h4>

            <div className="grid gap-4 md:grid-cols-2">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Successful</AlertTitle>
                <AlertDescription>
                  {bulkUpload.uploadResults.successful} farmers created
                  successfully
                </AlertDescription>
              </Alert>

              {bulkUpload.uploadResults.failed > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Failed</AlertTitle>
                  <AlertDescription>
                    {bulkUpload.uploadResults.failed} farmers failed to create
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {bulkUpload.uploadResults.errors.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Error Details</h5>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkUpload.uploadResults.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            {error.row}
                          </TableCell>
                          <TableCell className="text-destructive">
                            {error.message}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {error.data
                              ? Object.entries(error.data)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parsed Results Summary */}
        {bulkUpload.parsedFarmers.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Parsed Results</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="font-bold text-2xl text-blue-600">
                  {bulkUpload.parsedFarmers.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  Total farmers
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-bold text-2xl text-green-600">
                  {bulkUpload.parsedFarmers.reduce(
                    (sum, farmer) => sum + farmer.farms.length,
                    0
                  )}
                </div>
                <div className="text-muted-foreground text-sm">Total farms</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-bold text-2xl text-amber-600">
                  Ready for review
                </div>
                <div className="text-muted-foreground text-sm">Status</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <Button onClick={onBack} type="button" variant="ghost">
            Back
          </Button>
          <div className="flex gap-2">
            {bulkUpload.file && bulkUpload.parsedFarmers.length === 0 && (
              <Button
                disabled={bulkUpload.isUploading || bulkUpload.isProcessing}
                onClick={handleUpload}
                size="lg"
              >
                {bulkUpload.isUploading || bulkUpload.isProcessing
                  ? "Processing..."
                  : "Process File"}
              </Button>
            )}
            {bulkUpload.parsedFarmers.length > 0 && (
              <Button onClick={onNext} size="lg">
                Review Farmers ({bulkUpload.parsedFarmers.length})
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
