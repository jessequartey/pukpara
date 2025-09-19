"use client";

import type { OrganizationColumnKey, OrganizationTableRow } from "./columns";
import { organizationColumns } from "./columns";
import type { SortState } from "./data-table";
import { DataTable } from "./data-table";

export type { OrganizationTableRow };

export type OrganizationTableProps = {
  data: OrganizationTableRow[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  selectedIds: Set<string>;
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onApprove: (row: OrganizationTableRow) => void;
  onReject: (row: OrganizationTableRow) => void;
  onSuspend: (row: OrganizationTableRow) => void;
  onDelete: (row: OrganizationTableRow) => void;
  onView: (row: OrganizationTableRow) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  visibleColumnKeys?: Set<OrganizationColumnKey>;
};

export function OrganizationTable({
  data,
  sort,
  onSortChange,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onApprove,
  onReject,
  onSuspend,
  onDelete,
  onView,
  isLoading,
  isFetching,
  visibleColumnKeys,
}: OrganizationTableProps) {
  const shouldFilterColumns =
    visibleColumnKeys !== undefined && visibleColumnKeys.size > 0;
  const filteredColumns = shouldFilterColumns
    ? organizationColumns.filter((column) => visibleColumnKeys.has(column.key))
    : organizationColumns;
  const columnsToRender =
    shouldFilterColumns && filteredColumns.length > 0
      ? filteredColumns
      : organizationColumns;

  return (
    <DataTable
      columns={columnsToRender}
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      onApprove={onApprove}
      onDelete={onDelete}
      onReject={onReject}
      onSortChange={onSortChange}
      onSuspend={onSuspend}
      onToggleSelect={onSelectRow}
      onToggleSelectAll={onSelectAll}
      onView={onView}
      selectedIds={selectedIds}
      sort={sort}
    />
  );
}

export type OrganizationTableSortState = SortState;
