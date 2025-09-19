"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ORGANIZATION_STATUS } from "@/config/constants/auth";
import type {
  OrganizationTableRow,
} from "@/features/admin/organizations/components/organization-table/index";
import type { SortState } from "@/features/admin/organizations/components/organization-table/data-table";
import { api } from "@/trpc/react";

const ROW_OPTION_SMALL = 10;
const ROW_OPTION_MEDIUM = 20;
const ROW_OPTION_LARGE = 50;

export const ROW_OPTIONS = [
  ROW_OPTION_SMALL,
  ROW_OPTION_MEDIUM,
  ROW_OPTION_LARGE,
] as const;

type ConfirmAction = "approve" | "delete" | null;

type BulkMutation = {
  mutateAsync: (input: { organizationIds: string[] }) => Promise<unknown>;
};

const updateSelectionSet = (
  previous: Set<string>,
  id: string,
  checked: boolean
) => {
  const next = new Set(previous);
  if (checked) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return next;
};

const createBulkActionHandler = (
  getConfirmAction: () => ConfirmAction,
  getSelectedIds: () => Set<string>,
  approveMutation: BulkMutation,
  deleteMutation: BulkMutation
) => {
  return async () => {
    const action = getConfirmAction();
    const ids = Array.from(getSelectedIds());

    if (!action || ids.length === 0) {
      return;
    }

    if (action === "approve") {
      await approveMutation.mutateAsync({ organizationIds: ids });
      return;
    }

    await deleteMutation.mutateAsync({ organizationIds: ids });
  };
};

const createApproveSingleHandler = (approveMutation: {
  mutate: (input: { organizationIds: string[] }) => void;
}) => {
  return (row: OrganizationTableRow) => {
    if (row.status === ORGANIZATION_STATUS.ACTIVE) {
      toast.info(`"${row.name}" is already active`);
      return;
    }
    approveMutation.mutate({ organizationIds: [row.id] });
  };
};

// Helper function to get sort value for a field
const getSortValue = (row: OrganizationTableRow, field: string): string | number => {
  switch (field) {
    case "name":
      return row.name.toLowerCase();
    case "createdAt":
      return row.createdAt ? new Date(row.createdAt).getTime() : 0;
    case "users":
      return row.memberCount;
    case "status":
      return row.status ?? "";
    case "type":
      return row.type ?? "";
    case "owner":
      return row.owner?.name?.toLowerCase() ?? "";
    default:
      return "";
  }
};

