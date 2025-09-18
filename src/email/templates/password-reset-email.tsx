import * as React from "react";

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

const appName = "Pukpara";

export type PasswordResetEmailProps = {
  resetUrl: string;
  userName?: string | null;
};

export function PasswordResetEmail({ resetUrl, userName }: PasswordResetEmailProps) {
  const greetingName = userName?.trim() || "there";

  return (
    <Html>
      <Head />
      <Preview>Use this link to finish resetting your {appName} password.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={headingStyle}>Reset your password</Text>
            <Text style={textStyle}>Hi {greetingName},</Text>
            <Text style={textStyle}>
              We received a request to reset the password for your {appName} account. Use the button below to
              choose a new password. This link will expire soon for your security.
            </Text>
            <Button href={resetUrl} style={buttonStyle}>
              Reset password
            </Button>
            <Text style={textStyle}>
              If the button does not work, copy and paste this address into your browser:
            </Text>
            <Text style={linkStyle}>{resetUrl}</Text>
            <Hr style={dividerStyle} />
            <Text style={footerStyle}>
              If you did not request a password reset, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  color: "#0f172a",
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: "24px 0",
};

const containerStyle: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
};

const headingStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 16px",
};

const textStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#2563eb",
  borderRadius: "9999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};

const linkStyle: React.CSSProperties = {
  fontSize: "12px",
  wordBreak: "break-all",
  color: "#2563eb",
};

const dividerStyle: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const footerStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  margin: 0,
};

export function buildPasswordResetText({ resetUrl, userName }: PasswordResetEmailProps) {
  const greetingName = userName?.trim() || "there";
  return [
    `Hi ${greetingName},`,
    "",
    `We received a request to reset the password for your ${appName} account.`,
    "Use the link below to choose a new password. This link will expire soon for your security.",
    resetUrl,
    "",
    "If you did not request this change, you can safely ignore this email.",
  ].join("\n");
}

export default PasswordResetEmail;
