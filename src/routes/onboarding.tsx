import { createFileRoute } from "@tanstack/react-router";
import { OnboardingScreen } from "@/screens/auth";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingScreen,
});
