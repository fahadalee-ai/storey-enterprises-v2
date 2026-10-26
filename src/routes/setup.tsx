import { createFileRoute } from "@tanstack/react-router";
import { SetupScreen } from "@/screens/auth";

export const Route = createFileRoute("/setup")({
  component: SetupScreen,
});
