import { createFileRoute } from "@tanstack/react-router";
import { QuoteScreen } from "@/screens/money";

export const Route = createFileRoute("/quotes/$id")({
  component: function QuoteRoute() {
    const { id } = Route.useParams();
    return <QuoteScreen id={id} />;
  },
});
