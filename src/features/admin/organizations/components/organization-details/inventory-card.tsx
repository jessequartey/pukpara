"use client";

import { Eye, Plus, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InventoryCard() {
  // Mock data - replace with actual API call
  const inventory = {
    warehouses: [
      {
        id: "wh_1",
        name: "Main Warehouse",
        location: "Tema",
        stockLots: 23,
        totalValue: 15_680.5,
      },
      {
        id: "wh_2",
        name: "Secondary Storage",
        location: "Accra",
        stockLots: 8,
        totalValue: 4320.0,
      },
    ],
    topStockLots: [
      {
        id: "sl_1",
        commodity: "Maize",
        quantity: 250,
        unit: "bags",
        warehouse: "Main Warehouse",
        status: "available",
      },
      {
        id: "sl_2",
        commodity: "Rice",
        quantity: 180,
        unit: "bags",
        warehouse: "Main Warehouse",
        status: "reserved",
      },
      {
        id: "sl_3",
        commodity: "Cocoa",
        quantity: 95,
        unit: "bags",
        warehouse: "Secondary Storage",
        status: "available",
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600";
      case "reserved":
        return "text-orange-600";
      case "sold":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="size-4" />
            Inventory
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 size-4" />
            Create Warehouse
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warehouse Summary */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            Warehouses ({inventory.warehouses.length})
          </h4>
          {inventory.warehouses.map((warehouse) => (
            <div
              className="flex items-center justify-between rounded-lg border p-2"
              key={warehouse.id}
            >
              <div>
                <div className="font-medium text-sm">{warehouse.name}</div>
                <div className="text-muted-foreground text-xs">
                  {warehouse.location}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">
                  {warehouse.stockLots} lots
                </div>
                <div className="text-muted-foreground text-xs">
                  GHS {warehouse.totalValue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Stock Lots */}
        <div>
          <h4 className="mb-2 font-medium text-sm">Top Stock Lots</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Commodity</TableHead>
                  <TableHead className="text-xs">Qty</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.topStockLots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="text-xs">
                      <div>
                        <div className="font-medium">{lot.commodity}</div>
                        <div className="text-muted-foreground">
                          {lot.warehouse}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {lot.quantity} {lot.unit}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className={getStatusColor(lot.status)}>
                        {lot.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" size="sm" variant="outline">
          <Eye className="mr-2 size-4" />
          View Warehouses
        </Button>
      </CardContent>
    </Card>
  );
}
