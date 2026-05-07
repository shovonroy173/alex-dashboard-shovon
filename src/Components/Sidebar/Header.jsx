import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Bell, MessageSquareMore, UserRound } from "lucide-react";
import adminImage from "../../assets/image/adminkickclick.jpg";
import {
  getMyProfile,
  getUnreadNotificationCount,
  listAdminNotifications,
  markNotificationRead,
} from "../../services/adminApi";

const Header = ({ showDrawer }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [adminProfile, setAdminProfile] = useState({
    name: "James",
    role: "admin",
    profilePhoto: "",
  });
  const navigate = useNavigate();
  // const location = useLocation();
  // const isMessagesActive = location.pathname === "/messages";

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const payload = await getMyProfile();
        if (!mounted) return;
        const data = payload?.data || payload;
        setAdminProfile((prev) => ({
          ...prev,
          name: data?.name || data?.fullName || prev.name,
          profilePhoto: data?.profilePhoto || "",
        }));
      } catch {
        // Keep current local state.
      }
    };

    const handleProfileUpdated = (event) => {
      const detail = event?.detail || {};
      setAdminProfile((prev) => ({
        ...prev,
        name: detail?.name || prev.name,
        profilePhoto:
          detail?.profilePhoto !== undefined ? detail.profilePhoto : prev.profilePhoto,
      }));
    };

    const loadNotifications = async () => {
      try {
        const [listPayload, unreadPayload] = await Promise.all([
          listAdminNotifications({ page: 1, limit: 4 }),
          getUnreadNotificationCount(),
        ]);
        if (!mounted) return;

        const listData = listPayload?.data || listPayload;
        const items = Array.isArray(listData)
          ? listData
          : listData?.items || listData?.rows || [];
        const mapped = (Array.isArray(items) ? items : []).map((item) => ({
          id: item?.id || item?._id,
          title: item?.title || "Notification",
          message: item?.body || item?.message || item?.title || "Notification",
          time: item?.createdAt ? new Date(item.createdAt).toLocaleString() : "",
          isRead: Boolean(item?.isRead || item?.read),
          targetUrl: item?.targetUrl || item?.target_url || null,
        }));

        const unreadData = unreadPayload?.data || unreadPayload;
        setNotifications(mapped);
        setNotificationsCount(Number(unreadData?.count || 0));
      } catch {
        if (!mounted) return;
        setNotifications([]);
        setNotificationsCount(0);
      }
    };

    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    loadProfile();
    loadNotifications();
    window.addEventListener("admin-profile-updated", handleProfileUpdated);
    window.addEventListener("admin-notifications-updated", handleNotificationsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("admin-profile-updated", handleProfileUpdated);
      window.removeEventListener("admin-notifications-updated", handleNotificationsUpdated);
    };
  }, []);

  const handleNotificationClick = async (item) => {
    if (!item?.id) return;
    try {
      if (!item.isRead) {
        await markNotificationRead({ id: item.id });
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === item.id ? { ...notif, isRead: true } : notif))
        );
        setNotificationsCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
      }
      if (item.targetUrl) {
        window.open(item.targetUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Keep UI as-is if mark-read fails.
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-4">
          <RxHamburgerMenu
            className="cursor-pointer text-3xl text-[#164e63] lg:hidden"
            onClick={showDrawer}
          />
          <div>
            <h2 className="text-[2rem] font-semibold leading-none tracking-tight text-[#164e63]">
              Welcome,{adminProfile.name ? adminProfile.name.split(" ")[0] : "James"}
            </h2>
            <p className="mt-1 text-lg text-slate-600">Have a nice day!</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] transition hover:bg-orange-50"
          >
            <IoMdNotificationsOutline className="text-2xl" />
            {notificationsCount > 0 && (
              <span className="absolute right-2 top-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
            )}
          </button>

          <Link
            to="/settings/profile"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] transition hover:bg-orange-50"
          >
            {adminProfile.profilePhoto ? (
              <img
                src={adminProfile.profilePhoto || adminImage}
                alt="Admin"
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
          </Link>

          {/* <Link
            to="/messages"
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border transition ${
              isMessagesActive
                ? "border-[var(--color-brand-primary)] bg-orange-50 text-[var(--color-brand-primary)]"
                : "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:bg-orange-50"
            }`}
          >
            <MessageSquareMore className="h-5 w-5" />
          </Link> */}
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-0 top-[78px] z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <h2 className="border-b pb-2 text-center text-lg font-semibold text-slate-900">
            Notifications
          </h2>

          <div className="mt-4 space-y-4">
            {notifications.map((item, index) => (
              <button
                key={item.id || index}
                className="flex w-full items-start gap-3 text-left"
                onClick={() => handleNotificationClick(item)}
              >
                <div className={`rounded-xl p-2 ${item.isRead ? "bg-slate-100" : "bg-orange-50"}`}>
                  <Bell
                    className={
                      item.isRead ? "text-slate-700" : "text-[var(--color-brand-primary)]"
                    }
                    size={20}
                  />
                </div>
                <div>
                  <p className={`text-sm font-medium ${item.isRead ? "text-slate-700" : "text-slate-900"}`}>
                    {item.message}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </button>
            ))}
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications found.</p>
            ) : null}
          </div>

          <button
            onClick={() => {
              setShowNotifications(false);
              navigate("/notifications");
            }}
            className="mt-6 w-full rounded-xl bg-[var(--color-brand-primary)] py-2.5 text-white transition duration-200 hover:opacity-90"
          >
            Load More
          </button>
        </div>
      )}
      
    </div>
  );
};

export default Header;
