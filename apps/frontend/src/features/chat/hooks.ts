"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

export const conversationsKey = (workspaceId: string) => ["conversations", workspaceId];
export const conversationKey = (conversationId: string) => ["conversation", conversationId];

export function useConversations(workspaceId: string) {
  return useQuery({
    queryKey: conversationsKey(workspaceId),
    queryFn: () => api.listConversations(workspaceId),
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: conversationKey(conversationId),
    queryFn: () => api.getConversation(conversationId),
    retry: false,
  });
}

export function useDeleteConversation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteConversation,
    onSuccess: (_data, conversationId) =>
      queryClient.removeQueries({ queryKey: conversationKey(conversationId) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: conversationsKey(workspaceId) }),
  });
}
