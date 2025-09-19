"use client";

import type { FarmerColumnKey, FarmerTableRow } from "./columns";
import { farmerColumns } from "./columns";
import type { SortState } from "./data-table";
import { DataTable } from "./data-table";

export type FarmerTableProps = {
  data: FarmerTableRow[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  selectedIds: Set<string>;
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onApprove: (row: FarmerTableRow) => void;
  onReject: (row: FarmerTableRow) => void;
  onSuspend: (row: FarmerTableRow) => void;
  onBan: (row: FarmerTableRow) => void;
  onUnban: (row: FarmerTableRow) => void;
  onDelete: (row: FarmerTableRow) => void;
  onView: (row: FarmerTableRow) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  visibleColumnKeys?: Set<FarmerColumnKey>;
};

export function FarmerTable({
  data,
  sort,
  onSortChange,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onApprove,
  onReject,
  onSuspend,
  onBan,
  onUnban,
  onDelete,
  onView,
  isLoading,
  isFetching,
  visibleColumnKeys,
}: FarmerTableProps) {
  const shouldFilterColumns =
    visibleColumnKeys !== undefined && visibleColumnKeys.size > 0;
  const filteredColumns = shouldFilterColumns
    ? farmerColumns.filter((column) => visibleColumnKeys.has(column.key))
    : farmerColumns;
  const columnsToRender =
    shouldFilterColumns && filteredColumns.length > 0
      ? filteredColumns
      : farmerColumns;

  return (
    <DataTable
      columns={columnsToRender}
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      onApprove={onApprove}
      onBan={onBan}
      onDelete={onDelete}
      onReject={onReject}
      onSortChange={onSortChange}
      onSuspend={onSuspend}
      onToggleSelect={onSelectRow}
      onToggleSelectAll={onSelectAll}
      onUnban={onUnban}
      onView={onView}
      selectedIds={selectedIds}
      sort={sort}
    />
  );
}

export type FarmerTableSortState = SortState;
