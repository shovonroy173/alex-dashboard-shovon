import { apiRequest, createPath } from "./httpClient";

/**
 * List challenges with optional filters
 */
export const listChallenges = (query = {}) =>
  apiRequest("/admin/challenges", { query });

/**
 * Get details of a specific challenge
 */
export const getChallenge = (challengeId) =>
  apiRequest(createPath("/admin/challenges/:id", { id: challengeId }));

/**
 * Create a new challenge
 */
export const createChallenge = (body) =>
  apiRequest("/admin/challenges", {
    method: "POST",
    body,
  });

/**
 * Update an existing challenge
 */
export const updateChallenge = (challengeId, body) =>
  apiRequest(createPath("/admin/challenges/:id", { id: challengeId }), {
    method: "PATCH",
    body,
  });

/**
 * Delete a challenge
 */
export const deleteChallenge = (challengeId) =>
  apiRequest(createPath("/admin/challenges/:id", { id: challengeId }), {
    method: "DELETE",
  });

/**
 * Get analytics for a specific challenge
 */
export const getChallengeAnalytics = (challengeId) =>
  apiRequest(createPath("/admin/challenges/:id/analytics", { id: challengeId }));
