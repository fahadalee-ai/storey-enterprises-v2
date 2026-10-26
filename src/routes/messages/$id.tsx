import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/screens/inbox";

export const Route = createFileRoute("/messages/$id")({
  component: function ChatRoute() {
    const { id } = Route.useParams();
    return <ChatScreen id={id} />;
  },
});
