import { createFileRoute } from "@tanstack/react-router";
import { ServiceDetailScreen } from "@/screens/home";

export const Route = createFileRoute("/services/$id")({
  component: function ServiceRoute() {
    const { id } = Route.useParams();
    return <ServiceDetailScreen id={id} />;
  },
});
