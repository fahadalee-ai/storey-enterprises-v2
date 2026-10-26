import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/screens/auth";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});
