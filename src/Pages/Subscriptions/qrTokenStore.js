const STORAGE_KEY = "admin-qr-tokens";

export const initialTokens = [
  {
    id: "FD-99238-A",
    restaurant: "Gourmet Bistro Downtown",
    expiresLabel: "Expires in 18h",
    expiresAt: "Oct 24, 2023 - 04:00 PM",
    noExpiration: false,
    createdAt: "2023-10-23T10:00:00.000Z",
  },
  {
    id: "FD-11405-B",
    restaurant: "The Green Leaf Vegan",
    expiresLabel: "No Expiration",
    expiresAt: "",
    noExpiration: true,
    createdAt: "2023-10-22T09:15:00.000Z",
  },
  {
    id: "FD-11405-C",
    restaurant: "The Green Leaf Vegan",
    expiresLabel: "No Expiration",
    expiresAt: "",
    noExpiration: true,
    createdAt: "2023-10-21T12:20:00.000Z",
  },
  {
    id: "FD-11405-D",
    restaurant: "The Green Leaf Vegan",
    expiresLabel: "No Expiration",
    expiresAt: "",
    noExpiration: true,
    createdAt: "2023-10-20T04:30:00.000Z",
  },
  {
    id: "FD-81104-E",
    restaurant: "Taco Palace",
    expiresLabel: "Expires in 2d",
    expiresAt: "Nov 04, 2023 - 11:30 AM",
    noExpiration: false,
    createdAt: "2023-10-19T08:45:00.000Z",
  },
  {
    id: "FD-70112-F",
    restaurant: "Burger Town",
    expiresLabel: "Expires in 5d",
    expiresAt: "Nov 08, 2023 - 06:00 PM",
    noExpiration: false,
    createdAt: "2023-10-18T03:00:00.000Z",
  },
];

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const loadQrTokens = () => {
  if (!canUseStorage()) return initialTokens;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialTokens;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : initialTokens;
  } catch {
    return initialTokens;
  }
};

export const saveQrTokens = (tokens) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Ignore storage write failures.
  }
};

export const createQrToken = ({ restaurant, expiration, noExpiration, total }) => {
  const randomSuffix = String(Math.floor(100 + Math.random() * 899));
  const id = `FD-${randomSuffix}-${String.fromCharCode(65 + (total % 26))}`;

  return {
    id,
    restaurant,
    expiresLabel: noExpiration ? "No Expiration" : "Expires in 24h",
    expiresAt: noExpiration ? "" : expiration || "Oct 24, 2023 - 04:00 PM",
    noExpiration,
    createdAt: new Date().toISOString(),
  };
};
