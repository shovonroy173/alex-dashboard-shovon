import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Clock3,
  Edit3,
  Gift,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { message, Spin } from "antd";
import {
  createDailyReward,
  deleteDailyReward,
  getSpinWheelAnalytics,
  getSpinWheelSettings,
  listDailyRewards,
  updateSpinWheelSettings,
  updateDailyReward,
} from "../../services/adminApi";

const statusOptions = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

const sortOptions = [
  { value: "Newest", label: "Newest" },
  { value: "Points High-Low", label: "Points High-Low" },
  { value: "Points Low-High", label: "Points Low-High" },
  { value: "Weight High-Low", label: "Weight High-Low" },
  { value: "Weight Low-High", label: "Weight Low-High" },
  { value: "Quantity High-Low", label: "Quantity High-Low" },
];

const blankRewardDraft = {
  pointsReward: "1",
  quantityAvailable: "1",
  probability: "0",
  isActive: true,
  hasExpiry: false,
  expiresAt: "",
};

const spinAnalyticsCards = (analytics) => [
  {
    label: "Total Spins Today",
    value: analytics?.totalSpinsToday ?? 0,
    icon: Gift,
  },
  {
    label: "Avg. Redemption Rate",
    value: `${Number(analytics?.avgRedemptionRate ?? 0).toFixed(1)}%`,
    icon: CircleGauge,
  },
  {
    label: "Current Reset Cycle",
    value: analytics?.currentResetCycle ?? "24 Hours",
    icon: Clock3,
  },
];

const resetLogicOptions = [
  { value: "daily", label: "Daily" },
  { value: "manual", label: "Manual" },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const formatDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const statusClass = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  expired: "bg-red-100 text-red-700",
};

const RewardDraftCard = ({
  draft,
  setDraft,
  heading,
  subheading,
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  saving,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <Sparkles className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{heading}</p>
              <p className="text-xs text-slate-500">{subheading}</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Points Reward</p>
            <p className="mt-1 text-sm text-slate-500">
              Title and description are fixed by the backend. Admins only manage
              the points value, stock, weight, and expiry.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Points
            </label>
            <input
              type="number"
              min="0"
              step="1"
              max="1000000"
              value={draft.pointsReward}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  pointsReward: event.target.value,
                }))
              }
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--color-brand-secondary)] focus:ring-2 focus:ring-[rgba(84,101,255,0.14)]"
              placeholder="250"
            />
            <p className="mt-1 text-xs text-slate-500">
              Set to 0 for no points reward.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Stock
            </label>
            <input
              type="number"
              value={draft.quantityAvailable}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  quantityAvailable: event.target.value,
                }))
              }
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--color-brand-secondary)] focus:ring-2 focus:ring-[rgba(84,101,255,0.14)]"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Weight
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={draft.probability}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  probability: event.target.value,
                }))
              }
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--color-brand-secondary)] focus:ring-2 focus:ring-[rgba(84,101,255,0.14)]"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-slate-500">
              Relative weight. The total across rewards can exceed 100.
            </p>
          </div>

          <div className="flex items-end">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              Active
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Expiry
            </label>
            <div className="space-y-3 rounded-lg border border-slate-200 px-3 py-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.hasExpiry}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      hasExpiry: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Has expiry
              </label>
              {draft.hasExpiry ? (
                <input
                  type="datetime-local"
                  value={draft.expiresAt}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      expiresAt: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--color-brand-secondary)] focus:ring-2 focus:ring-[rgba(84,101,255,0.14)]"
                />
              ) : (
                <span className="text-sm text-slate-500"></span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="rounded-lg bg-[var(--color-brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
};

