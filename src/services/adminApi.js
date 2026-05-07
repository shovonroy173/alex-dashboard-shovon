import {
  apiRequest,
  apiRequestWithFallback,
  createPath,
  ApiError,
  buildApiUrl,
  extractApiErrorMessage,
  refreshAdminSession,
} from "./httpClient";
import { clearAdminSession, getAdminSession, isTokenExpired } from "../utils/auth";

const toListQuery = (query = {}) => ({
  ...query,
});

export const createAdmin = async ({ fullname, phone, email, password, image }) => {
  const formData = new FormData();
  formData.append("fullname", fullname);
  formData.append("email", email);
  formData.append("password", password);
  if (phone) {
    formData.append("phone", phone);
  }
  if (image) {
    formData.append("image", image);
  }

  return await apiRequest("/admin/admins", {
    method: "POST",
    body: formData,
  });
};

export const listAdmins = (query = {}) => {
  const blockedOnly = query.blockedOnly ?? query.blocked_only ?? undefined;
  return apiRequest("/admin/admins", {
    query: {
      blockedOnly: blockedOnly === undefined ? undefined : Boolean(blockedOnly),
    },
  });
};

export const getAdminById = ({ id }) =>
  apiRequest(createPath("/admin/admins/:id", { id }));

export const blockAdmin = ({ id }) =>
  apiRequest(createPath("/admin/admins/:id/block", { id }), {
    method: "POST",
    body: {},
  });

export const unblockAdmin = ({ id }) =>
  apiRequest(createPath("/admin/admins/:id/unblock", { id }), {
    method: "POST",
    body: {},
  });

export const getMyProfile = () =>
  apiRequestWithFallback(["/admin/profile", "/admin/settings/profile"]);

export const updateMyProfile = (body) =>
  apiRequestWithFallback(["/admin/profile", "/admin/settings/profile"], {
    method: "PATCH",
    body,
    contentType: body instanceof FormData ? null : "application/json",
  });

export const updateAdminProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return apiRequest("/admin/profile/image", {
    method: "PATCH",
    body: formData,
  });
};

export const getDashboardOverview = () =>
  apiRequestWithFallback([
    "/admin/dashboard/overview",
    "/dashboard/overview"
  ]);

export const getDashboardSummary = (query = {}) =>
  apiRequest("/admin/dashboard/summary", {
    query: toListQuery(query),
  });

export const getDashboardAnalytics = async (query = {}) => {
  const queryCandidates = [
    { ...toListQuery(query) },
    {},
  ];

  for (const candidateQuery of queryCandidates) {
    try {
      return await apiRequestWithFallback(
        ["/admin/dashboard/analytics", "/dashboard/analytics"],
        { query: candidateQuery }
      );
    } catch (error) {
      if (error?.status !== 404 && error?.status !== 400) {
        throw error;
      }
    }
  }

  return apiRequest("/admin/dashboard/overview");
};

export const listRecentUsers = (query = {}) =>
  apiRequest("/admin/dashboard/recent-users", { query: toListQuery(query) });

export const getDashboardNotificationPreview = () =>
  apiRequest("/admin/dashboard/notifications/preview");

export const listUsers = (query = {}) =>
  apiRequestWithFallback(["/admin/users"], { query: toListQuery(query) });

const pickFirst = (...values) => values.find((v) => v !== undefined && v !== null);

const buildUserListVariants = (query = {}) => {
  const page = pickFirst(query.page, 1);
  const pageSize = pickFirst(query.pageSize, query.limit, 10);
  const keyword = pickFirst(query.search, query.query, query.q, "");

  return [
    { page, pageSize, search: keyword || undefined },
    { page, pageSize, query: keyword || undefined },
    { page, pageSize, q: keyword || undefined },
  ];
};

export const listUsersSafe = async (query = {}) => {
  const variants = buildUserListVariants(query);

  for (const q of variants) {
    try {
      return await apiRequest("/admin/users", { query: q });
    } catch (error) {
      if (error?.status !== 400 && error?.status !== 404 && error?.status !== 422) {
        throw error;
      }
    }
  }

  return apiRequest("/admin/users/search", {
    query: {
      q: pickFirst(query.search, query.query, query.q, ""),
      pageSize: pickFirst(query.pageSize, query.limit, 10),
    },
  });
};

export const searchUsers = (query = {}) =>
  apiRequest("/admin/users/search", {
    query: {
      q: pickFirst(query.q, query.search, query.query, ""),
      pageSize: pickFirst(query.pageSize, query.limit, 10),
    },
  });

export const listBlockedUsers = (query = {}) =>
  apiRequest("/admin/users/blocked", {
    query: {
      page: pickFirst(query.page, 1),
      pageSize: pickFirst(query.pageSize, query.limit, 10),
      search: pickFirst(query.search, query.query, query.q, ""),
    },
  });

