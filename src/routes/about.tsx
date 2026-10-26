import { createFileRoute } from "@tanstack/react-router";
import { AboutScreen } from "@/screens/account";

export const Route = createFileRoute("/about")({
  component: AboutScreen,
});
