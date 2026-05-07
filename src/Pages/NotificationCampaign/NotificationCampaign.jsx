import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Search,
  SlidersHorizontal,
  Trash2,
  Eye,
  Plus,
  X,
  Info,
  AlignLeft,
  Users,
  Clock3,
  ChevronDown,
} from "lucide-react";
import { message, Modal, Spin } from "antd";
import {
  listCampaigns,
  createCampaign,
  deleteCampaign,
} from "../../services/notificationCampaignApi";

const statsConfig = [
  { label: "Total Sent", value: "34,210", subtext: "+12.4%", icon: Bell, tone: "positive" },
  { label: "Active Campaigns", value: "5", subtext: "Currently running", icon: Megaphone, tone: "neutral" },
  { label: "Scheduled", value: "3", subtext: "Next: Today 7:00 PM", icon: CalendarDays, tone: "neutral" },
  { label: "Delivery Rate", value: "96.8%", subtext: "+0.4%", icon: CheckCircle2, tone: "positive" },
];

const categoryOptions = ["promotional", "onboarding", "reward", "retention"];
const audienceOptions = [
  { label: "Global", value: "global" },
  { label: "All Users", value: "all_users" },
  { label: "Nearby Users", value: "nearby_users" },
  { label: "New Users", value: "new_user" },
  { label: "Top 10% Users", value: "top_10_users" },
  { label: "Inactive Shoppers", value: "inactive_shoppers" },
];

const statusStyles = {
  scheduled: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-600",
  draft: "bg-indigo-100 text-indigo-600",
};

const emptyForm = {
  campaignTitle: "",
  campaignCategory: "promotional",
  campaignBody: "",
  targetAudience: "all_users",
  deliveryType: "send_now",
  scheduledAt: "",
};

