import { apiRequest, apiRequestWithFallback, createPath } from "./httpClient";

export const listAds = (query = {}) =>
  apiRequestWithFallback(["/admin/ads", "/ads/admin"], { query });

export const createAd = (body) =>
  apiRequestWithFallback(["/admin/ads", "/ads/admin"], {
    method: "POST",
    body,
    contentType: body instanceof FormData ? null : "application/json",
  });

export const updateAd = ({ id, body }) =>
  apiRequestWithFallback(
    [createPath("/admin/ads/:id", { id }), createPath("/ads/admin/:id", { id })],
    {
      method: "PATCH",
      body,
      contentType: body instanceof FormData ? null : "application/json",
    }
  ).catch((error) => {
    if (error?.status === 404 || error?.status === 405) {
      return apiRequest(createPath("/admin/ads/:id", { id }), {
        method: "PUT",
        body,
        contentType: body instanceof FormData ? null : "application/json",
      });
    }
    throw error;
  });

export const deleteAd = ({ id }) =>
  apiRequestWithFallback(
    [createPath("/admin/ads/:id", { id }), createPath("/ads/admin/:id", { id })],
    { method: "DELETE" }
  );

export const updateAdStatus = ({ id, body }) =>
  updateAd({
    id,
    body: {
      status: body?.status,
    },
  });
