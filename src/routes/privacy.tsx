import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "@/screens/account";

export const Route = createFileRoute("/privacy")({
  component: function PrivacyRoute() {
    return <LegalScreen kind="privacy" />;
  },
});
