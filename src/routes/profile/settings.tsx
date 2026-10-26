import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/settings")({
  component: SettingsScreen,
});
