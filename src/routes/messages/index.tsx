import { createFileRoute } from "@tanstack/react-router";
import { MessagesScreen } from "@/screens/inbox";

export const Route = createFileRoute("/messages/")({
  component: MessagesScreen,
});
