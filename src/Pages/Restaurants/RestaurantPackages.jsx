import { Check, ChevronRight, Sparkles, X } from "lucide-react";

const packages = [
  {
    name: "Starter Pack",
    badge: "START",
    badgeClass: "bg-slate-100 text-slate-600",
    price: 49,
    cycle: "Monthly",
    expiresOn: "Oct 12, 2024",
    features: [
      { label: "Up to 500 orders/mo", included: true },
      { label: "Basic Analytics", included: true },
      { label: "Multi-location Support", included: false },
    ],
  },
  {
    name: "Professional Plan",
    badge: "ACTIVE",
    badgeClass: "bg-blue-100 text-blue-600",
    price: 129,
    cycle: "Annual",
    expiresOn: "Mar 31, 2024",
    features: [
      { label: "Unlimited orders", included: true },
      { label: "Advanced AI Analytics", included: true },
      { label: "2 Locations Support", included: true },
    ],
  },
  {
    name: "Prime Suite",
    badge: "PRIME",
    badgeClass: "bg-violet-100 text-violet-600",
    price: 299,
    cycle: "Annual",
    expiresOn: "Jun 15, 2025",
    features: [
      { label: "Custom Branding", included: true },
      { label: "Dedicated Account Manager", included: true },
      { label: "Unlimited Locations", included: true },
    ],
  },
  {
    name: "Dominio Master",
    badge: "M3 MINI3",
    badgeClass: "bg-amber-100 text-amber-600",
    price: 599,
    cycle: "Annual",
    expiresOn: "Feb 20, 2026",
    features: [
      { label: "Full White-label Domain", included: true },
      { label: "Global Franchise API", included: true },
      { label: "24/7 Priority Support", included: true },
    ],
  },
  {
    name: "Restaurant Pro",
    badge: "PR3",
    badgeClass: "bg-emerald-100 text-emerald-600",
    price: 89,
    cycle: "Monthly",
    expiresOn: "Nov 18, 2024",
    features: [
      { label: "Up to 2,000 orders/mo", included: true },
      { label: "Inventory Management", included: true },
      { label: "Loyalty Program", included: true },
    ],
  },
];

const RestaurantPackages = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
            Restaurant Package Management
          </h1>
          <p className="mt-1 text-[1.2rem] text-slate-600">
            View and manage subscriptions for each restaurant location.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(255,149,0,0.22)]"
        >
          <Sparkles className="h-4 w-4" />
          Feature Flags
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {packages.map((item) => (
          <div
            key={item.name}
            className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-900">
                {item.name}
              </h2>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.badgeClass}`}>
                {item.badge}
              </span>
            </div>

            <div className="mt-7 flex items-end gap-1">
              <span className="text-[3.6rem] font-semibold tracking-tight text-slate-900">
                ${item.price}
              </span>
              <span className="pb-2 text-[1.4rem] text-slate-500">/mo</span>
            </div>

            <div className="mt-7 space-y-5">
              {item.features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-4 text-[1.15rem]">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-[var(--color-brand-secondary)]" />
                  ) : (
                    <X className="h-5 w-5 text-slate-400" />
                  )}
                  <span className={feature.included ? "text-slate-600" : "text-slate-400"}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between text-[1.1rem]">
                <span className="text-slate-500">Billing Cycle</span>
                <span className="font-medium text-slate-700">{item.cycle}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[1.1rem]">
                <span className="text-slate-500">Expires On</span>
                <span className="font-medium text-slate-700">{item.expiresOn}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-secondary)] text-lg font-semibold text-white"
            >
              Upgrade Package
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantPackages;
