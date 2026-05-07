import { useEffect, useMemo, useState } from "react";
import { Ban, ChevronDown, ChevronLeft, ChevronRight, Download, Eye, Pencil, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { listUsersSafe } from "../../services/adminApi";
import { extractItemsAndTotal, normalizeUser } from "./userUtils";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Suspended: "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const UserAvatar = ({ user }) => {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="h-10 w-10 rounded-full object-cover"
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
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
      {initials}
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
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [pointsFilter, setPointsFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const usersPerPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const payload = await listUsersSafe({
          page: currentPage,
          pageSize: usersPerPage,
          search: debouncedSearch || undefined,
        });
        if (!mounted) return;

        const { items, total } = extractItemsAndTotal(payload);
        setUsers(Array.isArray(items) ? items : []);
        setTotalUsers(total);
        setLoadError("");
      } catch {
        if (!mounted) return;
        setUsers([]);
        setTotalUsers(0);
        setLoadError("Unable to load users from the backend. Check the admin session and API response.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, [currentPage, debouncedSearch]);

  const startIndex = (currentPage - 1) * usersPerPage;

  const normalizedUsers = useMemo(
    () => users.map((user, index) => normalizeUser(user, index, startIndex)),
    [users, startIndex]
  );

  const filteredUsers = useMemo(() => {
    return normalizedUsers.filter((user) => {
      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesCity = !cityFilter || user.city === cityFilter;
      const matchesPoints =
        !pointsFilter ||
        (pointsFilter === "0-1000" && user.points <= 1000) ||
        (pointsFilter === "1001-3000" && user.points >= 1001 && user.points <= 3000) ||
        (pointsFilter === "3000+" && user.points > 3000);

      return matchesStatus && matchesCity && matchesPoints;
    });
  }, [cityFilter, normalizedUsers, pointsFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));
  const cities = [...new Set(normalizedUsers.map((user) => user.city).filter(Boolean))];

  const renderPaginationNumbers = () => {
    const pages = [1];

    if (currentPage > 3) pages.push("...");
    for (
      let page = Math.max(2, currentPage - 1);
      page <= Math.min(totalPages - 1, currentPage + 1);
      page += 1
    ) {
      if (!pages.includes(page)) pages.push(page);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
          User Management
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/blocked-users"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100"
          >
            <Ban className="h-4 w-4" />
            Blocked Users
          </Link>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(255,149,0,0.22)]"
          >
            <Download className="h-4 w-4" />
            Export Users
          </button>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 shadow-sm"
            />
          </div>

          <SelectField
            value={statusFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setStatusFilter(event.target.value);
            }}
            options={["Active", "Suspended", "Inactive"]}
            placeholder="Status: All"
          />

          <SelectField
            value={cityFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setCityFilter(event.target.value);
            }}
            options={cities}
            placeholder="City: All"
          />

          <SelectField
            value={pointsFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setPointsFilter(event.target.value);
            }}
            options={["0-1000", "1001-3000", "3000+"]}
            placeholder="Points Range"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        {loadError ? (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-4 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Email</th>
                <th className="px-6 py-5">Points</th>
                <th className="px-6 py-5">Check-ins</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <p className="text-[1.05rem] font-semibold leading-5 text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-400">{user.userIdLabel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-600">{user.email}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[var(--color-brand-secondary)]">
                      {user.points.toLocaleString()} pts
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[1.05rem] text-slate-600">
                    {user.checkIns}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-4 text-slate-400">
                      <Link to={`/users/${user.id}`} className="hover:text-slate-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link to={`/users/${user.id}`} className="hover:text-slate-600">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[1.02rem] text-slate-500">
            Showing {filteredUsers.length ? startIndex + 1 : 0} to{" "}
            {filteredUsers.length ? startIndex + filteredUsers.length : 0} of {totalUsers.toLocaleString()} results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {renderPaginationNumbers().map((page, index) => (
              <button
                key={`${page}-${index}`}
                type="button"
                disabled={page === "..."}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? "bg-[var(--color-brand-secondary)] text-white"
                    : page === "..."
                      ? "cursor-default text-slate-400"
                      : "text-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
