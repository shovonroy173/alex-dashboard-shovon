import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  downloadQrCodeImage,
  downloadQrCodePdf,
  getQrCodes,
} from "../../services/adminApi";
import { message, Spin } from "antd";

const QrPreview = ({ tokenId }) => {
  const short = tokenId ? tokenId.slice(-2) : "00";
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
      <div className="grid grid-cols-3 gap-[2px] rounded-md bg-white p-2 shadow-sm">
        {Array.from({ length: 9 }, (_, index) => {
          const filled = [0, 1, 3, 5, 7, Number(short) % 9].includes(index);
          return (
            <span
              key={`${tokenId}-${index}`}
              className={`h-1.5 w-1.5 rounded-[2px] ${
                filled ? "bg-slate-700" : "bg-slate-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 8;

const QrTokensAll = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await getQrCodes();
      setTokens(res?.data || []);
    } catch (error) {
      message.error(error?.message || "Failed to load QR tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleDownload = async (restaurantId, kind) => {
    const id = restaurantId || "";
    if (!id) {
      message.error("Restaurant ID is missing for this QR token");
      return;
    }

    try {
      setDownloadingId(`${id}-${kind}`);
      if (kind === "image") {
        await downloadQrCodeImage(id);
      } else {
        await downloadQrCodePdf(id);
      }
      message.success(`QR ${kind} download started`);
    } catch (error) {
      message.error(error?.message || `Failed to download QR ${kind}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredTokens = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tokens;

    return tokens.filter(
      (token) => {
        const id = token.id || token._id || "";
        const restaurantName = token.restaurant?.name || token.restaurantName || "";
        return id.toLowerCase().includes(query) || restaurantName.toLowerCase().includes(query);
      }
    );
  }, [searchTerm, tokens]);

  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visibleTokens = filteredTokens.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
            All QR Tokens
          </h1>
          <p className="mt-1 text-[1.05rem] text-slate-500">
            Search, review, and manage every generated restaurant token.
          </p>
        </div>

        <Link
          to="/subscriptions"
          className="inline-flex h-10 items-center rounded-xl bg-[var(--color-brand-secondary)] px-5 text-sm font-semibold text-white"
        >
          Back to QR Tokens
        </Link>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by token ID or restaurant name..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-[140px_1fr_1.2fr_1.1fr_140px] gap-4 border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          <span>QR Preview</span>
          <span>Restaurant ID</span>
          <span>Restaurant Name</span>
          <span>Raw Token</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-100 min-h-[400px]">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Spin size="large" />
            </div>
          ) : visibleTokens.length > 0 ? (
            visibleTokens.map((token) => (
              <div
                key={token.id || token._id}
                className="grid grid-cols-[140px_1fr_1.2fr_1.1fr_140px] gap-4 px-6 py-4"
              >
                <div className="flex items-center">
                  <QrPreview tokenId={token.id || token._id || "00"} />
                </div>
                <div className="flex items-center text-[1.05rem] text-slate-600 font-mono">
                  {token.restaurantId || token.restaurant?.id || token._id}
                </div>
                <div className="flex items-center">
                  <p className="text-[1.08rem] font-semibold leading-7 text-slate-900">
                    {token.restaurant?.name || token.restaurantName || "Unknown Restaurant"}
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                   <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 break-all truncate w-[160px]">
                      {token.token || token.qrCodeToken || "N/A"}
                   </span>
                </div>
                <div className="flex items-center justify-end gap-3 text-slate-400">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(token.restaurantId || token.restaurant?.id || token._id, "image")
                    }
                    disabled={downloadingId === `${token.restaurantId || token.restaurant?.id || token._id}-image`}
                    title="Download Image"
                    className="rounded bg-slate-50 p-2 transition-colors hover:bg-[var(--color-brand-secondary)] hover:text-white disabled:opacity-60"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(token.restaurantId || token.restaurant?.id || token._id, "pdf")
                    }
                    disabled={downloadingId === `${token.restaurantId || token.restaurant?.id || token._id}-pdf`}
                    title="Export PDF"
                    className="rounded bg-slate-50 p-2 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-60"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-[400px] items-center justify-center text-slate-500">
              {searchTerm ? "No matching tokens found." : "No tokens exist on server."}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[1.02rem] text-slate-500">
            Showing {visibleTokens.length ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
            {Math.min(page * ITEMS_PER_PAGE, filteredTokens.length)} of {filteredTokens.length} tokens
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
            <div className="flex h-9 min-w-[38px] items-center justify-center rounded-lg bg-[var(--color-brand-secondary)] px-3 text-sm font-semibold text-white">
              {page}
            </div>
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
    </div>
  );
};

export default QrTokensAll;
