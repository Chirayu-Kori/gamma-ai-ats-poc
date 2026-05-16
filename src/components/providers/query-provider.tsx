"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

/**
 * Creates a new QueryClient instance with reasonable defaults.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        // Disable automatic refetching on window focus for better developer experience
        refetchOnWindowFocus: false,
        // Set a reasonable limit for retries
        retry: 1,
      },
    },
  });
}

/**
 * Persists the QueryClient instance on the browser to avoid re-creation
 * on every render, while ensuring a fresh one is created per request on the server.
 */
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is vital to avoid re-creating the client if React suspends during initial render.
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you want
  // to use suspense boundary on the server-side, because useState
  // will be re-initialized on the client rendering.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
