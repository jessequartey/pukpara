"use client";

import { Download, Upload, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

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
import { useFarmerCreateStore } from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";

type BulkUploadStepProps = {
  onNext: () => void;
  onBack: () => void;
};

const acceptedFileTypes = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
};

const maxFileSize = 10 * 1024 * 1024; // 10MB

export const BulkUploadStep = ({ onBack, onNext }: BulkUploadStepProps) => {
  const bulkUpload = useFarmerCreateStore((state) => state.bulkUpload);
  const setBulkUploadData = useFarmerCreateStore((state) => state.setBulkUploadData);
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

  const handleUpload = async () => {
    if (!bulkUpload.file) {
      toast.error("Please select a file first");
      return;
    }

    setBulkUploadData({ isUploading: true, uploadProgress: 0 });

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setBulkUploadData({ uploadProgress: i });
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Simulate processing results
      const mockResults = {
        successful: 45,
        failed: 5,
        errors: [
          {
            row: 3,
            message: "Invalid phone number format",
            data: { firstName: "John", lastName: "Doe", phone: "invalid" },
          },
          {
            row: 7,
            message: "Missing required field: district",
            data: { firstName: "Jane", lastName: "Smith" },
          },
          {
            row: 12,
            message: "Duplicate ID number",
            data: { firstName: "Bob", lastName: "Wilson", idNumber: "GHA-123" },
          },
          {
            row: 18,
            message: "Invalid email format",
            data: { firstName: "Alice", lastName: "Brown", email: "invalid-email" },
          },
          {
            row: 25,
            message: "Date of birth is required",
            data: { firstName: "Mike", lastName: "Johnson" },
          },
        ],
      };

      setBulkUploadData({
        isUploading: false,
        uploadProgress: 100,
        uploadResults: mockResults,
      });

      toast.success(
        `Upload completed: ${mockResults.successful} farmers created, ${mockResults.failed} failed`
      );
    } catch (error) {
      setBulkUploadData({ isUploading: false });
      toast.error("Upload failed. Please try again.");
    }
  };

  const downloadTemplate = () => {
    // In a real implementation, this would download a template file
    toast.info("Template download would start here");
  };

  const removeFile = () => {
    setBulkUploadData({
      file: null,
      uploadProgress: 0,
      isUploading: false,
      uploadResults: null,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/60 hover:bg-primary/5",
              bulkUpload.file && "border-primary bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
        {bulkUpload.isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">
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
                <div className="border rounded-lg">
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

        {/* Actions */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <Button onClick={onBack} type="button" variant="ghost">
            Back
          </Button>
          <div className="flex gap-2">
            {bulkUpload.file && !bulkUpload.uploadResults && (
              <Button
                disabled={bulkUpload.isUploading}
                onClick={handleUpload}
                size="lg"
              >
                {bulkUpload.isUploading ? "Uploading..." : "Upload Farmers"}
              </Button>
            )}
            {bulkUpload.uploadResults && (
              <Button onClick={onNext} size="lg">
                Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};