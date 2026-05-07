import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  ChevronLeft,
  CircleDollarSign,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Sparkles,
  SquarePen,
  UtensilsCrossed,
  CheckCircle2,
} from "lucide-react";
import { message, Spin } from "antd";
import {
  getRestaurantById,
  getPackageCatalog,
  activateRestaurantPackage,
  upgradeRestaurantPackage,
  getRestaurantMenu,
  listRestaurantMenuItems,
  createRestaurantMenuItem,
  updateRestaurantMenuItem,
} from "../../services/adminApi";

const packageRank = {
  start: 0,
  active: 1,
  pro: 2,
  prime: 3,
  dominio: 4,
};

const statusBadge = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  inactive: "bg-slate-100 text-slate-600",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const RestaurantAvatar = ({ name, imageUrl }) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-24 w-24 rounded-2xl object-cover shadow-sm border border-slate-100"
      />
    );
  }
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-semibold text-white shadow-sm">
      {name
        ?.split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
};

const RestaurantView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [packageCatalog, setPackageCatalog] = useState([]);
  const [menu, setMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuEditing, setMenuEditing] = useState(false);
  const [menuEditSaving, setMenuEditSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuImageInputKey, setMenuImageInputKey] = useState(0);
  const [menuEditImageInputKey, setMenuEditImageInputKey] = useState(0);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    pointsToBuy: "",
    isAvailable: true,
  });
  const [menuImage, setMenuImage] = useState(null);
  const [menuEditForm, setMenuEditForm] = useState({
    name: "",
    description: "",
    price: "",
    pointsToBuy: "",
    isAvailable: true,
    imageUrl: "",
  });
  const [menuEditImage, setMenuEditImage] = useState(null);
  const [menuEditImagePreview, setMenuEditImagePreview] = useState("");

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      const [restaurantRes, catalogRes] = await Promise.all([
        getRestaurantById(id),
        getPackageCatalog(),
      ]);
      setRestaurant(restaurantRes?.data);
      setPackageCatalog(catalogRes?.data || []);
    } catch (error) {
      message.error(error?.message || "Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMenu = useCallback(async () => {
    try {
      setMenuLoading(true);
      const [menuRes, itemsRes] = await Promise.all([
        getRestaurantMenu(id),
        listRestaurantMenuItems(id),
      ]);
      setMenu(menuRes?.data || null);
      setMenuItems(itemsRes?.data?.items || []);
    } catch (error) {
      message.error(error?.message || "Failed to load restaurant menu");
      setMenu(null);
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, [fetchRestaurant, fetchMenu]);

  useEffect(() => {
    if (!menuEditImage) {
      setMenuEditImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(menuEditImage);
    setMenuEditImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [menuEditImage]);

  const currentPackage = restaurant?.packageState?.currentPackage || restaurant?.enabledPackages?.[0] || null;
  const isUpgradeFlow = Boolean(currentPackage);
  const currentPackageRank = currentPackage ? packageRank[String(currentPackage).toLowerCase()] ?? -1 : -1;
  const eligiblePackages = packageCatalog.filter((pkg) => {
    const pkgRank = packageRank[String(pkg.code).toLowerCase()] ?? -1;
    return !isUpgradeFlow || pkgRank > currentPackageRank;
  });

  useEffect(() => {
    if (!showPackageModal) return;
    if (eligiblePackages.length === 0) {
      setSelectedPackage("");
      return;
    }
    if (!selectedPackage || !eligiblePackages.some((pkg) => pkg.code === selectedPackage)) {
      setSelectedPackage(eligiblePackages[0].code);
    }
  }, [showPackageModal, eligiblePackages, selectedPackage]);

  const handlePackageAction = async () => {
    try {
      setActionLoading(true);
      if (isUpgradeFlow) {
        await upgradeRestaurantPackage(id, selectedPackage);
        message.success("Package upgraded successfully");
      } else {
        await activateRestaurantPackage(id, selectedPackage);
        message.success("Package activated successfully");
      }
      setShowPackageModal(false);
      fetchRestaurant();
    } catch (error) {
      const errorMsg = error?.message && typeof error.message === 'string' 
        ? error.message 
        : error?.message?.message || "Failed to activate package";
      message.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: "",
      pointsToBuy: "",
      isAvailable: true,
    });
    setMenuImage(null);
    setMenuImageInputKey((current) => current + 1);
  };

  const openMenuEdit = (item) => {
    setEditingItem(item);
    setMenuEditForm({
      name: item.name || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      pointsToBuy: String(item.pointsToBuy ?? ""),
      isAvailable: Boolean(item.isAvailable),
      imageUrl: item.imageUrl || "",
    });
    setMenuEditImage(null);
    setMenuEditImageInputKey((current) => current + 1);
    setMenuEditing(true);
  };

  const closeMenuEdit = () => {
    setMenuEditing(false);
    setEditingItem(null);
    setMenuEditForm({
      name: "",
      description: "",
      price: "",
      pointsToBuy: "",
      isAvailable: true,
      imageUrl: "",
    });
    setMenuEditImage(null);
    setMenuEditImageInputKey((current) => current + 1);
  };

  const handleMenuSubmit = async (event) => {
    event.preventDefault();

    const name = menuForm.name.trim();
    const description = menuForm.description.trim();
    const price = Number(menuForm.price);
    const pointsToBuy = Number(menuForm.pointsToBuy);

    if (!name || !description || !Number.isFinite(price) || price < 0) {
      message.error("Please complete the menu item details.");
      return;
    }

    if (!Number.isFinite(pointsToBuy) || pointsToBuy < 0) {
      message.error("Please enter a valid reward point value.");
      return;
    }

    try {
      setMenuSaving(true);
      await createRestaurantMenuItem(id, {
        name,
        description,
        price,
        pointsToBuy,
        isAvailable: menuForm.isAvailable,
        image: menuImage,
      });
      message.success("Menu item added successfully");
      resetMenuForm();
      await fetchMenu();
    } catch (error) {
      message.error(error?.message || "Failed to add menu item");
    } finally {
      setMenuSaving(false);
    }
  };

  const handleMenuEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    const name = menuEditForm.name.trim();
    const description = menuEditForm.description.trim();
    const price = Number(menuEditForm.price);
    const pointsToBuy = Number(menuEditForm.pointsToBuy);

    if (!name || !description || !Number.isFinite(price) || price < 0) {
      message.error("Please complete the menu item details.");
      return;
    }

    if (!Number.isFinite(pointsToBuy) || pointsToBuy < 0) {
      message.error("Please enter a valid reward point value.");
      return;
    }

    try {
      setMenuEditSaving(true);
      await updateRestaurantMenuItem(id, editingItem.id, {
        name,
        description,
        price,
        pointsToBuy,
        isAvailable: menuEditForm.isAvailable,
        imageUrl: menuEditImage ? undefined : menuEditForm.imageUrl || undefined,
        image: menuEditImage,
      });
      message.success("Menu item updated successfully");
      closeMenuEdit();
      await fetchMenu();
    } catch (error) {
      message.error(error?.message || "Failed to update menu item");
    } finally {
      setMenuEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-xl">Restaurant not found.</p>
        <button
          onClick={() => navigate("/restaurants")}
          className="mt-4 text-[var(--color-brand-primary)] hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => navigate("/restaurants")}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Restaurants
      </button>

      {/* Header Profile Card */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] relative">
        <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200" />
        <div className="px-8 pb-8">
          <div className="-mt-12 flex items-end justify-between">
            <div className="flex items-end gap-6">
              <RestaurantAvatar name={restaurant.name} imageUrl={restaurant.imageUrl} />
              <div className="pb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {restaurant.name}
                  </h1>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusBadge[restaurant.status] || statusBadge.inactive}`}>
                    {restaurant.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin className="h-4 w-4" />
                  {restaurant.address}{restaurant.city && `, ${restaurant.city}`}
                </div>
              </div>
            </div>
            
            <div className="pb-2 flex gap-3">
               <div className="text-right">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Category</div>
                  <div className="text-lg font-semibold text-slate-800">{restaurant.category}</div>
               </div>
               <div className="w-px bg-slate-200 mx-2"></div>
              <div className="text-right">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Check-in Points</div>
                  <div className="text-lg font-bold text-[var(--color-brand-primary)]">{restaurant.pointsPerCheckIn} pts</div>
               </div>
                <div className="text-right">
                   <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Package</div>
                   <div className="text-lg font-semibold text-slate-800">
                     {currentPackage ? String(currentPackage).toUpperCase() : "Not Activated"}
                   </div>
                </div>
                <div className="w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center">
                  <button
                    onClick={() => navigate(`/restaurants/${id}/edit`)}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Details
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Packages Section */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Package Management
            </h2>
            <button
              onClick={() => setShowPackageModal(true)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-slate-200 transition-colors"
            >
              {currentPackage ? "Upgrade Package" : "Activate Package"}
            </button>
          </div>
          
          <div className="pt-6">
            {currentPackage ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                <p className="text-lg font-bold uppercase tracking-wide text-slate-800">
                      {String(currentPackage).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {restaurant.packageState?.billingCycle
                        ? `${restaurant.packageState.billingCycle} billing`
                        : "Active package state"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <p>No active packages assigned.</p>
                <p className="text-sm mt-1">Activate a package to enable features for this restaurant.</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
           <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 pb-6 border-b border-slate-100">
              <QrCode className="h-5 w-5 text-slate-600" />
              QR Check-in Identity
            </h2>
            <div className="pt-6 space-y-5">
               <div>
                  <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Token Name</div>
                  <div className="text-lg font-medium text-slate-800">{restaurant.qrCode?.name || "N/A"}</div>
               </div>
               <div>
                  <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">QR Location</div>
                  <div className="font-mono text-sm bg-slate-100 px-3 py-2 rounded-lg text-slate-600 inline-block">
                     {restaurant.qrCode?.location?.latitude}° N, {restaurant.qrCode?.location?.longitude}° W
                  </div>
               </div>
               <div>
                  <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Raw Token</div>
                  <div className="font-mono text-md bg-slate-800 text-green-400 px-3 py-2 rounded-lg break-all">
                     {restaurant.qrCode?.token || "N/A"}
                  </div>
               </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <UtensilsCrossed className="h-5 w-5 text-[var(--color-brand-primary)]" />
              Restaurant Menu
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {menu?.name || `${restaurant.name} Menu`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {menuItems.length} item{menuItems.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={fetchMenu}
              disabled={menuLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            >
              <SquarePen className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            onSubmit={handleMenuSubmit}
            className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Add Menu Item</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new dish or reward item for this restaurant.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                New
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Item name</span>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(event) =>
                      setMenuForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="e.g. Grilled Chicken Wrap"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Price</span>
                  <div className="relative">
                    <CircleDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={menuForm.price}
                      onChange={(event) =>
                        setMenuForm((current) => ({ ...current, price: event.target.value }))
                      }
                      placeholder="12.99"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                <textarea
                  rows={4}
                  value={menuForm.description}
                  onChange={(event) =>
                    setMenuForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Describe the item, ingredients, or redemption details."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Reward points</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={menuForm.pointsToBuy}
                    onChange={(event) =>
                      setMenuForm((current) => ({ ...current, pointsToBuy: event.target.value }))
                    }
                    placeholder="250"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Image</span>
                  <div className="relative">
                    <ImagePlus className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      key={menuImageInputKey}
                      type="file"
                      accept="image/*"
                      onChange={(event) => setMenuImage(event.target.files?.[0] || null)}
                      className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-600 shadow-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                <input
                  type="checkbox"
                  checked={menuForm.isAvailable}
                  onChange={(event) =>
                    setMenuForm((current) => ({ ...current, isAvailable: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                />
                Available on menu
              </label>

              <button
                type="submit"
                disabled={menuSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,149,0,0.24)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {menuSaving ? "Saving..." : "Add Menu Item"}
              </button>
            </div>
          </form>

          <div className="rounded-[24px] border border-slate-100 bg-slate-50/60 p-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Current Items</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Menu items visible to admins and restaurant staff.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-500 shadow-sm">
                {menuItems.length}
              </span>
            </div>

            {menuLoading ? (
              <div className="flex min-h-[260px] items-center justify-center">
                <Spin />
              </div>
            ) : menuItems.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white px-6 text-center text-slate-500">
                <BadgeCheck className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-base font-medium text-slate-700">No menu items yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Add the first item using the form on the left.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {menuItems.map((item) => {
                  const isAvailable = Boolean(item.isAvailable);
                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"
                    >
                      <div className="relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-52 w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#fed7aa_45%,_#f97316_100%)]">
                            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/75 text-4xl font-semibold text-orange-700 shadow-[0_10px_25px_rgba(249,115,22,0.18)] backdrop-blur">
                              {item.name?.slice(0, 1)?.toUpperCase() || "M"}
                            </div>
                          </div>
                        )}

                        <div className="absolute left-4 top-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                              isAvailable
                                ? "bg-emerald-500/90 text-white"
                                : "bg-slate-800/80 text-slate-100"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isAvailable ? "bg-white" : "bg-slate-300"
                              }`}
                            />
                            {isAvailable ? "Available" : "Hidden"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openMenuEdit(item)}
                          className="absolute right-4 top-4 inline-flex h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.12)] backdrop-blur transition hover:bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                      </div>

                      <div className="p-5">
                        <h4 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                          {item.name}
                        </h4>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Price
                            </div>
                            <div className="mt-1 text-base font-semibold text-slate-900">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-orange-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                              Points
                            </div>
                            <div className="mt-1 text-base font-semibold text-orange-700">
                              {item.pointsToBuy}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {menuEditing && editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={closeMenuEdit}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-7 py-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Edit Menu Item
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Update the item details shown in the restaurant menu.
              </p>
            </div>

            <form onSubmit={handleMenuEditSubmit} className="space-y-5 px-7 py-6">
              <div className="grid gap-5 md:grid-cols-[140px_minmax(0,1fr)]">
                <div className="flex flex-col gap-3">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {menuEditImagePreview ? (
                      <img
                        src={menuEditImagePreview}
                        alt={menuEditForm.name || editingItem.name}
                        className="h-36 w-full object-cover"
                      />
                    ) : menuEditForm.imageUrl ? (
                      <img
                        src={menuEditForm.imageUrl}
                        alt={menuEditForm.name || editingItem.name}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#fed7aa_45%,_#f97316_100%)] text-3xl font-semibold text-orange-700">
                        {(menuEditForm.name || editingItem.name)?.slice(0, 1)?.toUpperCase() || "M"}
                      </div>
                    )}
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Image
                    </span>
                    <input
                      key={menuEditImageInputKey}
                      type="file"
                      accept="image/*"
                      onChange={(event) => setMenuEditImage(event.target.files?.[0] || null)}
                      className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Item name</span>
                    <input
                      type="text"
                      value={menuEditForm.name}
                      onChange={(event) =>
                        setMenuEditForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Price</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={menuEditForm.price}
                        onChange={(event) =>
                          setMenuEditForm((current) => ({
                            ...current,
                            price: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Points</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={menuEditForm.pointsToBuy}
                        onChange={(event) =>
                          setMenuEditForm((current) => ({
                            ...current,
                            pointsToBuy: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                    <textarea
                      rows={4}
                      value={menuEditForm.description}
                      onChange={(event) =>
                        setMenuEditForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    <input
                      type="checkbox"
                      checked={menuEditForm.isAvailable}
                      onChange={(event) =>
                        setMenuEditForm((current) => ({
                          ...current,
                          isAvailable: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                    Available on menu
                  </label>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeMenuEdit}
                  disabled={menuEditSaving}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={menuEditSaving}
                  className="flex-1 rounded-xl bg-[var(--color-brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {menuEditSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modals */}
      {showPackageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setShowPackageModal(false)}
        >
          <div
            className="flex w-full max-w-5xl flex-col rounded-[24px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-8 py-7">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {isUpgradeFlow ? "Upgrade Package" : "Activate Package"}
              </h2>
              <p className="mt-2 text-slate-600">
                {isUpgradeFlow
                  ? "Select a higher package to upgrade this restaurant."
                  : "Select a package to bind and activate for this restaurant."}
              </p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
              {eligiblePackages.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  No upgrade package is available for the current restaurant state.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {eligiblePackages.map((pkg) => {
                    const isSelected = selectedPackage === pkg.code;
                    return (
                      <button
                        key={pkg.code}
                        type="button"
                        onClick={() => setSelectedPackage(pkg.code)}
                        className={`w-full rounded-2xl border p-5 text-left transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                            : "border-slate-200 hover:border-slate-300"
                        } cursor-pointer`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">{pkg.name}</div>
                            <div className="text-sm text-slate-500">
                              ${pkg.price} / {pkg.billingCycle}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-slate-600">
                              {pkg.description}
                            </div>
                            <ul className="mt-3 space-y-1 text-sm text-slate-600">
                              {pkg.features?.map((feature) => (
                                <li key={feature}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              pkg.badge === "START"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {String(pkg.code).toUpperCase()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-8 py-6">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowPackageModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !selectedPackage || eligiblePackages.length === 0}
                onClick={handlePackageAction}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading
                  ? isUpgradeFlow
                    ? "Upgrading..."
                    : "Activating..."
                  : isUpgradeFlow
                    ? "Upgrade Now"
                    : "Activate Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantView;
