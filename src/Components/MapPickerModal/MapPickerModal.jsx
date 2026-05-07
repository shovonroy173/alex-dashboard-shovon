import { useState, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { X, MapPin } from "lucide-react";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // SF as fallback

const MapPickerModal = ({ isOpen, onClose, onConfirm, initialCenter }) => {
  const [markerPos, setMarkerPos] = useState(null);

  const handleMapClick = useCallback((e) => {
    if (e.detail?.latLng) {
      setMarkerPos(e.detail.latLng);
    }
  }, []);

  const handleConfirm = () => {
    if (markerPos) {
      onConfirm(markerPos.lat, markerPos.lng);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Pick Location
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Click anywhere on the map to place the pin.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[60vh] w-full bg-slate-50">
          {!apiKey ? (
            <div className="flex h-full items-center justify-center text-slate-500 px-6 text-center">
              <p>Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.</p>
            </div>
          ) : (
            <APIProvider apiKey={apiKey}>
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={initialCenter || DEFAULT_CENTER}
                defaultZoom={13}
                gestureHandling={"greedy"}
                disableDefaultUI={false}
                zoomControl={true}
                onClick={handleMapClick}
              >
                {markerPos && <AdvancedMarker position={markerPos} />}
              </Map>
            </APIProvider>
          )}
        </div>

        <div className="flex items-center justify-between bg-slate-50 px-7 py-5">
          <div className="flex items-center gap-3 text-slate-600">
            {markerPos ? (
              <>
                <MapPin className="h-5 w-5 text-[var(--color-brand-secondary)]" />
                <span className="font-mono text-sm">
                  {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                </span>
              </>
            ) : (
              <span className="text-sm">No location selected</span>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="text-lg font-medium text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!markerPos}
              className={`rounded-xl px-6 py-3 text-lg font-semibold text-white transition-opacity ${
                !markerPos
                  ? "bg-slate-300 opacity-50 cursor-not-allowed"
                  : "bg-[var(--color-brand-primary)]"
              }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
