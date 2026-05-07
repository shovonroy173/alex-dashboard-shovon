import { Info } from "lucide-react";
import { useState } from "react";

const columns = ["Start", "Active", "Pro", "Prime", "Dominio"];

const initialFlags = [
  { name: "Basic Listing", values: [true, true, true, true, true] },
  { name: "Check-in Rewards", values: [false, true, true, true, true] },
  { name: "Featured Listing", values: [false, false, true, true, true] },
  { name: "Proximity Alerts", values: [false, false, false, true, true] },
  { name: "Routes", values: [false, false, false, false, true] },
  { name: "Premium Analytics", values: [false, false, false, false, true] },
];

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative h-7 w-11 rounded-full border transition ${
      checked
        ? "border-[var(--color-brand-secondary)] bg-[var(--color-brand-secondary)]"
        : "border-slate-400 bg-slate-200"
    }`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
        checked ? "left-5" : "left-1"
      }`}
    />
  </button>
);

const RestaurantPackageFlags = () => {
  const [flags, setFlags] = useState(initialFlags);

  const toggleFlag = (rowIndex, valueIndex) => {
    setFlags((current) =>
      current.map((row, currentRow) =>
        currentRow === rowIndex
          ? {
              ...row,
              values: row.values.map((value, currentValue) =>
                currentValue === valueIndex ? !value : value
              ),
            }
          : row
      )
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
        Feature Flags Package Management
      </h1>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-5">Feature Name</th>
                {columns.map((column) => (
                  <th key={column} className="px-6 py-5 text-center">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flags.map((flag, rowIndex) => (
                <tr key={flag.name} className="border-t border-slate-100">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[1.05rem] font-semibold text-slate-800">
                        {flag.name}
                      </span>
                      <Info className="h-4 w-4 text-slate-300" />
                    </div>
                  </td>
                  {flag.values.map((value, valueIndex) => (
                    <td key={`${flag.name}-${columns[valueIndex]}`} className="px-6 py-5 text-center">
                      <Toggle
                        checked={value}
                        onChange={() => toggleFlag(rowIndex, valueIndex)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-[1.02rem] text-blue-700 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4" />
          <span>
            Changes made to these flags will take effect immediately for all active subscriptions.
          </span>
        </div>
        <button type="button" className="font-semibold">
          View Changelog →
        </button>
      </div>
    </div>
  );
};

export default RestaurantPackageFlags;
