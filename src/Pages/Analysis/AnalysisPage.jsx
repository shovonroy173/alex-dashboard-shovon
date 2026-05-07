import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Store,
  Search,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const restaurants = ["Taco Palace - Downtown", "Burger Town - North Side", "Sushi House - West End"];
const periods = ["Last 30 Days", "Last 7 Days", "Last 90 Days"];

const kpis = [
  { label: "Total Check-ins", value: "2,456", change: "+12%" },
  { label: "Unique Visitors", value: "1,120", change: "+8%" },
  { label: "Repeat Visit Rate", value: "38%", change: "+4%" },
  { label: "Route Visitors", value: "312", change: "+15%" },
  { label: "Conversion Rate", value: "72%", change: "+6%" },
];

const lineData = [
  { date: "Oct 01", visitors: 28, checkIns: 18 },
  { date: "Oct 03", visitors: 32, checkIns: 22 },
  { date: "Oct 05", visitors: 22, checkIns: 12 },
  { date: "Oct 08", visitors: 48, checkIns: 28 },
  { date: "Oct 10", visitors: 44, checkIns: 22 },
  { date: "Oct 14", visitors: 68, checkIns: 38 },
  { date: "Oct 17", visitors: 52, checkIns: 21 },
  { date: "Oct 20", visitors: 79, checkIns: 49 },
  { date: "Oct 23", visitors: 61, checkIns: 31 },
  { date: "Oct 26", visitors: 90, checkIns: 61 },
  { date: "Oct 29", visitors: 73, checkIns: 44 },
];

const loyaltyData = [
  { name: "Returning", value: 38, fill: "#f68b1f" },
  { name: "Remaining", value: 62, fill: "#eef2f7" },
];

const loyaltyLegend = [
  { label: "Repeat Customers", value: 426, color: "bg-[#f68b1f]" },
  { label: "New Customers", value: 69, color: "bg-[#eef2f7]" },
  { label: "VIP Customers", value: 4, color: "bg-[#3f4ed8]" },
];

const trafficRows = [
  { label: "Instagram Ads", value: 142 },
  { label: "Google Maps Search", value: 98 },
  { label: "Facebook Local", value: 45 },
  { label: "Email Campaign", value: 27 },
];

