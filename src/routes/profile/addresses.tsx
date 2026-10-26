import { createFileRoute } from "@tanstack/react-router";
import { AddressesScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/addresses")({
  component: AddressesScreen,
});
