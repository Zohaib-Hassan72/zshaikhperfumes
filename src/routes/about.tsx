import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: () => <Navigate to="/pages/$slug" params={{ slug: "about" }} />,
});
