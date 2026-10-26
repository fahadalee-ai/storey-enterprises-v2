import { createFileRoute } from "@tanstack/react-router";
import { DeleteAccountScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/delete")({
  component: DeleteAccountScreen,
});
