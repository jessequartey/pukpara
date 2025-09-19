/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: <necessary for type inference> */

import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

export interface PageTitleProps {
  title: string;
  titleContent?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItemType[];
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export function PageTitle({
  title,
  titleContent,
  description,
  breadcrumbs = [],
  action,
  className,
}: PageTitleProps) {
  const ActionIcon = action?.icon || Plus;
  const hasCustomTitle = Boolean(titleContent);
  const renderDescription = () => {
    if (description === null || description === undefined) {
      return null;
    }

    if (typeof description === "string") {
      return <p className="text-muted-foreground">{description}</p>;
    }

    return <div>{description}</div>;
  };

  return (
    <div className={cn("space-y-4 pb-6", className)}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div
                className="contents"
                key={`${crumb.href || crumb.label}-${index}`}
              >
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {hasCustomTitle ? (
            <>
              <h2 className="sr-only">{title}</h2>
              {titleContent}
            </>
          ) : (
            <h2 className="font-bold text-2xl text-foreground tracking-tight">
              {title}
            </h2>
          )}
          {renderDescription()}
        </div>

        {action &&
          (action.href ? (
            <Button asChild className="shrink-0">
              <Link href={action.href}>
                <ActionIcon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button className="shrink-0" onClick={action.onClick}>
              <ActionIcon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          ))}
      </div>
    </div>
  );
}
