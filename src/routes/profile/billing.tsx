import { createFileRoute } from "@tanstack/react-router";
import { BillingScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/billing")({
  component: BillingScreen,
});
