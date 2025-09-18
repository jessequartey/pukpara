import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BreadcrumbItemType } from "@/components/ui/page-title";
import { PageTitle } from "@/components/ui/page-title";
import {
  getOrganizationSections,
  type OrganizationSectionNavItem,
} from "@/features/admin/organizations/components/organization-section-config";
import { OrganizationSectionNav } from "@/features/admin/organizations/components/organization-section-nav";

type OrganizationSummary = {
  id: string;
  name: string;
  slug: string | null;
  status: string | null;
  organizationType: string | null;
  organizationSubType: string | null;
  logoUrl?: string | null;
};

type OrganizationDetailsLayoutProps = {
  organization: OrganizationSummary;
  basePath: string;
  currentPath: string;
  breadcrumbs?: BreadcrumbItemType[];
  children: ReactNode;
  extraBadges?: ReactNode[];
};

const STATUS_BADGE_STYLES: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-400",
  },
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300",
  },
};

const baseBreadcrumbs: BreadcrumbItemType[] = [
  { label: "Admin", href: "/admin" },
  { label: "Organizations", href: "/admin/organizations" },
];

const formatSegment = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const segments = value.split(/[_\s]+/u).filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  return segments
    .map((segment) => {
      const lower = segment.toLowerCase();
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
};

const buildBadges = (
  organization: OrganizationSummary,
  extraBadges?: ReactNode[]
) => {
  const badges: ReactNode[] = [];

  const typeLabel = formatSegment(organization.organizationType);
  const subTypeLabel = formatSegment(organization.organizationSubType);

  if (typeLabel) {
    badges.push(
      <Badge key="type" variant="secondary">
        {subTypeLabel ? `${typeLabel} / ${subTypeLabel}` : typeLabel}
      </Badge>
    );
  }

  if (organization.status) {
    const statusKey = organization.status.toUpperCase();
    const status = STATUS_BADGE_STYLES[statusKey] ?? {
      label: formatSegment(organization.status) ?? organization.status,
      className:
        "border-border bg-muted text-muted-foreground dark:bg-muted/40 dark:text-muted-foreground",
    };

    badges.push(
      <Badge className={status.className} key="status" variant="outline">
        {status.label}
      </Badge>
    );
  }

  if (extraBadges && extraBadges.length > 0) {
    for (const badge of extraBadges) {
      if (!badge) {
        continue;
      }
      badges.push(badge);
    }
  }

  return badges;
};

const computeBreadcrumbs = (
  organization: OrganizationSummary,
  basePath: string,
  breadcrumbs?: BreadcrumbItemType[]
) => {
  const trail: BreadcrumbItemType[] = [...baseBreadcrumbs];
  const hasExtra = Boolean(breadcrumbs && breadcrumbs.length > 0);

  const organizationCrumb: BreadcrumbItemType = hasExtra
    ? { label: organization.name, href: basePath }
    : { label: organization.name };

  trail.push(organizationCrumb);

  if (breadcrumbs) {
    for (const crumb of breadcrumbs) {
      trail.push(crumb);
    }
  }

  return trail;
};

const buildNavItems = (
  basePath: string,
  organizationType: string | null,
  currentPath: string
) => {
  const sections = getOrganizationSections(basePath, organizationType);

  return sections.map<OrganizationSectionNavItem & { isActive: boolean }>(
    (section) => ({
      ...section,
      isActive:
        section.href === currentPath ||
        (section.href !== basePath &&
          currentPath.startsWith(`${section.href}`)),
    })
  );
};

const getInitials = (value: string) => {
  const words = value.split(/\s+/u).filter(Boolean);
  if (words.length === 0) {
    return "--";
  }

  if (words.length === 1) {
    return words[0]?.slice(0, 2).toUpperCase();
  }

  const chars = `${words.at(0)?.charAt(0) ?? ""}${
    words.at(-1)?.charAt(0) ?? ""
  }`;
  return chars.toUpperCase();
};

export function OrganizationDetailsLayout({
  organization,
  basePath,
  currentPath,
  breadcrumbs,
  children,
  extraBadges,
}: OrganizationDetailsLayoutProps) {
  const badges = buildBadges(organization, extraBadges);
  const navItems = buildNavItems(
    basePath,
    organization.organizationType,
    currentPath
  );
  const composedBreadcrumbs = computeBreadcrumbs(
    organization,
    basePath,
    breadcrumbs
  );
  const showPending = organization.status?.toUpperCase() === "PENDING";

  const titleContent = (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar className="size-14">
        {organization.logoUrl ? (
          <AvatarImage alt={organization.name} src={organization.logoUrl} />
        ) : null}
        <AvatarFallback className="font-semibold text-lg">
          {getInitials(organization.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-3xl text-foreground tracking-tight">
          {organization.name}
        </span>
        {organization.slug ? (
          <span className="text-muted-foreground text-sm">
            {`/${organization.slug}`}
          </span>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showPending ? (
        <Alert className="border-amber-200/70 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-200">
          <Clock aria-hidden className="mt-0.5 size-4" />
          <AlertTitle>Pending approval</AlertTitle>
          <AlertDescription>
            <p>
              This organization is awaiting review. Actions are limited until a
              platform administrator approves the request.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <PageTitle
        breadcrumbs={composedBreadcrumbs}
        description={
          <div className="flex flex-wrap items-center gap-2">
            {badges}
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/organizations">
                <ArrowLeft aria-hidden className="mr-2 size-4" />
                Back to organizations
              </Link>
            </Button>
          </div>
        }
        title={organization.name}
        titleContent={titleContent}
      />

      <OrganizationSectionNav items={navItems} />

      <div className="space-y-6">{children}</div>
    </div>
  );
}
