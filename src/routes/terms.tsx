import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "@/screens/account";

export const Route = createFileRoute("/terms")({
  component: function TermsRoute() {
    return <LegalScreen kind="terms" />;
  },
});
