import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  MapPin,
  QrCode,
  Save,
  Loader2,
} from "lucide-react";
import { message, Spin } from "antd";
import MapPickerModal from "../../Components/MapPickerModal/MapPickerModal";
import {
  getRestaurantById,
  updateRestaurant,
} from "../../services/adminApi";

const categories = ["Fast Food", "Cafe", "Fine Dining", "Steakhouse", "Dessert"];

const RestaurantEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    category: "",
    latitude: "",
    longitude: "",
    points: "",
    imageFile: null,
    imageUrl: "", // For previewing existing image
    qrCode: null, // Keep existing QR code data
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await getRestaurantById(id);
        const data = res?.data;
        if (data) {
          setFormData({
            name: data.name || "",
            address: data.address || "",
            city: data.city || "",
            category: data.category || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
            points: data.pointsPerCheckIn?.toString() || "",
            imageFile: null,
            imageUrl: data.imageUrl || "",
            qrCode: data.qrCode || null,
          });
        }
      } catch (error) {
        message.error(error?.message || "Failed to load restaurant details");
        navigate("/restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.category ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.points
    ) {
      message.error("Please fill in all required fields.");
      return;
    }

    try {
      setActionLoading(true);

      const rPayload = new FormData();
      rPayload.append("name", formData.name.trim());
      rPayload.append("address", formData.address.trim());
      if (formData.city?.trim()) rPayload.append("city", formData.city.trim());
      rPayload.append("latitude", formData.latitude);
      rPayload.append("longitude", formData.longitude);
      rPayload.append("category", formData.category);
      rPayload.append("pointsPerCheckIn", formData.points);
      
      if (formData.imageFile) {
        rPayload.append("image", formData.imageFile);
      }
      
      // Preserve or update QR code data (Backend expects individual fields)
      rPayload.append("qrCodeName", formData.qrCode?.name || `${formData.name.trim()} Main Entrance`);
      rPayload.append("qrCodeLatitude", formData.latitude);
      rPayload.append("qrCodeLongitude", formData.longitude);
      rPayload.append("qrCodeToken", formData.qrCode?.token || `qr-rest-${Date.now()}`);
      
      if (formData.imageUrl && !formData.imageFile) {
        rPayload.append("imageUrl", formData.imageUrl);
      }

      await updateRestaurant(id, rPayload);
      message.success("Restaurant updated successfully");
      navigate(`/restaurants/${id}`);
    } catch (error) {
      message.error(error?.message || "Failed to update restaurant");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center flex-1">
          Edit Restaurant
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="px-8 py-8">
          <div className="space-y-6">
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-slate-700">Restaurant Name</span>
              <input
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Enter restaurant name"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:border-[var(--color-brand-primary)] focus:outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
              <label className="block">
                <span className="mb-2 block text-lg font-medium text-slate-700">Address</span>
                <input
                  value={formData.address}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="123 Street Name"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-[var(--color-brand-primary)] focus:outline-none"
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
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-[var(--color-brand-primary)] focus:outline-none"
                />
              </label>
            </div>

            <div>
              <span className="mb-3 block text-lg font-medium text-slate-700">Coordinates</span>
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px]">
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
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:border-[var(--color-brand-primary)] focus:outline-none"
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
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:border-[var(--color-brand-primary)] focus:outline-none"
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-lg font-medium text-slate-700">Category</span>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, category: event.target.value }))
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 text-slate-700 focus:border-[var(--color-brand-primary)] focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
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
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:border-[var(--color-brand-primary)] focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-lg font-medium text-slate-700">
                  Update Image
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
                  Optional. Leave empty to keep current image.
                </p>
              </label>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-4">
                <span className="mb-2 block text-sm font-medium text-slate-500">Current / New Preview</span>
                {formData.imageFile ? (
                   <img
                    src={URL.createObjectURL(formData.imageFile)}
                    alt="New Preview"
                    className="h-24 w-24 rounded-xl object-cover shadow-sm border border-white"
                  />
                ) : formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Current"
                    className="h-24 w-24 rounded-xl object-cover shadow-sm border border-white"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                    No Image
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <QrCode className="h-5 w-5 text-slate-600" />
                <span className="text-lg font-medium text-slate-700">QR Code Binding</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                The bound QR code token is: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">{formData.qrCode?.token || "N/A"}</code>. 
                Coordinates will be updated to match the restaurant's location on save.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-6">
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => navigate(-1)}
            className="rounded-xl px-6 py-3 text-lg font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleSave}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-8 text-lg font-semibold text-white shadow-[0_12px_20px_rgba(255,149,0,0.22)] disabled:opacity-60"
          >
            {actionLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

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

export default RestaurantEdit;
