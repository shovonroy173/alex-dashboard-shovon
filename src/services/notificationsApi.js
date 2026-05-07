import { apiRequest } from "./httpClient";

const toListQuery = (query = {}) => ({
  ...query,
  pageSize: query.pageSize ?? query.limit,
});

export const getNotificationsPreview = (query = {}) =>
  apiRequest("/admin/notifications", {
    query: { context: "preview", ...toListQuery(query) },
  });

export const listNotifications = (query = {}) =>
  apiRequest("/admin/notifications", {
    query: { context: "full", ...toListQuery(query) },
  });

export const markNotificationsRead = (body) =>
  apiRequest("/admin/notifications/read", {
    method: "POST",
    body,
  });