// Client-side sorting function
const sortOrganizations = (
  organizations: OrganizationTableRow[],
  sort: SortState
): OrganizationTableRow[] => {
  return [...organizations].sort((a, b) => {
    const aValue = getSortValue(a, sort.field);
    const bValue = getSortValue(b, sort.field);

    if (aValue < bValue) {
      return sort.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

// Client-side search filter function
const filterOrganizations = (
  organizations: OrganizationTableRow[],
  searchTerm: string
): OrganizationTableRow[] => {
  if (!searchTerm.trim()) {
    return organizations;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  return organizations.filter((org) => {
    return (
      org.name.toLowerCase().includes(normalizedSearch) ||
      org.slug?.toLowerCase().includes(normalizedSearch) ||
      org.contactEmail?.toLowerCase().includes(normalizedSearch) ||
      org.contactPhone?.includes(normalizedSearch) ||
      org.owner?.name.toLowerCase().includes(normalizedSearch) ||
      org.owner?.email.toLowerCase().includes(normalizedSearch)
    );
  });
};

type UseOrganizationListControllerReturn = {
  search: string;
  setSearch: (value: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: (typeof ROW_OPTIONS)[number];
  setPageSize: (pageSize: (typeof ROW_OPTIONS)[number]) => void;
  sort: SortState;
  setSort: (sort: SortState) => void;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  confirmAction: ConfirmAction;
  setConfirmAction: (action: ConfirmAction) => void;
  data: OrganizationTableRow[];
  total: number;
  totalPages: number;
  startRow: number;
  endRow: number;
  listQuery: ReturnType<typeof api.admin.organizations.all.useQuery>;
  handleSortChange: (sort: SortState) => void;
  handleSelectRow: (id: string, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handleApproveSingle: (row: OrganizationTableRow) => void;
  handleRejectSingle: (row: OrganizationTableRow) => void;
  handleSuspendSingle: (row: OrganizationTableRow) => void;
  handleDeleteSingle: (row: OrganizationTableRow) => void;
  handleView: (row: OrganizationTableRow) => void;
  handleBulkAction: () => Promise<void>;
  isBusy: boolean;
};

export function useOrganizationListController(): UseOrganizationListControllerReturn {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof ROW_OPTIONS)[number]>(ROW_OPTION_MEDIUM);
  const [sort, setSort] = useState<SortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Use the new admin router to get all organizations
  const listQuery = api.admin.organizations.all.useQuery();

  // Transform the API data to match OrganizationTableRow type
  const allData: OrganizationTableRow[] = useMemo(() => {
    return (listQuery.data ?? []).map((org) => ({
      ...org,
      logo: null,
      type: org.organizationType,
      subType: org.organizationSubType,
    }));
  }, [listQuery.data]);

  // Apply client-side filtering, sorting, and pagination
  const filteredData = useMemo(
    () => filterOrganizations(allData, search),
    [allData, search]
  );
  const sortedData = useMemo(
    () => sortOrganizations(filteredData, sort),
    [filteredData, sort]
  );
  const total = sortedData.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  // Client-side pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = sortedData.slice(startIndex, endIndex);

  const approveMutation = api.admin.organizations.approve.useMutation({
    onSuccess: async () => {
      await listQuery.refetch();
      setSelectedIds(new Set());
      toast.success("Selected organizations approved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve organizations");
    },
  });

  const deleteMutation = api.admin.organizations.delete.useMutation({
    onSuccess: async () => {
      await listQuery.refetch();
      setSelectedIds(new Set());
      toast.success("Selected organizations deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete organizations");
    },
  });

  const handleSortChange = (nextSort: SortState) => {
    setSort(nextSort);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((previous) => updateSelectionSet(previous, id, checked));
  };

  const handleSelectAll = (checked: boolean) => {
    const rows = checked ? data : [];
    setSelectedIds(new Set(rows.map((row) => row.id)));
  };

  const handleApproveSingle = createApproveSingleHandler(approveMutation);

  const handleRejectSingle = (_row: OrganizationTableRow) => {
    toast.info("Reject functionality not yet implemented");
  };

  const handleSuspendSingle = (_row: OrganizationTableRow) => {
    toast.info("Suspend functionality not yet implemented");
  };

  const handleDeleteSingle = (row: OrganizationTableRow) => {
    setSelectedIds(new Set([row.id]));
    setConfirmAction("delete");
  };

  const handleView = (row: OrganizationTableRow) => {
    router.push(`/admin/organizations/${encodeURIComponent(row.id)}`);
  };

  const handleBulkAction = createBulkActionHandler(
    () => confirmAction,
    () => selectedIds,
    approveMutation,
    deleteMutation
  );

  const isBusy = approveMutation.isPending || deleteMutation.isPending;
  const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
    setSelectedIds(new Set()); // Clear selection when searching
  };

  return {
    search,
    setSearch: updateSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    selectedIds,
    setSelectedIds,
    confirmAction,
    setConfirmAction,
    data,
    total,
    totalPages,
    startRow,
    endRow,
    listQuery,
    handleSortChange,
    handleSelectRow,
    handleSelectAll,
    handleApproveSingle,
    handleRejectSingle,
    handleSuspendSingle,
    handleDeleteSingle,
    handleView,
    handleBulkAction,
    isBusy,
  } as const;
}

export type { UseOrganizationListControllerReturn };
