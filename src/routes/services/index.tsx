import { createFileRoute } from "@tanstack/react-router";
import { ServicesScreen } from "@/screens/home";

export const Route = createFileRoute("/services/")({
  component: ServicesScreen,
});
