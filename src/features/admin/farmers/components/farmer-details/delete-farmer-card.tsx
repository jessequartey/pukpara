"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DeleteFarmerCardProps = {
  farmerName: string;
  onDelete?: () => void;
};

export function DeleteFarmerCard({
  farmerName,
  onDelete,
}: DeleteFarmerCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete?.();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Delete Farmer</h4>
            <p className="text-muted-foreground text-sm">
              Permanently delete this farmer profile and all associated data.
              This action cannot be undone.
            </p>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <div className="flex items-start gap-2">
              <Trash2 className="mt-0.5 size-4 text-destructive" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Warning</p>
                <p className="text-destructive/80">
                  This will permanently delete <strong>{farmerName}</strong> and
                  all related data including:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-destructive/80">
                  <li>Farmer profile and identity information</li>
                  <li>Farm records and yield data</li>
                  <li>Group and team memberships</li>
                  <li>Financial transactions and savings</li>
                  <li>Loan applications and repayment history</li>
                  <li>KYC verification records</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            size="sm"
            variant="destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Farmer
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {farmerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              farmer profile for "{farmerName}" and all associated data
              including farm records, financial transactions, group memberships,
              and KYC verification records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete Farmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
