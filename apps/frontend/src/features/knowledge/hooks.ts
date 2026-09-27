"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

export const documentsKey = (workspaceId: string) => ["documents", workspaceId];

export function useDocuments(workspaceId: string) {
  return useQuery({
    queryKey: documentsKey(workspaceId),
    queryFn: () => api.listDocuments(workspaceId),
    // Poll while anything is still processing so progress and status update on their own.
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === "processing") ? 1000 : false,
  });
}

export function useUploadDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadDocument(workspaceId, file),
    onSettled: () => queryClient.invalidateQueries({ queryKey: documentsKey(workspaceId) }),
  });
}

export function useDeleteDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDocument,
    onSettled: () => queryClient.invalidateQueries({ queryKey: documentsKey(workspaceId) }),
  });
}
