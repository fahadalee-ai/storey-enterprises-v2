import { createFileRoute } from "@tanstack/react-router";
import { NotificationSettingsScreen } from "@/screens/inbox";

export const Route = createFileRoute("/notifications/settings")({
  component: NotificationSettingsScreen,
});
