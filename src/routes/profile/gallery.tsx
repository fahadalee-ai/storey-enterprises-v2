import { createFileRoute } from "@tanstack/react-router";
import { GalleryScreen } from "@/screens/account";

export const Route = createFileRoute("/profile/gallery")({
  component: GalleryScreen,
});
