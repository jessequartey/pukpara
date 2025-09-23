import type { ReactNode } from "react";

import type { BreadcrumbItemType } from "@/components/ui/page-title";
import { PageTitle } from "@/components/ui/page-title";

type UserPageTitleProps = {
	title: string;
	titleContent?: ReactNode;
	description?: ReactNode;
	action?: {
		label: string;
		href?: string;
		onClick?: () => void;
		icon?: React.ComponentType<{ className?: string }>;
	};
	breadcrumbs?: BreadcrumbItemType[];
	children?: ReactNode;
};

const baseBreadcrumbs: BreadcrumbItemType[] = [
	{ label: "Admin", href: "/admin" },
	{ label: "Users", href: "/admin/users" },
];

export function UserPageTitle({
	title,
	titleContent,
	description,
	action,
	breadcrumbs,
	children,
}: UserPageTitleProps) {
	return (
		<div className="space-y-6">
			<PageTitle
				action={action}
				breadcrumbs={[...baseBreadcrumbs, ...(breadcrumbs ?? [])]}
				description={description}
				title={title}
				titleContent={titleContent}
			/>
			{children}
		</div>
	);
}
