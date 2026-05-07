import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Pencil,
  Plus,
  Search,
  ShieldOff,
  ShoppingCart,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { message, Spin } from "antd";
import {
  createReward,
  deleteReward,
  getRewardAnalytics,
  listRewards,
  updateReward,
} from "../../services/adminApi";

const categoryOptions = [
  { value: "All", label: "All" },
  { value: "xp", label: "XP Reward" },
  { value: "food_item", label: "Food Item" },
  { value: "discount", label: "Discount" },
  { value: "gift_card", label: "Gift Card" },
  { value: "experience", label: "Experience" },
  { value: "product", label: "Product" },
  { value: "vip_experience", label: "VIP Experience" },
  { value: "grand_prize", label: "Grand Prize" },
  { value: "bundle", label: "Bundle" },
];

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
  { value: "Quantity High-Low", label: "Quantity High-Low" },
];

const rewardCategoryLabels = {
  xp: "XP Reward",
  food_item: "Food Item",
  discount: "Discount",
  gift_card: "Gift Card",
  experience: "Experience",
  product: "Product",
  vip_experience: "VIP Experience",
  grand_prize: "Grand Prize",
  bundle: "Bundle",
};

const rewardCategoryDescriptions = {
  xp: "Earn XP directly when redeemed.",
  food_item: "Redeem an individual food item.",
  discount: "Apply a percentage discount.",
  gift_card: "Deliver a code-based gift card.",
  experience: "Offer a special dining or travel experience.",
  product: "Give away a physical product or device.",
  vip_experience: "Reserve a premium invite-only experience.",
  grand_prize: "Use for the biggest campaign prizes.",
  bundle: "Bundle multiple items into one reward.",
};

const statusClass = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  expired: "bg-red-100 text-red-600",
};

const analyticsIconClass = {
  totalRewards: "bg-violet-100 text-violet-600",
  activeRewards: "bg-emerald-100 text-emerald-600",
  inactiveRewards: "bg-slate-100 text-slate-500",
  expiredRewards: "bg-red-100 text-red-600",
  lowStockRewards: "bg-orange-100 text-orange-600",
  totalQuantityAvailable: "bg-blue-100 text-blue-600",
  averagePointsRequired: "bg-indigo-100 text-indigo-600",
  noExpiryRewards: "bg-cyan-100 text-cyan-700",
};

const blankRewardForm = {
  title: "",
  description: "",
  pointsRequired: "1000",
  quantityAvailable: "50",
  rewardCategory: "gift_card",
  xpPoints: "",
  foodItemName: "",
  discountPercentage: "",
  giftCardCode: "",
  termsAndConditions: "",
  isActive: true,
  hasExpiry: false,
  expiresAt: "",
  imageFile: null,
  imagePreview: "",
};

