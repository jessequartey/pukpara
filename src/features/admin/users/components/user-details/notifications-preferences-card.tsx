"use client";

import { Bell, Mail, MessageSquare, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type NotificationsPreferencesCardProps = {
  userId: string;
};

type NotificationPreferences = {
  email: {
    enabled: boolean;
    newsletters: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
  };
  sms: {
    enabled: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
    marketingMessages: boolean;
  };
};

type NotificationHistory = {
  id: string;
  time: Date;
  channel: "email" | "sms" | "inapp" | "webhook";
  templateKey: string;
  status: "sent" | "failed" | "queued";
  error?: string;
};

const RECENT_NOTIFICATIONS_LIMIT = 10;
const TEST_NOTIFICATION_DELAY = 1500;

export function NotificationsPreferencesCard({ userId: _ }: NotificationsPreferencesCardProps) {
  const [isSending, setIsSending] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      newsletters: true,
      transactionAlerts: true,
      securityAlerts: true,
    },
    sms: {
      enabled: true,
      transactionAlerts: true,
      securityAlerts: true,
      marketingMessages: false,
    },
  });

  // Mock data - replace with actual API calls
  const notificationHistory: NotificationHistory[] = [
    {
      id: "notif_1",
      time: new Date("2024-01-20T14:30:00Z"),
      channel: "email",
      templateKey: "welcome",
      status: "sent",
    },
    {
      id: "notif_2",
      time: new Date("2024-01-20T10:15:00Z"),
      channel: "sms",
      templateKey: "transaction.alert",
      status: "sent",
    },
    {
      id: "notif_3",
      time: new Date("2024-01-19T16:45:00Z"),
      channel: "email",
      templateKey: "password.reset",
      status: "failed",
      error: "Invalid email address",
    },
    {
      id: "notif_4",
      time: new Date("2024-01-19T09:30:00Z"),
      channel: "sms",
      templateKey: "verification.code",
      status: "sent",
    },
    {
      id: "notif_5",
      time: new Date("2024-01-18T13:20:00Z"),
      channel: "email",
      templateKey: "receipt.created",
      status: "queued",
    },
  ];

  const handleSendTestEmail = async () => {
    setIsSending("email");
    try {
      await new Promise(resolve => setTimeout(resolve, TEST_NOTIFICATION_DELAY));
      toast.success("Test email sent successfully");
    } catch {
      toast.error("Failed to send test email");
    } finally {
      setIsSending(null);
    }
  };

  const handleSendTestSms = async () => {
    setIsSending("sms");
    try {
      await new Promise(resolve => setTimeout(resolve, TEST_NOTIFICATION_DELAY));
      toast.success("Test SMS sent successfully");
    } catch {
      toast.error("Failed to send test SMS");
    } finally {
      setIsSending(null);
    }
  };

  const handlePreferenceChange = (
    channel: "email" | "sms",
    key: string,
    value: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: value,
      },
    }));
    toast.success("Preference updated");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "inapp":
        return <Bell className="h-4 w-4" />;
      case "webhook":
        return <Send className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "queued":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "sent":
        return "default";
      case "failed":
        return "destructive";
      case "queued":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTemplateDisplayName = (templateKey: string) => {
    switch (templateKey) {
      case "welcome":
        return "Welcome Email";
      case "transaction.alert":
        return "Transaction Alert";
      case "password.reset":
        return "Password Reset";
      case "verification.code":
        return "Verification Code";
      case "receipt.created":
        return "Receipt Created";
      default:
        return templateKey;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications & Preferences
        </CardTitle>
        <CardDescription>
          Delivery preferences and notification history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Preferences */}
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Preferences</h4>
          
          {/* Email Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Email Notifications</span>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable email notifications</span>
                <Switch
                  checked={preferences.email.enabled}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("email", "enabled", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Newsletters & updates</span>
                <Switch
                  checked={preferences.email.newsletters}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("email", "newsletters", checked)
                  }
                  disabled={!preferences.email.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Transaction alerts</span>
                <Switch
                  checked={preferences.email.transactionAlerts}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("email", "transactionAlerts", checked)
                  }
                  disabled={!preferences.email.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security alerts</span>
                <Switch
                  checked={preferences.email.securityAlerts}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("email", "securityAlerts", checked)
                  }
                  disabled={!preferences.email.enabled}
                />
              </div>
            </div>
          </div>

          {/* SMS Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">SMS Notifications</span>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable SMS notifications</span>
                <Switch
                  checked={preferences.sms.enabled}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("sms", "enabled", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Transaction alerts</span>
                <Switch
                  checked={preferences.sms.transactionAlerts}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("sms", "transactionAlerts", checked)
                  }
                  disabled={!preferences.sms.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security alerts</span>
                <Switch
                  checked={preferences.sms.securityAlerts}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("sms", "securityAlerts", checked)
                  }
                  disabled={!preferences.sms.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Marketing messages</span>
                <Switch
                  checked={preferences.sms.marketingMessages}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("sms", "marketingMessages", checked)
                  }
                  disabled={!preferences.sms.enabled}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Actions */}
        <div className="space-y-3">
          <h4 className="font-medium">Test Notifications</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={isSending === "email"}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isSending === "email" ? "Sending..." : "Send Test Email"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendTestSms}
              disabled={isSending === "sms"}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {isSending === "sms" ? "Sending..." : "Send Test SMS"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notification History */}
        <div className="space-y-4">
          <h4 className="font-medium">Recent History</h4>
          {notificationHistory.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No notifications sent yet
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationHistory.slice(0, RECENT_NOTIFICATIONS_LIMIT).map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(notification.time)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(notification.channel)}
                          <span className="capitalize">{notification.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTemplateDisplayName(notification.templateKey)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(notification.status)}
                          <Badge variant={getStatusVariant(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {notification.error || "—"}
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