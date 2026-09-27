"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { api } from "@/lib/api/client";
import type { Workspace } from "@/lib/api/types";

export function useWorkspaces() {
  return useQuery({ queryKey: ["workspaces"], queryFn: api.listWorkspaces });
}

const WorkspaceContext = createContext<Workspace | null>(null);

export const WorkspaceProvider = WorkspaceContext.Provider;

/** The workspace (tenant) in the URL. Only usable inside /w/[workspace]. */
export function useCurrentWorkspace() {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error("useCurrentWorkspace must be used inside /w/[workspace]");
  return workspace;
}
