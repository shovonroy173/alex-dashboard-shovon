import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { getUserById } from "../../services/adminApi";
import { listAdminReports } from "../../services/reportsApi";
import { getOriginalAvatarUrl, toAbsoluteAvatarUrl } from "../UserList/userUtils";

const formatJoinedDate = (value) => {
  if (!value) return "02-24-2024";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "02-24-2024";

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const deriveStatus = (report) => {
  const rawStatus = String(
    report?.status ??
      report?.reportTo?.status ??
      report?.target?.status ??
      report?.user?.status ??
      "active"
  ).toLowerCase();

  if (rawStatus.includes("block") || rawStatus.includes("ban") || rawStatus.includes("suspend")) {
    return "Blocked";
  }

  if (rawStatus.includes("pending") || rawStatus.includes("open")) {
    return "Pending";
  }

  return "Active";
};

const deriveCity = (report, index) =>
  report?.reportTo?.city ||
  report?.target?.city ||
  report?.user?.city ||
  report?.reportTo?.location?.city ||
  report?.target?.location?.city ||
  ["New York", "Chicago", "Austin", "Seattle"][index % 4];

const derivePoints = (report, index) => {
  const raw = Number(
    report?.reportTo?.points ??
      report?.target?.points ??
      report?.user?.points ??
      report?.reportTo?.rewardPoints ??
      report?.target?.rewardPoints ??
      650 + index * 275
  );

  return Number.isFinite(raw) ? raw : 0;
};

const normalizeReport = (report, index, startIndex) => {
  const target =
    report?.reportTo || report?.target || report?.user || report?.reportedUser || report || {};
  const joinedAt =
    target?.joinedAt ||
    target?.createdAt ||
    report?.createdAt ||
    report?.dateTime ||
    report?.date;

  return {
    id: String(report?.id || report?._id || target?.id || target?._id || startIndex + index + 1),
    serial: String(startIndex + index + 1).padStart(2, "0"),
    userId:
      target?.id ||
      target?._id ||
      report?.reportedUserId ||
      report?.reportTo?.id ||
      report?.reportTo?._id ||
      null,
    fullName: target?.fullName || target?.name || report?.reportTo?.name || "Robert Fox",
    email: target?.email || report?.reportTo?.email || "fox@email",
    joinedDate: formatJoinedDate(joinedAt),
    joinedRaw: joinedAt,
    avatar: toAbsoluteAvatarUrl(getOriginalAvatarUrl(target)),
    status: deriveStatus(report),
    city: deriveCity(report, index),
    points: derivePoints(report, index),
    reason: report?.reason || report?.reportReason || "No reason provided",
    reporterName:
      report?.reportFrom?.fullName ||
      report?.reportFrom?.name ||
      report?.reporter?.fullName ||
      report?.reporter?.name ||
      "Unknown reporter",
  };
};

const UserAvatar = ({ row }) => {
  if (row.avatar) {
    return (
      <img
        src={row.avatar}
        alt={row.fullName}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  const initials = row.fullName
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#fb7185] text-xs font-semibold text-white">
      {initials}
    </div>
  );
};

const SelectField = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[15px] text-slate-700 shadow-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [pointsFilter, setPointsFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        const payload = await listAdminReports({ page: currentPage, limit: itemsPerPage });
        if (!mounted) return;

        const data = payload?.data ?? payload;
        const items = Array.isArray(data)
          ? data
          : data?.reports || data?.items || data?.rows || [];
        const total =
          Number(payload?.meta?.totalItems) ||
          Number(data?.total) ||
          Number(data?.meta?.total) ||
          Number(data?.pagination?.total) ||
          items.length;

        setReports(Array.isArray(items) ? items : []);
        setTotalItems(total);
      } catch {
        if (!mounted) return;
        setReports([]);
        setTotalItems(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReports();
    return () => {
      mounted = false;
    };
  }, [currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const normalizedReports = useMemo(
    () => reports.map((report, index) => normalizeReport(report, index, startIndex)),
    [reports, startIndex]
  );

  const filteredReports = useMemo(() => {
    return normalizedReports.filter((report) => {
      const matchesSearch =
        !debouncedSearch ||
        report.fullName.toLowerCase().includes(debouncedSearch) ||
        report.email.toLowerCase().includes(debouncedSearch) ||
        report.reporterName.toLowerCase().includes(debouncedSearch);

      const matchesStatus = !statusFilter || report.status === statusFilter;
      const matchesCity = !cityFilter || report.city === cityFilter;
      const matchesPoints =
        !pointsFilter ||
        (pointsFilter === "0-1000" && report.points <= 1000) ||
        (pointsFilter === "1001-3000" && report.points >= 1001 && report.points <= 3000) ||
        (pointsFilter === "3000+" && report.points > 3000);

      return matchesSearch && matchesStatus && matchesCity && matchesPoints;
    });
  }, [cityFilter, debouncedSearch, normalizedReports, pointsFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const cities = [...new Set(normalizedReports.map((report) => report.city).filter(Boolean))];
  const statuses = [...new Set(normalizedReports.map((report) => report.status).filter(Boolean))];

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

  const openUserModal = async (report) => {
    setSelectedReport(report);
    setSelectedUser(null);
    setIsUserModalOpen(true);

    if (!report.userId) return;

    setIsUserLoading(true);
    try {
      const payload = await getUserById({ id: report.userId });
      const user = payload?.data ?? payload;
      setSelectedUser(user || null);
    } catch {
      setSelectedUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

  const closeModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
    setSelectedReport(null);
    setIsUserLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
          Report Management
        </h1>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-slate-700 shadow-sm"
            />
          </div>

          <SelectField
            value={statusFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setStatusFilter(event.target.value);
            }}
            options={statuses}
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

      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#0f4c6830] text-left text-[15px] font-medium text-[#0f4c68]">
                <th className="px-7 py-5">S.ID</th>
                <th className="px-7 py-5">Full Name</th>
                <th className="px-7 py-5">Email</th>
                <th className="px-7 py-5">Joined Date</th>
                <th className="px-7 py-5 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-7 py-10 text-center text-sm text-slate-500">
                    Loading reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-7 py-10 text-center text-sm text-slate-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-7 py-4 text-[15px] font-medium text-[#0f4c68]">
                      {report.serial}
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar row={report} />
                        <span className="text-[15px] font-medium text-[#0f4c68]">
                          {report.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-4 text-[15px] text-[#0f4c68]">{report.email}</td>
                    <td className="px-7 py-4 text-[15px] text-[#0f4c68]">
                      {report.joinedDate}
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => openUserModal(report)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#0f4c68] hover:bg-slate-100"
                          aria-label={`View ${report.fullName}`}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredReports.length ? startIndex + 1 : 0} to {startIndex + filteredReports.length} of {totalItems.toLocaleString()} results
          </p>

          <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-600">
            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 ${
                currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50"
              }`}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {renderPaginationNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 ${
                    currentPage === page
                      ? "bg-[#4354e0] text-white shadow-[0_10px_20px_rgba(67,84,224,0.22)]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 ${
                currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50"
              }`}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isUserModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Report Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the reported user summary and reason.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {isUserLoading ? (
              <p className="text-sm text-slate-500">Loading user details...</p>
            ) : (
              <div className="space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-900">Full name:</span> {selectedUser?.fullName || selectedReport?.fullName || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Email:</span> {selectedUser?.email || selectedReport?.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Status:</span> {selectedUser?.status || selectedReport?.status || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Joined:</span> {selectedReport?.joinedDate || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">City:</span> {selectedUser?.city || selectedReport?.city || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Points:</span> {selectedUser?.points || selectedReport?.points || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">Report reason</p>
                  <p className="mt-2 leading-6 text-slate-600">
                    {selectedReport?.reason || "No reason provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">Reporter</p>
                  <p className="mt-2 text-slate-600">{selectedReport?.reporterName || "Unknown reporter"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Reports;
