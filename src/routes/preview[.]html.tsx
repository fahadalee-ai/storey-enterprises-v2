import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/preview.html")({
  component: PreviewHtmlPage,
});

function PreviewHtmlPage() {
  useEffect(() => {
    window.location.replace("/preview.html");
  }, []);
  return null;
}
