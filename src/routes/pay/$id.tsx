import { createFileRoute } from "@tanstack/react-router";
import { PaymentScreen } from "@/screens/money";

export const Route = createFileRoute("/pay/$id")({
  component: function PayRoute() {
    const { id } = Route.useParams();
    return <PaymentScreen id={id} />;
  },
});
