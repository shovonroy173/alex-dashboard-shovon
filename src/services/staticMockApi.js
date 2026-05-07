const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

const toIsoDaysAgo = (days) => new Date(now - days * dayMs).toISOString();
const toIsoDaysFromNow = (days) => new Date(now + days * dayMs).toISOString();

const sampleUsers = Array.from({ length: 24 }, (_, index) => {
  const id = `user-${index + 1}`;
  const blocked = index % 7 === 0;
  return {
    id,
    fullName: `User ${index + 1}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    avatarUrl: `https://i.pravatar.cc/100?img=${(index % 68) + 1}`,
    createdAt: toIsoDaysAgo(40 - index),
    joinedAt: toIsoDaysAgo(40 - index),
    status: blocked ? "blocked" : "active",
    isBlocked: blocked,
    phone: `+1 555 010 ${String(index + 1).padStart(2, "0")}`,
    contactNo: `+1 555 010 ${String(index + 1).padStart(2, "0")}`,
    address: `${100 + index} Main St, Seattle, WA`,
  };
});

const buildAdminRecord = (user, role = "admin") => ({
  id: `admin-${user.id}`,
  uid: `admin-${user.id}`,
  fullName: user.fullName,
  fullname: user.fullName,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  profileImageUrl: user.avatarUrl,
  createdAt: user.createdAt,
  joinedAt: user.joinedAt,
  status: user.isBlocked ? "blocked" : "active",
  isBlocked: user.isBlocked,
  isVerified: true,
  role,
  phone: user.phone,
});

let sampleAdmins = [
  buildAdminRecord(sampleUsers[1], "super_admin"),
  buildAdminRecord(sampleUsers[2], "admin"),
  buildAdminRecord(sampleUsers[3], "admin"),
  buildAdminRecord(sampleUsers[4], "admin"),
];

let notifications = Array.from({ length: 14 }, (_, index) => ({
  id: `notif-${index + 1}`,
  title: `System Notice ${index + 1}`,
  message:
    index % 2 === 0
      ? "New user registration requires review."
      : "Weekly metrics report is now ready.",
  body:
    index % 2 === 0
      ? "New user registration requires review."
      : "Weekly metrics report is now ready.",
  createdAt: toIsoDaysAgo(index),
  isRead: index > 4,
  read: index > 4,
}));

let notificationCampaigns = Array.from({ length: 9 }, (_, index) => ({
  id: `campaign-${index + 1}`,
  campaignTitle: [
    "Weekend Food Promo",
    "Welcome New Explorer",
    "Monthly Leaderboard Reward",
    "Flash Friday Sale",
    "Abandoned Cart Alert",
    "Top Spender Reward",
    "Rainy Day Special",
    "Happy Hour Booster",
    "Holiday Push",
  ][index],
  campaignBody:
    index % 2 === 0
      ? "Visit nearby restaurants and earn double points today."
      : "Unlock a reward and keep the streak going.",
  campaignCategory: ["promotional", "onboarding", "reward", "retention"][index % 4],
  targetAudience: ["global", "all_users", "nearby_users", "new_user", "top_10_users", "inactive_shoppers"][
    index % 6
  ],
  cityName: null,
  ageGroup: null,
  deliveryType: index % 3 === 0 ? "schedule_later" : "send_now",
  scheduledAt: index % 3 === 0 ? toIsoDaysFromNow(index) : null,
  sentAt: index % 3 === 0 ? null : toIsoDaysAgo(index),
  status: ["scheduled", "active", "completed", "draft"][index % 4],
  deliveryRate: 91 + index,
  createdBy: "admin-001",
  createdAt: toIsoDaysAgo(index + 1),
  updatedAt: toIsoDaysAgo(index),
}));

const reports = Array.from({ length: 14 }, (_, index) => {
  const from = sampleUsers[(index + 2) % sampleUsers.length];
  const to = sampleUsers[(index + 9) % sampleUsers.length];
  return {
    id: `report-${index + 1}`,
    reportFrom: {
      id: from.id,
      fullName: from.fullName,
      name: from.name,
    },
    reportTo: {
      id: to.id,
      fullName: to.fullName,
      name: to.name,
      status: index % 3 === 0 ? "blocked" : "active",
    },
    reason: index % 2 === 0 ? "Harassment in chat" : "Inappropriate content",
    status: "open",
    createdAt: toIsoDaysAgo(index + 1),
  };
});

const categories = [
  { id: "cat-1", categoryName: "Sports", isActive: true },
  { id: "cat-2", categoryName: "Music", isActive: true },
  { id: "cat-3", categoryName: "Food", isActive: true },
  { id: "cat-4", categoryName: "Technology", isActive: true },
  { id: "cat-5", categoryName: "Workshops", isActive: true },
  { id: "cat-6", categoryName: "Health", isActive: true },
  { id: "cat-7", categoryName: "Art", isActive: true },
  { id: "cat-8", categoryName: "Gaming", isActive: true },
  { id: "cat-9", categoryName: "Business", isActive: true },
];