export const getUserById = ({ id }) =>
  apiRequest(createPath("/admin/users/:id", { id }));

export const adjustUserPoints = ({ id, pointsDelta, reason }) =>
  apiRequest(createPath("/admin/users/:id/points", { id }), {
    method: "PATCH",
    body: {
      pointsDelta,
      reason,
    },
  });

export const blockUser = ({ id }) =>
  apiRequestWithFallback(
    [
      createPath("/admin/users/:id/block", { id }),
      createPath("/admin/users/:id/ban", { id }),
    ],
    { method: "POST", body: {} }
  );

export const unblockUser = ({ id }) =>
  apiRequestWithFallback(
    [
      createPath("/admin/users/:id/unblock", { id }),
      createPath("/admin/users/:id/unban", { id }),
    ],
    { method: "POST", body: {} }
  );

export const addUserNote = ({ id, body }) =>
  apiRequest(createPath("/admin/users/:id/notes", { id }), {
    method: "POST",
    body,
  });

export const updateUserStatus = ({ id, status }) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "blocked" || normalized === "inactive") {
    return blockUser({ id }).catch((error) => {
      if (error?.status === 404 || error?.status === 405) {
        return apiRequestWithFallback(
          [
            createPath("/admin/users/:id/status", { id }),
            createPath("/admin/users/:id", { id }),
          ],
          {
            method: "PATCH",
            body: { status: "blocked", isBlocked: true, blocked: true },
          }
        );
      }
      throw error;
    });
  }

  if (normalized === "active" || normalized === "unblocked") {
    return unblockUser({ id }).catch((error) => {
      if (error?.status === 404 || error?.status === 405) {
        return apiRequestWithFallback(
          [
            createPath("/admin/users/:id/status", { id }),
            createPath("/admin/users/:id", { id }),
          ],
          {
            method: "PATCH",
            body: { status: "active", isBlocked: false, blocked: false },
          }
        );
      }
      throw error;
    });
  }

  return apiRequestWithFallback(
    [createPath("/admin/users/:id/status", { id })],
    {
      method: "PATCH",
      body: { status },
    }
  );
};

export const listActivities = (query = {}) =>
  apiRequestWithFallback(["/admin/activities"], { query: toListQuery(query) });

export const listEvents = (query = {}) =>
  apiRequestWithFallback(["/admin/events"], { query: toListQuery(query) });

export const getActivityById = ({ id }) =>
  apiRequest(createPath("/admin/activities/:id", { id }));

export const approveActivity = ({ id, body }) =>
  apiRequest(createPath("/admin/activities/:id/approve", { id }), {
    method: "POST",
    body,
  });

export const cancelActivity = ({ id, body }) =>
  apiRequest(createPath("/admin/activities/:id/cancel", { id }), {
    method: "POST",
    body,
  });

export const deleteActivity = ({ id }) =>
  apiRequest(createPath("/admin/activities/:id", { id }), { method: "DELETE" });

export const searchActivities = (query = {}) =>
  apiRequest("/admin/activities/search", { query: toListQuery(query) });

export const updateActivityStatus = ({ id, status, body = {} }) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved") return approveActivity({ id, body });
  if (normalized === "cancelled" || normalized === "canceled") {
    return cancelActivity({ id, body });
  }
  return apiRequestWithFallback(
    [createPath("/admin/activities/:id/status", { id })],
    {
      method: "PATCH",
      body: { status, ...body },
    }
  );
};

export const updateEventStatus = ({ id, status, body = {} }) =>
  apiRequestWithFallback(
    [createPath("/admin/events/:id/status", { id })],
    {
      method: "PATCH",
      body: { status, ...body },
    }
  );

// ---------------- Rewards API ----------------

export const listRewards = (query = {}) =>
  apiRequest("/admin/rewards", { query: toListQuery(query) });

export const getReward = ({ id }) =>
  apiRequest(createPath("/admin/rewards/:id", { id }));

export const getRewardAnalytics = () =>
  apiRequest("/admin/rewards/analytics");

export const createReward = (formData) =>
  apiRequest("/admin/rewards", {
    method: "POST",
    body: formData,
  });

export const updateReward = ({ id, body }) =>
  apiRequest(createPath("/admin/rewards/:id", { id }), {
    method: "PATCH",
    body,
  });

export const deleteReward = ({ id }) =>
  apiRequest(createPath("/admin/rewards/:id", { id }), {
    method: "DELETE",
  });

// ---------------- Daily Rewards API ----------------

export const listDailyRewards = (query = {}) =>
  apiRequest("/admin/daily-rewards", { query: toListQuery(query) });

export const getDailyReward = ({ id }) =>
  apiRequest(createPath("/admin/daily-rewards/:id", { id }));

