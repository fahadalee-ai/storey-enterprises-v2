import { createFileRoute } from "@tanstack/react-router";
import { PaymentMethodsScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/payments")({
  component: PaymentMethodsScreen,
});