const heatmapRows = [
  { label: "Morning", values: [1, 2, 1, 2, 3, 2, 2] },
  { label: "Lunch", values: [4, 5, 4, 5, 6, 5, 5] },
  { label: "Afternoon", values: [1, 2, 1, 2, 4, 3, 2] },
  { label: "Dinner", values: [5, 6, 6, 7, 8, 8, 7] },
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapColors = ["#fff3e3", "#ffe3bf", "#ffc276", "#ff9f3b", "#ff7c1f", "#e85f0f", "#a9441a", "#8d3413"];

const visitBreakdown = [
  { date: "Oct 28, 2023", visitors: 142, checkIns: 112, repeatVisits: 45, conversionRate: "78.8%", routeTraffic: 32 },
  { date: "Oct 27, 2023", visitors: 128, checkIns: 92, repeatVisits: 38, conversionRate: "71.9%", routeTraffic: 28 },
  { date: "Oct 26, 2023", visitors: 110, checkIns: 84, repeatVisits: 29, conversionRate: "76.3%", routeTraffic: 19 },
  { date: "Oct 25, 2023", visitors: 165, checkIns: 124, repeatVisits: 52, conversionRate: "75.1%", routeTraffic: 41 },
];

const SelectField = ({ value, onChange, options, icon: Icon, className = "" }) => (
  <div className={`relative ${className}`}>
    {Icon ? <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
    <select
      value={value}
      onChange={onChange}
      className={`h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm ${
        Icon ? "pl-11 pr-10" : "px-4 pr-10"
      }`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

const lineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#4450dd]">
        Visitors: {payload[0]?.value}
      </p>
      <p className="text-sm font-semibold text-[#f68b1f]">
        Check-ins: {payload[1]?.value}
      </p>
    </div>
  );
};

const AnalysisPage = () => {
  const [restaurant, setRestaurant] = useState(restaurants[0]);
  const [period, setPeriod] = useState(periods[0]);
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(1);

  const paginatedRows = useMemo(() => visitBreakdown.slice((page - 1) * 4, page * 4), [page]);
  const totalPages = Math.max(1, Math.ceil(visitBreakdown.length / 4));
  const maxTraffic = Math.max(...trafficRows.map((row) => row.value), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
          Restaurant Consumer Analytics
        </h1>

        <div className="flex flex-col gap-3 md:flex-row">
          <SelectField
            value={restaurant}
            onChange={(event) => setRestaurant(event.target.value)}
            options={restaurants}
            icon={Store}
            className="min-w-[240px]"
          />
          <SelectField
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            options={periods}
            icon={CalendarDays}
            className="min-w-[160px]"
          />
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-lg font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[1.02rem] text-slate-500">{item.label}</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-[2rem] font-semibold leading-none tracking-tight text-slate-900">
                {item.value}
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-600">
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_370px]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
              Visitors vs Check-ins
            </h2>

            <div className="flex items-center gap-5 text-[1.02rem] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#4450dd]" />
                Visitors
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#f68b1f]" />
                Check-ins
              </div>
            </div>
          </div>

          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 12, right: 8, left: -26, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#edf2f7" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#8ea0bb", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip content={lineTooltip} />
                <Line type="monotone" dataKey="visitors" stroke="#4450dd" strokeWidth={6} dot={false} />
                <Line type="monotone" dataKey="checkIns" stroke="#f68b1f" strokeWidth={6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
            Visitor Loyalty
          </h2>

          <div className="mt-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loyaltyData}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={84}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                />
                <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-[18px] font-semibold">
                  38%
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  Returning
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {loyaltyLegend.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[1.05rem]">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </div>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
            Peak Visit
            <br />
            Hours
          </h2>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[460px]">
              <div className="ml-[76px] grid grid-cols-7 gap-1 pb-3 text-center text-xs text-slate-400">
                {dayLabels.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="space-y-2">
                {heatmapRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))] items-center gap-1">
                    <span className="text-sm text-slate-400">{row.label}</span>
                    {row.values.map((value, index) => (
                      <span
                        key={`${row.label}-${index}`}
                        className="h-7 rounded-[4px]"
                        style={{ backgroundColor: heatmapColors[value - 1] }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 text-xs text-slate-400">
                <span>Less</span>
                {heatmapColors.slice(0, 4).map((color) => (
                  <span key={color} className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: color }} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
            Route Traffic Performance
          </h2>

          <div className="mt-8 space-y-6">
            {trafficRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between gap-4 text-[1.02rem]">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="text-slate-500">{row.value} visits</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-[#4450dd]"
                    style={{ width: `${(row.value / maxTraffic) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">
            Visit
            <br />
            Breakdown
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchDate}
                onChange={(event) => setSearchDate(event.target.value)}
                placeholder="Search date..."
                className="h-10 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-700"
              />
            </div>
            <button
              type="button"
              className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-[1.02rem] font-medium text-slate-700"
            >
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#687b9b]">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Visitors</th>
                <th className="px-6 py-4">Check-ins</th>
                <th className="px-6 py-4">Repeat Visits</th>
                <th className="px-6 py-4">Conversion Rate</th>
                <th className="px-6 py-4">Route Traffic</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.date} className="border-t border-slate-100">
                  <td className="px-6 py-5 text-[1.05rem] font-medium text-slate-900">{row.date}</td>
                  <td className="px-6 py-5 text-[1.05rem] text-slate-600">{row.visitors}</td>
                  <td className="px-6 py-5 text-[1.05rem] text-slate-600">{row.checkIns}</td>
                  <td className="px-6 py-5 text-[1.05rem] text-slate-600">{row.repeatVisits}</td>
                  <td className="px-6 py-5 text-[1.05rem] text-slate-600">{row.conversionRate}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-md bg-indigo-50 px-3 py-1 text-sm font-semibold text-[#4450dd]">
                      {row.routeTraffic} visits
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[1.02rem] text-slate-500">
            Showing 1 to {paginatedRows.length} of 30 days
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-500 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalysisPage;