const subscriptions = Array.from({ length: 18 }, (_, index) => {
  const user = sampleUsers[index % sampleUsers.length];
  const isYearly = index % 3 === 0;
  const active = index % 4 !== 0;
  return {
    id: `sub-${index + 1}`,
    sId: index + 1,
    user: {
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
    email: user.email,
    plan: isYearly ? "yearly" : "monthly",
    status: active ? "active" : "expired",
    expirationDate: toIsoDaysFromNow(active ? 30 + index : -(index + 1)),
  };
});

let subscriptionFees = {
  subscriptionMonthlyPrice: 29,
  subscriptionYearlyPrice: 299,
};

const earningTransactions = Array.from({ length: 22 }, (_, index) => {
  const user = sampleUsers[index % sampleUsers.length];
  const amount = 49 + index * 3;
  return {
    id: `txn-${index + 1}`,
    transactionId: `TRX-${10000 + index}`,
    payer: {
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      accountNumberMasked: "**** **** **** 5454",
    },
    plan: index % 3 === 0 ? "Annual Pro" : "Monthly Pro",
    amount,
    adminEarning: Number((amount * 0.2).toFixed(2)),
    currency: "USD",
    date: toIsoDaysAgo(index + 1),
  };
});

const eventCreators = Array.from({ length: 15 }, (_, index) => ({
  id: `creator-${index + 1}`,
  creatorId: `creator-${index + 1}`,
  sId: index + 1,
  creatorName: `Creator ${index + 1}`,
  creatorAvatarUrl: `https://i.pravatar.cc/100?img=${(index + 20) % 68}`,
  totalEvents: 3 + (index % 6),
  ticketSold: 120 + index * 14,
  totalEarnings: 3000 + index * 550,
  paymentStatus: index % 2 === 0 ? "pending" : "complete",
}));

const activities = Array.from({ length: 8 }, (_, index) => ({
  id: `activity-${index + 1}`,
  entityType: "activity",
  title: `Morning Fitness Session ${index + 1}`,
  hostName: sampleUsers[index].fullName,
  hostAvatarUrl: sampleUsers[index].avatarUrl,
  status: index % 4 === 0 ? "completed" : "upcoming",
  description: "Community fitness and stretching session.",
  imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=60",
  startAt: toIsoDaysFromNow(index + 1),
  endAt: toIsoDaysFromNow(index + 1.1),
  location: "Central Park",
  participantLimit: 40 + index * 5,
  type: "Fitness",
  createdAt: toIsoDaysAgo(index + 2),
}));

const events = Array.from({ length: 8 }, (_, index) => ({
  id: `event-${index + 1}`,
  entityType: "event",
  title: `City Music Night ${index + 1}`,
  hostName: sampleUsers[index + 4].fullName,
  hostAvatarUrl: sampleUsers[index + 4].avatarUrl,
  status: index % 3 === 0 ? "ongoing" : "upcoming",
  description: "Live band performances and food stalls.",
  imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=60",
  startAt: toIsoDaysFromNow(index + 2),
  endAt: toIsoDaysFromNow(index + 2.2),
  location: "Downtown Arena",
  participantLimit: 300 + index * 25,
  type: "Music",
  createdAt: toIsoDaysAgo(index + 1),
}));

const products = Array.from({ length: 10 }, (_, index) => ({
  id: `product-${index + 1}`,
  name: `Promo Product ${index + 1}`,
  category: ["Protein", "Accessories", "Supplements"][index % 3],
  description: "Marketing banner product for campaign testing.",
  price: 25 + index * 5,
  destinationUrl: "https://example.com/product",
  ctaUrl: "https://example.com/product",
  imageUrl: `https://picsum.photos/seed/ad-${index + 1}/640/360`,
  isActive: index % 2 === 0,
  createdAt: toIsoDaysAgo(index),
}));

const restaurantPackageCatalog = [
  {
    code: "start",
    name: "Start",
    price: 0,
    billingCycle: "monthly",
    description: "Basic presence for restaurants getting started.",
    features: ["Restaurant listing", "Basic QR access"],
    badge: "START",
  },
  {
    code: "active",
    name: "Active",
    price: 39,
    billingCycle: "monthly",
    description: "Adds check-in rewards and stronger visibility.",
    features: ["Check-in rewards", "Priority support"],
    badge: "ACTIVE",
  },
  {
    code: "pro",
    name: "Pro",
    price: 79,
    billingCycle: "monthly",
    description: "Better visibility with featured placement tools.",
    features: ["Featured listing", "Campaign tools"],
    badge: "PRO",
  },
  {
    code: "prime",
    name: "Prime",
    price: 129,
    billingCycle: "monthly",
    description: "Adds proximity alerts and more advanced reach.",
    features: ["Proximity alerts", "Premium analytics"],
    badge: "PRIME",
  },
  {
    code: "dominio",
    name: "Dominio",
    price: 199,
    billingCycle: "annual",
    description: "Full premium package for featured restaurants.",
    features: ["Routes", "Premium analytics", "All premium features"],
    badge: "DOMINIO",
  },
];

const rewardCatalogState = [
  {
    id: "reward-1",
    title: "Free Dessert",
    description: "Claim a free dessert after completing the challenge.",
    pointsRequired: 150,
    quantityAvailable: 10,
    rewardCategory: "food_item",
    foodItemName: "Free Dessert",
    xpPoints: null,
    discountPercentage: null,
    giftCardCode: null,
    termsAndConditions: "Available while stocks last.",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=60",
    isActive: true,
    hasExpiry: false,
    expiresAt: null,
    createdBy: "admin-001",
    createdAt: toIsoDaysAgo(8),
    updatedAt: toIsoDaysAgo(1),
  },
  {
    id: "reward-2",
    title: "120 XP Bonus",
    description: "Instant XP reward for engaged users.",
    pointsRequired: 100,
    quantityAvailable: 25,
    rewardCategory: "xp",
    foodItemName: null,
    xpPoints: 120,
    discountPercentage: null,
    giftCardCode: null,
    termsAndConditions: "XP is added once the reward is redeemed.",
    imageUrl: null,
    isActive: true,
    hasExpiry: false,
    expiresAt: null,
    createdBy: "admin-001",
    createdAt: toIsoDaysAgo(11),
    updatedAt: toIsoDaysAgo(2),
  },
  {
    id: "reward-3",
    title: "10% Discount",
    description: "Use this reward to apply a 10% discount.",
    pointsRequired: 80,
    quantityAvailable: 4,
    rewardCategory: "discount",
    foodItemName: null,
    xpPoints: null,
    discountPercentage: 10,
    giftCardCode: null,
    termsAndConditions: "Valid for one order only.",
    imageUrl: null,
    isActive: true,
    hasExpiry: true,
    expiresAt: toIsoDaysFromNow(15),
    createdBy: "admin-001",
    createdAt: toIsoDaysAgo(4),
    updatedAt: toIsoDaysAgo(1),
  },
];

const challengeState = [
  {
    id: "challenge-1",
    title: "Breakfast Streak",
    description: "Complete check-ins during breakfast hours.",
    rewardPoints: 250,
    rewardId: "reward-1",
    startAt: toIsoDaysAgo(2),
    endAt: toIsoDaysFromNow(5),
    status: "active",
    criteria: [
      { id: "criterion-1", type: "check_in_count", requiredCount: 5 },
      { id: "criterion-2", type: "breakfast_check_ins", requiredCount: 3 },
    ],
    createdBy: "admin-001",
    createdAt: toIsoDaysAgo(10),
    updatedAt: toIsoDaysAgo(1),
  },
  {
    id: "challenge-2",
    title: "Lunch Explorer",
    description: "Check in at lunch spots twice.",
    rewardPoints: 180,
    rewardId: null,
    startAt: toIsoDaysAgo(8),
    endAt: toIsoDaysFromNow(1),
    status: "active",
    criteria: [{ id: "criterion-3", type: "lunch_check_ins", requiredCount: 2 }],
    createdBy: "admin-001",
    createdAt: toIsoDaysAgo(12),
    updatedAt: toIsoDaysAgo(2),
  },
];

const restaurantState = new Map();
const restaurantMenuState = new Map();
const restaurantMenuItemsState = new Map();

const readBodyValue = (body, key) => {
  if (body instanceof FormData) {
    return body.get(key);
  }
  return body?.[key];
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const buildRestaurantRecord = (restaurantId) => {
  const isDominio = String(restaurantId).endsWith("39");
  return {
    id: restaurantId,
    name: "Red Chili",
    address: "Badda",
    city: "Dhaka",
    latitude: 23.780391,
    longitude: 90.425284,
    category: "Fine Dining",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=60",
    qrCode: {
      name: "Red Chili Main Entrance",
      location: {
        latitude: 23.780391,
        longitude: 90.425284,
      },
      token: `qr-rest-${String(restaurantId).slice(0, 12)}`,
    },
    pointsPerCheckIn: 40,
    status: "active",
    createdBy: "admin-001",
    enabledPackages: isDominio ? ["dominio"] : ["active"],
    enabledFeatures: [],
    packageState: {
      currentPackage: isDominio ? "dominio" : "active",
      billingCycle: isDominio ? "annual" : "monthly",
      activatedAt: toIsoDaysAgo(6),
      expiresAt: toIsoDaysFromNow(isDominio ? 360 : 30),
    },
  };
};

const ensureRestaurantState = (restaurantId) => {
  const existing = restaurantState.get(restaurantId);
  if (existing) return existing;

  const record = buildRestaurantRecord(restaurantId);
  restaurantState.set(restaurantId, record);

  const menu = {
    id: `menu-${restaurantId}`,
    restaurantId,
    name: `${record.name} Menu`,
    createdBy: record.createdBy,
    createdAt: toIsoDaysAgo(12),
    updatedAt: toIsoDaysAgo(1),
  };
  restaurantMenuState.set(restaurantId, menu);
  restaurantMenuItemsState.set(restaurantId, [
    {
      id: `menu-item-${restaurantId}-1`,
      menuId: menu.id,
      restaurantId,
      name: "Grilled Chicken Wrap",
      description: "A warm wrap with grilled chicken, lettuce, and garlic sauce.",
      price: 12.99,
      pointsToBuy: 250,
      imageUrl:
        "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?auto=format&fit=crop&w=800&q=60",
      isAvailable: true,
      createdBy: record.createdBy,
      createdAt: toIsoDaysAgo(2),
      updatedAt: toIsoDaysAgo(2),
    },
    {
      id: `menu-item-${restaurantId}-2`,
      menuId: menu.id,
      restaurantId,
      name: "Spicy Beef Burger",
      description: "Beef patty, pickles, cheddar, and signature house sauce.",
      price: 14.99,
      pointsToBuy: 300,
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60",
      isAvailable: true,
      createdBy: record.createdBy,
      createdAt: toIsoDaysAgo(3),
      updatedAt: toIsoDaysAgo(3),
    },
  ]);

  return record;
};

const ensureRestaurantMenu = (restaurantId) => {
  const restaurant = ensureRestaurantState(restaurantId);
  const existing = restaurantMenuState.get(restaurantId);
  if (existing) return existing;

  const menu = {
    id: `menu-${restaurantId}`,
    restaurantId,
    name: `${restaurant.name} Menu`,
    createdBy: restaurant.createdBy,
    createdAt: toIsoDaysAgo(12),
    updatedAt: toIsoDaysAgo(1),
  };
  restaurantMenuState.set(restaurantId, menu);
  return menu;
};

const ensureRestaurantMenuItems = (restaurantId) => {
  ensureRestaurantMenu(restaurantId);
  return restaurantMenuItemsState.get(restaurantId) || [];
};

const aboutContent = {
  "about-us":
    "<h2>About Madbel AI</h2><p>Madbel AI Dashboard is used to manage users, subscriptions, reports, and communications from one place.</p>",
  "privacy-policy":
    "<h2>Privacy Policy</h2><p>Data shown in this environment is dummy content for UI testing only.</p>",
  "terms-and-conditions":
    "<h2>Terms & Conditions</h2><p>Using this test dashboard implies acceptance of non-production sample data behavior.</p>",
};

const threads = [
  {
    _id: "thread-1",
    directPeer: {
      id: "user-7",
      fullName: "Alex Turner",
      role: "event_creator",
      profileImage: "https://i.pravatar.cc/100?img=12",
    },
    unreadCount: 2,
    updatedAt: toIsoDaysAgo(0.2),
    lastMessage: { type: "text", text: "Can you review my payout request?" },
  },
  {
    _id: "thread-2",
    directPeer: {
      id: "user-11",
      fullName: "Sarah Jones",
      role: "user",
      profileImage: "https://i.pravatar.cc/100?img=24",
    },
    unreadCount: 0,
    updatedAt: toIsoDaysAgo(0.5),
    lastMessage: { type: "text", text: "Thanks for resolving the report." },
  },
];

const messagesByThread = {
  "thread-1": [
    {
      _id: "msg-1",
      senderUserId: "user-7",
      type: "text",
      text: "Hi admin, I requested a payout yesterday.",
      createdAt: toIsoDaysAgo(1),
    },
    {
      _id: "msg-2",
      senderUserId: "admin-001",
      type: "text",
      text: "Received. We are checking your account.",
      createdAt: toIsoDaysAgo(0.9),
    },
  ],
  "thread-2": [
    {
      _id: "msg-3",
      senderUserId: "user-11",
      type: "text",
      text: "Thanks for your help.",
      createdAt: toIsoDaysAgo(0.8),
    },
  ],
};

let profile = {
  id: "admin-001",
  name: "Stone Admin",
  fullName: "Stone Admin",
  email: "admin@stoneacademy.test",
  phone: "+1 555 111 2233",
  contactNo: "+1 555 111 2233",
  address: "Seattle, WA",
  role: "admin",
  profilePhoto: "https://i.pravatar.cc/120?img=32",
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const paginate = (items, query = {}) => {
  const page = toPositiveInt(query.page, 1);
  const limit = toPositiveInt(query.limit ?? query.pageSize, 10);
  const start = (page - 1) * limit;
  return {
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
    items: items.slice(start, start + limit),
  };
};

const includesText = (value, keyword) =>
  String(value || "").toLowerCase().includes(String(keyword || "").toLowerCase());

const getPathWithoutQuery = (path) => String(path || "").split("?")[0];

const response = (data, meta) => ({
  success: true,
  message: "Static mode mock response",
  data,
  ...(meta ? { meta } : {}),
});

const findUserById = (id) => sampleUsers.find((item) => String(item.id) === String(id));

const extractId = (path, prefix) => decodeURIComponent(path.slice(prefix.length));

const handleAdmins = (path, method, query = {}) => {
  if (path === "/admin/admins" && method === "GET") {
    const blockedOnly = String(query.blockedOnly || query.blocked_only || "").toLowerCase() === "true";
    const admins = blockedOnly ? sampleAdmins.filter((item) => item.isBlocked) : sampleAdmins;
    return response(admins);
  }

  if (path.startsWith("/admin/admins/")) {
    const id = extractId(path, "/admin/admins/");

    if (id.endsWith("/block")) {
      const adminId = id.replace(/\/block$/, "");
      sampleAdmins = sampleAdmins.map((item) =>
        String(item.id) === String(adminId)
          ? { ...item, isBlocked: true, status: "blocked" }
          : item
      );
      return response(sampleAdmins.find((item) => String(item.id) === String(adminId)) || null);
    }

    if (id.endsWith("/unblock")) {
      const adminId = id.replace(/\/unblock$/, "");
      sampleAdmins = sampleAdmins.map((item) =>
        String(item.id) === String(adminId)
          ? { ...item, isBlocked: false, status: "active" }
          : item
      );
      return response(sampleAdmins.find((item) => String(item.id) === String(adminId)) || null);
    }

    const admin = sampleAdmins.find((item) => String(item.id) === String(id));
    return response(admin || sampleAdmins[0]);
  }

  return null;
};

const handleUsers = (path, method, query = {}) => {
  if (path === "/admin/users" && method === "GET") {
    const keyword = query.search || query.query || query.q || "";
    const filtered = keyword
      ? sampleUsers.filter(
          (user) =>
            includesText(user.fullName, keyword) ||
            includesText(user.email, keyword)
        )
      : sampleUsers;
    const pageData = paginate(filtered, query);
    return response(
      { items: pageData.items, users: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path === "/admin/users/blocked") {
    const blockedUsers = sampleUsers.filter((item) => item.status === "blocked");
    const keyword = query.search || query.query || query.q || "";
    const filtered = keyword
      ? blockedUsers.filter(
          (user) =>
            includesText(user.fullName, keyword) ||
            includesText(user.email, keyword)
        )
      : blockedUsers;
    const pageData = paginate(filtered, query);
    return response(
      { items: pageData.items, users: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path.startsWith("/admin/users/")) {
    const id = extractId(path, "/admin/users/");

    if (id.endsWith("/block") || id.endsWith("/ban")) {
      return response({ ok: true });
    }
    if (id.endsWith("/unblock") || id.endsWith("/unban")) {
      return response({ ok: true });
    }
    if (id.endsWith("/status") || id.endsWith("/notes")) {
      return response({ ok: true });
    }

    const user = findUserById(id);
    return response(user || sampleUsers[0]);
  }

  return null;
};

const handleReports = (path, method, query = {}) => {
  if ((path === "/admin/reports" || path === "/reports/admin") && method === "GET") {
    const pageData = paginate(reports, query);
    return response(
      { reports: pageData.items, items: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (
    path.startsWith("/admin/reports/") ||
    path.startsWith("/reports/admin/")
  ) {
    return response({ ok: true });
  }

  return null;
};

const handleDashboard = (path, query = {}) => {
  if (path === "/admin/dashboard/summary") {
    const range = String(query.range || query.period || "last_7_days").toLowerCase();
    const activityCount =
      range === "last_24_hours" ? 24 : range === "last_30_days" ? 30 : range === "monthly" ? 31 : 7;
    const labelFormatter = (index) => {
      if (range === "last_24_hours") {
        return `${String(index).padStart(2, "0")}:00`;
      }
      if (range === "last_30_days") {
        return `Day ${index + 1}`;
      }
      if (range === "monthly") {
        return String(index + 1);
      }
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index % 7];
    };
    const activity = Array.from({ length: activityCount }, (_, index) => ({
      label: labelFormatter(index),
      checkIns: 90 + index * 7,
      pointsIssued: 60 + index * 5,
    }));
    const topRestaurants = [
      { restaurantId: "rest-1", restaurantName: "Taco Palace", checkIns: 1230, pointsIssued: 6820 },
      { restaurantId: "rest-2", restaurantName: "Burger Town", checkIns: 980, pointsIssued: 5410 },
      { restaurantId: "rest-3", restaurantName: "Pizza Hub", checkIns: 860, pointsIssued: 4990 },
      { restaurantId: "rest-4", restaurantName: "Sushi House", checkIns: 710, pointsIssued: 3860 },
      { restaurantId: "rest-5", restaurantName: "Coffee Spot", checkIns: 650, pointsIssued: 3480 },
    ];
    const topUsers = sampleUsers.slice(0, 5).map((user, index) => ({
      rank: index + 1,
      uid: user.id,
      fullname: user.fullName,
      email: user.email,
      profileImageUrl: user.avatarUrl,
      currentPoints: 12540 - index * 1120,
      totalCheckIns: 80 - index * 7,
    }));

    return response({
      range,
      year: Number(query.year || new Date().getFullYear()),
      month: query.month ? Number(query.month) : null,
      activeUsers: 18,
      dailyCheckIns: 3245,
      pointsIssued: 245300,
      rewardsRedeemed: 890,
      activity,
      topRestaurants,
      topUsers,
    });
  }

  if (path === "/admin/dashboard/overview" || path === "/dashboard/overview") {
    return response({
      totalUsers: sampleUsers.length,
      totalRevenue: 128940,
      usersGrowth: 11.2,
      revenueGrowth: 8.7,
      subscriptionRevenue: 48320,
      eventPlatformFeeRevenue: 80620,
    });
  }

  if (path === "/admin/dashboard/analytics" || path === "/dashboard/analytics") {
    return response({
      monthlyUsers: [
        { month: "Jan", users: 140 },
        { month: "Feb", users: 180 },
        { month: "Mar", users: 210 },
        { month: "Apr", users: 240 },
        { month: "May", users: 275 },
        { month: "Jun", users: 300 },
        { month: "Jul", users: 340 },
        { month: "Aug", users: 380 },
        { month: "Sep", users: 420 },
        { month: "Oct", users: 470 },
        { month: "Nov", users: 520 },
        { month: "Dec", users: 560 },
      ],
    });
  }

  if (path === "/admin/dashboard/recent-users") {
    return response({ items: sampleUsers.slice(0, 5), users: sampleUsers.slice(0, 5) });
  }

  if (path === "/admin/dashboard/notifications/preview") {
    return response({ items: notifications.slice(0, 4) });
  }

  return null;
};

const handleRestaurants = (path, method, body = {}) => {
  if (path === "/admin/restaurants" && method === "GET") {
    const restaurants = Array.from(restaurantState.values());
    if (restaurants.length > 0) {
      return response({ items: restaurants, restaurants, total: restaurants.length });
    }

    const restaurant = ensureRestaurantState("fd28ba21-c666-4a23-baa6-1f0f6bea1d39");
    return response({ items: [restaurant], restaurants: [restaurant], total: 1 });
  }

  if (path.startsWith("/admin/restaurants/")) {
    const id = extractId(path, "/admin/restaurants/");

    if (id.endsWith("/menu")) {
      const restaurantId = id.replace(/\/menu$/, "");
      const menu = ensureRestaurantMenu(restaurantId);
      return response(menu);
    }

    if (id.endsWith("/menu/items")) {
      const restaurantId = id.replace(/\/menu\/items$/, "");
      const menu = ensureRestaurantMenu(restaurantId);
      const items = ensureRestaurantMenuItems(restaurantId);

      if (method === "GET") {
        return response({ items });
      }

      if (method === "POST") {
        const nextItems = restaurantMenuItemsState.get(restaurantId) || [];
        const nextId = `menu-item-${restaurantId}-${nextItems.length + 1}`;
        const nowIso = new Date().toISOString();
        const created = {
          id: nextId,
          menuId: menu.id,
          restaurantId,
          name: String(readBodyValue(body, "name") || "Untitled Item"),
          description: String(readBodyValue(body, "description") || ""),
          price: Number(readBodyValue(body, "price") || 0),
          pointsToBuy: Number(readBodyValue(body, "pointsToBuy") || 0),
          imageUrl: readBodyValue(body, "image")
            ? `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60&sig=${nextItems.length + 1}`
            : null,
          isAvailable: toBoolean(readBodyValue(body, "isAvailable"), true),
          createdBy: "admin-001",
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        restaurantMenuItemsState.set(restaurantId, [...nextItems, created]);
        return response(created);
      }
    }

    if (id.includes("/menu/items/")) {
      const [restaurantId, itemId] = id.split("/menu/items/");
      const items = ensureRestaurantMenuItems(restaurantId);
      const index = items.findIndex((item) => String(item.id) === String(itemId));
      if (index === -1) {
        return response({ message: "Menu item not found" });
      }

      if (method === "PATCH") {
        const existing = items[index];
        const updated = {
          ...existing,
          name: readBodyValue(body, "name") ?? existing.name,
          description: readBodyValue(body, "description") ?? existing.description,
          price:
            readBodyValue(body, "price") !== undefined
              ? Number(readBodyValue(body, "price"))
              : existing.price,
          pointsToBuy:
            readBodyValue(body, "pointsToBuy") !== undefined
              ? Number(readBodyValue(body, "pointsToBuy"))
              : existing.pointsToBuy,
          isAvailable:
            readBodyValue(body, "isAvailable") !== undefined
              ? toBoolean(readBodyValue(body, "isAvailable"), existing.isAvailable)
              : existing.isAvailable,
          imageUrl: readBodyValue(body, "image")
            ? `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60&sig=${index + 1}`
            : readBodyValue(body, "imageUrl") === ""
              ? null
              : readBodyValue(body, "imageUrl") ?? existing.imageUrl,
          updatedAt: new Date().toISOString(),
        };
        const next = [...items];
        next[index] = updated;
        restaurantMenuItemsState.set(restaurantId, next);
        return response(updated);
      }
    }

    const restaurantId = id;
    const restaurant = ensureRestaurantState(restaurantId);
    return response(restaurant);
  }

  return null;
};

const handlePackages = (path, method, body = {}) => {
  if (path === "/admin/packages/catalog" && method === "GET") {
    return response(restaurantPackageCatalog);
  }

  if (
    path.startsWith("/admin/packages/restaurants/") &&
    (path.endsWith("/activate") || path.endsWith("/upgrade"))
  ) {
    const restaurantId = path
      .replace("/admin/packages/restaurants/", "")
      .replace(/\/(activate|upgrade)$/, "");
    const packageCode = String(body?.package || body?.pkgCode || "active").toLowerCase();
    const existing = ensureRestaurantState(restaurantId);
    const updated = {
      ...existing,
      enabledPackages: Array.from(new Set([...(existing.enabledPackages || []), packageCode])),
      packageState: {
        currentPackage: packageCode,
        billingCycle: packageCode === "dominio" ? "annual" : "monthly",
        activatedAt: new Date().toISOString(),
        expiresAt: toIsoDaysFromNow(packageCode === "dominio" ? 360 : 30),
      },
    };
    restaurantState.set(restaurantId, updated);
    return response({ ok: true, restaurant: updated });
  }

  return null;
};

const computeRewardStatus = (reward, nowIso = new Date().toISOString()) => {
  if (!reward.isActive) return "inactive";
  if (reward.hasExpiry && reward.expiresAt && new Date(reward.expiresAt).getTime() <= new Date(nowIso).getTime()) {
    return "expired";
  }
  return "active";
};

const toRewardItem = (reward) => ({
  ...reward,
  status: computeRewardStatus(reward),
});

const handleRewards = (path, method, query = {}, body = {}) => {
  if (path === "/admin/rewards" && method === "GET") {
    const keyword = query.search || query.q || "";
    const statusFilter = query.status || "";
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = String(query.sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";

    let items = rewardCatalogState.map(toRewardItem);
    if (keyword) {
      items = items.filter(
        (reward) =>
          includesText(reward.title, keyword) || includesText(reward.description, keyword)
      );
    }
    if (statusFilter) {
      items = items.filter((reward) => reward.status === statusFilter);
    }

    items.sort((a, b) => {
      let left = a[sortBy];
      let right = b[sortBy];
      if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "expiresAt") {
        left = left ? new Date(left).getTime() : 0;
        right = right ? new Date(right).getTime() : 0;
      }
      if (typeof left === "string") left = left.toLowerCase();
      if (typeof right === "string") right = right.toLowerCase();
      if (left < right) return sortOrder === "asc" ? -1 : 1;
      if (left > right) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const pageData = paginate(items, query);
    return response(
      {
        items: pageData.items,
        total: pageData.total,
        pagination: {
          totalItems: pageData.total,
          page: pageData.page,
          pageSize: pageData.limit,
          totalPages: pageData.totalPages,
        },
      },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path === "/admin/rewards/analytics") {
    const items = rewardCatalogState.map(toRewardItem);
    return response({
      totalRewards: items.length,
      activeRewards: items.filter((item) => item.status === "active").length,
      inactiveRewards: items.filter((item) => item.status === "inactive").length,
      expiredRewards: items.filter((item) => item.status === "expired").length,
      noExpiryRewards: items.filter((item) => !item.hasExpiry).length,
      lowStockRewards: items.filter((item) => item.quantityAvailable > 0 && item.quantityAvailable < 20).length,
      totalQuantityAvailable: items.reduce((sum, item) => sum + Number(item.quantityAvailable || 0), 0),
      averagePointsRequired: items.length
        ? items.reduce((sum, item) => sum + Number(item.pointsRequired || 0), 0) / items.length
        : 0,
    });
  }

  if (path === "/admin/rewards" && method === "POST") {
    const nowIso = new Date().toISOString();
    const record = {
      id: `reward-${rewardCatalogState.length + 1}`,
      title: readBodyValue(body, "title") || "Untitled Reward",
      description: readBodyValue(body, "description") || "",
      pointsRequired: Number(readBodyValue(body, "pointsRequired") || 0),
      quantityAvailable: Number(readBodyValue(body, "quantityAvailable") || 0),
      rewardCategory: readBodyValue(body, "rewardCategory") || "gift_card",
      xpPoints:
        readBodyValue(body, "xpPoints") !== undefined && readBodyValue(body, "xpPoints") !== ""
          ? Number(readBodyValue(body, "xpPoints"))
          : null,
      foodItemName: readBodyValue(body, "foodItemName") || null,
      discountPercentage:
        readBodyValue(body, "discountPercentage") !== undefined && readBodyValue(body, "discountPercentage") !== ""
          ? Number(readBodyValue(body, "discountPercentage"))
          : null,
      giftCardCode: readBodyValue(body, "giftCardCode") || null,
      termsAndConditions: readBodyValue(body, "termsAndConditions") || "",
      imageUrl: readBodyValue(body, "image") ? `https://picsum.photos/seed/reward-${rewardCatalogState.length + 1}/640/360` : null,
      isActive: toBoolean(readBodyValue(body, "isActive"), true),
      hasExpiry: toBoolean(readBodyValue(body, "hasExpiry"), false),
      expiresAt: readBodyValue(body, "expiresAt") || null,
      createdBy: "admin-001",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    rewardCatalogState.unshift(record);
    return response(toRewardItem(record));
  }

  if (path.startsWith("/admin/rewards/")) {
    const id = extractId(path, "/admin/rewards/");
    if (id === "analytics") return null;
    const index = rewardCatalogState.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return response(null);

    if (method === "GET") {
      return response(toRewardItem(rewardCatalogState[index]));
    }

    if (method === "PATCH") {
      const existing = rewardCatalogState[index];
      const updated = {
        ...existing,
        title: readBodyValue(body, "title") ?? existing.title,
        description: readBodyValue(body, "description") ?? existing.description,
        pointsRequired:
          readBodyValue(body, "pointsRequired") !== undefined
            ? Number(readBodyValue(body, "pointsRequired"))
            : existing.pointsRequired,
        quantityAvailable:
          readBodyValue(body, "quantityAvailable") !== undefined
            ? Number(readBodyValue(body, "quantityAvailable"))
            : existing.quantityAvailable,
        rewardCategory: readBodyValue(body, "rewardCategory") ?? existing.rewardCategory,
        xpPoints:
          readBodyValue(body, "xpPoints") !== undefined
            ? Number(readBodyValue(body, "xpPoints"))
            : existing.xpPoints,
        foodItemName:
          readBodyValue(body, "foodItemName") !== undefined
            ? readBodyValue(body, "foodItemName")
            : existing.foodItemName,
        discountPercentage:
          readBodyValue(body, "discountPercentage") !== undefined
            ? Number(readBodyValue(body, "discountPercentage"))
            : existing.discountPercentage,
        giftCardCode:
          readBodyValue(body, "giftCardCode") !== undefined
            ? readBodyValue(body, "giftCardCode")
            : existing.giftCardCode,
        termsAndConditions:
          readBodyValue(body, "termsAndConditions") !== undefined
            ? readBodyValue(body, "termsAndConditions")
            : existing.termsAndConditions,
        imageUrl:
          readBodyValue(body, "image") ? `https://picsum.photos/seed/reward-${index + 1}/640/360` :
          readBodyValue(body, "imageUrl") === ""
            ? null
            : readBodyValue(body, "imageUrl") ?? existing.imageUrl,
        isActive:
          readBodyValue(body, "isActive") !== undefined
            ? toBoolean(readBodyValue(body, "isActive"), existing.isActive)
            : existing.isActive,
        hasExpiry:
          readBodyValue(body, "hasExpiry") !== undefined
            ? toBoolean(readBodyValue(body, "hasExpiry"), existing.hasExpiry)
            : existing.hasExpiry,
        expiresAt:
          readBodyValue(body, "expiresAt") !== undefined
            ? readBodyValue(body, "expiresAt") || null
            : existing.expiresAt,
        updatedAt: new Date().toISOString(),
      };
      rewardCatalogState[index] = updated;
      return response(toRewardItem(updated));
    }

    if (method === "DELETE") {
      rewardCatalogState.splice(index, 1);
      return response({ ok: true });
    }
  }

  return null;
};

const handleChallenges = (path, method, query = {}, body = {}) => {
  if (path === "/admin/challenges" && method === "GET") {
    const keyword = query.search || query.q || "";
    const statusFilter = query.status || "";
    let items = challengeState.map((item) => ({ ...item }));
    if (keyword) {
      items = items.filter(
        (item) => includesText(item.title, keyword) || includesText(item.description, keyword)
      );
    }
    if (statusFilter) {
      items = items.filter((item) => item.status === statusFilter);
    }
    const pageData = paginate(items, query);
    return response(
      {
        items: pageData.items,
        total: pageData.total,
        pagination: {
          totalItems: pageData.total,
          page: pageData.page,
          pageSize: pageData.limit,
          totalPages: pageData.totalPages,
        },
      },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path === "/admin/challenges" && method === "POST") {
    const nowIso = new Date().toISOString();
    const criteria = Array.isArray(body?.criteria) ? body.criteria : [];
    const record = {
      id: `challenge-${challengeState.length + 1}`,
      title: body?.title || "Untitled Challenge",
      description: body?.description || "",
      rewardPoints: Number(body?.rewardPoints || 0),
      rewardId: body?.rewardId || null,
      startAt: body?.startAt || nowIso,
      endAt: body?.endAt || nowIso,
      status: body?.status || "pending",
      criteria: criteria.map((criterion, index) => ({
        id: criterion.id || `criterion-${Date.now()}-${index}`,
        type: criterion.type || "check_in_count",
        requiredCount: Number(criterion.requiredCount || 1),
      })),
      createdBy: "admin-001",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    challengeState.unshift(record);
    return response(record);
  }

  if (path.startsWith("/admin/challenges/")) {
    const id = extractId(path, "/admin/challenges/");
    if (id.endsWith("/analytics")) {
      const challengeId = id.replace(/\/analytics$/, "");
      const challenge = challengeState.find((item) => String(item.id) === String(challengeId));
      return response({
        challengeId,
        challengeTitle: challenge?.title || "Challenge",
        totalParticipants: 12,
        inProgressParticipants: 4,
        completedParticipants: 8,
        completionRate: 66.67,
        averageProgressPercent: 71.25,
        totalRewardPointsAwarded: 2000,
      });
    }

    const index = challengeState.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return response(null);

    if (method === "GET") {
      return response(challengeState[index]);
    }

    if (method === "PATCH") {
      const existing = challengeState[index];
      const updated = {
        ...existing,
        title: body?.title ?? existing.title,
        description: body?.description ?? existing.description,
        rewardPoints: body?.rewardPoints !== undefined ? Number(body.rewardPoints) : existing.rewardPoints,
        rewardId: body?.rewardId !== undefined ? body.rewardId : existing.rewardId,
        startAt: body?.startAt ?? existing.startAt,
        endAt: body?.endAt ?? existing.endAt,
        status: body?.status ?? existing.status,
        criteria: Array.isArray(body?.criteria)
          ? body.criteria.map((criterion, criterionIndex) => ({
              id: criterion.id || existing.criteria?.[criterionIndex]?.id || `criterion-${Date.now()}-${criterionIndex}`,
              type: criterion.type || "check_in_count",
              requiredCount: Number(criterion.requiredCount || 1),
            }))
          : existing.criteria,
        updatedAt: new Date().toISOString(),
      };
      challengeState[index] = updated;
      return response(updated);
    }

    if (method === "DELETE") {
      challengeState.splice(index, 1);
      return response({ ok: true });
    }
  }

  return null;
};

const handleSubscriptions = (path, method, query = {}, body = {}) => {
  if (path === "/admin/subscriptions" && method === "GET") {
    const keyword = query.search || query.q || "";
    const filtered = keyword
      ? subscriptions.filter(
          (item) =>
            includesText(item.user?.name, keyword) ||
            includesText(item.email, keyword)
        )
      : subscriptions;
    const pageData = paginate(filtered, query);
    return response(
      { items: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path === "/admin/subscriptions/fees" && method === "GET") {
    return response(subscriptionFees);
  }
  if (path === "/admin/subscriptions/fees" && (method === "PATCH" || method === "PUT")) {
    subscriptionFees = {
      subscriptionMonthlyPrice:
        Number(body?.subscriptionMonthlyPrice) || subscriptionFees.subscriptionMonthlyPrice,
      subscriptionYearlyPrice:
        Number(body?.subscriptionYearlyPrice) || subscriptionFees.subscriptionYearlyPrice,
    };
    return response(subscriptionFees);
  }
  if (path.startsWith("/admin/subscriptions/")) {
    return response(subscriptions[0]);
  }
  if (path === "/admin/subscriptions/search") {
    return response({ items: subscriptions.slice(0, 8), total: subscriptions.length });
  }

  return null;
};

const handleNotifications = (path, method, query = {}) => {
  if (path === "/admin/notifications/unread-count") {
    const unreadCount = notifications.filter((item) => !item.isRead).length;
    return response({ count: unreadCount });
  }

  if (path === "/admin/notifications" && method === "GET") {
    const pageData = paginate(notifications, query);
    return response(
      {
        items: pageData.items,
        rows: pageData.items,
        notifications: pageData.items,
        total: pageData.total,
      },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path === "/admin/notifications/read-all") {
    notifications = notifications.map((item) => ({ ...item, isRead: true, read: true }));
    return response({ ok: true });
  }

  if (path.startsWith("/admin/notifications/") && path.endsWith("/read")) {
    const id = path.replace("/admin/notifications/", "").replace("/read", "");
    notifications = notifications.map((item) =>
      String(item.id) === String(id) ? { ...item, isRead: true, read: true } : item
    );
    return response({ ok: true });
  }

  if (path === "/admin/notifications/read") {
    return response({ ok: true });
  }

  return null;
};

const handleNotificationCampaigns = (path, method, query = {}, body = {}) => {
  if (path === "/admin/notification-campaigns" && method === "GET") {
    const keyword = query.search || query.q || "";
    const statusFilter = query.status || "";
    let filtered = notificationCampaigns;
    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          includesText(item.campaignTitle, keyword) ||
          includesText(item.campaignBody, keyword)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    const pageData = paginate(filtered, query);
    return response(
      { items: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path === "/admin/notification-campaigns" && method === "POST") {
    const record = {
      id: `campaign-${notificationCampaigns.length + 1}`,
      campaignTitle: body?.campaignTitle || body?.campaignName || body?.title || "Untitled Campaign",
      campaignBody: body?.campaignBody || body?.messagePreview || body?.body || "",
      campaignCategory: body?.campaignCategory || body?.category || "promotional",
      targetAudience: body?.targetAudience || "all_users",
      cityName: body?.cityName || null,
      ageGroup: body?.ageGroup || null,
      deliveryType: body?.deliveryType || "send_now",
      scheduledAt: body?.scheduledAt || null,
      sentAt: body?.deliveryType === "schedule_later" ? null : toIsoDaysAgo(0),
      status: body?.status || (body?.deliveryType === "schedule_later" ? "scheduled" : "active"),
      deliveryRate: Number(body?.deliveryRate) || 96,
      createdBy: "admin-001",
      createdAt: toIsoDaysAgo(0),
      updatedAt: toIsoDaysAgo(0),
    };
    notificationCampaigns = [record, ...notificationCampaigns];
    return response(record);
  }

  if (path.startsWith("/admin/notification-campaigns/") && method === "DELETE") {
    const id = extractId(path, "/admin/notification-campaigns/");
    notificationCampaigns = notificationCampaigns.filter((item) => String(item.id) !== String(id));
    return response({ ok: true });
  }

  if (path.startsWith("/admin/notification-campaigns/") && method === "GET") {
    const id = extractId(path, "/admin/notification-campaigns/");
    const campaign = notificationCampaigns.find((item) => String(item.id) === String(id));
    return response(campaign || notificationCampaigns[0]);
  }

  return null;
};

const handleProfile = (path, method, body) => {
  if (
    (path === "/admin/profile" || path === "/admin/settings/profile") &&
    method === "GET"
  ) {
    return response(profile);
  }

  if (
    (path === "/admin/profile" || path === "/admin/settings/profile") &&
    (method === "PUT" || method === "PATCH")
  ) {
    if (body instanceof FormData) {
      return response({
        ...profile,
        profilePhoto: "https://i.pravatar.cc/120?img=53",
      });
    }
    profile = {
      ...profile,
      ...body,
      name: body?.fullName || body?.name || profile.name,
      fullName: body?.fullName || body?.name || profile.fullName,
      contactNo: body?.contactNo || body?.phone || profile.contactNo,
      phone: body?.phone || body?.contactNo || profile.phone,
    };
    return response(profile);
  }

  if (path === "/admin/settings/security") {
    return response({
      twoFactorEnabled: false,
      lastPasswordChangeAt: toIsoDaysAgo(30),
    });
  }

  return null;
};

const handleEarnings = (path, method, query = {}) => {
  if (
    (path === "/admin/earnings/transactions" || path === "/billing/admin/transactions") &&
    method === "GET"
  ) {
    const pageData = paginate(earningTransactions, query);
    return response(
      { items: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (path.startsWith("/admin/earnings/transactions/") && path.endsWith("/invoice")) {
    const id = path.replace("/admin/earnings/transactions/", "").replace("/invoice", "");
    return response({ invoiceId: `INV-${id.toUpperCase()}` });
  }

  if (path.startsWith("/admin/earnings/transactions/")) {
    const id = path.replace("/admin/earnings/transactions/", "");
    const row = earningTransactions.find((item) => String(item.id) === String(id));
    return response(row || earningTransactions[0]);
  }

  return null;
};

const handleEventCreators = (path, method, query = {}) => {
  if (
    (path === "/admin/event-creators" || path === "/admin/event-creators/premium") &&
    method === "GET"
  ) {
    const pageData = paginate(eventCreators, query);
    return response(
      { items: pageData.items, rows: pageData.items, total: pageData.total },
      {
        page: pageData.page,
        totalPages: pageData.totalPages,
        totalItems: pageData.total,
      }
    );
  }

  if (
    path.startsWith("/admin/event-creators/") ||
    path.startsWith("/admin/event-creators/premium/")
  ) {
    if (path.endsWith("/payout")) {
      return response({ ok: true });
    }

    const id = path
      .replace("/admin/event-creators/premium/", "")
      .replace("/admin/event-creators/", "");
    const base = eventCreators.find((item) => item.creatorId === id) || eventCreators[0];

    return response({
      creator: {
        id: base.creatorId,
        fullName: base.creatorName,
        email: `${base.creatorName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        avatarUrl: base.creatorAvatarUrl,
        status: "active",
      },
      metrics: {
        totalEarnings: base.totalEarnings,
        pendingAmount: base.paymentStatus === "pending" ? 460 : 0,
        totalPaidOut: Math.max(0, base.totalEarnings - 460),
        paymentStatus: base.paymentStatus,
      },
      events: [
        {
          id: `${base.creatorId}-e1`,
          title: "Summer Beats Festival",
          startAt: toIsoDaysAgo(8),
          ticketPrice: 45,
          status: "completed",
          stats: { joinedCount: 240 },
        },
        {
          id: `${base.creatorId}-e2`,
          title: "Weekend Food Carnival",
          startAt: toIsoDaysFromNow(6),
          ticketPrice: 30,
          status: "upcoming",
          stats: { joinedCount: 130 },
        },
      ],
    });
  }

  return null;
};

const handleActivityEvents = (path, method) => {
  if (path === "/admin/activities" && method === "GET") {
    return response(activities);
  }
  if (path === "/admin/events" && method === "GET") {
    return response(events);
  }
  if (
    path.startsWith("/admin/activities/") ||
    path.startsWith("/admin/events/")
  ) {
    return response({ ok: true });
  }
  return null;
};

const handleCategories = (path, method, query = {}, body = {}) => {
  if (path === "/admin/categories" && method === "GET") {
    const pageData = paginate(categories, query);
    return response(pageData.items, {
      page: pageData.page,
      totalPages: pageData.totalPages,
      totalItems: pageData.total,
    });
  }

  if (path === "/admin/categories" && method === "POST") {
    return response({
      id: `cat-${categories.length + 1}`,
      categoryName: body?.categoryName || "New Category",
      isActive: true,
    });
  }

  if (path.startsWith("/admin/categories/")) {
    return response({ ok: true });
  }

  return null;
};

const handleProducts = (path, method, query = {}) => {
  if (
    (path === "/shop/admin/products" || path === "/shop/admin/products/table") &&
    method === "GET"
  ) {
    const keyword = query.q || query.search || "";
    const category = query.category;
    const active = query.active;

    const filtered = products.filter((item) => {
      const keywordOk = keyword
        ? includesText(item.name, keyword) || includesText(item.description, keyword)
        : true;
      const categoryOk = category ? item.category === category : true;
      const activeFlag =
        active === undefined ? undefined : String(active).toLowerCase() === "true";
      const activeOk = activeFlag === undefined ? true : Boolean(item.isActive) === activeFlag;
      return keywordOk && categoryOk && activeOk;
    });

    return response(filtered);
  }

  if (path === "/shop/admin/products" && method === "POST") {
    return response({ ok: true, id: "product-new" });
  }

  if (path.startsWith("/shop/admin/products/")) {
    return response({ ok: true });
  }

  return null;
};

const handleCms = (path, method, body = {}) => {
  if (path === "/cms/about-us" || path === "/cms/pages/about-us") {
    return response({ content: aboutContent["about-us"] });
  }
  if (path === "/cms/privacy-policy" || path === "/cms/pages/privacy-policy") {
    return response({ content: aboutContent["privacy-policy"] });
  }
  if (
    path === "/cms/terms-and-conditions" ||
    path === "/cms/pages/terms-of-service"
  ) {
    return response({ content: aboutContent["terms-and-conditions"] });
  }
  if (path.startsWith("/cms/admin/") && (method === "PUT" || method === "POST")) {
    return response({ content: body?.content || "" });
  }
  return null;
};

const handleChat = (path, method, body = {}) => {
  if (path === "/chat/threads" && method === "GET") {
    return response(threads);
  }

  if (path === "/chat/threads/admin" && method === "POST") {
    return response(threads[0]);
  }

  if (path.startsWith("/chat/threads/") && path.endsWith("/messages") && method === "GET") {
    const id = path.replace("/chat/threads/", "").replace("/messages", "");
    return response({ messages: messagesByThread[id] || [] });
  }

  if (path.startsWith("/chat/threads/") && path.endsWith("/messages") && method === "POST") {
    const id = path.replace("/chat/threads/", "").replace("/messages", "");
    const next = {
      _id: `msg-${Date.now()}`,
      senderUserId: "admin-001",
      type: body?.type || "text",
      text: body?.text || "",
      createdAt: new Date().toISOString(),
    };
    messagesByThread[id] = [...(messagesByThread[id] || []), next];
    return response(next);
  }

  if (path.startsWith("/chat/threads/") && path.endsWith("/seen")) {
    return response({ ok: true });
  }

  return null;
};

const handleAuth = (path, method) => {
  if (
    (path.includes("/logout") && method !== "GET") ||
    path.includes("/password") ||
    path.includes("/security")
  ) {
    return response({ ok: true });
  }
  return null;
};

export const getStaticMockResponse = (path, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const query = options.query || {};
  const body = options.body || {};
  const normalizedPath = getPathWithoutQuery(path);

  const handlers = [
    () => handleAdmins(normalizedPath, method, query),
    () => handleDashboard(normalizedPath, query),
    () => handleRestaurants(normalizedPath, method, query, body),
    () => handlePackages(normalizedPath, method, body),
    () => handleRewards(normalizedPath, method, query, body),
    () => handleChallenges(normalizedPath, method, query, body),
    () => handleUsers(normalizedPath, method, query),
    () => handleReports(normalizedPath, method, query),
    () => handleCategories(normalizedPath, method, query, body),
    () => handleSubscriptions(normalizedPath, method, query, body),
    () => handleNotifications(normalizedPath, method, query),
    () => handleNotificationCampaigns(normalizedPath, method, query, body),
    () => handleProfile(normalizedPath, method, body),
    () => handleEarnings(normalizedPath, method, query),
    () => handleEventCreators(normalizedPath, method, query),
    () => handleActivityEvents(normalizedPath, method),
    () => handleProducts(normalizedPath, method, query),
    () => handleCms(normalizedPath, method, body),
    () => handleChat(normalizedPath, method, body),
    () => handleAuth(normalizedPath, method),
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result) return result;
  }

  return response({
    note: "No specific mock for this endpoint yet.",
    path: normalizedPath,
    method,
  });
};
