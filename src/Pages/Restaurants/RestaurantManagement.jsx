import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";
import MapPickerModal from "../../Components/MapPickerModal/MapPickerModal";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getRestaurants,
  createRestaurant,
  deleteRestaurant,
} from "../../services/adminApi";

const categories = ["All", "Fast Food", "Cafe", "Fine Dining", "Steakhouse", "Dessert"];

const categoryBadge = {
  "Fast Food": "bg-blue-100 text-blue-700",
  Cafe: "bg-violet-100 text-violet-700",
  "Fine Dining": "bg-amber-100 text-amber-700",
  default: "bg-slate-100 text-slate-700",
};

const statusBadge = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  inactive: "bg-slate-100 text-slate-600",
};

const createBlankRestaurant = () => ({
  name: "",
  address: "",
  city: "",
  category: "",
  latitude: "",
  longitude: "",
  points: "",
  imageFile: null,
});

const RestaurantAvatar = ({ name, imageUrl }) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-10 w-10 rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
      {name
        ?.split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
};

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest First");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [formData, setFormData] = useState(createBlankRestaurant());
  const [showMapPicker, setShowMapPicker] = useState(false);

  const itemsPerPage = 7;

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await getRestaurants();
      setRestaurants(res?.data || []);
    } catch (error) {
      message.error(error?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const next = restaurants.filter((restaurant) => {
      const matchesCategory =
        selectedCategory === "All" || restaurant.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        restaurant.name?.toLowerCase().includes(normalizedSearch) ||
        restaurant.address?.toLowerCase().includes(normalizedSearch) ||
        restaurant.city?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });

    if (sortBy === "A-Z") {
      return [...next].sort((a, b) => a.name.localeCompare(b.name));
    }

    return next;
  }, [restaurants, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setFormData(createBlankRestaurant());
    setShowAddModal(true);
  };

  const handleSaveRestaurant = async () => {
    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.category ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.points ||
      !formData.imageFile
    ) {
      message.error("Please fill in all required fields, including the restaurant image.");
      return;
    }

    try {
      setActionLoading(true);

      const rPayload = new FormData();
      rPayload.append("name", formData.name.trim());
      rPayload.append("address", formData.address.trim());
      if (formData.city.trim()) rPayload.append("city", formData.city.trim());
      rPayload.append("latitude", formData.latitude);
      rPayload.append("longitude", formData.longitude);
      rPayload.append("category", formData.category);
      rPayload.append("pointsPerCheckIn", formData.points);
      rPayload.append("image", formData.imageFile);

      // Auto-generate QR code properties based on location
      rPayload.append("qrCodeName", `${formData.name.trim()} Main Entrance`);
      rPayload.append("qrCodeLatitude", formData.latitude);
      rPayload.append("qrCodeLongitude", formData.longitude);
      rPayload.append("qrCodeToken", `qr-rest-${Date.now()}`);

      await createRestaurant(rPayload);
      message.success("Restaurant added successfully");
      setShowAddModal(false);
      setPage(1);
      fetchRestaurants();
    } catch (error) {
      message.error(error?.message || "Failed to add restaurant");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurantToDelete) return;
    try {
      setActionLoading(true);
      await deleteRestaurant({ id: restaurantToDelete.id });
      message.success("Restaurant deleted successfully");
      setRestaurantToDelete(null);
      fetchRestaurants();
    } catch (error) {
      message.error(error?.message || "Failed to delete restaurant");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[2.05rem] font-medium tracking-tight text-slate-900">
            Restaurant Management
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(255,149,0,0.22)]"
        >
          <Plus className="h-4 w-4" />
          Add Restaurant
        </button>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search restaurants..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[var(--color-brand-secondary)] text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Sort By
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-slate-700 shadow-sm"
            >
              <option>Newest First</option>
              <option>A-Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-5">Restaurant</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Address</th>
                <th className="px-6 py-5">Coordinates</th>
                <th className="px-6 py-5">Packages</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    Loading restaurants...
                  </td>
                </tr>
              ) : paginatedRestaurants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No restaurants found.
                  </td>
                </tr>
              ) : (
                paginatedRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <RestaurantAvatar name={restaurant.name} imageUrl={restaurant.imageUrl} />
                        <div>
                          <p className="text-[1.05rem] font-semibold leading-5 text-slate-900">
                            {restaurant.name}
                          </p>
                          <p className="text-sm text-slate-500">{restaurant.pointsPerCheckIn} pts/checkin</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryBadge[restaurant.category] || categoryBadge.default}`}>
                        {restaurant.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {restaurant.address}
                      {restaurant.city && <span>, {restaurant.city}</span>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="whitespace-pre-line rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500">
                        {restaurant.latitude}° N,
                        {"\n"}{restaurant.longitude}° W
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(restaurant.enabledPackages) ? restaurant.enabledPackages : []).map((pkg) => (
                          <span key={pkg} className="rounded-full bg-indigo-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-indigo-700">
                            {pkg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusBadge[restaurant.status] || statusBadge.inactive}`}>
                        {restaurant.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-4 text-slate-400">
                        <button 
                          type="button" 
                          onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                          className="hover:text-[var(--color-brand-primary)]"
                          title="View Restaurant"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => navigate(`/restaurants/${restaurant.id}/edit`)}
                          className="hover:text-slate-600"
                          title="Edit Restaurant"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestaurantToDelete(restaurant)}
                          className="hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span>Rows per page:</span>
            <span className="font-medium text-slate-700">{itemsPerPage}</span>
          </div>
          <div className="flex items-center gap-6">
            <span>
              {filteredRestaurants.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredRestaurants.length)} of {filteredRestaurants.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-8 w-8 rounded-lg text-sm font-semibold ${
                    pageNumber === currentPage
                      ? "bg-[var(--color-brand-secondary)] text-white"
                      : "text-slate-600"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-2xl max-h-full overflow-y-auto overflow-x-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <div className="px-7 pb-8 pt-7">
              <h2 className="text-[2rem] font-semibold tracking-tight text-slate-900">
                Add New Restaurant
              </h2>
                <p className="mt-1 text-lg text-slate-500">
                Fill in the details and upload the restaurant image. Package activation happens later from the restaurant view page.
              </p>

              <div className="mt-8 space-y-6">
                <label className="block">
                  <span className="mb-2 block text-lg font-medium text-slate-700">Restaurant Name</span>
                  <input
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Enter restaurant name"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                  <label className="block">
                    <span className="mb-2 block text-lg font-medium text-slate-700">Address</span>
                    <input
                      value={formData.address}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, address: event.target.value }))
                      }
                      placeholder="123 Street Name"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-lg font-medium text-slate-700">City (Optional)</span>
                    <input
                      value={formData.city}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, city: event.target.value }))
                      }
                      placeholder="City Name"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>
                </div>

                <div>
                  <span className="mb-3 block text-lg font-medium text-slate-700">Coordinates</span>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Latitude
                      </span>
                      <input
                        value={formData.latitude}
                        type="number"
                        step="any"
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, latitude: event.target.value }))
                        }
                        placeholder="23.7806"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Longitude
                      </span>
                      <input
                        value={formData.longitude}
                        type="number"
                        step="any"
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, longitude: event.target.value }))
                        }
                        placeholder="90.2794"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-[var(--color-brand-secondary)]" />
                      Map
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-lg font-medium text-slate-700">Category</span>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, category: event.target.value }))
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 text-slate-700"
                      >
                        <option value="">Select category</option>
                        {categories
                          .filter((category) => category !== "All")
                          .map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-lg font-medium text-slate-700">Points per Check-in</span>
                    <input
                      value={formData.points}
                      type="number"
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, points: event.target.value }))
                      }
                      placeholder="e.g. 50"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-lg font-medium text-slate-700">
                    Restaurant Image <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        imageFile: event.target.files?.[0] || null,
                      }))
                    }
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-brand-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Required. Upload a JPG or PNG restaurant photo.
                  </p>
                </label>

                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between rounded-2xl bg-slate-50 p-5 mt-4">
                  <div className="flex-1">
                    <span className="mb-1 block text-lg font-medium text-slate-700">QR Code Binding</span>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      A unique check-in QR code token will be automatically generated and bound to this restaurant's coordinates upon creation.
                    </p>
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500"
                    >
                      <QrCode className="h-4 w-4" />
                      Auto-Generates on Save
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-7 py-5 sticky bottom-0">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowAddModal(false)}
                className="text-lg font-medium text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveRestaurant}
                className="rounded-xl bg-[var(--color-brand-primary)] px-6 py-3 text-lg font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Saving..." : "Save Restaurant"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {restaurantToDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-xl rounded-[24px] bg-white px-8 py-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <h2 className="text-[2.1rem] font-semibold tracking-tight text-slate-900">
              Delete Restaurant?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[1.25rem] leading-9 text-slate-600">
              Are you sure you want to remove {restaurantToDelete.name} from the
              platform? This action cannot be undone.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setRestaurantToDelete(null)}
                className="rounded-2xl bg-slate-100 px-6 py-4 text-xl font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteRestaurant}
                className="rounded-2xl bg-[#f64040] px-6 py-4 text-xl font-semibold text-white disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialCenter={
          formData.latitude && formData.longitude
            ? { lat: Number(formData.latitude), lng: Number(formData.longitude) }
            : null
        }
        onConfirm={(lat, lng) => {
          setFormData((current) => ({
            ...current,
            latitude: Number(lat).toFixed(6),
            longitude: Number(lng).toFixed(6),
          }));
          setShowMapPicker(false);
        }}
      />
    </div>
  );
};

export default RestaurantManagement;
