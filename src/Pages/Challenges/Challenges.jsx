import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Target,
  Calendar,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";
import { message, Spin, Modal, Empty } from "antd";
import {
  listChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeAnalytics,
} from "../../services/challengesApi";
import { listRewards } from "../../services/adminApi";

const statusOptions = [
  { value: "All", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const criterionTypes = [
  { value: "check_in_count", label: "Total Check-ins" },
  { value: "breakfast_check_ins", label: "Breakfast Check-ins" },
  { value: "lunch_check_ins", label: "Lunch Check-ins" },
  { value: "dinner_check_ins", label: "Dinner Check-ins" },
];

const statusClass = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
};

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rewardPoints: 100,
    rewardId: "",
    startAt: "",
    endAt: "",
    status: "pending",
    criteria: [{ type: "check_in_count", requiredCount: 5 }],
  });

  const [analytics, setAnalytics] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalPoints: 0,
  });

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const query = {
        page: currentPage,
        page_size: pageSize,
      };
      if (searchTerm) query.search = searchTerm;
      if (statusFilter !== "All") query.status = statusFilter;

      const response = await listChallenges(query);
      const data = response?.data || {};
      setChallenges(data.items || []);
      setTotalItems(data.pagination?.totalItems || 0);

      // Simple global analytics calculation from pagination or separate call if available
      // For now, using pagination data for total
      setAnalytics(prev => ({
        ...prev,
        total: data.pagination?.totalItems || 0,
        active: (data.items || []).filter(c => c.status === "active").length, // Mock active count if list is shallow
        completed: (data.items || []).filter(c => c.status === "completed").length,
      }));
    } catch (error) {
      // message.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const loadRewards = async () => {
    try {
      setRewardsLoading(true);
      const response = await listRewards({
        page: 1,
        pageSize: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const data = response?.data || {};
      setRewards(Array.isArray(data.items) ? data.items : []);
    } catch {
      setRewards([]);
    } finally {
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    loadRewards();
  }, []);

  const rewardById = useMemo(() => {
    return new Map(rewards.map((reward) => [reward.id, reward]));
  }, [rewards]);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormData({
      title: "",
      description: "",
      rewardPoints: 100,
      rewardId: "",
      startAt: "",
      endAt: "",
      status: "pending",
      criteria: [{ type: "check_in_count", requiredCount: 5 }],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      rewardPoints: challenge.rewardPoints,
      rewardId: challenge.rewardId || "",
      startAt: formatDateTimeLocal(challenge.startAt),
      endAt: formatDateTimeLocal(challenge.endAt),
      status: challenge.status,
      criteria: challenge.criteria || [{ type: "check_in_count", requiredCount: 5 }],
    });
    setShowModal(true);
  };

  const handleAddCriterion = () => {
    setFormData((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { type: "check_in_count", requiredCount: 5 }],
    }));
  };

  const handleRemoveCriterion = (index) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const handleCriterionChange = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index][field] = field === "requiredCount" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, criteria: newCriteria }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.startAt || !formData.endAt) {
      message.warning("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        rewardId: formData.rewardId || null,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      if (editingChallenge) {
        await updateChallenge(editingChallenge.id, payload);
        message.success("Challenge updated successfully");
      } else {
        await createChallenge(payload);
        message.success("Challenge created successfully");
      }
      setShowModal(false);
      loadChallenges();
    } catch (error) {
      message.error(error?.message || "Failed to save challenge");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Challenge",
      content: "Are you sure you want to delete this challenge? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteChallenge(id);
          message.success("Challenge deleted");
          loadChallenges();
        } catch (error) {
          message.error("Failed to delete challenge");
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-900">Challenges Management</h1>
          <p className="mt-1 text-slate-500">Create, track, and manage user engagement challenges.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,149,0,0.22)] transition-all hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Create Challenge
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Challenges", value: analytics.total, icon: Trophy, color: "bg-violet-100 text-violet-600" },
          { label: "Active Now", value: analytics.active, icon: Target, color: "bg-emerald-100 text-emerald-600" },
          { label: "Completed", value: analytics.completed, icon: CheckCircle2, color: "bg-blue-100 text-blue-600" },
          { label: "Participation", value: "84%", icon: Users, color: "bg-amber-100 text-amber-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Filters & Content */}
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 pl-12 pr-4 text-slate-700 outline-none focus:border-[var(--color-brand-primary)]"
              />
            </div>
            <div className="flex items-center gap-3">
               <span className="text-sm font-medium text-slate-500">Status:</span>
               <div className="relative">
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11 w-40 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-slate-700 outline-none focus:border-[var(--color-brand-primary)]"
                 >
                   {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
                 <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
               </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Challenge</th>
                <th className="px-6 py-4">Reward</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Criteria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                   <td colSpan={6} className="py-20 text-center">
                     <Spin size="large" />
                     <p className="mt-4 text-slate-500 font-medium">Loading challenges...</p>
                   </td>
                </tr>
              ) : challenges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <Empty description="No challenges found" />
                  </td>
                </tr>
              ) : (
                challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{challenge.title}</p>
                        <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{challenge.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="space-y-2">
                         <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-[var(--color-brand-secondary)]">
                           <Award className="h-4 w-4" />
                           {challenge.rewardPoints} XP
                         </div>
                         <div className="text-xs font-medium text-slate-500">
                           {challenge.rewardId
                             ? rewardById.get(challenge.rewardId)?.title || "Linked reward"
                             : "No linked reward"}
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(challenge.startAt)}</span>
                        <span className="flex items-center gap-1.5 ml-0.5 mt-1 border-l-2 border-slate-100 pl-4 text-xs font-medium">to {formatDate(challenge.endAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-700">{challenge.criteriaCount || challenge.criteria?.length || 0} Targets</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusClass[challenge.status] || "bg-slate-100 text-slate-600"}`}>
                        {challenge.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3 text-slate-400">
                        <button onClick={() => handleOpenEdit(challenge)} className="p-1.5 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(challenge.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
           <p className="text-sm text-slate-500 font-medium">
             Showing <span className="text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-slate-900">{totalItems}</span>
           </p>
           <div className="flex items-center gap-2">
             <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40 hover:bg-slate-50 transition-all"
             >
               <ChevronLeft className="h-4 w-4" />
             </button>
             {/* Page numbers would go here for a full implementation */}
             <button 
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * pageSize >= totalItems}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40 hover:bg-slate-50 transition-all"
             >
               <ChevronRight className="h-4 w-4" />
             </button>
           </div>
        </div>
      </section>

      {/* Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900">{editingChallenge ? "Edit Challenge" : "Create New Challenge"}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              {/* Basic Info */}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Challenge Title</label>
                  <input 
                    value={formData.title}
                    onChange={e => setFormData(p => ({...p, title: e.target.value}))}
                    placeholder="e.g. Weekly Breakfast Warrior"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                    placeholder="Describe how users can complete this challenge..."
                    className="min-h-[100px] w-full rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Reward Points (XP)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.rewardPoints}
                      onChange={e => setFormData(p => ({...p, rewardPoints: Number(e.target.value)}))}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-12 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                    />
                    <Award className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <div className="relative">
                    <select 
                      value={formData.status}
                      onChange={e => setFormData(p => ({...p, status: e.target.value}))}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 pr-10 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Linked Reward</label>
                <div className="relative">
                  <select
                    value={formData.rewardId}
                    onChange={(e) => setFormData((p) => ({ ...p, rewardId: e.target.value }))}
                    disabled={rewardsLoading}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:bg-slate-50"
                  >
                    <option value="">No reward linked</option>
                    {rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.title} - {reward.pointsRequired} pts
                        {reward.status && reward.status !== "active" ? ` (${reward.status})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                </div>
                <p className="text-xs text-slate-500">
                  Users receive this reward automatically after completing the challenge.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 font-medium">Start Date</label>
                  <input 
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={e => setFormData(p => ({...p, startAt: e.target.value}))}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 font-medium">End Date</label>
                  <input 
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={e => setFormData(p => ({...p, endAt: e.target.value}))}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none"
                  />
                </div>
              </div>

              {/* Criteria Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-base font-bold text-slate-800">Challenge Criteria</label>
                  <button 
                    type="button" 
                    onClick={handleAddCriterion}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-brand-secondary)] hover:opacity-80"
                  >
                    <Plus className="h-4 w-4" />
                    Add Criteria
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.criteria.map((criterion, idx) => (
                    <div key={idx} className="flex gap-4 items-end rounded-2xl bg-slate-50 p-4 border border-slate-100 group relative">
                      <div className="flex-1 space-y-2">
                        <label className="text-[0.8rem] font-bold text-slate-500 uppercase tracking-wider">Criterion Type</label>
                        <div className="relative">
                          <select 
                             value={criterion.type}
                             onChange={e => handleCriterionChange(idx, "type", e.target.value)}
                             className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm outline-none"
                          >
                            {criterionTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>
                      <div className="w-32 space-y-2">
                        <label className="text-[0.8rem] font-bold text-slate-500 uppercase tracking-wider">Required</label>
                        <input 
                          type="number"
                          value={criterion.requiredCount}
                          onChange={e => handleCriterionChange(idx, "requiredCount", e.target.value)}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none"
                        />
                      </div>
                      {formData.criteria.length > 1 && (
                        <button 
                          onClick={() => handleRemoveCriterion(idx)}
                          className="flex h-10 w-10 items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-8 py-6 bg-slate-50/50 flex justify-end gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="h-12 px-6 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-12 items-center justify-center min-w-[140px] rounded-xl bg-[var(--color-brand-secondary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--color-brand-secondary)]/20 disabled:opacity-50 transition-all"
              >
                {saving ? <Spin size="small" className="white-spin mr-2" /> : null}
                {editingChallenge ? "Save Changes" : "Create Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
