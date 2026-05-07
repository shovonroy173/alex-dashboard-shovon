import { useEffect, useMemo, useState } from "react";
import { APIProvider, AdvancedMarker, Map, Polyline, useMap } from "@vis.gl/react-google-maps";
import { message } from "antd";
import {
  ChevronDown,
  Download,
  LoaderCircle,
  MapPinned,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  createAdminRoute,
  deleteAdminRoute,
  getAdminRoute,
  listAdminRoutes,
  updateAdminRoute,
  searchRouteRestaurantsByCity,
} from "../../services/adminApi";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };
const ROUTE_PAGE_SIZE = 1000;

const commonCities = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Austin, TX",
  "Portland, OR",
  "Denver, CO",
  "Seattle, WA",
];

const statusOptions = [
  { label: "Status: All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Under Review", value: "under_review" },
];

const pointsOptions = [
  { label: "Points Range", value: "all" },
  { label: "0-100", value: "0-100" },
  { label: "101-300", value: "101-300" },
  { label: "301-700", value: "301-700" },
];

const statusBadgeStyles = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
  under_review: "bg-amber-100 text-amber-700",
};

const formatStatusLabel = (status) =>
  String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const normalizeRestaurant = (restaurant) => ({
  ...restaurant,
  latitude: Number(restaurant?.latitude ?? 0),
  longitude: Number(restaurant?.longitude ?? 0),
});

const normalizeRoute = (route) => {
  const restaurants = Array.isArray(route?.restaurants)
    ? route.restaurants.map(normalizeRestaurant)
    : [];

  return {
    ...route,
    id: String(route?.id ?? ""),
    restaurantCount: Number(route?.restaurantCount ?? restaurants.length ?? 0),
    restaurants,
  };
};

const routePayloadFromRecord = (route) => ({
  name: route?.routeName || "",
  description: route?.description || "",
  city: route?.city || "",
  status: route?.status || "draft",
  restaurantIds: Array.isArray(route?.restaurants)
    ? route.restaurants.map((restaurant) => restaurant.id).filter(Boolean)
    : [],
});

