import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
  isTokenExpired,
} from "../utils/auth";
import { getStaticMockResponse } from "./staticMockApi";

const DEFAULT_API_BASE_URL = "http://localhost:5191";
const DEFAULT_API_PREFIX = "/api/v1";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
const API_PREFIX = import.meta.env.VITE_API_PREFIX?.trim() || DEFAULT_API_PREFIX;
const STATIC_MODE = import.meta.env.VITE_STATIC_MODE !== "false";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const buildApiUrl = (path, { skipPrefix = false } = {}) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const prefixedPath = skipPrefix || normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `${API_PREFIX.replace(/\/+$/, "")}${normalizedPath}`;

  return `${API_BASE_URL.replace(/\/+$/, "")}${prefixedPath}`;
};

export const createPath = (template, params = {}) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    const encoded = encodeURIComponent(String(value));
    return acc.replaceAll(`:${key}`, encoded);
  }, template);
};

const appendQuery = (path, query = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        searchParams.append(key, String(entry));
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${queryString}`;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const redirectToSignIn = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/sign-in") {
    window.location.replace("/sign-in");
  }
};

const extractAuthPayload = (payload) => payload?.data || payload || {};

const persistSessionFromAuthPayload = (payload, fallbackSession = null) => {
  const data = extractAuthPayload(payload);
  if (!data?.access_token) {
    throw new ApiError(
      extractApiErrorMessage(payload) || "Authentication failed",
      401,
      payload
    );
  }

  const email = data?.email || fallbackSession?.email || "";
  setAdminSession({
    email,
    accessToken: data.access_token,
    refreshToken: data.refresh_token || fallbackSession?.refreshToken || null,
    profile: {
      uid: data?.uid,
      email,
      role: data?.role,
      isVerified: data?.is_verified,
    },
  });

  return getAdminSession();
};

export const refreshAdminSession = async () => {
  const session = getAdminSession();
  const refreshToken = session?.refreshToken;

  if (!refreshToken) {
    clearAdminSession();
    throw new ApiError("Unauthorized. Please sign in again.", 401, {
      message: "Missing refresh token",
    });
  }

  const response = await fetch(buildApiUrl("/admin/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminSession();
      redirectToSignIn();
    }

    throw new ApiError(
      extractApiErrorMessage(payload) || "Session refresh failed",
      response.status,
      payload
    );
  }

  return persistSessionFromAuthPayload(payload, session);
};

const ensureFreshAdminSession = async () => {
  const session = getAdminSession();

  if (!session?.accessToken) {
    clearAdminSession();
    redirectToSignIn();
    throw new ApiError("Unauthorized. Please sign in again.", 401, {
      message: "Missing access token",
    });
  }

  if (isTokenExpired(session.accessToken)) {
    return refreshAdminSession();
  }

  return session;
};

export const extractApiErrorMessage = (payload) => {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors[0]?.message;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof payload?.error?.message === "string" && payload.error.message.trim()) {
    return payload.error.message;
  }

  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  return "Request failed";
};

export const apiRequest = async (
  path,
  {
    method = "GET",
    query,
    body,
    headers = {},
    auth = true,
    contentType = "application/json",
  } = {}
) => {
  if (STATIC_MODE) {
    return getStaticMockResponse(path, { method, query, body });
  }

  const finalPath = appendQuery(path, query);
  const requestHeaders = { ...headers };

  const hasFormDataBody = body instanceof FormData;
  if (!hasFormDataBody && body !== undefined && contentType) {
    requestHeaders["Content-Type"] = contentType;
  }

  const performFetch = async (skipPrefix = false, token = null) => {
    if (auth) {
      const freshSession = await ensureFreshAdminSession();
      requestHeaders.Authorization = `Bearer ${freshSession.accessToken}`;
    } else if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    return fetch(buildApiUrl(finalPath, { skipPrefix }), {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : hasFormDataBody || contentType !== "application/json"
            ? body
            : JSON.stringify(body),
    });
  };

  let response = await performFetch(false);
  let payload = await parseResponse(response);

  // Local backends sometimes expose routes without /api/v1 prefix.
  if (
    !response.ok &&
    response.status === 404 &&
    API_PREFIX &&
    !finalPath.startsWith("/api/")
  ) {
    response = await performFetch(true);
    payload = await parseResponse(response);
  }

  if (!response.ok && response.status === 401 && auth) {
    try {
      const refreshedSession = await refreshAdminSession();
      requestHeaders.Authorization = `Bearer ${refreshedSession.accessToken}`;
      response = await performFetch(false);
      payload = await parseResponse(response);
    } catch (refreshError) {
      if (refreshError instanceof ApiError) {
        throw refreshError;
      }
      throw new ApiError(
        "Session refresh failed",
        401,
        { message: "Session refresh failed" }
      );
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminSession();
      redirectToSignIn();
    }

    throw new ApiError(
      extractApiErrorMessage(payload) || "Request failed",
      response.status,
      payload
    );
  }

  return payload;
};

export const apiRequestWithFallback = async (paths, options = {}) => {
  const candidates = Array.isArray(paths) ? paths : [paths];
  let lastError = null;

  for (const candidate of candidates) {
    try {
      return await apiRequest(candidate, options);
    } catch (error) {
      lastError = error;
      if (error?.status !== 404 && error?.status !== 405) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Request failed");
};
