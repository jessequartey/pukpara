"use client";

import {
	BarChart3,
	Boxes,
	Building2,
	CreditCard,
	Layers3,
	Search,
	Settings,
	Store,
	Tractor,
	UserPlus,
	Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Icon mapping to avoid serialization issues
const iconMap = {
	BarChart3,
	Boxes,
	Building2,
	CreditCard,
	Layers3,
	Settings,
	Store,
	Tractor,
	UserPlus,
	Users,
} as const;

type IconName = keyof typeof iconMap;

import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";

type SearchItem = {
	icon: IconName;
	label: string;
	href: string;
	shortcut: string;
};

type SearchGroup = {
	group: string;
	items: SearchItem[];
};

const ORG_PATH_REGEX = /^\/app\/([^/]+)/u;

const buildTenantSearchGroups = (orgId: string | undefined): SearchGroup[] => {
	if (!orgId) {
		return [];
	}

	const basePath = `/app/${orgId}`;

	return [
		{
			group: "Organization",
			items: [
				{ icon: "BarChart3", label: "Overview", href: basePath, shortcut: "O" },
				{
					icon: "Layers3",
					label: "Groups",
					href: `${basePath}/groups`,
					shortcut: "G",
				},
				{
					icon: "Tractor",
					label: "Farmers",
					href: `${basePath}/farmers`,
					shortcut: "F",
				},
				{
					icon: "Settings",
					label: "Settings",
					href: `${basePath}/settings`,
					shortcut: "S",
				},
			],
		},
		{
			group: "Quick actions",
			items: [
				{
					icon: "UserPlus",
					label: "Register farmer",
					href: `${basePath}/farmers/create`,
					shortcut: "Shift+F",
				},
				{
					icon: "Layers3",
					label: "Create group",
					href: `${basePath}/groups/create`,
					shortcut: "Shift+G",
				},
			],
		},
	];
};

const adminSearchGroups: SearchGroup[] = [
	{
		group: "Platform",
		items: [
			{ icon: "BarChart3", label: "Overview", href: "/admin", shortcut: "O" },
			{
				icon: "Building2",
				label: "Organizations",
				href: "/admin/organizations",
				shortcut: "T",
			},
			{ icon: "Users", label: "Users", href: "/admin/users", shortcut: "U" },
			{
				icon: "Tractor",
				label: "Farmers",
				href: "/admin/farmers",
				shortcut: "F",
			},
		],
	},
	{
		group: "Operations",
		items: [
			{
				icon: "CreditCard",
				label: "Payments",
				href: "/admin/payments",
				shortcut: "P",
			},
			{
				icon: "Boxes",
				label: "Inventory",
				href: "/admin/inventory/commodities",
				shortcut: "I",
			},
			{
				icon: "Store",
				label: "Marketplace",
				href: "/admin/marketplace/listings",
				shortcut: "M",
			},
		],
	},
	{
		group: "Quick actions",
		items: [
			{
				icon: "Building2",
				label: "Create organization",
				href: "/admin/organizations?create=new",
				shortcut: "Shift+T",
			},
			{
				icon: "Users",
				label: "Invite user",
				href: "/admin/users?invite=new",
				shortcut: "Shift+U",
			},
			{
				icon: "Boxes",
				label: "Add commodity",
				href: "/admin/inventory/commodities?create=new",
				shortcut: "Shift+C",
			},
		],
	},
];

export const SearchButton = () => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const orgMatch = pathname.match(ORG_PATH_REGEX);
	const orgId = orgMatch ? orgMatch[1] : undefined;
	const isAdminView = pathname.startsWith("/admin");

	const items = useMemo(() => {
		if (isAdminView) {
			return adminSearchGroups;
		}

		return buildTenantSearchGroups(orgId);
	}, [isAdminView, orgId]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((isOpen) => !isOpen);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const handleSelect = (href: string) => {
		setOpen(false);
		if (href.startsWith("#")) {
			// Handle special actions - could integrate with analytics or action handlers
			return;
		}
		router.push(href);
	};

	return (
		<>
			<Button
				className="relative"
				onClick={() => setOpen(true)}
				size="icon"
				variant="outline"
			>
				<Search className="h-5 w-5" />
				<span className="sr-only">Search</span>
			</Button>

			<CommandDialog onOpenChange={setOpen} open={open}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					{items.map((group) => (
						<CommandGroup heading={group.group} key={group.group}>
							{group.items.map((item) => {
								const IconComponent = iconMap[item.icon];
								return (
									<CommandItem
										className="flex items-center gap-2"
										key={item.href}
										onSelect={() => handleSelect(item.href)}
									>
										<IconComponent className="h-4 w-4" />
										<span>{item.label}</span>
										<CommandShortcut>{item.shortcut}</CommandShortcut>
									</CommandItem>
								);
							})}
						</CommandGroup>
					))}
				</CommandList>
			</CommandDialog>
		</>
	);
};
