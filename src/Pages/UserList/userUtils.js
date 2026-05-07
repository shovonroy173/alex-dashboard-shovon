export const toAbsoluteAvatarUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (/^(https?:)?\/\//i.test(url) || /^data:|^blob:/i.test(url)) return url;
  if (url.startsWith("/")) {
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
    return base ? `${base}${url}` : url;
  }
  return url;
};

export const getOriginalAvatarUrl = (user) =>
  user?.avatarUrl ||
  user?.avatarURL ||
  user?.avatar ||
  user?.profileImageUrl ||
  user?.profileImage ||
  user?.profile_image ||
  user?.profilePhoto ||
  user?.photoUrl ||
  user?.photo ||
  user?.imageUrl ||
  user?.image ||
  user?.profile?.avatar ||
  user?.profile?.avatarUrl ||
  "";

export const deriveUserStatus = (user) => {
  const raw = String(
    user?.status ??
    user?.accountStatus ??
    (user?.is_blocked || user?.isBlocked
      ? "suspended"
      : user?.is_verified === false || user?.isVerified === false || user?.isActive === false
        ? "inactive"
        : "active")
  ).toLowerCase();

  if (raw.includes("suspend") || raw.includes("block") || raw.includes("ban")) {
    return "Suspended";
  }
  if (raw.includes("inactive")) {
    return "Inactive";
  }
  return "Active";
};

export const normalizeUser = (user, index = 0, startIndex = 0) => {
  const id = user?.id || user?._id || user?.userId || startIndex + index + 1;
  const createdAt = user?.joinedAt || user?.createdAt || user?.joinedDate || null;
  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "N/A";

  const points = Number(
    user?.points ??
      user?.currentPoints ??
      user?.rewardPoints ??
      user?.totalPoints ??
      user?.walletPoints ??
      540 + index * 380
  );
  const checkIns = Number(
    user?.checkIns ?? user?.totalCheckIns ?? user?.checkins ?? user?.visits ?? 5 + index * 7
  );
  const streak = Number(
    user?.streak ?? user?.totalStreakLogins ?? user?.currentStreak ?? Math.max(2, Math.round(checkIns / 4))
  );
  const redeemed = Number(
    user?.redeemed ??
      user?.redeemedRewards ??
      Math.max(1, Math.round(points / 450))
  );
  const status = deriveUserStatus(user);

  return {
    id: String(id),
    userIdLabel: `#${id}`,
    name: user?.name || user?.fullName || user?.fullname || user?.username || "Unknown User",
    email: user?.email || "N/A",
    avatar: toAbsoluteAvatarUrl(getOriginalAvatarUrl(user)),
    joinedDate,
    joinedRaw: createdAt,
    city:
      user?.city ||
      user?.cityName ||
      user?.location?.city ||
      user?.address?.city ||
      user?.profile?.city ||
      "New York, NY",
    status,
    points: Number.isFinite(points) ? points : 0,
    checkIns: Number.isFinite(checkIns) ? checkIns : 0,
    streak: Number.isFinite(streak) ? streak : 0,
    redeemed: Number.isFinite(redeemed) ? redeemed : 0,
    raw: user,
  };
};

export const extractItemsAndTotal = (payload) => {
  const data = payload?.data ?? payload;
  const visited = new Set();

  const findFirstArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return null;
    if (visited.has(value)) return null;
    visited.add(value);

    const priorityKeys = ["users", "items", "rows", "results", "docs", "data", "list"];
    for (const key of priorityKeys) {
      if (Array.isArray(value[key])) return value[key];
    }

    for (const key of Object.keys(value)) {
      const found = findFirstArray(value[key]);
      if (found) return found;
    }

    return null;
  };

  const items = findFirstArray(data) || [];
  const total =
    Number(data?.total) ||
    Number(data?.totalCount) ||
    Number(data?.count) ||
    Number(data?.meta?.total) ||
    Number(data?.pagination?.totalItems) ||
    Number(data?.pagination?.total) ||
    Number(data?.pageInfo?.total) ||
    Number(data?.meta?.count) ||
    items.length;

  return { items, total };
};
