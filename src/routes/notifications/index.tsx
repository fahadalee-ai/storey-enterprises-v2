import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/screens/inbox";

export const Route = createFileRoute("/notifications/")({
  component: NotificationsScreen,
});
