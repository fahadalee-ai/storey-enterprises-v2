import { createFileRoute } from "@tanstack/react-router";
import { EditProfileScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfileScreen,
});
