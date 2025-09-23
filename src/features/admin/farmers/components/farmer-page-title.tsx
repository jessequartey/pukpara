import type { ReactNode } from "react";

import type { BreadcrumbItemType } from "@/components/ui/page-title";
import { PageTitle } from "@/components/ui/page-title";

type FarmerPageTitleProps = {
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
	{ label: "Farmers", href: "/admin/farmers" },
];

export function FarmerPageTitle({
	title,
	titleContent,
	description,
	action,
	breadcrumbs,
	children,
}: FarmerPageTitleProps) {
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
