import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gift, ScanLine, Tag, UsersRound } from "lucide-react";
import { getDashboardSummary } from "../../services/adminApi";

const formatCompact = (value) => (Number(value) || 0).toLocaleString();

const getInitials = (name = "User") =>
  name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const rangeOptions = [
  { label: "Last 24h", value: "last_24_hours" },
  { label: "7 Days", value: "last_7_days" },
  { label: "30 Days", value: "last_30_days" },
  { label: "Monthly", value: "monthly" },
];

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({
  label,
  value: String(index + 1),
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-brand-secondary)]">
        Check-ins: {formatCompact(payload[0]?.value)}
      </p>
      <p className="text-sm font-medium text-emerald-600">
        Points Issued: {formatCompact(payload[1]?.value)}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("last_7_days");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const payload = await getDashboardSummary({
          range: selectedRange,
          year: Number(selectedYear),
          month: selectedRange === "monthly" ? Number(selectedMonth) : undefined,
        });
        if (!mounted) return;
        setDashboard(payload?.data || payload || null);
      } catch {
        if (mounted) setDashboard(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [selectedRange, selectedYear, selectedMonth]);

  const summary = dashboard || {};
  const activityData = Array.isArray(summary.activity) ? summary.activity : [];
  const topRestaurants = Array.isArray(summary.topRestaurants) ? summary.topRestaurants : [];
  const topUsers = Array.isArray(summary.topUsers) ? summary.topUsers : [];

  const overviewCards = useMemo(
    () => [
      {
        label: "Active Users",
        value: summary.activeUsers ?? 0,
        icon: UsersRound,
        iconClass: "bg-indigo-50 text-[var(--color-brand-secondary)]",
      },
      {
        label: "Daily Check-ins",
        value: summary.dailyCheckIns ?? 0,
        icon: ScanLine,
        iconClass: "bg-indigo-50 text-[var(--color-brand-secondary)]",
      },
      {
        label: "Points Issued",
        value: summary.pointsIssued ?? 0,
        icon: Tag,
        iconClass: "bg-emerald-100 text-emerald-600",
      },
      {
        label: "Rewards Redeemed",
        value: summary.rewardsRedeemed ?? 0,
        icon: Gift,
        iconClass: "bg-rose-100 text-rose-500",
      },
    ],
    [summary]
  );

  const maxLeaderboardPoints = Math.max(...topUsers.map((entry) => Number(entry.currentPoints) || 0), 1);
  const maxRestaurantValue = Math.max(...topRestaurants.map((item) => Number(item.checkIns) || 0), 1);

  const selectedRangeLabel =
    rangeOptions.find((option) => option.value === selectedRange)?.label || "7 Days";

  return (
    <div className="space-y-8 pb-4">
      <section>
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 md:text-[2.05rem]">
              Dashboard Overview
            </h1>
          </div>

          {selectedRange === "monthly" ? (
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-7 border-b border-slate-200 pb-4">
          {rangeOptions.map((range) => {
            const isActive = range.value === selectedRange;
            return (
              <button
                key={range.value}
                type="button"
                onClick={() => setSelectedRange(range.value)}
                className={`relative pb-3 text-lg font-semibold transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {range.label}
                {isActive ? (
                  <span className="absolute inset-x-0 -bottom-[1px] h-[3px] rounded-full bg-[var(--color-brand-secondary)]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
                  {selectedRangeLabel}
                </span>
              </div>
              <p className="text-lg text-slate-500">{card.label}</p>
              <p className="mt-1 text-[2rem] font-semibold tracking-tight text-slate-900">
                {loading ? "..." : formatCompact(card.value)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
                Daily Activity
              </h2>
              <p className="text-sm text-slate-500">Check-ins vs Points Issued</p>
            </div>

            <div className="flex items-center gap-5 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[var(--color-brand-secondary)]" />
                Check-ins
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                Points Issued
              </div>
            </div>
          </div>

          <div className="h-[320px] md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="checkInsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-secondary)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--color-brand-secondary)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="pointsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="checkIns"
                  stroke="var(--color-brand-secondary)"
                  strokeWidth={3}
                  fill="url(#checkInsFill)"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="pointsIssued"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#pointsFill)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
              Top Restaurants
            </h2>
            <span className="text-sm font-semibold text-slate-400">Top 5</span>
          </div>

          <div className="space-y-5">
            {topRestaurants.map((restaurant) => (
              <div key={restaurant.restaurantId}>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <p className="text-[1.05rem] font-semibold leading-6 text-slate-900">
                    {restaurant.restaurantName}
                  </p>
                  <div className="text-right">
                    <p className="text-lg text-slate-500">{formatCompact(restaurant.checkIns)}</p>
                    <p className="text-xs font-medium text-slate-400">
                      {formatCompact(restaurant.pointsIssued)} pts
                    </p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-[var(--color-brand-secondary)]"
                    style={{ width: `${(Number(restaurant.checkIns) / maxRestaurantValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
            Top Users Leaderboard
          </h2>
          <button
            type="button"
            onClick={() => navigate("/user-list")}
            className="text-lg font-semibold text-[var(--color-brand-secondary)]"
          >
            View All Users
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Check-ins</th>
                <th className="px-6 py-4">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user) => (
                <tr key={user.uid} className="border-t border-slate-100">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-[var(--color-brand-secondary)]">
                        {getInitials(user.fullname)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{user.fullname}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-lg font-semibold text-slate-900">
                    {formatCompact(user.currentPoints)} pts
                  </td>
                  <td className="px-6 py-5 text-lg text-slate-600">
                    {formatCompact(user.totalCheckIns)} check-ins
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-2.5 w-full max-w-[160px] rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full bg-[var(--color-brand-secondary)]"
                        style={{
                          width: `${(Number(user.currentPoints) / maxLeaderboardPoints) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
