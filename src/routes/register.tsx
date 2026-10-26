import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "@/screens/auth";

export const Route = createFileRoute("/register")({
  component: RegisterScreen,
});
