import * as React from "react";
import {
  createContext,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./components/workhorse/queries";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

export interface SqContext {
  clientId: string;
  state: string;
  token: string;
}

export const sqContext = createContext<SqContext>({
  clientId: "sandbox-sq0idb-Zo_kJ9WN2IDavTl6AbFO2g",
  state: "",
  token: "",
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Unicase:wght@500;600;700;900&family=EB+Garamond:wght@400;500;600&display=swap",
  },
  {
    rel: "stylesheet",
    href: "/app.css",
    type: "text/css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <InitColorSchemeScript attribute="class" />
        <React.Fragment>
          <ThemeProvider disableTransitionOnChange={false} theme={theme}>
            <CssBaseline enableColorScheme />
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ThemeProvider>
        </React.Fragment>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
