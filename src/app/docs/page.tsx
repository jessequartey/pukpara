"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
	const [spec, setSpec] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSpec = async () => {
			try {
				const response = await fetch("/api/openapi");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setSpec(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load API spec",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchSpec();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Loading API documentation...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
					<p className="text-gray-600">{error}</p>
				</div>
			</div>
		);
	}

	if (!spec) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">No API specification found</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<SwaggerUI spec={spec} />
		</div>
	);
}