export const getDailyRewardAnalytics = () =>
  apiRequest("/admin/daily-rewards/analytics");

export const createDailyReward = (formData) =>
  apiRequest("/admin/daily-rewards", {
    method: "POST",
    body: formData,
  });

export const updateDailyReward = ({ id, body }) =>
  apiRequest(createPath("/admin/daily-rewards/:id", { id }), {
    method: "PATCH",
    body,
  });

export const deleteDailyReward = ({ id }) =>
  apiRequest(createPath("/admin/daily-rewards/:id", { id }), {
    method: "DELETE",
  });

// ---------------- Spin Wheel API ----------------

export const getSpinWheelAnalytics = () =>
  apiRequest("/admin/spin-wheel/analytics");

export const getSpinWheelSettings = () =>
  apiRequest("/admin/spin-wheel/settings");

export const updateSpinWheelSettings = (body) =>
  apiRequest("/admin/spin-wheel/settings", {
    method: "PATCH",
    body,
  });

export const listSubscriptions = (query = {}) =>
  apiRequestWithFallback(["/admin/subscriptions"], { query: toListQuery(query) });

export const getSubscriptionFees = () => apiRequest("/admin/subscriptions/fees");

export const updateSubscriptionFees = (body) =>
  apiRequestWithFallback(
    ["/admin/subscriptions/fees"],
    { method: "PATCH", body }
  ).catch((error) => {
    if (error?.status === 404 || error?.status === 405) {
      return apiRequest("/admin/subscriptions/fees", { method: "PUT", body });
    }
    throw error;
  });

export const getSubscriptionById = ({ id }) =>
  apiRequest(createPath("/admin/subscriptions/:id", { id }));

export const searchSubscriptions = (body) =>
  apiRequest("/admin/subscriptions/search", { method: "POST", body });

export const listAdminNotifications = (query = {}) =>
  apiRequestWithFallback(["/admin/notifications"], {
    query: toListQuery(query),
  });

export const getUnreadNotificationCount = async () => {
  try {
    const payload = await apiRequestWithFallback(["/admin/notifications/unread-count"]);
    const data = payload?.data || payload;
    return { data: { count: Number(data?.count || 0) } };
  } catch {
    const payload = await apiRequestWithFallback(["/admin/notifications"], {
      query: { page: 1, limit: 100 },
    });
    const data = payload?.data || payload;
    const items = Array.isArray(data) ? data : data?.items || data?.rows || [];
    const unread = Array.isArray(items)
      ? items.filter((item) => !(item?.isRead || item?.read)).length
      : 0;
    return { data: { count: unread } };
  }
};

export const markNotificationRead = ({ id }) =>
  apiRequestWithFallback(
    [createPath("/admin/notifications/:id/read", { id })],
    { method: "PATCH" }
  );

export const markAllNotificationsRead = () =>
  apiRequestWithFallback(["/admin/notifications/read-all"], {
    method: "PATCH",
  });

export const getSettingsProfile = () =>
  apiRequestWithFallback(["/admin/settings/profile", "/admin/profile"]);

export const updateSettingsProfile = (body) =>
  apiRequestWithFallback(["/admin/settings/profile", "/admin/profile"], {
    method: "PUT",
    body,
  });

export const getSettingsSecurity = () =>
  apiRequestWithFallback(["/admin/settings/security"]);

export const updateSettingsSecurity = (body) =>
  apiRequestWithFallback(["/admin/settings/security", "/admin/password"], {
    method: "PUT",
    body,
  });

// ---------------- Routes API ----------------

export const listAdminRoutes = (query = {}) =>
  apiRequest("/admin/routes", {
    query: toListQuery(query),
  });

export const getAdminRoute = ({ id }) =>
  apiRequest(createPath("/admin/routes/:id", { id }));

export const createAdminRoute = (body) =>
  apiRequest("/admin/routes", {
    method: "POST",
    body,
  });

export const updateAdminRoute = ({ id, body }) =>
  apiRequest(createPath("/admin/routes/:id", { id }), {
    method: "PATCH",
    body,
  });

export const deleteAdminRoute = ({ id }) =>
  apiRequest(createPath("/admin/routes/:id", { id }), {
    method: "DELETE",
  });

export const searchRouteRestaurantsByCity = (query = {}) =>
  apiRequest("/admin/routes/restaurants/search", {
    query: toListQuery(query),
  });

// ---------------- Restaurants API ----------------

export const getRestaurants = async (query = {}) =>
  apiRequestWithFallback(["/admin/restaurants"], { 
    query: toListQuery(query) 
  });

export const createRestaurant = async (formData) =>
  apiRequest("/admin/restaurants", {
    method: "POST",
    body: formData,
  });

export const deleteRestaurant = async ({ id }) =>
  apiRequest(`/admin/restaurants/${id}`, {
    method: "DELETE",
  });

