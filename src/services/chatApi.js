import { apiRequest } from "./httpClient";

const getThreadIdOrThrow = (threadId) => {
  const value = String(threadId || "").trim();
  if (!value) {
    throw new Error("Missing thread id.");
  }
  return encodeURIComponent(value);
};

export const listThreads = () => apiRequest("/chat/threads");

export const ensureAdminThread = () =>
  apiRequest("/chat/threads/admin", { method: "POST" });

export const listThreadMessages = ({ threadId }) =>
  apiRequest(`/chat/threads/${getThreadIdOrThrow(threadId)}/messages`);

export const sendThreadMessage = ({ threadId, body }) =>
  apiRequest(`/chat/threads/${getThreadIdOrThrow(threadId)}/messages`, {
    method: "POST",
    body,
  });

export const markThreadSeen = ({ threadId }) =>
  apiRequest(`/chat/threads/${getThreadIdOrThrow(threadId)}/seen`, {
    method: "POST",
  });

// Backward compatible names in case any old imports still exist.
export const listConversations = listThreads;
export const listMessages = ({ threadId }) => listThreadMessages({ threadId });
export const sendMessage = ({ threadId, body }) =>
  sendThreadMessage({ threadId, body });
