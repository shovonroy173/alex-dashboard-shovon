import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  EllipsisVertical,
  MapPinned,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const initialRoutes = [
  {
    id: 1,
    name: "Taco Trail",
    stops: ["T1", "T2", "T3", "+3"],
    city: "Austin, TX",
    createdDate: "Oct 12, 2023",
    status: "Active",
    featured: true,
    tone: "from-sky-400 via-cyan-500 to-emerald-300",
  },
  {
    id: 2,
    name: "Sushi Safari",
    stops: ["S1", "S2", "+2"],
    city: "Portland, OR",
    createdDate: "Nov 05, 2023",
    status: "Active",
    featured: false,
    tone: "from-lime-500 via-emerald-500 to-teal-300",
  },
  {
    id: 3,
    name: "Donut Dash",
    stops: ["D1", "D2", "D3", "D4"],
    city: "Denver, CO",
    createdDate: "Dec 01, 2023",
    status: "Draft",
    featured: false,
    tone: "from-pink-300 via-rose-300 to-orange-200",
  },
  {
    id: 4,
    name: "Noodle Night",
    stops: ["N1", "N2", "+5"],
    city: "Seattle, WA",
    createdDate: "Dec 15, 2023",
    status: "Under Review",
    featured: false,
    tone: "from-slate-800 via-slate-700 to-zinc-500",
  },
  {
    id: 5,
    name: "Noodle Night",
    stops: ["N1", "N2", "+5"],
    city: "Seattle, WA",
    createdDate: "Dec 15, 2023",
    status: "Under Review",
    featured: false,
    tone: "from-slate-800 via-slate-700 to-zinc-500",
  },
  {
    id: 6,
    name: "Noodle Night",
    stops: ["N1", "N2", "+5"],
    city: "Seattle, WA",
    createdDate: "Dec 15, 2023",
    status: "Under Review",
    featured: false,
    tone: "from-slate-800 via-slate-700 to-zinc-500",
  },
];

const cityOptions = ["City: All", "Austin, TX", "Portland, OR", "Denver, CO", "Seattle, WA"];
const statusOptions = ["Status: All", "Active", "Draft", "Under Review"];
const pointsOptions = ["Points Range", "0-100", "101-300", "301-700"];

const cityChoices = ["Select a city", "New York", "Austin", "Portland", "Denver", "Seattle"];

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
  "Under Review": "bg-amber-100 text-amber-700",
};

const stopRestaurants = [
  { id: 1, name: "The Burger Joint", location: "8th Avenue, Midtown" },
  { id: 2, name: "Mama's Pizzeria", location: "Greenwich Village" },
  { id: 3, name: "Sushi Zen", location: "Chelsea Market" },
];

const SelectField = ({ value, onChange, options, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
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

const CreateRouteModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "Select a city",
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6">
      <div className="mx-auto w-full max-w-[980px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[var(--color-brand-primary)]">
              <MapPinned className="h-5 w-5" />
            </div>
            <h2 className="text-[1.85rem] font-semibold tracking-[-0.03em] text-slate-900">
              Create New Route
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-6 py-7">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Route Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g. Downtown Taco Trail"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={4}
                  placeholder="Describe your food discovery journey..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                <SelectField
                  value={form.city}
                  onChange={(value) => setForm((prev) => ({ ...prev, city: value }))}
                  options={cityChoices}
                />
              </div>

              <div className="pt-2">
                <div className="mb-4 flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-[var(--color-brand-primary)]" />
                  <h3 className="text-[1.2rem] font-semibold text-slate-900">Route Stops</h3>
                </div>

                <div className="relative mb-5">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Add a restaurant..."
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                  />
                </div>

                <div className="space-y-3">
                  {stopRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_6px_16px_rgba(15,23,42,0.05)]"
                    >
                      <div className="grid h-8 w-5 shrink-0 grid-cols-2 gap-1 opacity-45">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <span key={index} className="h-1 w-1 rounded-full bg-slate-400" />
                        ))}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-sm font-semibold text-white">
                        {restaurant.id}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{restaurant.name}</p>
                        <p className="text-sm text-slate-500">{restaurant.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Route Preview</label>
              <div className="relative h-[445px] overflow-hidden rounded-[22px] border border-slate-200 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,#eef6ff_0%,#d7ecfb_100%)]">
                <div className="absolute inset-0 opacity-80">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute h-[2px] w-[160%] -rotate-[18deg] bg-white/75"
                      style={{ top: `${index * 68 + 24}px`, left: "-20%" }}
                    />
                  ))}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute h-[160%] w-[2px] rotate-[14deg] bg-white/70"
                      style={{ left: `${index * 72 + 26}px`, top: "-20%" }}
                    />
                  ))}
                </div>

                <div className="absolute right-5 top-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  Satellite
                </div>

                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <path
                    d="M20 28 C 32 30, 36 40, 45 46 S 62 57, 70 68"
                    fill="none"
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    strokeWidth="1.3"
                  />
                </svg>

                {[
                  { label: "1", top: "28%", left: "28%" },
                  { label: "2", top: "49%", left: "47%" },
                  { label: "3", top: "72%", left: "75%" },
                ].map((marker) => (
                  <div
                    key={marker.label}
                    className="absolute"
                    style={{ top: marker.top, left: marker.left }}
                  >
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.28)]">
                      {marker.label}
                      <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-2 rotate-45 bg-[var(--color-brand-primary)]" />
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-4 left-1/2 w-[72%] -translate-x-1/2 text-center text-xs text-slate-500">
                  Total distance: 2.4 miles · Estimated time: 45 minutes
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border border-slate-300 px-8 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => {
              onCreate(form);
              onClose();
            }}
            className="h-12 rounded-xl bg-[var(--color-brand-secondary)] px-8 text-lg font-semibold text-white shadow-[0_14px_24px_rgba(79,70,229,0.28)] transition hover:opacity-90"
          >
            Create Route
          </button>
        </div>
      </div>
    </div>
  );
};