const DailyRewards = () => {
  const createRowRef = useRef(null);
  const LIST_PAGE_SIZE = 100;
  const [items, setItems] = useState([]);
  const [spinAnalytics, setSpinAnalytics] = useState(null);
  const [spinSettings, setSpinSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(blankRewardDraft);
  const [createDraft, setCreateDraft] = useState(blankRewardDraft);
  const [createRowOpen, setCreateRowOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    resetLogic: "daily",
    resetTimeUtc: "00:00",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const sortConfig =
        sortBy === "Points High-Low"
          ? { sortBy: "pointsReward", sortOrder: "desc" }
          : sortBy === "Points Low-High"
            ? { sortBy: "pointsReward", sortOrder: "asc" }
            : sortBy === "Weight High-Low"
              ? { sortBy: "probability", sortOrder: "desc" }
              : sortBy === "Weight Low-High"
                ? { sortBy: "probability", sortOrder: "asc" }
                : sortBy === "Quantity High-Low"
                  ? { sortBy: "quantityAvailable", sortOrder: "desc" }
                  : { sortBy: "createdAt", sortOrder: "desc" };

      const payload = await listDailyRewards({
        page: 1,
        pageSize: LIST_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter !== "All" ? statusFilter || undefined : undefined,
        ...sortConfig,
      });

      setItems(Array.isArray(payload?.data?.items) ? payload.data.items : []);
    } catch (error) {
      message.error(error?.message || "Failed to load daily rewards");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, statusFilter]);

  const loadSpinAnalytics = useCallback(async () => {
    try {
      const payload = await getSpinWheelAnalytics();
      setSpinAnalytics(payload?.data || payload);
    } catch {
      setSpinAnalytics(null);
    }
  }, []);

  const loadSpinSettings = useCallback(async () => {
    try {
      const payload = await getSpinWheelSettings();
      const data = payload?.data || payload;
      setSpinSettings(data);
      setSettingsForm({
        resetLogic: data?.resetLogic || "daily",
        resetTimeUtc: data?.resetTimeUtc || "00:00",
      });
    } catch {
      setSpinSettings(null);
      setSettingsForm({
        resetLogic: "daily",
        resetTimeUtc: "00:00",
      });
    }
  }, []);

  useEffect(() => {
    loadItems();
    loadSpinAnalytics();
    loadSpinSettings();
  }, [loadItems, loadSpinAnalytics, loadSpinSettings]);

  useEffect(() => {
    if (!createRowOpen) return;
    const timer = window.setTimeout(() => {
      createRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [createRowOpen]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        String(item.pointsReward ?? item.discountPercentage ?? "").includes(query) ||
        String(item.quantityAvailable ?? "").includes(query) ||
        String(item.probability ?? "").includes(query);
      return matchesSearch;
    });
  }, [debouncedSearch, items]);

  const sortedItems = useMemo(() => {
    const next = [...filteredItems];
    if (sortBy === "Points High-Low") {
      next.sort(
        (a, b) =>
          Number(b.pointsReward ?? b.discountPercentage ?? 0) -
          Number(a.pointsReward ?? a.discountPercentage ?? 0),
      );
    } else if (sortBy === "Points Low-High") {
      next.sort(
        (a, b) =>
          Number(a.pointsReward ?? a.discountPercentage ?? 0) -
          Number(b.pointsReward ?? b.discountPercentage ?? 0),
      );
    } else if (sortBy === "Weight High-Low") {
      next.sort((a, b) => b.probability - a.probability);
    } else if (sortBy === "Weight Low-High") {
      next.sort((a, b) => a.probability - b.probability);
    } else if (sortBy === "Quantity High-Low") {
      next.sort((a, b) => b.quantityAvailable - a.quantityAvailable);
    } else {
      next.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }
    return next;
  }, [filteredItems, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleItems = sortedItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const openCreate = () => {
    setCreateRowOpen(true);
  };

  const openEdit = (item) => {
    setEditingItemId(item.id);
    setEditingDraft({
      pointsReward: String(item.pointsReward ?? item.discountPercentage ?? "1"),
      quantityAvailable: String(item.quantityAvailable ?? ""),
      probability: String(item.probability ?? "0"),
      isActive: Boolean(item.isActive),
      hasExpiry: Boolean(item.hasExpiry),
      expiresAt: formatDateTimeInput(item.expiresAt),
    });
  };

  const closeEdit = () => {
    setEditingItemId(null);
    setEditingDraft(blankRewardDraft);
  };

  const closeCreate = () => {
    setCreateRowOpen(false);
    setCreateDraft(blankRewardDraft);
  };

  const buildDraftPayload = (draft) => {
    const pointsReward = Number(draft.pointsReward);
    const payload = {
      pointsReward,
      discountPercentage: pointsReward,
      quantityAvailable: Number(draft.quantityAvailable),
      probability: Number(draft.probability),
      isActive: Boolean(draft.isActive),
      hasExpiry: Boolean(draft.hasExpiry),
    };

    if (draft.hasExpiry && draft.expiresAt) {
      payload.expiresAt = new Date(draft.expiresAt).toISOString();
    }

    return payload;
  };

  const buildDraftFormData = (draft) => {
    const payload = buildDraftPayload(draft);
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        form.append(key, String(value));
      }
    });
    return form;
  };

  const validateDraft = (draft) => {
    const pointsReward = Number(draft.pointsReward);
    const quantityAvailable = Number(draft.quantityAvailable);
    const probability = Number(draft.probability);

    if (
      !Number.isFinite(pointsReward) ||
      pointsReward < 0 ||
      pointsReward > 1000000
    ) {
      return "Points must be between 0 and 1,000,000.";
    }

    if (!Number.isFinite(quantityAvailable) || quantityAvailable < 0) {
      return "Stock must be a non-negative number.";
    }

    if (!Number.isFinite(probability) || probability < 0 || probability > 100) {
      return "Weight must be between 0 and 100.";
    }

    if (draft.hasExpiry && !draft.expiresAt) {
      return "Please choose an expiry date or turn off expiry.";
    }

    return null;
  };

  const saveCreate = async () => {
    const validationError = validateDraft(createDraft);
    if (validationError) {
      message.error(validationError);
      return;
    }

    try {
      setSaving(true);
      await createDailyReward(buildDraftFormData(createDraft));
      message.success("Daily reward created successfully");
      closeCreate();
      await Promise.all([loadItems(), loadSpinAnalytics()]);
    } catch (error) {
      message.error(error?.message || "Failed to create daily reward");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (itemId) => {
    const validationError = validateDraft(editingDraft);
    if (validationError) {
      message.error(validationError);
      return;
    }

    try {
      setSaving(true);
      await updateDailyReward({
        id: itemId,
        body: buildDraftFormData(editingDraft),
      });
      message.success("Daily reward updated successfully");
      closeEdit();
      await Promise.all([loadItems(), loadSpinAnalytics()]);
    } catch (error) {
      message.error(error?.message || "Failed to update daily reward");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    try {
      setDeleting(true);
      await deleteDailyReward({ id: item.id });
      message.success("Daily reward deleted successfully");
      await Promise.all([loadItems(), loadSpinAnalytics()]);
    } catch (error) {
      message.error(error?.message || "Failed to delete daily reward");
    } finally {
      setDeleting(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      setSettingsSaving(true);
      const payload = {
        resetLogic: settingsForm.resetLogic,
        resetTimeUtc: settingsForm.resetTimeUtc,
      };
      const response = await updateSpinWheelSettings(payload);
      const data = response?.data || response;
      setSpinSettings(data);
      setSettingsForm({
        resetLogic: data?.resetLogic || settingsForm.resetLogic,
        resetTimeUtc: data?.resetTimeUtc || settingsForm.resetTimeUtc,
      });
      message.success("Spin wheel settings updated successfully");
      await loadSpinAnalytics();
    } catch (error) {
      message.error(error?.message || "Failed to update spin wheel settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const cards = spinAnalyticsCards(spinAnalytics);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-900">
            Spin Wheel Configuration
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Configure the daily spin pool, wheel weights, and reset schedule.
          </p>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-[2.1rem] font-semibold tracking-tight text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_340px]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Daily Rewards
                </p>
                  <p className="mt-2 text-sm text-slate-500">
                  Manage points rewards that feed the spin wheel and define the
                  weights for each item.
                  </p>
                </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-[var(--color-brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Item
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search daily rewards..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 shadow-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                <SelectField
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  options={statusOptions}
                  placeholder="Status"
                />
                <SelectField
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  options={sortOptions}
                  placeholder="Sort"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#687b9b]">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Spin />
                        Loading daily rewards...
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading && visibleItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No daily rewards found.
                    </td>
                  </tr>
                ) : null}

                {!loading &&
                  visibleItems.map((item) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <Fragment key={item.id}>
                        <tr className="border-t border-slate-100 align-top">
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                <Sparkles className="h-5 w-5 text-slate-400" />
                              </div>
                              <div className="min-w-0 flex-1 space-y-2">
                                <p className="max-w-[220px] text-[1.03rem] font-semibold leading-6 text-slate-900">
                                  Points Reward
                                </p>
                                <p className="text-sm text-slate-500">
                                  Claim a fixed points reward.
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[var(--color-brand-secondary)]">
                              {item.pointsReward ?? item.discountPercentage} pts
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {item.quantityAvailable}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {item.probability}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass[item.status] || statusClass.inactive}`}
                            >
                              {(item.status || "").charAt(0).toUpperCase() +
                                (item.status || "").slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {item.hasExpiry && item.expiresAt
                              ? formatDate(item.expiresAt)
                              : "Daily"}
                          </td>
                          <td className="px-6 py-5">
                            {!isEditing ? (
                              <div className="flex justify-end gap-3 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  className="hover:text-slate-600"
                                  title="Edit daily reward"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item)}
                                  disabled={deleting}
                                  className="hover:text-red-500 disabled:opacity-50"
                                  title="Delete daily reward"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Editing
                              </span>
                            )}
                          </td>
                        </tr>
                        {isEditing ? (
                          <tr className="border-b-2 border-dashed border-[rgba(84,101,255,0.28)] bg-slate-50/60 align-top">
                            <td colSpan={7} className="px-6 py-5">
                      <RewardDraftCard
                        draft={editingDraft}
                        setDraft={setEditingDraft}
                        heading="Edit reward"
                        subheading="Adjust the points value, stock, weight, or expiry settings."
                        cancelLabel="Cancel"
                        submitLabel="Save"
                        onCancel={closeEdit}
                                onSubmit={() => saveEdit(item.id)}
                                saving={saving}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}

                {!loading && createRowOpen ? (
                  <tr
                    ref={createRowRef}
                    className="border-t-2 border-dashed border-[rgba(84,101,255,0.28)] bg-slate-50/60 align-top"
                  >
                    <td colSpan={7} className="px-6 py-5">
                      <RewardDraftCard
                        draft={createDraft}
                        setDraft={setCreateDraft}
                        heading="New reward"
                        subheading="Create a new points reward with its weight and stock."
                        cancelLabel="Clear"
                        submitLabel="Create"
                        onCancel={closeCreate}
                        onSubmit={saveCreate}
                        saving={saving}
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Daily rewards are consumed by the spin wheel and should be
              refreshed from this screen.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((current) => Math.max(1, current - 1))
                }
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm font-medium text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Reset Cycle
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {spinAnalytics?.currentResetCycle || "24 Hours"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Current setting: {spinSettings?.resetLogic || "daily"} at{" "}
                  {spinSettings?.resetTimeUtc || "00:00"} UTC
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              The spin pool is refreshed on a daily basis. Use the inline rows
              to create or edit the items that are available for the next daily
              cycle.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Global Settings
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Determine how often users can spin and when the wheel resets.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Reset Logic
                </span>
                <div className="relative">
                  <select
                    value={settingsForm.resetLogic}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        resetLogic: event.target.value,
                      }))
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 pr-10 text-slate-700"
                  >
                    {resetLogicOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Reset Time (UTC)
                </span>
                <input
                  type="time"
                  value={settingsForm.resetTimeUtc}
                  onChange={(event) =>
                    setSettingsForm((current) => ({
                      ...current,
                      resetTimeUtc: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-slate-700"
                />
              </label>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() =>
                    message.info(
                      "Wheel preview will use the backend spin pool.",
                    )
                  }
                >
                  Preview Wheel
                </button>
                <button
                  type="button"
                  onClick={handleSettingsSave}
                  disabled={settingsSaving}
                  className="flex-1 rounded-xl bg-[var(--color-brand-secondary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {settingsSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

const SelectField = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-slate-700 shadow-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

export default DailyRewards;
