import { useState } from "react";
import { Form, Input, message } from "antd";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { ImageUp } from "lucide-react";
import { createAdmin } from "../../services/adminApi";

const MakeAdmin = () => {
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      await createAdmin({
        fullname: values.fullName,
        phone: values.phone,
        email: values.email,
        password: values.password,
        image: selectedFile,
      });

      message.success("Admin created successfully.");
      form.resetFields();
      setPreviewImage("");
      setSelectedFile(null);
    } catch (error) {
      message.error(error?.message || "Failed to create admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setSelectedFile(file);
    event.target.value = "";
  };

  return (
    <div className="p-4">
      <div className="overflow-hidden bg-white border rounded-2xl border-slate-100 shadow-sm">
        <div className="px-6 py-4 bg-[var(--color-brand-primary)]">
          <h1 className="text-4xl font-semibold text-white">Create Admin</h1>
        </div>

        <div className="p-6 md:p-8">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="fullName"
              label={<span className="text-2xl font-medium text-slate-700">Name</span>}
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input
                placeholder="jhon doe"
                className="h-14 rounded-xl border-slate-300 text-xl"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-2xl font-medium text-slate-700">Email</span>}
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input
                placeholder="abc@gmail.com"
                className="h-14 rounded-xl border-slate-300 text-xl"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="text-2xl font-medium text-slate-700">Phone</span>}
              rules={[
                { required: true, message: "Please enter phone number" },
                { min: 7, message: "Phone number too short" },
                { max: 30, message: "Phone number too long" },
              ]}
            >
              <Input
                placeholder="+1 555 123 4567"
                className="h-14 rounded-xl border-slate-300 text-xl"
              />
            </Form.Item>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Form.Item
                name="password"
                label={
                  <span className="text-2xl font-medium text-slate-700">
                    New Password
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="h-14 rounded-xl border-slate-300 pr-12 text-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={
                  <span className="text-2xl font-medium text-slate-700">
                    Confirm New Password
                  </span>
                }
                rules={[
                  { required: true, message: "Please confirm password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    className="h-14 rounded-xl border-slate-300 pr-12 text-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </Form.Item>
            </div>

            <div className="mb-2 text-2xl font-medium text-slate-700">Profile Image</div>

            <label
              htmlFor="admin-profile-image"
              className="group flex min-h-48 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="New admin preview"
                  className="h-40 w-40 rounded-xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <ImageUp className="h-10 w-10" />
                  <p className="text-2xl">Upload Image</p>
                </div>
              )}
            </label>
            <input
              id="admin-profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-[760px] rounded-xl bg-[var(--color-brand-secondary)] px-8 py-4 text-3xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default MakeAdmin;
