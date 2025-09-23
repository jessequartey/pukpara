import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import type { CSSProperties } from "react";

const appName = "Pukpara";

export type OrganizationApprovedEmailProps = {
	organizationName: string;
	onboardingUrl: string;
	recipientName?: string | null;
};

export function OrganizationApprovedEmail({
	organizationName,
	onboardingUrl,
	recipientName,
}: OrganizationApprovedEmailProps) {
	const greetingName = recipientName?.trim() || "there";

	return (
		<Html>
			<Head />
			<Preview>
				{organizationName} is approved. Set up your {appName} workspace next.
			</Preview>
			<Body style={bodyStyle}>
				<Container style={containerStyle}>
					<Section>
						<Text style={headingStyle}>{organizationName} is ready</Text>
						<Text style={textStyle}>Hi {greetingName},</Text>
						<Text style={textStyle}>
							Great news! Your organization <strong>{organizationName}</strong>{" "}
							is now approved on {appName}. You can personalize the workspace,
							configure preferences, and start inviting teammates right away.
						</Text>
						<Button href={onboardingUrl} style={buttonStyle}>
							Open onboarding guide
						</Button>
						<Text style={textStyle}>
							If the button does not work, copy and paste this address into your
							browser:
						</Text>
						<Text style={linkStyle}>{onboardingUrl}</Text>
						<Hr style={dividerStyle} />
						<Text style={footerStyle}>
							Need help getting started? Reply to this email and our team will
							respond shortly.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const bodyStyle: CSSProperties = {
	backgroundColor: "#f5f5f5",
	color: "#0f172a",
	fontFamily:
		'"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	padding: "24px 0",
};

const containerStyle: CSSProperties = {
	margin: "0 auto",
	maxWidth: "560px",
	backgroundColor: "#ffffff",
	borderRadius: "16px",
	padding: "32px",
	boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
};

const headingStyle: CSSProperties = {
	fontSize: "20px",
	fontWeight: 600,
	margin: "0 0 16px",
};

const textStyle: CSSProperties = {
	fontSize: "14px",
	lineHeight: "22px",
	margin: "0 0 16px",
};

const buttonStyle: CSSProperties = {
	backgroundColor: "#16a34a",
	borderRadius: "9999px",
	color: "#ffffff",
	display: "inline-block",
	fontSize: "14px",
	fontWeight: 600,
	padding: "12px 24px",
	textDecoration: "none",
};

const linkStyle: CSSProperties = {
	fontSize: "12px",
	wordBreak: "break-all",
	color: "#2563eb",
};

const dividerStyle: CSSProperties = {
	borderColor: "#e2e8f0",
	margin: "24px 0",
};

const footerStyle: CSSProperties = {
	fontSize: "12px",
	color: "#64748b",
	margin: 0,
};

export function buildOrganizationApprovedText({
	organizationName,
	onboardingUrl,
	recipientName,
}: OrganizationApprovedEmailProps) {
	const greetingName = recipientName?.trim() || "there";

	return [
		`Hi ${greetingName},`,
		"",
		`Great news! Your organization ${organizationName} is now approved on ${appName}.`,
		"Personalize the workspace, configure preferences, and invite teammates using the link below.",
		onboardingUrl,
		"",
		"Need a hand? Reply to this message and our team will help you get started.",
	].join("\n");
}

export default OrganizationApprovedEmail;
