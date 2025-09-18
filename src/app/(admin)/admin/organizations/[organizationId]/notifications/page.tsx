import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationNotificationsPageProps = {
  params: { organizationId: string };
};

const notificationTemplates = [
  {
    id: "invite",
    name: "Invite member",
    description: "Triggered when an admin invites a user to the organization.",
  },
  {
    id: "approved",
    name: "Organization approved",
    description: "Sent when the platform approves the organization onboarding.",
  },
  {
    id: "password_reset",
    name: "Password reset",
    description: "Delivered when members request password resets via USSD/SMS.",
  },
  {
    id: "suspension",
    name: "Suspension notice",
    description:
      "Dispatched upon suspension, including actor and reason notes.",
  },
];

export default function OrganizationNotificationsPage({
  params,
}: OrganizationNotificationsPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/notifications`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Notifications" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => <NotificationsContent />}
    </OrganizationDetailsShell>
  );
}

function NotificationsContent() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="font-semibold text-lg">Notification preferences</h2>
        <p className="text-muted-foreground text-sm">
          Configure communication channels across email, SMS, and in-app for key
          organization events.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Channel toggles</CardTitle>
          <CardDescription>
            Enable or disable notifications per template and channel. Changes
            sync instantly once preferences storage is wired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[2fr_repeat(3,_minmax(0,_1fr))] gap-3 text-muted-foreground text-xs uppercase">
            <span>Template</span>
            <span className="text-center">Email</span>
            <span className="text-center">SMS</span>
            <span className="text-center">In-app</span>
          </div>
          <div className="space-y-3">
            {notificationTemplates.map((template) => (
              <div
                className="grid grid-cols-[2fr_repeat(3,_minmax(0,_1fr))] items-center gap-3 rounded-md border p-3"
                key={template.id}
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {template.description}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Switch
                    aria-label={`${template.name} email toggle`}
                    defaultChecked
                  />
                </div>
                <div className="flex justify-center">
                  <Switch aria-label={`${template.name} SMS toggle`} />
                </div>
                <div className="flex justify-center">
                  <Switch
                    aria-label={`${template.name} in-app toggle`}
                    defaultChecked
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test send</CardTitle>
          <CardDescription>
            Trigger a sample notification to verify delivery pipelines. Future
            implementation will queue via the notification service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Input
                aria-describedby="template-help"
                defaultValue="Invite member"
                id="template"
                readOnly
              />
              <p className="text-muted-foreground text-xs" id="template-help">
                Template picker will surface available variants.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                defaultValue=""
                id="target"
                placeholder="email@example.com or +233200000000"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">
              <Send aria-hidden className="mr-2 size-4" />
              Send test notification
            </Button>
            <span className="text-muted-foreground text-xs">
              Logs and delivery receipts will display here once connected.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
