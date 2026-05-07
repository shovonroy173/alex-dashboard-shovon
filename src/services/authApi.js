import { apiRequest, extractApiErrorMessage } from "./httpClient";

/**
 * POST /admin/auth/login
 * Body: { email, password }
 * Response: { success, message, data: { uid, email, role, is_verified, access_token, refresh_token, expires_in } }
 */
export const loginAdmin = async ({ email, password }) => {
  try {
    return await apiRequest("/admin/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
  } catch (error) {
    const payloadMessage = extractApiErrorMessage(error?.payload);
    throw new Error(payloadMessage || error?.message || "Login failed. Please try again.");
  }
};

/**
 * POST /admin/auth/forgot-password
 * Body: { email }
 * Response: { success, message }
 */
export const forgotAdminPassword = async ({ email }) => {
  try {
    return await apiRequest("/admin/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { email },
    });
  } catch (error) {
    const payloadMessage = extractApiErrorMessage(error?.payload);
    throw new Error(
      payloadMessage || error?.message || "Unable to send verification code."
    );
  }
};

/**
 * POST /admin/auth/resend-forgot-otp
 * Body: { email }
 * Response: { success, message }
 */
export const resendAdminForgotOtp = async ({ email }) => {
  try {
    return await apiRequest("/admin/auth/resend-forgot-otp", {
      method: "POST",
      auth: false,
      body: { email },
    });
  } catch (error) {
    const payloadMessage = extractApiErrorMessage(error?.payload);
    throw new Error(
      payloadMessage || error?.message || "Unable to resend verification code."
    );
  }
};

/**
 * POST /admin/auth/verify-forgot-otp
 * Body: { email, otp }
 * Response: { success, message, data: { email, is_verified } }
 */
export const verifyAdminForgotOtp = async ({ email, otp }) => {
  try {
    return await apiRequest("/admin/auth/verify-forgot-otp", {
      method: "POST",
      auth: false,
      body: { email, otp },
    });
  } catch (error) {
    const payloadMessage = extractApiErrorMessage(error?.payload);
    throw new Error(
      payloadMessage || error?.message || "Verification failed."
    );
  }
};

/**
 * PATCH /admin/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { current_password, new_password }
 * Response: { success, message }
 */
export const changeAdminPassword = async ({ currentPassword, newPassword }) => {
  try {
    return await apiRequest("/admin/change-password", {
      method: "PATCH",
      body: { current_password: currentPassword, new_password: newPassword },
    });
  } catch (error) {
    const payloadMessage = extractApiErrorMessage(error?.payload);
    throw new Error(
      payloadMessage || error?.message || "Unable to change password."
    );
  }
};

/**
 * POST /admin/auth/reset-password
 * Body: { email, new_password }
 * Response: { success, message }
 *
 * Called after the forgot-password OTP has been verified.
 */
export const resetAdminPassword = async ({ email, newPassword }) => {
  try {
    return await apiRequest("/admin/auth/reset-password", {
      method: "POST",
      auth: false,
      body: { email, new_password: newPassword },
    });
  } catch (error) {
    const payloadMessage = extractApiErrorMessage(error?.payload);
    throw new Error(
      payloadMessage || error?.message || "Unable to reset password."
    );
  }
};
