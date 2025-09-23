"use client";

import {
	AlertTriangle,
	Key,
	Monitor,
	Plus,
	Shield,
	Smartphone,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type SecuritySessionsCardProps = {
	userId: string;
};

type Session = {
	id: string;
	device: string;
	userAgent: string;
	ipAddress: string;
	createdAt: Date;
	expiresAt: Date;
	isCurrent: boolean;
};

type ApiKey = {
	id: string;
	name: string;
	maskedValue: string;
	lastUsed: Date | null;
	createdAt: Date;
};

const SESSION_REVOKE_DELAY = 1000;
const ALL_SESSIONS_REVOKE_DELAY = 1500;

export function SecuritySessionsCard({
	userId: _userId,
}: SecuritySessionsCardProps) {
	const [isRevoking, setIsRevoking] = useState<string | null>(null);

	// Mock data - replace with actual API calls
	const user = {
		emailVerified: true,
		phoneNumberVerified: true,
		impersonatedBy: null, // or user ID if being impersonated
	};

	const sessions: Session[] = [
		{
			id: "sess_1",
			device: "Chrome on Windows",
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			ipAddress: "192.168.1.1",
			createdAt: new Date("2024-01-20T10:00:00Z"),
			expiresAt: new Date("2024-02-20T10:00:00Z"),
			isCurrent: true,
		},
		{
			id: "sess_2",
			device: "Safari on iPhone",
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
			ipAddress: "10.0.0.1",
			createdAt: new Date("2024-01-19T15:30:00Z"),
			expiresAt: new Date("2024-02-19T15:30:00Z"),
			isCurrent: false,
		},
	];

	const apiKeys: ApiKey[] = [
		{
			id: "key_1",
			name: "Mobile App Access",
			maskedValue: "pk_*********************xyz",
			lastUsed: new Date("2024-01-20T14:30:00Z"),
			createdAt: new Date("2024-01-15T10:00:00Z"),
		},
	];

	const handleRevokeSession = async (sessionId: string) => {
		setIsRevoking(sessionId);
		try {
			await new Promise((resolve) => setTimeout(resolve, SESSION_REVOKE_DELAY));
			toast.success("Session revoked successfully");
		} catch {
			toast.error("Failed to revoke session");
		} finally {
			setIsRevoking(null);
		}
	};

	const handleRevokeAllSessions = async () => {
		setIsRevoking("all");
		try {
			await new Promise((resolve) =>
				setTimeout(resolve, ALL_SESSIONS_REVOKE_DELAY),
			);
			toast.success("All sessions revoked successfully");
		} catch {
			toast.error("Failed to revoke all sessions");
		} finally {
			setIsRevoking(null);
		}
	};

	const handleRevokeApiKey = (_keyId: string) => {
		toast.success("API key revoked");
	};

	const handleCreateApiKey = () => {
		toast.success("Create API key dialog would open");
	};

	const handleStopImpersonating = () => {
		toast.success("Stopped impersonating user");
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getDeviceIcon = (userAgent: string) => {
		if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
			return <Smartphone className="h-4 w-4" />;
		}
		return <Monitor className="h-4 w-4" />;
	};

	const shortenUserAgent = (userAgent: string) => {
		if (userAgent.includes("Chrome")) {
			return "Chrome";
		}
		if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
			return "Safari";
		}
		if (userAgent.includes("Firefox")) {
			return "Firefox";
		}
		if (userAgent.includes("Edge")) {
			return "Edge";
		}
		return "Unknown";
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Security & Sessions
				</CardTitle>
				<CardDescription>
					Multi-factor authentication, active sessions, and API keys
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* MFA Status */}
				<div className="space-y-4">
					<h4 className="font-medium">Multi-Factor Authentication</h4>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center justify-between">
							<span className="text-sm">Email Verified</span>
							<Badge variant={user.emailVerified ? "default" : "secondary"}>
								{user.emailVerified ? "Verified" : "Pending"}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Phone Verified</span>
							<Badge
								variant={user.phoneNumberVerified ? "default" : "secondary"}
							>
								{user.phoneNumberVerified ? "Verified" : "Pending"}
							</Badge>
						</div>
					</div>
				</div>

				<Separator />

				{/* Impersonation Banner */}
				{user.impersonatedBy && (
					<>
						<div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-2">
									<AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
									<div className="text-sm">
										<p className="font-medium text-orange-800">
											Impersonation Active
										</p>
										<p className="text-orange-700">
											This session is being impersonated by admin user ID:{" "}
											{user.impersonatedBy}
										</p>
									</div>
								</div>
								<Button
									onClick={handleStopImpersonating}
									size="sm"
									variant="outline"
								>
									Stop Impersonating
								</Button>
							</div>
						</div>
						<Separator />
					</>
				)}

				{/* Active Sessions */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Active Sessions</h4>
						<Button
							disabled={isRevoking === "all"}
							onClick={handleRevokeAllSessions}
							size="sm"
							variant="destructive"
						>
							{isRevoking === "all" ? "Revoking..." : "Revoke All"}
						</Button>
					</div>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Device</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead className="w-[100px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessions.map((session) => (
									<TableRow key={session.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												{getDeviceIcon(session.userAgent)}
												<div>
													<p className="font-medium text-sm">
														{session.device}
													</p>
													<p className="text-muted-foreground text-xs">
														{shortenUserAgent(session.userAgent)}
													</p>
												</div>
												{session.isCurrent && (
													<Badge className="text-xs" variant="outline">
														Current
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell className="font-mono text-sm">
											{session.ipAddress}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(session.createdAt)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(session.expiresAt)}
										</TableCell>
										<TableCell>
											<Button
												disabled={isRevoking === session.id}
												onClick={() => handleRevokeSession(session.id)}
												size="sm"
												variant="ghost"
											>
												{isRevoking === session.id ? (
													"Revoking..."
												) : (
													<Trash2 className="h-4 w-4" />
												)}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				<Separator />

				{/* API Keys */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">API Keys</h4>
						<Button onClick={handleCreateApiKey} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Create New
						</Button>
					</div>
					{apiKeys.length === 0 ? (
						<div className="py-6 text-center">
							<Key className="mx-auto h-8 w-8 text-muted-foreground/50" />
							<p className="mt-2 text-muted-foreground text-sm">
								No API keys created
							</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Key</TableHead>
										<TableHead>Last Used</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="w-[100px]" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{apiKeys.map((apiKey) => (
										<TableRow key={apiKey.id}>
											<TableCell className="font-medium">
												{apiKey.name}
											</TableCell>
											<TableCell className="font-mono text-sm">
												{apiKey.maskedValue}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{apiKey.lastUsed
													? formatDate(apiKey.lastUsed)
													: "Never"}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{formatDate(apiKey.createdAt)}
											</TableCell>
											<TableCell>
												<Button
													onClick={() => handleRevokeApiKey(apiKey.id)}
													size="sm"
													variant="ghost"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
