import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { CalendarDays, ChevronRight, Eye, MapPin, Store, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { adjustUserPoints, getUserById, updateUserStatus } from "../../services/adminApi";
import { normalizeUser } from "./userUtils";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Suspended: "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const historyFallback = [
  { restaurant: "Taco Palace", date: "Oct 24, 2023", location: "Queens, NY", points: 50, accent: "bg-orange-100 text-orange-600" },
  { restaurant: "Burger Town", date: "Oct 22, 2023", location: "Manhattan, NY", points: 75, accent: "bg-blue-100 text-blue-600" },
  { restaurant: "Ramen Nagi", date: "Oct 20, 2023", location: "Brooklyn, NY", points: 40, accent: "bg-emerald-100 text-emerald-600" },
];

const UserAvatar = ({ user }) => {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="h-28 w-28 rounded-full object-cover shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
      />
    );
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
      {initials}
    </div>
  );
};

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [pointsUpdating, setPointsUpdating] = useState(false);
  const [adjustmentMode, setAdjustmentMode] = useState("add");
  const [adjustmentAmount, setAdjustmentAmount] = useState("0");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        const payload = await getUserById({ id });
        if (!mounted) return;
        const data = payload?.data || payload;
        setUser(normalizeUser(data));
      } catch {
        if (!mounted) return;
        setUser(
          normalizeUser({
            id,
            name: "Maria Gonzalez",
            email: "maria@email.com",
            city: "New York, NY",
            points: 2450,
            checkIns: 34,
            redeemedRewards: 5,
            streak: 12,
            createdAt: "2023-10-12T00:00:00.000Z",
            status: "active",
          })
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, [id]);

  const metrics = useMemo(() => {
    if (!user) return [];
    return [
      { label: "Total Points", value: user.points.toLocaleString(), accent: "text-[var(--color-brand-primary)]" },
      { label: "Check-ins", value: user.checkIns.toLocaleString() },
      { label: "Redeemed", value: user.redeemed.toLocaleString() },
      { label: "Streak", value: `${user.streak} days` },
    ];
  }, [user]);

  const handleStatusToggle = async () => {
    if (!user) return;
    const nextStatus = user.status === "Active" ? "inactive" : "active";
    setUser((current) => ({ ...current, status: nextStatus === "active" ? "Active" : "Inactive" }));

    try {
      setStatusUpdating(true);
      await updateUserStatus({ id: user.id, status: nextStatus });
    } catch {
      setUser((current) => ({
        ...current,
        status: nextStatus === "active" ? "Inactive" : "Active",
      }));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSuspend = async () => {
    if (!user) return;
    const previousStatus = user.status;
    setUser((current) => ({ ...current, status: "Suspended" }));
    try {
      setStatusUpdating(true);
      await updateUserStatus({ id: user.id, status: "blocked" });
    } catch {
      setUser((current) => ({ ...current, status: previousStatus }));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!user) return;
    const amount = Number(adjustmentAmount) || 0;
    if (amount <= 0) {
      message.error("Enter a valid points amount.");
      return;
    }

    const pointsDelta = adjustmentMode === "add" ? amount : -amount;

    try {
      setPointsUpdating(true);
      const payload = await adjustUserPoints({
        id: user.id,
        pointsDelta,
        reason: adjustmentReason.trim() || undefined,
      });
      const updated = normalizeUser(payload?.data || payload);
      setUser(updated);
      setAdjustmentAmount("0");
      setAdjustmentReason("");
      message.success(
        `${adjustmentMode === "add" ? "Added" : "Removed"} ${Math.abs(pointsDelta)} points successfully.`
      );
    } catch (error) {
      message.error(error?.message || "Failed to update points");
    } finally {
      setPointsUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-lg text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        Loading user details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-[2rem] font-medium tracking-tight text-slate-900">
        <Link to="/user-list" className="hover:text-[var(--color-brand-primary)]">
          Users
        </Link>
        <ChevronRight className="h-6 w-6 text-slate-400" />
        <span>{user.name}</span>
      </div>

      <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-[2.4rem] font-semibold tracking-tight text-slate-900">
                {user.name}
              </h1>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[user.status]}`}>
                {user.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-[1.3rem] text-slate-500">User ID: {user.userIdLabel}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 p-7">
              <div className="flex flex-col items-center text-center">
                <UserAvatar user={user} />
                <h2 className="mt-5 text-[2rem] font-semibold tracking-tight text-slate-900">
                  {user.name}
                </h2>
                <p className="text-[1.1rem] text-slate-500">{user.email}</p>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6 text-[1.1rem]">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Location
                    </p>
                    <p className="font-medium text-slate-700">{user.city}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <CalendarDays className="mt-1 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Joined
                    </p>
                    <p className="font-medium text-slate-700">{user.joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 p-7">
              <h3 className="text-[1.55rem] font-semibold tracking-tight text-slate-900">
                Status Control
              </h3>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-[1.05rem] font-medium text-slate-700">
                  Account Active
                </span>
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={handleStatusToggle}
                  className={`relative h-8 w-12 rounded-full transition ${
                    user.status === "Active"
                      ? "bg-[var(--color-brand-secondary)]"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                      user.status === "Active" ? "left-5" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                disabled={statusUpdating}
                onClick={handleSuspend}
                className="mt-5 w-full rounded-2xl border border-red-200 px-4 py-3 text-[1.05rem] font-semibold text-red-500"
              >
                Suspend Account
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[22px] border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className={`mt-2 text-[2rem] font-semibold tracking-tight text-slate-900 ${metric.accent || ""}`}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-slate-200">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="text-[1.5rem] font-semibold tracking-tight text-slate-900">
                  Points Adjustment
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                  <div>
                    <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setAdjustmentMode("add")}
                        className={`rounded-xl px-5 py-2 text-[1.02rem] font-semibold ${
                          adjustmentMode === "add"
                            ? "bg-white text-[var(--color-brand-secondary)] shadow-sm"
                            : "text-slate-500"
                        }`}
                      >
                        Add Points
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustmentMode("remove")}
                        className={`rounded-xl px-5 py-2 text-[1.02rem] font-semibold ${
                          adjustmentMode === "remove"
                            ? "bg-white text-[var(--color-brand-secondary)] shadow-sm"
                            : "text-slate-500"
                        }`}
                      >
                        Remove Points
                      </button>
                    </div>

                    <label className="mt-5 block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Amount
                      </span>
                      <input
                        value={adjustmentAmount}
                        onChange={(event) => setAdjustmentAmount(event.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 px-4"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Reason for Adjustment
                      </span>
                      <textarea
                        value={adjustmentReason}
                        onChange={(event) => setAdjustmentReason(event.target.value)}
                        placeholder="e.g., Promotion bonus, Error correction..."
                        className="min-h-[78px] w-full rounded-xl border border-slate-200 px-4 py-3"
                      />
                    </label>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAdjustPoints}
                        disabled={pointsUpdating}
                        className="rounded-xl bg-[var(--color-brand-secondary)] px-6 py-3 text-lg font-semibold text-white"
                      >
                        {pointsUpdating ? "Updating..." : "Update Points"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <h3 className="text-[1.5rem] font-semibold tracking-tight text-slate-900">
                  Check-in History
                </h3>
                <button type="button" className="text-lg font-semibold text-[var(--color-brand-secondary)]">
                  View All
                </button>
              </div>

              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {historyFallback.map((entry) => (
                    <tr key={`${entry.restaurant}-${entry.date}`} className="border-t border-slate-100">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${entry.accent}`}>
                            <Store className="h-4 w-4" />
                          </div>
                          <span className="text-[1.05rem] font-semibold text-slate-900">
                            {entry.restaurant}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-600">{entry.date}</td>
                      <td className="px-6 py-5 text-slate-600">{entry.location}</td>
                      <td className="px-6 py-5 text-right text-lg font-semibold text-[#00c2a8]">
                        +{entry.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