const formatDateTime = (value) => {
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

const getSpecificFieldName = (category) => {
  if (category === "xp") return "xpPoints";
  if (category === "food_item") return "foodItemName";
  if (category === "discount") return "discountPercentage";
  if (category === "gift_card") return "giftCardCode";
  return null;
};

const getRewardSubtitle = (reward) => {
  if (reward.rewardCategory === "xp") return `${reward.xpPoints ?? 0} XP`;
  if (reward.rewardCategory === "food_item") return reward.foodItemName || "Food item reward";
  if (reward.rewardCategory === "discount") return `${reward.discountPercentage ?? 0}% discount`;
  if (reward.rewardCategory === "gift_card") return reward.giftCardCode || "Gift card reward";
  return reward.description || "Reward";
};

const stockBarClass = (stock) => {
  if (stock <= 0) return "bg-slate-200";
  if (stock < 20) return "bg-orange-500";
  return "bg-emerald-500";
};

const metricCards = (analytics) => [
  {
    label: "Total Rewards",
    value: analytics?.totalRewards ?? 0,
    icon: Gift,
    iconClass: analyticsIconClass.totalRewards,
  },
  {
    label: "Active Rewards",
    value: analytics?.activeRewards ?? 0,
    icon: CheckCircle2,
    iconClass: analyticsIconClass.activeRewards,
  },
  {
    label: "Inactive Rewards",
    value: analytics?.inactiveRewards ?? 0,
    icon: ShieldOff,
    iconClass: analyticsIconClass.inactiveRewards,
  },
  {
    label: "Expired Rewards",
    value: analytics?.expiredRewards ?? 0,
    icon: ShieldOff,
    iconClass: analyticsIconClass.expiredRewards,
  },
  {
    label: "Low Stock Rewards",
    value: analytics?.lowStockRewards ?? 0,
    icon: ShoppingCart,
    iconClass: analyticsIconClass.lowStockRewards,
  },
  {
    label: "Quantity Available",
    value: Number(analytics?.totalQuantityAvailable ?? 0).toLocaleString(),
    icon: ShoppingCart,
    iconClass: analyticsIconClass.totalQuantityAvailable,
  },
  {
    label: "Average Points",
    value: Number(analytics?.averagePointsRequired ?? 0).toFixed(2),
    icon: Gift,
    iconClass: analyticsIconClass.averagePointsRequired,
  },
  {
    label: "No Expiry",
    value: analytics?.noExpiryRewards ?? 0,
    icon: CheckCircle2,
    iconClass: analyticsIconClass.noExpiryRewards,
  },
];

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

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState(blankRewardForm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const sortConfig =
        sortBy === "Points High-Low"
          ? { sortBy: "pointsRequired", sortOrder: "desc" }
          : sortBy === "Points Low-High"
            ? { sortBy: "pointsRequired", sortOrder: "asc" }
            : sortBy === "Quantity High-Low"
              ? { sortBy: "quantityAvailable", sortOrder: "desc" }
              : { sortBy: "createdAt", sortOrder: "desc" };

      const payload = await listRewards({
        page: 1,
        pageSize: 100,
        search: debouncedSearch || undefined,
        status: statusFilter !== "All" ? statusFilter || undefined : undefined,
        ...sortConfig,
      });

      const items = payload?.data?.items || [];
      const next = Array.isArray(items) ? items : [];
      setRewards(next);
    } catch (error) {
      message.error(error?.message || "Failed to load rewards");
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const payload = await getRewardAnalytics();
      setAnalytics(payload?.data || payload);
    } catch {
      setAnalytics(null);
    }
  };

  useEffect(() => {
    loadRewards();
    loadAnalytics();
  }, [debouncedSearch, statusFilter, sortBy]);

  const filteredRewards = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return rewards.filter((reward) => {
      const matchesCategory = !categoryFilter || categoryFilter === "All" || reward.rewardCategory === categoryFilter;
      const matchesSearch =
        !query ||
        reward.title?.toLowerCase().includes(query) ||
        reward.description?.toLowerCase().includes(query) ||
        getRewardSubtitle(reward).toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, debouncedSearch, rewards]);

  const sortedRewards = useMemo(() => {
    const next = [...filteredRewards];
    if (sortBy === "Points High-Low") {
      next.sort((a, b) => b.pointsRequired - a.pointsRequired);
    } else if (sortBy === "Points Low-High") {
      next.sort((a, b) => a.pointsRequired - b.pointsRequired);
    } else if (sortBy === "Quantity High-Low") {
      next.sort((a, b) => b.quantityAvailable - a.quantityAvailable);
    } else {
      next.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return next;
  }, [filteredRewards, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedRewards.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleRewards = sortedRewards.slice((page - 1) * pageSize, page * pageSize);
  const cards = metricCards(analytics);

  const openCreateModal = () => {
    setEditingReward(null);
    setFormData(blankRewardForm);
    setShowFormModal(true);
  };

  const openEditModal = (reward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title || "",
      description: reward.description || "",
      pointsRequired: String(reward.pointsRequired ?? ""),
      quantityAvailable: String(reward.quantityAvailable ?? ""),
      rewardCategory: reward.rewardCategory || "gift_card",
      xpPoints: reward.xpPoints != null ? String(reward.xpPoints) : "",
      foodItemName: reward.foodItemName || "",
      discountPercentage: reward.discountPercentage != null ? String(reward.discountPercentage) : "",
      giftCardCode: reward.giftCardCode || "",
      termsAndConditions: reward.termsAndConditions || "",
      isActive: Boolean(reward.isActive),
      hasExpiry: Boolean(reward.hasExpiry),
      expiresAt: formatDateTimeInput(reward.expiresAt),
      imageFile: null,
      imagePreview: reward.imageUrl || "",
    });
    setShowFormModal(true);
  };

  const closeModal = () => {
    setShowFormModal(false);
    setEditingReward(null);
    setFormData(blankRewardForm);
  };

  const buildRewardPayload = () => {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      pointsRequired: Number(formData.pointsRequired),
      quantityAvailable: Number(formData.quantityAvailable),
      rewardCategory: formData.rewardCategory,
      isActive: Boolean(formData.isActive),
      hasExpiry: Boolean(formData.hasExpiry),
    };

    const specificField = getSpecificFieldName(formData.rewardCategory);
    if (specificField === "xpPoints") {
      payload.xpPoints = Number(formData.xpPoints);
    }
    if (specificField === "foodItemName") {
      payload.foodItemName = formData.foodItemName.trim();
    }
    if (specificField === "discountPercentage") {
      payload.discountPercentage = Number(formData.discountPercentage);
    }
    if (specificField === "giftCardCode") {
      payload.giftCardCode = formData.giftCardCode.trim();
    }

    if (formData.termsAndConditions.trim()) {
      payload.termsAndConditions = formData.termsAndConditions.trim();
    }

    if (formData.hasExpiry && formData.expiresAt) {
      payload.expiresAt = new Date(formData.expiresAt).toISOString();
    }

    return payload;
  };

  const buildRewardFormData = () => {
    const payload = buildRewardPayload();
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        form.append(key, String(value));
      }
    });
    if (formData.imageFile) {
      form.append("image", formData.imageFile);
    }
    return form;
  };

  const handleSaveReward = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      message.error("Please fill in the required fields.");
      return;
    }

    const specificField = getSpecificFieldName(formData.rewardCategory);
    const specificValue =
      specificField === "xpPoints"
        ? formData.xpPoints
        : specificField === "foodItemName"
          ? formData.foodItemName
          : specificField === "discountPercentage"
            ? formData.discountPercentage
            : specificField === "giftCardCode"
              ? formData.giftCardCode
              : "";

    if (!String(specificValue || "").trim()) {
      message.error("Please fill in the reward type specific field.");
      return;
    }

    try {
      setSaving(true);
      if (editingReward) {
        await updateReward({
          id: editingReward.id,
          body: buildRewardFormData(),
        });
        message.success("Reward updated successfully");
      } else {
        await createReward(buildRewardFormData());
        message.success("Reward created successfully");
      }
      closeModal();
      await Promise.all([loadRewards(), loadAnalytics()]);
    } catch (error) {
      message.error(error?.message || "Failed to save reward");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReward = async (reward) => {
    if (!reward?.id) return;
    try {
      setDeleting(true);
      await deleteReward({ id: reward.id });
      message.success("Reward deleted successfully");
      await Promise.all([loadRewards(), loadAnalytics()]);
    } catch (error) {
      message.error(error?.message || "Failed to delete reward");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
          Rewards Management
        </h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(255,149,0,0.22)]"
        >
          <Plus className="h-4 w-4" />
          Create Reward
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[22px] border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.98rem] text-slate-500">{card.label}</p>
                  <p className="mt-1 text-[2.05rem] font-semibold leading-none tracking-tight text-slate-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_140px_140px_120px] lg:justify-between">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search rewards..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 shadow-sm"
              />
            </div>

            <SelectField
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              options={categoryOptions}
              placeholder="Category"
            />

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

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#687b9b]">
              <tr>
                <th className="px-6 py-4">Reward</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <Spin />
                      Loading rewards...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && visibleRewards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    No rewards found.
                  </td>
                </tr>
              ) : null}

              {!loading &&
                visibleRewards.map((reward) => (
                  <tr key={reward.id} className="border-t border-slate-100">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          {reward.imageUrl ? (
                            <img
                              src={reward.imageUrl}
                              alt={reward.title}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          ) : (
                            <Gift className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="max-w-[220px] text-[1.08rem] font-semibold leading-6 text-slate-900">
                            {reward.title}
                          </p>
                          <p className="text-sm text-[#7e8ca5]">{getRewardSubtitle(reward)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[1.05rem] text-slate-600">
                      {rewardCategoryLabels[reward.rewardCategory] || reward.rewardCategory}
                    </td>
                    <td className="px-6 py-6">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[var(--color-brand-secondary)]">
                        {reward.pointsRequired.toLocaleString()} pts
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="max-w-[86px]">
                        <p className={`text-[1.02rem] ${reward.quantityAvailable < 20 && reward.quantityAvailable > 0 ? "text-orange-600" : "text-slate-700"}`}>
                          {reward.quantityAvailable}
                          {reward.quantityAvailable < 20 && reward.quantityAvailable > 0 ? " (Low)" : ""}
                        </p>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${stockBarClass(reward.quantityAvailable)}`}
                            style={{
                              width: `${Math.min(
                                100,
                                reward.quantityAvailable === 0 ? 0 : reward.quantityAvailable / 1.5
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass[reward.status] || statusClass.inactive}`}>
                        {(reward.status || "").charAt(0).toUpperCase() + (reward.status || "").slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-[1.02rem] text-slate-600">
                      {reward.hasExpiry && reward.expiresAt ? formatDateTime(reward.expiresAt) : "No expiry"}
                    </td>
                    <td className="px-6 py-6 text-[1.02rem] leading-6 text-slate-600">
                      {formatDateTime(reward.createdAt)}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-4 text-[#8ea0bb]">
                        <button
                          type="button"
                          onClick={() => openEditModal(reward)}
                          className="hover:text-slate-600"
                          title="Edit reward"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(reward)}
                          disabled={deleting}
                          className="hover:text-red-500 disabled:opacity-50"
                          title="Delete reward"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-[1.02rem] text-slate-500">
            <span>Rows per page:</span>
            <div className="relative min-w-[50px]">
              <span className="font-semibold text-slate-700">{pageSize}</span>
              <ChevronDown className="pointer-events-none absolute -right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <p className="text-[1.02rem] text-slate-500">
              {visibleRewards.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, sortedRewards.length)} of {sortedRewards.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(0, 5)
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-semibold ${
                      pageNumber === page
                        ? "bg-[var(--color-brand-secondary)] text-white"
                        : "text-slate-700"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showFormModal ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <h2 className="text-[2rem] font-semibold tracking-tight text-slate-900">
                  {editingReward ? "Edit Reward" : "Create New Reward"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <label className="block">
                    <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                      Reward Title
                    </span>
                    <input
                      value={formData.title}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, title: event.target.value }))
                      }
                      placeholder="e.g. Amazon $20 Gift Card"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4"
                    />
                  </label>

                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                        Reward Category
                      </span>
                      <div className="relative">
                        <select
                          value={formData.rewardCategory}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              rewardCategory: event.target.value,
                              xpPoints: event.target.value === "xp" ? current.xpPoints : "",
                              foodItemName: event.target.value === "food_item" ? current.foodItemName : "",
                              discountPercentage:
                                event.target.value === "discount" ? current.discountPercentage : "",
                              giftCardCode: event.target.value === "gift_card" ? current.giftCardCode : "",
                            }))
                          }
                          className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 pr-10 text-slate-700"
                        >
                          {categoryOptions
                            .filter((item) => item.value !== "All")
                            .map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {rewardCategoryDescriptions[formData.rewardCategory] ||
                          "Use title, description, image, and stock to define this reward."}
                      </p>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                        Points Required
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.pointsRequired}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              pointsRequired: event.target.value,
                            }))
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          pts
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                        Reward Stock
                      </span>
                      <input
                        type="number"
                        value={formData.quantityAvailable}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            quantityAvailable: event.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 px-4"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                        Reward Image
                      </span>
                      <div className="rounded-2xl border border-dashed border-[#d9e2f0] bg-[#f9fbff] px-4 py-4 text-slate-500">
                        <div className="flex items-center gap-4">
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                            {formData.imagePreview ? (
                              <img
                                src={formData.imagePreview}
                                alt="Reward preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UploadCloud className="h-8 w-8 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                              <UploadCloud className="h-4 w-4" />
                              {editingReward ? "Replace image" : "Upload image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] || null;
                                  setFormData((current) => ({
                                    ...current,
                                    imageFile: file,
                                    imagePreview: file
                                      ? URL.createObjectURL(file)
                                      : editingReward?.imageUrl || "",
                                  }));
                                }}
                              />
                            </label>
                            <p className="mt-2 text-sm text-slate-400">
                              JPG or PNG image. If you do not choose a new file while editing, the current image stays unchanged.
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {formData.rewardCategory === "xp" ? (
                      <label className="block">
                        <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                          XP Points
                        </span>
                        <input
                          type="number"
                          value={formData.xpPoints}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, xpPoints: event.target.value }))
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 px-4"
                        />
                      </label>
                    ) : null}

                    {formData.rewardCategory === "food_item" ? (
                      <label className="block">
                        <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                          Food Item Name
                        </span>
                        <input
                          value={formData.foodItemName}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              foodItemName: event.target.value,
                            }))
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 px-4"
                        />
                      </label>
                    ) : null}

                    {formData.rewardCategory === "discount" ? (
                      <label className="block">
                        <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                          Discount Percentage
                        </span>
                        <input
                          type="number"
                          value={formData.discountPercentage}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              discountPercentage: event.target.value,
                            }))
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 px-4"
                        />
                      </label>
                    ) : null}

                    {formData.rewardCategory === "gift_card" ? (
                      <label className="block">
                        <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                          Gift Card Code
                        </span>
                        <input
                          value={formData.giftCardCode}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              giftCardCode: event.target.value,
                            }))
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 px-4"
                        />
                      </label>
                    ) : null}
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                      Description
                    </span>
                    <textarea
                      value={formData.description}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, description: event.target.value }))
                      }
                      placeholder="Explain the benefits of this reward..."
                      className="min-h-[110px] w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                      Terms & Conditions
                    </span>
                    <textarea
                      value={formData.termsAndConditions}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          termsAndConditions: event.target.value,
                        }))
                      }
                      placeholder="Specific rules for redemption..."
                      className="min-h-[110px] w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                      <div>
                        <p className="text-[1.08rem] font-medium text-slate-800">Active</p>
                        <p className="text-sm text-slate-500">Enable this reward in the catalog.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, isActive: event.target.checked }))
                        }
                        className="h-5 w-5"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                      <div>
                        <p className="text-[1.08rem] font-medium text-slate-800">Has Expiry</p>
                        <p className="text-sm text-slate-500">Set a deadline for this reward.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.hasExpiry}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, hasExpiry: event.target.checked }))
                        }
                        className="h-5 w-5"
                      />
                    </label>
                  </div>

                  {formData.hasExpiry ? (
                    <label className="block">
                      <span className="mb-2 block text-[1.08rem] font-medium text-slate-700">
                        Expiration Date & Time
                      </span>
                      <input
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, expiresAt: event.target.value }))
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 px-4"
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-medium text-[#8b9ab0]">
                    {editingReward ? "Update the selected reward." : "Create a new reward for the catalog."}
                  </p>
                  <p className="text-sm text-slate-400">
                    {editingReward
                      ? "You can replace the existing image from this form."
                      : "Upload a reward image and fill the type-specific field."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-lg font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReward}
                    disabled={saving}
                    className="rounded-xl bg-[var(--color-brand-secondary)] px-6 py-3 text-lg font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingReward ? "Update Reward" : "Create Reward"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Rewards;