const RoutesManagement = () => {
  const [routes, setRoutes] = useState(initialRoutes);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [cityFilter, setCityFilter] = useState("City: All");
  const [pointsRange, setPointsRange] = useState("Points Range");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesQuery =
        !query ||
        route.name.toLowerCase().includes(query.toLowerCase()) ||
        route.city.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "Status: All" || route.status === statusFilter;
      const matchesCity = cityFilter === "City: All" || route.city === cityFilter;
      const matchesPoints = pointsRange === "Points Range" || true;
      return matchesQuery && matchesStatus && matchesCity && matchesPoints;
    });
  }, [cityFilter, pointsRange, query, routes, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleRoutes = filteredRoutes.slice((currentPage - 1) * 10, currentPage * 10);

  const handleCreateRoute = (form) => {
    setRoutes((prev) => [
      {
        id: Date.now(),
        name: form.name || "New Route",
        stops: ["R1", "R2", "R3"],
        city: form.city === "Select a city" ? "New York" : form.city,
        createdDate: "Today",
        status: "Draft",
        featured: false,
        tone: "from-orange-300 via-amber-300 to-red-200",
      },
      ...prev,
    ]);
    setPage(1);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[2.1rem] font-medium tracking-[-0.03em] text-slate-900">
          Routes Management
        </h1>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-brand-primary)] px-6 text-base font-semibold text-white shadow-[0_14px_24px_rgba(255,149,0,0.24)] transition hover:opacity-90"
        >
          Create Route
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
            />
          </div>
          <SelectField
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={statusOptions}
          />
          <SelectField
            value={cityFilter}
            onChange={(value) => {
              setCityFilter(value);
              setPage(1);
            }}
            options={cityOptions}
          />
          <SelectField value={pointsRange} onChange={setPointsRange} options={pointsOptions} />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-slate-900">All Routes</h2>
          <div className="flex items-center gap-4 text-slate-400">
            <button type="button" className="transition hover:text-slate-700">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button type="button" className="transition hover:text-slate-700">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left">
              <tr className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <th className="px-6 py-5">Route Name</th>
                <th className="px-4 py-5">Stops</th>
                <th className="px-4 py-5">City</th>
                <th className="px-4 py-5">Created Date</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-4 py-5">Featured</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRoutes.map((route) => (
                <tr key={route.id} className="border-t border-slate-100 align-middle">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${route.tone}`} />
                      <p className="text-[1.05rem] font-semibold text-slate-900">{route.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-wrap gap-1">
                      {route.stops.map((stop, index) => (
                        <span
                          key={`${route.id}-${index}`}
                          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                            stop.startsWith("+")
                              ? "bg-slate-100 text-slate-400"
                              : "bg-orange-100 text-slate-700"
                          }`}
                        >
                          {stop}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[1.02rem] text-slate-600">{route.city}</td>
                  <td className="px-4 py-5 text-[1.02rem] text-slate-600">{route.createdDate}</td>
                  <td className="px-4 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                        statusStyles[route.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {route.status}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <button
                      type="button"
                      onClick={() =>
                        setRoutes((prev) =>
                          prev.map((item) =>
                            item.id === route.id ? { ...item, featured: !item.featured } : item
                          )
                        )
                      }
                      className={`relative h-7 w-11 rounded-full transition ${
                        route.featured ? "bg-[var(--color-brand-primary)]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          route.featured ? "left-5" : "left-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button type="button" className="text-slate-400 transition hover:text-slate-700">
                      <EllipsisVertical className="ml-auto h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {visibleRoutes.length === 0 ? 0 : (currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, filteredRoutes.length)} of {filteredRoutes.length} results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                  currentPage === item
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <CreateRouteModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRoute}
        />
      ) : null}
    </div>
  );
};

export default RoutesManagement;
