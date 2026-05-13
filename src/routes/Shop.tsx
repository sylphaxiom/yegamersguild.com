import type { Route } from "./+types/Shop";
import { Outlet } from "react-router";
import { authMiddleware } from "~/components/workhorse/middleware";
import { sqContext } from "~/root";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  authMiddleware,
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Browse the store inventory." },
  ];
}

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  if (token != "") {
  }
  return context.get(sqContext);
}

export default function Shop() {
  return <Outlet />;
}
