import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Download, FileText } from "lucide-react";
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

const Subscriptions = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await getQrCodes({ limit: 4 });
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

  const visibleTokens = tokens.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
          QR Token Management
        </h1>
        <p className="mt-2 text-slate-500">
          QR tokens are automatically generated and bound when a restaurant validates an address coordinates.
        </p>
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-900">
            Active Tokens
          </h2>
          <Link
            to="/subscriptions/all"
            className="flex items-center gap-2 text-[1.1rem] font-semibold text-[#35b653]"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-[160px_1fr_1.2fr_180px_140px] gap-4 border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            <span>QR Preview</span>
            <span>Restaurant ID</span>
            <span>Restaurant Name</span>
            <span>Raw Token</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-100 min-h-[300px]">
            {loading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Spin size="large" />
              </div>
            ) : visibleTokens.length > 0 ? (
              visibleTokens.map((token) => (
                <div
                  key={token.id || token._id}
                  className="grid grid-cols-[160px_1fr_1.2fr_180px_140px] gap-4 px-6 py-4"
                >
                  <div className="flex items-center">
                    <QrPreview tokenId={token.id || token._id || "00"} />
                  </div>
                  <div className="flex items-center text-[1.05rem] text-slate-600 font-mono">
                    {token.restaurantId || token.restaurant?.id || token._id}
                  </div>
                  <div className="flex items-center">
                    <p className="max-w-[220px] text-[1.1rem] font-semibold leading-7 text-slate-900">
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
              <div className="flex h-[300px] items-center justify-center text-slate-500">
                No active tokens found.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscriptions;
