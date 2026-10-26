import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/")({
  component: ProfileScreen,
});
