import { Form, Input, message } from "antd";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthShell from "../../../Components/Auth/AuthShell";
import { resetAdminPassword } from "../../../services/authApi";

const ADMIN_RESET_EMAIL_KEY = "adminResetEmail";

const NewPass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || sessionStorage.getItem(ADMIN_RESET_EMAIL_KEY) || "";
  const otpVerified = Boolean(location.state?.otpVerified);

  useEffect(() => {
    if (!email) {
      navigate("/forgate-password", { replace: true });
    }
  }, [email, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onFinish = async (values) => {
    setLoading(true);
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      message.error("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (!otpVerified) {
      message.error("OTP verification is required before continuing.");
      setLoading(false);
      navigate("/verify-code", { state: { email } });
      return;
    }

    try {
      const payload = await resetAdminPassword({
        email,
        newPassword,
      });

      message.success(payload?.message || "Password has been reset successfully.");
      sessionStorage.removeItem(ADMIN_RESET_EMAIL_KEY);
      navigate("/sign-in", { replace: true });
    } catch (error) {
      message.error(error?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell compact>
      <Form
        name="new-password"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
        className="w-full"
      >
        <div className="mb-8">
          <h2 className="mb-3 text-4xl font-bold tracking-tight text-white">
            Create New Password
          </h2>
          <p className="text-lg text-white/85">
            Set a new password for {email || "your account"}.
          </p>
        </div>

        <Form.Item
          name="newPassword"
          label={<span className="text-[18px] font-semibold text-white">New Password</span>}
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
          className="mb-7"
        >
          <div className="relative flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder=""
              className="h-16 rounded-xl border-0 bg-white px-5 pr-14 text-lg text-slate-900 shadow-none"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 text-lg text-slate-500"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-[18px] font-semibold text-white">Confirm Password</span>}
          rules={[
            { required: true, message: "Please confirm your password!" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
          className="mb-10"
        >
          <div className="relative flex items-center">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder=""
              className="h-16 rounded-xl border-0 bg-white px-5 pr-14 text-lg text-slate-900 shadow-none"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-4 text-lg text-slate-500"
            >
              {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </Form.Item>

        <Form.Item className="mb-0">
          <button
            className="h-14 w-full rounded-lg bg-[#ff9500] text-xl font-semibold text-white hover:bg-[#f48b00] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Update Password"}
          </button>
        </Form.Item>
      </Form>
    </AuthShell>
  );
};

export default NewPass;
