"use client";

import "swagger-ui-react/swagger-ui.css";

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="docs-layout">{children}</div>;
}
