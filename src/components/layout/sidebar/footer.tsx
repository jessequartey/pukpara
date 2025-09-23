import { Badge } from "@/components/ui/badge";

export function SidebarFooterComponent() {
	return (
		<div className="flex items-center justify-between p-4 border-t">
			<div className="text-muted-foreground text-xs font-medium">
				Pukpara Platform
			</div>
			<Badge className="text-xs" variant="secondary">
				v0.0.1
			</Badge>
		</div>
	);
}
