/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: <necessary for type inference> */
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

export interface PageTitleProps {
  title: string;
  description?: string;
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
  description,
  breadcrumbs = [],
  action,
  className,
}: PageTitleProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <div className={cn('space-y-4 pb-6', className)}>
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
                      <Link to={crumb.href}>{crumb.label}</Link>
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
          <h2 className="font-bold text-2xl text-foreground tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {action &&
          (action.href ? (
            <Button asChild className="shrink-0">
              <Link to={action.href}>
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
