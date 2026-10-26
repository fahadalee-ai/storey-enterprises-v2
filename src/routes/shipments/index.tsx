import { createFileRoute } from "@tanstack/react-router";
import { ShipmentsScreen } from "@/screens/shipments";

export const Route = createFileRoute("/shipments/")({
  component: ShipmentsScreen,
});
