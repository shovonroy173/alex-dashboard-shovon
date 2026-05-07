import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

const tabs = ["Trending", "Featured", "Sponsored"];

const placementData = {
  Trending: [
    { id: 1, name: "Taco Palace", subtitle: "Mexican · Downtown", category: "Trending", active: true, accent: "from-yellow-400 to-orange-600" },
    { id: 2, name: "Burger Town", subtitle: "Fast Food · North Side", category: "Trending", active: true, accent: "from-orange-500 to-red-700" },
    { id: 3, name: "Sushi House", subtitle: "Japanese · West End", category: "Trending", active: false, accent: "from-amber-300 to-amber-700" },
  ],
  Featured: [
    { id: 4, name: "Cafe Mosaic", subtitle: "Cafe · River North", category: "Featured", active: true, accent: "from-sky-500 to-indigo-600" },
    { id: 5, name: "Lotus Garden", subtitle: "Asian Fusion · Uptown", category: "Featured", active: false, accent: "from-emerald-500 to-lime-500" },
  ],
  Sponsored: [
    { id: 6, name: "Prime Slice", subtitle: "Pizza · Midtown", category: "Sponsored", active: true, accent: "from-fuchsia-500 to-violet-600" },
    { id: 7, name: "Brunch Yard", subtitle: "Brunch · Harbor", category: "Sponsored", active: true, accent: "from-pink-500 to-rose-500" },
  ],
};

const StatusToggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative h-7 w-11 rounded-full border transition ${
      checked
        ? "border-[var(--color-brand-secondary)] bg-[var(--color-brand-secondary)]"
        : "border-slate-300 bg-slate-200"
    }`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
        checked ? "left-5" : "left-1"
      }`}
    />
  </button>
);

const PlacementAvatar = ({ name, accent }) => (
  <div
    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-lg font-semibold text-white`}
  >
    {name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </div>
);

const RestaurantPlacements = () => {
  const [activeTab, setActiveTab] = useState("Trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [sortBy, setSortBy] = useState("Newest");
  const [rows, setRows] = useState(placementData);

  const currentRows = useMemo(() => {
    const items = rows[activeTab] || [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.subtitle.toLowerCase().includes(normalizedSearch);
      const matchesCity =
        cityFilter === "All Cities" ||
        item.subtitle.toLowerCase().includes(cityFilter.toLowerCase());
      return matchesSearch && matchesCity;
    });
  }, [activeTab, cityFilter, rows, searchTerm]);

  const handleToggle = (rowId) => {
    setRows((current) => ({
      ...current,
      [activeTab]: current[activeTab].map((row) =>
        row.id === rowId ? { ...row, active: !row.active } : row
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
        Premium Placement Management
      </h1>

      <div className="flex flex-wrap gap-8 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative pb-4 text-lg font-semibold uppercase tracking-[0.08em] ${
                isActive ? "text-[var(--color-brand-primary)]" : "text-slate-400"
              }`}
            >
              {tab}
              {isActive ? (
                <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[var(--color-brand-primary)]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search restaurants by name or category..."
              className="h-11 w-full rounded-2xl bg-slate-50 pl-12 pr-4 text-slate-700"
            />
          </div>
          <div className="relative">
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="h-11 appearance-none rounded-2xl bg-slate-50 pl-4 pr-10 text-slate-600"
            >
              <option>All Cities</option>
              <option>Downtown</option>
              <option>North Side</option>
              <option>West End</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 appearance-none rounded-2xl bg-slate-50 pl-4 pr-10 text-slate-600"
            >
              <option>Newest</option>
              <option>Alphabetical</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-5">Restaurant</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <PlacementAvatar name={row.name} accent={row.accent} />
                      <div>
                        <p className="text-[1.1rem] font-semibold text-slate-900">{row.name}</p>
                        <p className="text-sm text-slate-500">{row.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                      {row.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <StatusToggle checked={row.active} onChange={() => handleToggle(row.id)} />
                      <span className="text-lg text-slate-600">
                        {row.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-4 text-slate-400">
                      <button type="button" className="hover:text-slate-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" className="hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 text-slate-500 md:flex-row md:items-center md:justify-between">
          <span className="text-lg">
            Showing 1 to {currentRows.length} of {currentRows.length} restaurants
          </span>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg border border-slate-200 p-2">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-lg border border-slate-200 p-2">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPlacements;