const SelectField = ({ value, onChange, options, className = "", isObject = false }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
    >
      {options.map((option) => (
        <option key={isObject ? option.value : option} value={isObject ? option.value : option}>
          {isObject ? option.label : option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

const Panel = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
    <div className="mb-5 flex items-center gap-3">
      <Icon className="h-5 w-5 text-indigo-500" />
      <h3 className="text-[1.1rem] font-semibold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
);

const NotificationCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await listCampaigns({
        page,
        limit: 5,
        search: query || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setCampaigns(res.data.items || []);
      setTotal(res.data.pagination?.totalItems || res.data.pagination?.total_items || res.data.items.length);
    } catch (err) {
      message.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, statusFilter]);

  // Debounced search could be added here, but for now simple trigger on enter or small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchCampaigns();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / 5));

  const handleCreate = async () => {
    if (!form.campaignTitle || !form.campaignBody) {
      message.warning("Please fill in the title and message body");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        scheduledAt: form.deliveryType === "schedule_later" ? new Date(form.scheduledAt).toISOString() : null,
      };
      await createCampaign(payload);
      message.success("Campaign created successfully");
      setIsModalOpen(false);
      setForm(emptyForm);
      fetchCampaigns();
    } catch (err) {
      message.error(err.message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Campaign",
      content: "Are you sure you want to delete this notification campaign?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteCampaign({ id });
          message.success("Campaign deleted");
          fetchCampaigns();
        } catch (err) {
          message.error("Failed to delete campaign");
        }
      },
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[2.1rem] font-medium tracking-[-0.03em] text-slate-900">
          Push Notification Campaigns
        </h1>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-base font-semibold text-white shadow-[0_14px_24px_rgba(255,149,0,0.24)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-4 flex items-start justify-between">
                <p className="max-w-[120px] text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {item.label}
                </p>
                <Icon className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex items-end gap-3">
                <p className="text-[2.1rem] font-semibold leading-none text-slate-900">
                  {item.value}
                </p>
              </div>
              <p
                className={`mt-3 text-sm ${
                  item.tone === "positive" ? "text-emerald-500" : "text-slate-500"
                }`}
              >
                {item.subtext}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-slate-900">
            All Campaigns
          </h2>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter campaigns..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)] lg:w-[192px]"
              />
            </div>

            <SelectField
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={["all", "active", "scheduled", "completed", "draft"]}
              className="lg:w-[120px]"
            />

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              <SlidersHorizontal className="h-4 w-4" />
              More filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spin size="large" />
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left">
                <tr className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-6 py-5">Campaign Name</th>
                  <th className="px-4 py-5">Message Body</th>
                  <th className="px-4 py-5">Target Audience</th>
                  <th className="px-4 py-5">Scheduled At</th>
                  <th className="px-4 py-5">Status</th>
                  <th className="px-4 py-5">Delivery Rate</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t border-slate-100 align-top">
                    <td className="px-6 py-5">
                      <p className="max-w-[150px] text-[1.05rem] font-semibold leading-7 text-slate-900">
                        {campaign.campaignTitle}
                      </p>
                    </td>
                    <td className="px-4 py-5 text-[1.02rem] text-slate-500">
                      <p className="max-w-[230px] truncate">{campaign.campaignBody}</p>
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-flex rounded-lg bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase text-indigo-600">
                        {campaign.targetAudience.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[1.02rem] text-slate-600">
                      {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : "Send Now"}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          statusStyles[campaign.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[1.1rem] font-semibold text-slate-900">
                      {campaign.deliveryRate?.toFixed(1)}%
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button type="button" className="transition hover:text-slate-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(campaign.id)}
                          className="transition hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {campaigns.length === 0 ? 0 : (page - 1) * 5 + 1} to{" "}
            {Math.min(page * 5, total)} of {total} campaigns
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600 disabled:opacity-50"
              disabled={page === 1}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                  page === item
                    ? "bg-[var(--color-brand-secondary)] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600 disabled:opacity-50"
              disabled={page === totalPages}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6">
          <div className="mx-auto w-full max-w-[860px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-[1.85rem] font-semibold tracking-[-0.03em] text-slate-900">
                Create Campaign
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 transition hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <Panel icon={Info} title="Campaign Details">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Campaign Title
                      </label>
                      <input
                        value={form.campaignTitle}
                        onChange={(e) => setForm({ ...form, campaignTitle: e.target.value })}
                        placeholder="e.g. Summer Flash Sale"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Category
                      </label>
                      <SelectField
                        value={form.campaignCategory}
                        onChange={(val) => setForm({ ...form, campaignCategory: val })}
                        options={categoryOptions}
                      />
                    </div>
                  </div>
                </Panel>

                <Panel icon={AlignLeft} title="Message Content">
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">Message Body</label>
                        <span className="text-xs text-slate-400">{form.campaignBody.length}/1000</span>
                      </div>
                      <textarea
                        value={form.campaignBody}
                        onChange={(e) => setForm({ ...form, campaignBody: e.target.value })}
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none focus:border-[var(--color-brand-secondary)]"
                      />
                    </div>
                  </div>
                </Panel>

                <Panel icon={Users} title="Target Audience">
                  <SelectField
                    value={form.targetAudience}
                    onChange={(val) => setForm({ ...form, targetAudience: val })}
                    options={audienceOptions}
                    isObject
                  />
                </Panel>

                <Panel icon={Clock3} title="Delivery Schedule">
                  <div className="space-y-5">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={form.deliveryType === "send_now"}
                          onChange={() => setForm({ ...form, deliveryType: "send_now" })}
                        />
                        Send Now
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={form.deliveryType === "schedule_later"}
                          onChange={() => setForm({ ...form, deliveryType: "schedule_later" })}
                        />
                        Schedule Later
                      </label>
                    </div>
                    {form.deliveryType === "schedule_later" && (
                      <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="h-12 w-full rounded-xl border border-slate-200 px-4"
                      />
                    )}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button onClick={() => setIsModalOpen(false)} className="h-12 px-6 font-semibold text-slate-500">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="h-12 rounded-xl bg-[var(--color-brand-secondary)] px-8 font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Sending..." : form.deliveryType === "send_now" ? "Send Now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCampaign;
