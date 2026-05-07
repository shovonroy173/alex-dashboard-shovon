import { useState } from "react";
import { Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../../Components/Auth/AuthShell";
import { forgotAdminPassword } from "../../../services/authApi";

const ADMIN_RESET_EMAIL_KEY = "adminResetEmail";

const ForgatePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const email = values.email.trim().toLowerCase();

    try {
      const payload = await forgotAdminPassword({ email });
      sessionStorage.setItem(ADMIN_RESET_EMAIL_KEY, email);
      message.success(payload?.message || "Verification code sent to your email.");
      navigate("/verify-code", { state: { email } });
    } catch (error) {
      message.error(error?.message || "Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell compact>
      <div className="text-white">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">Forget Password</h1>
        <p className="mb-8 max-w-[640px] text-lg leading-8 text-white/85">
          Enter your email address to get a verification code for resetting your
          password.
        </p>

        <Form name="forgotPassword" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
            className="mb-14"
          >
            <Input className="h-16 rounded-xl border-0 bg-white px-5 text-lg text-slate-900 shadow-none" />
          </Form.Item>

          <Form.Item className="mb-0">
            <button
              type="submit"
              className="h-14 w-full rounded-lg bg-[#ff9500] text-xl font-semibold text-white hover:bg-[#f48b00] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </Form.Item>
        </Form>
      </div>
    </AuthShell>
  );
};

export default ForgatePassword;
