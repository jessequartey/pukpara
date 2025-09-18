"use client";

import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
} from "@/config/constants/auth";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";

const typeOptions = Object.values(ORGANIZATION_TYPE);
const subscriptionOptions = Object.values(ORGANIZATION_SUBSCRIPTION_TYPE);

export function OrganizationCreatePage() {
  const [name, setName] = useState("");
  const slug = useMemo(
    () =>
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    [name]
  );

  return (
    <OrganizationPageTitle
      description="Capture key details for the new organization. Provisioning hooks will create the workspace and seed the owner automatically."
      title="Create organization"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Organization profile</CardTitle>
            <CardDescription>
              Basic information used across the dashboard and outgoing
              communications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Name</Label>
                <Input
                  id="org-name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Acme Cooperative"
                  value={name}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-slug">Slug</Label>
                <Input id="org-slug" readOnly value={slug} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-type">Type</Label>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="org-type"
                >
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-description">Description</Label>
                <textarea
                  className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="org-description"
                  placeholder="Internal notes about the organization..."
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Assign a starting plan and licensing status; these can be adjusted
              after onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="org-plan">Plan</Label>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                id="org-plan"
              >
                {subscriptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-license">License status</Label>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                id="org-license"
              >
                <option value="issued">Issued</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-max-users">Max users</Label>
              <Input id="org-max-users" placeholder="100" type="number" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            The full creation workflow will include validation, owner
            assignment, and audit logging. This scaffold keeps the page
            structure ready for a richer form.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Additional form controls and server actions will arrive in the next
          iteration.
        </CardContent>
      </Card>
    </OrganizationPageTitle>
  );
}

export default OrganizationCreatePage;
