import { createFileRoute } from "@tanstack/react-router";
import { ShipmentDetailScreen } from "@/screens/shipments";

export const Route = createFileRoute("/shipments/$id")({
  component: function ShipmentRoute() {
    const { id } = Route.useParams();
    return <ShipmentDetailScreen id={id} />;
  },
});
