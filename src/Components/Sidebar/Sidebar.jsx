import { FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import brandlogo from "../../assets/image/logo.svg";
import {
  ChevronDown,
  ChartColumnIncreasing,
  Award,
  BellRing,
  Sparkles,
  QrCode,
  Route,
  Settings,
  Utensils,
  TriangleAlert,
  UserCog,
  UserX,
  Users,
  Trophy,
} from "lucide-react";
import { clearAdminSession } from "../../utils/auth";

const Sidebar = ({ closeDrawer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRestaurantRoute =
    location.pathname.startsWith("/restaurants") ||
    location.pathname === "/restaurant-request";
  const [restaurantsOpen, setRestaurantsOpen] = useState(isRestaurantRoute);

  useEffect(() => {
    if (isRestaurantRoute) {
      setRestaurantsOpen(true);
    }
  }, [isRestaurantRoute]);

  const topMenuItems = [
    { icon: <MdDashboard className="h-5 w-5" />, label: "Dashboard", Link: "/" },
    { icon: <Users className="h-5 w-5" />, label: "Users", Link: "/user-list" },
    { icon: <UserX className="h-5 w-5" />, label: "Blocked Users", Link: "/blocked-users" },
  ];

  const menuItems = [
    { icon: <QrCode className="h-5 w-5" />, label: "QR Tokens", Link: "/subscriptions" },
    { icon: <Award className="h-5 w-5" />, label: "Rewards", Link: "/earnings" },
    { icon: <Trophy className="h-5 w-5" />, label: "Challenges", Link: "/challenges" },
    { icon: <Sparkles className="h-5 w-5" />, label: "Daily Rewards", Link: "/daily-rewards" },
    {
      icon: <ChartColumnIncreasing className="h-5 w-5" />,
      label: "Analytics",
      Link: "/analysis-page",
    },
    {
      icon: <BellRing className="h-5 w-5" />,
      label: "Push Notifications",
      Link: "/notification-campaign",
    },
    {
      icon: <Route className="h-5 w-5" />,
      label: "Routes",
      Link: "/routes-management",
    },
    { icon: <TriangleAlert className="h-5 w-5" />, label: "Reports", Link: "/reports" },
    { icon: <UserCog className="h-5 w-5" />, label: "Admins", Link: "/admins" },
    { icon: <UserCog className="h-5 w-5" />, label: "Create Admin", Link: "/create-admin" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", Link: "/settings" },
  ];

  const handleLogout = () => {
    clearAdminSession();
    if (closeDrawer) closeDrawer();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="mb-8 flex justify-center">
        <img src={brandlogo} alt="logo" className="h-auto w-[100px]" />
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {topMenuItems.map((item) => {
          const isActive = location.pathname === item.Link;

          return (
            <Link
              key={item.label}
              to={item.Link}
              onClick={closeDrawer}
              className={`mb-2 flex items-center gap-3 rounded-xl px-5 py-4 text-[1.05rem] font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-brand-primary)] text-white shadow-[0_14px_24px_rgba(255,149,0,0.22)]"
                  : "text-slate-900 hover:bg-orange-50 hover:text-[var(--color-brand-primary)]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="mb-2">
          <button
            type="button"
            onClick={() => setRestaurantsOpen((current) => !current)}
            className={`flex items-center  w-[100%] justify-between rounded-xl px-5 py-4 text-[1.05rem] font-medium transition-all ${
              restaurantsOpen
                ? "text-slate-900"
                : "text-slate-900 hover:bg-orange-50 hover:text-[var(--color-brand-primary)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Utensils className="h-5 w-5" />
              <span>Restaurants</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${restaurantsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {restaurantsOpen ? (
            <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4">
              {[
                { label: "Restaurants", path: "/restaurants" },
                { label: "Packages", path: "/restaurants/packages" },
                { label: "Package Flags", path: "/restaurants/package-flags" },
                { label: "Placements", path: "/restaurants/placements" },
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeDrawer}
                    className={`block rounded-xl px-5 py-3 text-[1.02rem] font-medium transition-all ${
                      isActive
                        ? "bg-[var(--color-brand-primary)] text-white shadow-[0_14px_24px_rgba(255,149,0,0.22)]"
                        : "text-slate-800 hover:bg-orange-50 hover:text-[var(--color-brand-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.Link;

          return (
            <Link
              key={item.label}
              to={item.Link}
              onClick={closeDrawer}
              className={`mb-2 flex items-center gap-3 rounded-xl px-5 py-4 text-[1.05rem] font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-brand-primary)] text-white shadow-[0_14px_24px_rgba(255,149,0,0.22)]"
                  : "text-slate-900 hover:bg-orange-50 hover:text-[var(--color-brand-primary)]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 shrink-0 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-5 py-3 text-lg font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <FiLogOut className="text-lg" />
          <p>Logout</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
