import { createFileRoute } from "@tanstack/react-router";
import { ContactScreen } from "@/screens/account";

export const Route = createFileRoute("/contact")({
  component: ContactScreen,
});
