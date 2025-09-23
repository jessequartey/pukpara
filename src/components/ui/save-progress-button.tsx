import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatTimestamp } from "@/lib/form-persistence";

interface SaveProgressButtonProps {
	onSave: () => void;
	onClear?: () => void;
	hasSavedData?: boolean;
	savedTimestamp?: number | null;
	disabled?: boolean;
	className?: string;
}

export function SaveProgressButton({
	onSave,
	onClear,
	hasSavedData = false,
	savedTimestamp = null,
	disabled = false,
	className = "",
}: SaveProgressButtonProps) {
	const [showClearDialog, setShowClearDialog] = useState(false);

	const handleSave = () => {
		onSave();
	};

	const handleClear = () => {
		if (onClear) {
			onClear();
			setShowClearDialog(false);
		}
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={handleSave}
					disabled={disabled}
					className={className}
				>
					<Save className="mr-2 h-4 w-4" />
					Save Progress
				</Button>

				{hasSavedData && savedTimestamp && onClear && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowClearDialog(true)}
						className="text-muted-foreground hover:text-destructive"
					>
						Clear Saved
					</Button>
				)}

				{hasSavedData && savedTimestamp && (
					<span className="text-xs text-muted-foreground">
						Saved {formatTimestamp(savedTimestamp)}
					</span>
				)}
			</div>

			<Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Clear Saved Progress?</DialogTitle>
						<DialogDescription>
							This will permanently delete your saved form progress. You won't
							be able to recover this data.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowClearDialog(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleClear}>
							Clear Progress
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
