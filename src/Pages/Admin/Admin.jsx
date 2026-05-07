import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { Link } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { blockAdmin, listAdmins, unblockAdmin } from "../../services/adminApi";
import { getAdminSession } from "../../utils/auth";
import { normalizeUser } from "../UserList/userUtils";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Suspended: "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const formatRole = (role) =>
  String(role || "admin")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeAdmin = (admin, index = 0) => {
  const normalized = normalizeUser(admin, index, 0);

  return {
    ...normalized,
    uid: String(admin?.uid || admin?.id || normalized.id),
    role: formatRole(admin?.role),
    raw: admin,
  };
};

const AdminAvatar = ({ admin }) => {
  if (admin.avatar) {
    return (
      <img
        src={admin.avatar}
        alt={admin.name}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  const initials = admin.name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
      {initials}
    </div>
  );
};

const AdminManagementPage = () => {
  const session = getAdminSession();
  const currentUid = session?.profile?.uid || "";
  const currentRole = String(session?.profile?.role || "").toLowerCase();
  const isSuperAdmin = currentRole === "super_admin";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await listAdmins();
      const data = payload?.data || payload;
      const items = Array.isArray(data) ? data : data?.items || [];
      setAdmins(items.map((item, index) => normalizeAdmin(item, index)));
      setLoadError("");
    } catch (error) {
      setAdmins([]);
      setLoadError(error?.message || "Unable to load admin accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const filteredAdmins = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesSearch =
        !needle ||
        admin.name.toLowerCase().includes(needle) ||
        admin.email.toLowerCase().includes(needle) ||
        admin.role.toLowerCase().includes(needle);

      const matchesStatus = statusFilter === "All" || admin.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [admins, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((admin) => admin.status === "Active").length;
    const blocked = admins.filter((admin) => admin.status === "Suspended").length;
    const superAdmins = admins.filter((admin) => admin.raw?.role === "super_admin").length;
    return { total, active, blocked, superAdmins };
  }, [admins]);

  const openAction = (admin, action) => {
    if (!isSuperAdmin) {
      message.error("Only super admins can manage admin accounts.");
      return;
    }

    if (admin.uid === currentUid) {
      message.warning("You cannot change your own admin status.");
      return;
    }

    setPendingAction({ admin, action });
  };

  const confirmAction = async () => {
    if (!pendingAction?.admin?.uid) return;

    try {
      setActionLoading(true);
      const { admin, action } = pendingAction;
      const payload =
        action === "block"
          ? await blockAdmin({ id: admin.uid })
          : await unblockAdmin({ id: admin.uid });

      const updated = normalizeAdmin(payload?.data || payload, 0);
      setAdmins((prev) => prev.map((item) => (item.uid === updated.uid ? updated : item)));
      message.success(
        action === "block" ? "Admin account blocked successfully." : "Admin account unblocked successfully."
      );
    } catch (error) {
      message.error(error?.message || "Unable to update admin status.");
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const columns = [
    {
      title: "Admin",
      dataIndex: "name",
      key: "name",
      render: (_, admin) => (
        <div className="flex items-center gap-3">
          <AdminAvatar admin={admin} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[1.02rem] font-semibold text-slate-900">{admin.name}</p>
              {admin.uid === currentUid ? (
                <Tag color="blue" className="m-0 rounded-full border-0 px-2 py-0.5">
                  You
                </Tag>
              ) : null}
            </div>
            <p className="text-sm text-slate-400">ID: {admin.uid}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[var(--color-brand-secondary)]">
          {role}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}>
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, admin) => {
        const isBlocked = admin.status === "Suspended";
        const disabled = admin.uid === currentUid || !isSuperAdmin;
        return (
          <Space size="small">
            <Button
              type={isBlocked ? "default" : "primary"}
              danger={!isBlocked}
              disabled={disabled}
              onClick={() => openAction(admin, isBlocked ? "unblock" : "block")}
              icon={isBlocked ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            >
              {isBlocked ? "Unblock" : "Block"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
            Administrator Management
          </h1>
          <p className="mt-1 text-slate-500">
            Manage admin accounts, block access, and unblock trusted accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/create-admin"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(255,149,0,0.22)]"
          >
            <Plus className="h-4 w-4" />
            Create Admin
          </Link>
          <Button
            onClick={loadAdmins}
            icon={<RefreshCw className="h-4 w-4" />}
            className="h-10 rounded-xl"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Admins", value: summary.total },
          { label: "Active", value: summary.active },
          { label: "Blocked", value: summary.blocked },
          { label: "Super Admins", value: summary.superAdmins },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, or role..."
              className="h-11 rounded-xl border-slate-200 pl-12"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="h-11 w-full"
            options={["All", "Active", "Suspended", "Inactive"].map((item) => ({
              value: item,
              label: item,
            }))}
          />
        </div>

        {loadError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <div className="mt-5">
          <Table
            rowKey="uid"
            loading={loading}
            columns={columns}
            dataSource={filteredAdmins}
            pagination={{
              pageSize: 6,
              showSizeChanger: false,
              hideOnSinglePage: true,
            }}
          />
        </div>
      </div>

      <Modal
        open={Boolean(pendingAction)}
        title={
          pendingAction?.action === "block" ? "Block admin account" : "Unblock admin account"
        }
        onCancel={() => setPendingAction(null)}
        onOk={confirmAction}
        confirmLoading={actionLoading}
        okText={pendingAction?.action === "block" ? "Block" : "Unblock"}
        okButtonProps={{ danger: pendingAction?.action === "block" }}
      >
        <p className="text-slate-600">
          {pendingAction?.action === "block"
            ? "This admin account will lose access to the dashboard until it is unblocked."
            : "This admin account will regain access to the dashboard."}
        </p>
        <p className="mt-3 font-medium text-slate-900">
          {pendingAction?.admin?.name} ({pendingAction?.admin?.email})
        </p>
      </Modal>
    </div>
  );
};

export default AdminManagementPage;
