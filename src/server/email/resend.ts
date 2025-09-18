import { Resend } from "resend";

import PasswordResetEmail, {
  buildPasswordResetText,
  type PasswordResetEmailProps,
} from "@/email/templates/password-reset-email";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
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