const toLatLng = (restaurant) => {
  const latitude = Number(restaurant?.latitude);
  const longitude = Number(restaurant?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { lat: latitude, lng: longitude };
};

const getShortCode = (name) => {
  const normalized = String(name || "").trim();
  if (!normalized) return "?";

  const code = normalized
    .split(/\s+/)
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return code || normalized.slice(0, 2).toUpperCase();
};

const matchesPointRange = (count, range) => {
  if (range === "all") return true;
  if (range === "0-100") return count <= 100;
  if (range === "101-300") return count >= 101 && count <= 300;
  if (range === "301-700") return count >= 301 && count <= 700;
  return true;
};

const SelectField = ({ value, onChange, options, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
    >
      {options.map((option) => {
        const item = typeof option === "string" ? { label: option, value: option } : option;
        return (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        );
      })}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

const RestaurantPickerSection = ({
  city,
  searchTerm,
  setSearchTerm,
  loadingRestaurants,
  availableRestaurants,
  selectedRestaurants,
  setSelectedRestaurants,
}) => {
  const toggleRestaurant = (restaurant) => {
    setSelectedRestaurants((prev) => {
      if (prev.some((item) => item.id === restaurant.id)) {
        return prev.filter((item) => item.id !== restaurant.id);
      }
      return [...prev, restaurant];
    });
  };

  return (
    <div className="pt-2">
      <div className="mb-4 flex items-center gap-2">
        <MapPinned className="h-5 w-5 text-[var(--color-brand-primary)]" />
        <h3 className="text-[1.2rem] font-semibold text-slate-900">Route Stops</h3>
      </div>

      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Selected Stops
          </h4>
          <span className="text-sm text-slate-500">{selectedRestaurants.length} selected</span>
        </div>

        <div className="space-y-3">
          {selectedRestaurants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
              No restaurants selected yet.
            </div>
          ) : null}

          {selectedRestaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_6px_16px_rgba(15,23,42,0.05)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-900">{restaurant.name}</p>
                <p className="truncate text-sm text-slate-500">{restaurant.address}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRestaurant(restaurant)}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          Available Restaurants
        </h4>
        <span className="text-sm text-slate-500">{city ? city : "Choose a city"}</span>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={city ? "Search restaurants by name..." : "Enter a city first"}
          disabled={!city.trim()}
          className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)] disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {!city.trim() ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
          Enter a city to load route-enabled restaurants.
        </div>
      ) : null}

      <div className="space-y-3">
        {loadingRestaurants ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Loading restaurants...
          </div>
        ) : null}

        {!loadingRestaurants && city.trim() && availableRestaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
            No route-enabled restaurants found for this city.
          </div>
        ) : null}

        {availableRestaurants.map((restaurant) => {
          const isSelected = selectedRestaurants.some((item) => item.id === restaurant.id);
          return (
            <button
              type="button"
              key={restaurant.id}
              onClick={() => toggleRestaurant(restaurant)}
              className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-[var(--color-brand-secondary)] bg-indigo-50"
                  : "border-slate-100 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.05)] hover:border-slate-200"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-sm font-semibold text-white">
                {getShortCode(restaurant.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-900">
                  {restaurant.name}
                </p>
                <p className="truncate text-sm text-slate-500">{restaurant.address}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {restaurant.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isSelected
                      ? "bg-[var(--color-brand-secondary)] text-white"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isSelected ? "Added" : "Add"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RouteMapOverlay = ({ restaurants }) => {
  const map = useMap();
  const path = useMemo(
    () => restaurants.map(toLatLng).filter(Boolean),
    [restaurants]
  );

  useEffect(() => {
    if (!map) return;

    if (path.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(11);
      return;
    }

    if (path.length === 1) {
      map.setCenter(path[0]);
      map.setZoom(15);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 72);
  }, [map, path]);

  return (
    <>
      {path.length > 1 ? (
        <Polyline
          path={path}
          strokeColor="#4f46e5"
          strokeOpacity={0.95}
          strokeWeight={5}
          geodesic
        />
      ) : null}

      {restaurants.map((restaurant, index) => {
        const position = toLatLng(restaurant);
        if (!position) return null;

        return (
          <AdvancedMarker
            key={restaurant.id}
            position={position}
            title={restaurant.name}
            collisionBehavior="REQUIRED"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--color-brand-primary)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,149,0,0.3)]">
              {index + 1}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

const RoutePathMap = ({
  restaurants,
  heightClass = "h-[420px]",
  emptyTitle = "No restaurants selected yet",
  emptyDescription = "Choose restaurants to draw the route line on the map.",
}) => {
  const validRestaurants = useMemo(
    () => restaurants.filter((restaurant) => toLatLng(restaurant)),
    [restaurants]
  );

  if (!apiKey) {
    return (
      <div
        className={`${heightClass} flex items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500`}
      >
        Google Maps API key is missing. Add `VITE_GOOGLE_MAPS_API_KEY` to the dashboard env.
      </div>
    );
  }

  return (
    <div className={`${heightClass} relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100`}>
      {validRestaurants.length === 0 ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)] px-6 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--color-brand-primary)] shadow-sm">
              <MapPinned className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">{emptyTitle}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">{emptyDescription}</p>
          </div>
        </div>
      ) : null}

      <APIProvider apiKey={apiKey}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={toLatLng(validRestaurants[0]) || DEFAULT_CENTER}
          defaultZoom={validRestaurants.length > 1 ? 12 : 15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl
        >
          <RouteMapOverlay restaurants={validRestaurants} />
        </Map>
      </APIProvider>
    </div>
  );
};

const RouteMapCard = ({ route }) => {
  const restaurants = route?.restaurants || [];

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Route Map
          </p>
          <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-slate-900">
            {route?.routeName || "Select a route"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {route
              ? `${route.restaurantCount} restaurant${route.restaurantCount === 1 ? "" : "s"} in ${route.city}`
              : "The selected route will appear here with markers and a connecting line."}
          </p>
        </div>
        {route ? (
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusBadgeStyles[route.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {formatStatusLabel(route.status)}
          </span>
        ) : null}
      </div>

      <div className="px-6 py-6">
        <RoutePathMap
          restaurants={restaurants}
          heightClass="h-[430px]"
          emptyTitle="No route selected"
          emptyDescription="Click a route row below to preview the route path on the map."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Stops
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {route?.restaurantCount ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              City
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{route?.city || "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Created
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {formatDate(route?.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RouteDetailsCard = ({ route, onDelete, onEdit }) => {
  if (!route) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <h2 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-slate-900">
          Route Details
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
          Select a route to see the restaurant sequence, metadata, and admin actions.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Route Details
          </p>
          <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-slate-900">
            {route.routeName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{route.description}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            statusBadgeStyles[route.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {formatStatusLabel(route.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">City</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{route.city}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Restaurants
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {route.restaurantCount} stop{route.restaurantCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Created
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">{formatDate(route.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Updated
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">{formatDate(route.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Route Stops</h3>
          <span className="text-sm text-slate-500">{route.restaurantCount} restaurants</span>
        </div>

        <div className="space-y-3">
          {route.restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-primary)] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-base font-semibold text-slate-900">
                    {restaurant.name}
                  </p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {restaurant.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{restaurant.address}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  {Number(restaurant.latitude).toFixed(5)}, {Number(restaurant.longitude).toFixed(5)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onEdit(route)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit Route
        </button>
        <button
          type="button"
          onClick={() => onDelete(route)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete Route
        </button>
      </div>
    </div>
  );
};

const CreateRouteModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    status: "draft",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRestaurants = async () => {
      const city = form.city.trim();
      const query = searchTerm.trim();

      if (!city) {
        setAvailableRestaurants([]);
        setLoadingRestaurants(false);
        return;
      }

      setLoadingRestaurants(true);
      try {
        const payload = await searchRouteRestaurantsByCity({
          city,
          search: query || undefined,
          page: 1,
          pageSize: 12,
        });
        if (!cancelled) {
          setAvailableRestaurants(payload?.data?.items?.map(normalizeRestaurant) || []);
        }
      } catch (error) {
        if (!cancelled) {
          message.error(error?.message || "Failed to load restaurants for this city");
          setAvailableRestaurants([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRestaurants(false);
        }
      }
    };

    const timer = window.setTimeout(loadRestaurants, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.city, searchTerm]);

  const toggleRestaurant = (restaurant) => {
    setSelectedRestaurants((prev) => {
      if (prev.some((item) => item.id === restaurant.id)) {
        return prev.filter((item) => item.id !== restaurant.id);
      }
      return [...prev, restaurant];
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      message.error("Route name is required.");
      return;
    }
    if (!form.description.trim()) {
      message.error("Route description is required.");
      return;
    }
    if (!form.city.trim()) {
      message.error("Route city is required.");
      return;
    }
    if (selectedRestaurants.length === 0) {
      message.error("Pick at least one restaurant for the route.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        name: form.name.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        restaurantIds: selectedRestaurants.map((restaurant) => restaurant.id),
        status: form.status,
      });
      onClose();
    } catch (error) {
      message.error(error?.message || "Failed to create route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[var(--color-brand-primary)]">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[1.85rem] font-semibold tracking-[-0.03em] text-slate-900">
                Create New Route
              </h2>
              <p className="text-sm text-slate-500">
                Pick a city, choose route-enabled restaurants, and preview the connected path.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-6 py-7">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Route Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g. Downtown Taco Trail"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={4}
                  placeholder="Describe the route and the food experience it should offer."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                  <input
                    value={form.city}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, city: event.target.value }));
                      setSelectedRestaurants([]);
                    }}
                    placeholder="e.g. Dhaka or Austin, TX"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                  <SelectField
                    value={form.status}
                    onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                    options={statusOptions.slice(1)}
                  />
                </div>
              </div>

              <RestaurantPickerSection
                city={form.city}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loadingRestaurants={loadingRestaurants}
                availableRestaurants={availableRestaurants}
                selectedRestaurants={selectedRestaurants}
                setSelectedRestaurants={setSelectedRestaurants}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Route Preview</label>
                <RoutePathMap
                  restaurants={selectedRestaurants}
                  heightClass="h-[470px]"
                  emptyTitle="Preview your route"
                  emptyDescription="As you add restaurants, the map will show numbered markers and a connecting line."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Selected
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedRestaurants.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    City
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {form.city.trim() || "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatStatusLabel(form.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border border-slate-300 px-8 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] px-8 text-lg font-semibold text-white shadow-[0_14px_24px_rgba(79,70,229,0.28)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Route"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditRouteModal = ({ route, onClose, onUpdate }) => {
  const [form, setForm] = useState(() => routePayloadFromRecord(route));
  const [searchTerm, setSearchTerm] = useState("");
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState(
    route?.restaurants ? route.restaurants.map(normalizeRestaurant) : []
  );
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(routePayloadFromRecord(route));
    setSelectedRestaurants(route?.restaurants ? route.restaurants.map(normalizeRestaurant) : []);
    setSearchTerm("");
  }, [route]);

  useEffect(() => {
    let cancelled = false;

    const loadRestaurants = async () => {
      const city = form.city.trim();
      const query = searchTerm.trim();

      if (!city) {
        setAvailableRestaurants([]);
        setLoadingRestaurants(false);
        return;
      }

      setLoadingRestaurants(true);
      try {
        const payload = await searchRouteRestaurantsByCity({
          city,
          search: query || undefined,
          page: 1,
          pageSize: 12,
        });
        if (!cancelled) {
          setAvailableRestaurants(payload?.data?.items?.map(normalizeRestaurant) || []);
        }
      } catch (error) {
        if (!cancelled) {
          message.error(error?.message || "Failed to load restaurants for this city");
          setAvailableRestaurants([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRestaurants(false);
        }
      }
    };

    const timer = window.setTimeout(loadRestaurants, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.city, searchTerm]);

  const toggleRestaurant = (restaurant) => {
    setSelectedRestaurants((prev) => {
      if (prev.some((item) => item.id === restaurant.id)) {
        return prev.filter((item) => item.id !== restaurant.id);
      }
      return [...prev, restaurant];
    });
  };

  const handleSubmit = async () => {
    if (!route?.id) return;
    if (!form.name.trim()) {
      message.error("Route name is required.");
      return;
    }
    if (!form.description.trim()) {
      message.error("Route description is required.");
      return;
    }
    if (!form.city.trim()) {
      message.error("Route city is required.");
      return;
    }
    if (selectedRestaurants.length === 0) {
      message.error("Pick at least one restaurant for the route.");
      return;
    }

    setSaving(true);
    try {
      await onUpdate(route.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        restaurantIds: selectedRestaurants.map((restaurant) => restaurant.id),
        status: form.status,
      });
      onClose();
    } catch (error) {
      message.error(error?.message || "Failed to update route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[var(--color-brand-primary)]">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[1.85rem] font-semibold tracking-[-0.03em] text-slate-900">
                Edit Route
              </h2>
              <p className="text-sm text-slate-500">
                Update route metadata, stops, and the path preview.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-6 py-7">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Route Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                  <input
                    value={form.city}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, city: event.target.value }));
                      setSelectedRestaurants([]);
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                  <SelectField
                    value={form.status}
                    onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                    options={statusOptions.slice(1)}
                  />
                </div>
              </div>

              <RestaurantPickerSection
                city={form.city}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loadingRestaurants={loadingRestaurants}
                availableRestaurants={availableRestaurants}
                selectedRestaurants={selectedRestaurants}
                setSelectedRestaurants={setSelectedRestaurants}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Route Preview</label>
                <RoutePathMap
                  restaurants={selectedRestaurants}
                  heightClass="h-[470px]"
                  emptyTitle="Preview your route"
                  emptyDescription="As you add restaurants, the map will show numbered markers and a connecting line."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Selected
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedRestaurants.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    City
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {form.city.trim() || "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatStatusLabel(form.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border border-slate-300 px-8 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] px-8 text-lg font-semibold text-white shadow-[0_14px_24px_rgba(79,70,229,0.28)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoutesManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [pointsRange, setPointsRange] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRouteTarget, setEditRouteTarget] = useState(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const payload = await listAdminRoutes({
        page: 1,
        pageSize: ROUTE_PAGE_SIZE,
        search: query.trim() || undefined,
        city: cityFilter !== "all" ? cityFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      const items = payload?.data?.items?.map(normalizeRoute) || [];
      setRoutes(items);
    } catch (error) {
      message.error(error?.message || "Failed to load routes");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    setPage(1);
  }, [query, statusFilter, cityFilter]);

  useEffect(() => {
    if (routes.length === 0) {
      setSelectedRouteId(null);
      return;
    }

    const selectedExists = routes.some((route) => route.id === selectedRouteId);
    if (!selectedExists) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes, selectedRouteId]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => matchesPointRange(route.restaurantCount, pointsRange));
  }, [pointsRange, routes]);

  const cityOptions = useMemo(() => {
    const values = new Set(commonCities);
    routes.forEach((route) => {
      if (route?.city) values.add(route.city);
    });

    if (cityFilter !== "all" && cityFilter) {
      values.add(cityFilter);
    }

    return [
      { label: "City: All", value: "all" },
      ...Array.from(values)
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right))
        .map((city) => ({ label: city, value: city })),
    ];
  }, [cityFilter, routes]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleRoutes = filteredRoutes.slice((currentPage - 1) * 10, currentPage * 10);

  const selectedRoute =
    visibleRoutes.find((route) => route.id === selectedRouteId) || visibleRoutes[0] || null;

  const handleCreateRoute = async (body) => {
    const payload = await createAdminRoute(body);
    const createdRoute = normalizeRoute(payload?.data || payload);
    message.success("Route created successfully");
    setIsModalOpen(false);
    await fetchRoutes();
    setSelectedRouteId(createdRoute.id);
    setPage(1);
  };

  const handleUpdateRoute = async (routeId, body) => {
    await updateAdminRoute({ id: routeId, body });
    message.success("Route updated successfully");
    await fetchRoutes();
    setSelectedRouteId(routeId);
  };

  const handleOpenEditRoute = async (route) => {
    if (!route?.id) return;
    try {
      const payload = await getAdminRoute({ id: route.id });
      const fullRoute = normalizeRoute(payload?.data || payload);
      setEditRouteTarget(fullRoute);
    } catch (error) {
      message.error(error?.message || "Failed to load route details");
    }
  };

  const handleDeleteRoute = async (route) => {
    if (!route) return;
    const confirmed = window.confirm(`Delete route "${route.routeName}"?`);
    if (!confirmed) return;

    try {
      await deleteAdminRoute({ id: route.id });
      message.success("Route deleted successfully");
      await fetchRoutes();
    } catch (error) {
      message.error(error?.message || "Failed to delete route");
    }
  };

  const routeCountSummary = filteredRoutes.length;
  const startIndex = routeCountSummary === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, routeCountSummary);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[2.1rem] font-medium tracking-[-0.03em] text-slate-900">
            Routes Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create route journeys, pick restaurants, and preview the path on the map.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-brand-primary)] px-6 text-base font-semibold text-white shadow-[0_14px_24px_rgba(255,149,0,0.24)] transition hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Route
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, description, city..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[var(--color-brand-secondary)]"
            />
          </div>
          <SelectField
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusOptions}
          />
          <SelectField
            value={cityFilter}
            onChange={(value) => setCityFilter(value)}
            options={cityOptions}
          />
          <SelectField
            value={pointsRange}
            onChange={(value) => setPointsRange(value)}
            options={pointsOptions}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <RouteMapCard route={selectedRoute} />
        <RouteDetailsCard
          route={selectedRoute}
          onDelete={handleDeleteRoute}
          onEdit={handleOpenEditRoute}
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-slate-900">
            All Routes
          </h2>
          <div className="flex items-center gap-4 text-slate-400">
            <button type="button" className="transition hover:text-slate-700">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button type="button" className="transition hover:text-slate-700">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left">
              <tr className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <th className="px-6 py-5">Route Name</th>
                <th className="px-4 py-5">Stops</th>
                <th className="px-4 py-5">City</th>
                <th className="px-4 py-5">Created Date</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-4 py-5">Restaurants</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && visibleRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No routes found for the current filters.
                  </td>
                </tr>
              ) : null}

              {visibleRoutes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                const stopBadges = route.restaurants.slice(0, 3).map((restaurant) =>
                  getShortCode(restaurant.name)
                );
                const extraStops = Math.max(route.restaurants.length - stopBadges.length, 0);

                return (
                  <tr
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`cursor-pointer border-t border-slate-100 align-middle transition ${
                      isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-cyan-500 to-emerald-300 text-white shadow-sm">
                          <MapPinned className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[1.05rem] font-semibold text-slate-900">
                            {route.routeName}
                          </p>
                          <p className="text-sm text-slate-500">{route.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-wrap gap-1">
                        {stopBadges.map((stop, index) => (
                          <span
                            key={`${route.id}-${index}`}
                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-orange-100 px-2 text-xs font-semibold text-slate-700"
                          >
                            {stop}
                          </span>
                        ))}
                        {extraStops > 0 ? (
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-400">
                            +{extraStops}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[1.02rem] text-slate-600">{route.city}</td>
                    <td className="px-4 py-5 text-[1.02rem] text-slate-600">
                      {formatDate(route.createdAt)}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          statusBadgeStyles[route.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatStatusLabel(route.status)}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[1.02rem] text-slate-600">
                      {route.restaurantCount}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRouteId(route.id);
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenEditRoute(route);
                          }}
                          className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteRoute(route);
                          }}
                          className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {startIndex} to {endIndex} of {routeCountSummary} results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                  currentPage === item
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <CreateRouteModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRoute}
        />
      ) : null}

      {editRouteTarget ? (
        <EditRouteModal
          route={editRouteTarget}
          onClose={() => setEditRouteTarget(null)}
          onUpdate={handleUpdateRoute}
        />
      ) : null}
    </div>
  );
};

export default RoutesManagement;
