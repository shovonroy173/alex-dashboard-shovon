import { Checkbox, Form, Input, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { isAdminAuthenticated, setAdminSession } from "../../../utils/auth";
import { loginAdmin } from "../../../services/authApi";
import AuthShell from "../../../Components/Auth/AuthShell";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    const normalizedEmail = values.email.trim().toLowerCase();

    try {
      const payload = await loginAdmin({
        email: normalizedEmail,
        password: values.password,
      });

      const data = payload?.data || payload;
      const accessToken = data?.access_token;
      const refreshToken = data?.refresh_token;

      if (!accessToken) {
        throw new Error("Login response did not include access token.");
      }

      setAdminSession({
        email: data?.email || normalizedEmail,
        accessToken,
        refreshToken,
        profile: {
          uid: data?.uid,
          email: data?.email || normalizedEmail,
          role: data?.role,
          isVerified: data?.is_verified,
        },
      });

      message.success(payload?.message || "Login successful");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      message.error(error.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell compact>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
        className="w-full"
      >
        <Form.Item
          name="email"
          label={<span className="text-[18px] font-semibold text-white">Email</span>}
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
          className="mb-8"
        >
          <Input
            type="text"
            autoComplete="username"
            placeholder=""
            className="h-16 rounded-xl border-0 bg-white px-5 text-lg text-slate-900 shadow-none"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="text-[18px] font-semibold text-white">Password</span>}
          rules={[
            { required: true, message: "Please enter your password" },
            {
              min: 6,
              message: "Password must be at least 6 characters",
            },
          ]}
          className="mb-4"
        >
          <div className="relative flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder=""
              className="h-16 rounded-xl border-0 bg-white px-5 pr-14 text-lg text-slate-900 shadow-none"
            />
            <button
              onClick={togglePasswordVisibility}
              type="button"
              className="absolute right-4 text-lg text-slate-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </Form.Item>

        <div className="mb-9 flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="auth-checkbox text-[15px] text-white">
              <span className="text-white">Remember password</span>
            </Checkbox>
          </Form.Item>

          <Link
            to="/forgate-password"
            className="text-[15px] font-medium text-[#ff9717] underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>

        <Form.Item className="mb-0">
          <button
            className="h-14 w-full rounded-lg bg-[#ff9500] text-xl font-semibold text-white hover:bg-[#f48b00] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </Form.Item>
      </Form>
    </AuthShell>
  );
};

export default SignIn;
