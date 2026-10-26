import { createFileRoute } from "@tanstack/react-router";
import { HelpScreen } from "@/screens/account";

export const Route = createFileRoute("/help")({
  component: HelpScreen,
});
