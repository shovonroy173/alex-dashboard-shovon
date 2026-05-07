import { apiRequest, createPath } from "./httpClient";

const toListQuery = (query = {}) => ({
  ...query,
  pageSize: query.pageSize ?? query.limit,
});

export const listCampaigns = (query = {}) =>
  apiRequest("/admin/notification-campaigns", { query: toListQuery(query) });

export const getCampaign = ({ id }) =>
  apiRequest(createPath("/admin/notification-campaigns/:id", { id }));

export const createCampaign = (body) =>
  apiRequest("/admin/notification-campaigns", {
    method: "POST",
    body,
  });

export const updateCampaign = ({ id, body }) =>
  apiRequest(createPath("/admin/notification-campaigns/:id", { id }), {
    method: "PATCH",
    body,
  });

export const deleteCampaign = ({ id }) =>
  apiRequest(createPath("/admin/notification-campaigns/:id", { id }), {
    method: "DELETE",
  });