export const getRestaurantById = async (id) =>
  apiRequestWithFallback([`/admin/restaurants/${id}`]);

export const updateRestaurant = async (id, formData) =>
  apiRequest(`/admin/restaurants/${id}`, {
    method: "PUT",
    body: formData,
  });

export const getRestaurantMenu = async (id) =>
  apiRequestWithFallback([`/admin/restaurants/${id}/menu`]);

export const listRestaurantMenuItems = async (id) =>
  apiRequestWithFallback([`/admin/restaurants/${id}/menu/items`]);

export const createRestaurantMenuItem = async (id, payload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("pointsToBuy", String(payload.pointsToBuy));
  formData.append("isAvailable", String(Boolean(payload.isAvailable)));

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return apiRequest(`/admin/restaurants/${id}/menu/items`, {
    method: "POST",
    body: formData,
  });
};

export const updateRestaurantMenuItem = async (id, itemId, payload) => {
  const formData = new FormData();

  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.price !== undefined) {
    formData.append("price", String(payload.price));
  }
  if (payload.pointsToBuy !== undefined) {
    formData.append("pointsToBuy", String(payload.pointsToBuy));
  }
  if (payload.isAvailable !== undefined) {
    formData.append("isAvailable", String(Boolean(payload.isAvailable)));
  }
  if (payload.imageUrl !== undefined) {
    formData.append("imageUrl", payload.imageUrl || "");
  }
  if (payload.image) {
    formData.append("image", payload.image);
  }

  return apiRequest(`/admin/restaurants/${id}/menu/items/${itemId}`, {
    method: "PATCH",
    body: formData,
  });
};

export const getPackageCatalog = async () =>
  apiRequestWithFallback(["/admin/packages/catalog"]);

export const activateRestaurantPackage = async (id, pkgCode) =>
  apiRequest(`/admin/packages/restaurants/${id}/activate`, {
    method: "POST",
    body: { package: pkgCode },
  });

export const upgradeRestaurantPackage = async (id, pkgCode) =>
  apiRequest(`/admin/packages/restaurants/${id}/upgrade`, {
    method: "POST",
    body: { package: pkgCode },
  });

// ---------------- QR Codes API ----------------
export const getQrCodes = async (query = {}) =>
  apiRequest("/admin/qr-codes", { query: toListQuery(query) });

export const getQrCodeDetails = async (id) =>
  apiRequest(`/admin/qr-codes/${id}`);

export const getQrCodeImageUrl = (id) =>
  buildApiUrl(`/admin/qr-codes/${id}/image`);

export const getQrCodePdfUrl = (id) =>
  buildApiUrl(`/admin/qr-codes/${id}/pdf`);

const downloadBinaryFile = async (path, filename) => {
  let session = getAdminSession();

  if (!session?.accessToken) {
    clearAdminSession();
    throw new ApiError("Unauthorized. Please sign in again.", 401, {
      message: "Missing access token",
    });
  }

  if (isTokenExpired(session.accessToken)) {
    session = await refreshAdminSession();
  }

  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : {
          message: (await response.text()) || "",
        };

    if (response.status === 401) {
      try {
        session = await refreshAdminSession();
        const retryResponse = await fetch(buildApiUrl(path), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (retryResponse.ok) {
          const retryBlob = await retryResponse.blob();
          const retryUrl = window.URL.createObjectURL(retryBlob);
          const retryAnchor = document.createElement("a");
          retryAnchor.href = retryUrl;
          retryAnchor.download = filename;
          document.body.appendChild(retryAnchor);
          retryAnchor.click();
          retryAnchor.remove();
          window.URL.revokeObjectURL(retryUrl);
          return;
        }

        const retryContentType = retryResponse.headers.get("content-type") || "";
        const retryPayload = retryContentType.includes("application/json")
          ? await retryResponse.json()
          : {
              message: (await retryResponse.text()) || "",
            };
        if (retryResponse.status === 401) {
          clearAdminSession();
        }
        throw new ApiError(
          extractApiErrorMessage(retryPayload) || "Download failed",
          retryResponse.status,
          retryPayload
        );
      } catch (refreshError) {
        if (refreshError instanceof ApiError) {
          throw refreshError;
        }
        clearAdminSession();
        throw new ApiError("Session refresh failed", 401, {
          message: "Session refresh failed",
        });
      }
    }
    throw new ApiError(
      extractApiErrorMessage(payload) || "Download failed",
      response.status,
      payload
    );
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadQrCodeImage = (id) =>
  downloadBinaryFile(`/admin/qr-codes/${id}/image`, `${id}-qr.png`);

export const downloadQrCodePdf = (id) =>
  downloadBinaryFile(`/admin/qr-codes/${id}/pdf`, `${id}-qr.pdf`);
