"use client";

import type { UserColumnKey, UserTableRow } from "./columns";
import { userColumns } from "./columns";
import type { SortState } from "./data-table";
import { DataTable } from "./data-table";

export type UserTableProps = {
  data: UserTableRow[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  selectedIds: Set<string>;
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onApprove: (row: UserTableRow) => void;
  onReject: (row: UserTableRow) => void;
  onSuspend: (row: UserTableRow) => void;
  onBan: (row: UserTableRow) => void;
  onUnban: (row: UserTableRow) => void;
  onDelete: (row: UserTableRow) => void;
  onView: (row: UserTableRow) => void;
  onImpersonate: (row: UserTableRow) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  visibleColumnKeys?: Set<UserColumnKey>;
};

export function UserTable({
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
  onImpersonate,
  isLoading,
  isFetching,
  visibleColumnKeys,
}: UserTableProps) {
  const shouldFilterColumns =
    visibleColumnKeys !== undefined && visibleColumnKeys.size > 0;
  const filteredColumns = shouldFilterColumns
    ? userColumns.filter((column) => visibleColumnKeys.has(column.key))
    : userColumns;
  const columnsToRender =
    shouldFilterColumns && filteredColumns.length > 0
      ? filteredColumns
      : userColumns;

  return (
    <DataTable
      columns={columnsToRender}
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      onApprove={onApprove}
      onBan={onBan}
      onDelete={onDelete}
      onImpersonate={onImpersonate}
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

export type UserTableSortState = SortState;
