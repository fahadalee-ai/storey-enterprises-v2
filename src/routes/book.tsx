import { createFileRoute } from "@tanstack/react-router";
import { BookingScreen } from "@/screens/booking";

export const Route = createFileRoute("/book")({
  component: BookingScreen,
});
