import { Resend } from "resend";

import OrganizationApprovedEmail, {
  buildOrganizationApprovedText,
  type OrganizationApprovedEmailProps,
} from "@/email/templates/organization-approved-email";
import PasswordResetEmail, {
  buildPasswordResetText,
  type PasswordResetEmailProps,
} from "@/email/templates/password-reset-email";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = "noreply@hellonaa.com";
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendPasswordResetEmail(
  props: PasswordResetEmailProps & { email: string }
) {
  if (!resendClient) {
    return;
  }
  if (!resendFromEmail) {
    return;
  }
  const { email, ...templateProps } = props;
  await resendClient.emails.send({
    from: resendFromEmail,
    to: email,
    subject: "Reset your Pukpara password",
    react: PasswordResetEmail(templateProps),
    text: buildPasswordResetText(templateProps),
  });
}

export async function sendOrganizationApprovedEmail(
  props: OrganizationApprovedEmailProps & { email: string }
) {
  if (!resendClient) {
    return;
  }
  if (!resendFromEmail) {
    return;
  }

  const { email, ...templateProps } = props;

  await resendClient.emails.send({
    from: resendFromEmail,
    to: email,
    subject: `${templateProps.organizationName} is approved on Pukpara`,
    react: OrganizationApprovedEmail(templateProps),
    text: buildOrganizationApprovedText(templateProps),
  });
}

export async function sendOrganizationInviteEmail(props: {
  email: string;
  userName: string;
  organizationName: string;
  resetUrl: string;
}) {
  if (!resendClient) {
    return;
  }
  if (!resendFromEmail) {
    return;
  }

  const { email, userName, organizationName, resetUrl } = props;

  // Use the existing password reset email template but customize the subject
  await resendClient.emails.send({
    from: resendFromEmail,
    to: email,
    subject: `Welcome to ${organizationName} on Pukpara - Set your password`,
    react: PasswordResetEmail({ userName, resetUrl }),
    text: buildPasswordResetText({ userName, resetUrl }),
  });
}
