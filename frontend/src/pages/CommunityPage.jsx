import { AlertCircle, Loader2, LocateFixed, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DiseaseInsights from '../components/DiseaseInsights.jsx';
import StoreCards from '../components/StoreCards.jsx';
import { API_BASE_URL, apiUrl } from '../config/api.js';
import { getSavedLocation, saveLocation } from '../utils/storage.js';

const COMMUNITY_API_URL = apiUrl('/community');

function CommunityPage() {
  const [location, setLocation] = useState(() => getSavedLocation());
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [stores, setStores] = useState([]);
  const [storesError, setStoresError] = useState('');
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (location) {
      loadCommunityData(location);
    }
  }, []);

  const loadCommunityData = async (nextLocation) => {
    setIsLoading(true);
    setStoresError('');

    try {
      const params = new URLSearchParams({
        latitude: String(nextLocation.latitude),
        longitude: String(nextLocation.longitude),
      });
      const response = await fetch(`${COMMUNITY_API_URL}?${params}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Community data could not be loaded.');
      }

      setStores(data.nearby_stores || []);
      setStoresError(data.nearby_stores_error || '');
      setInsights(data.disease_insights || []);
    } catch (error) {
      setStores([]);
      setInsights([]);
      const isNetworkError =
        error instanceof TypeError && /failed to fetch|network/i.test(error.message);
      setStoresError(
        isNetworkError
          ? `Could not connect to the server at ${API_BASE_URL}. The backend may be starting, unavailable, or blocked by CORS.`
          : error instanceof Error
            ? error.message
            : 'Community data could not be loaded.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseLocation = () => {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(nextLocation);
        saveLocation(nextLocation);
        setIsLocating(false);
        loadCommunityData(nextLocation);
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. Enable location to see nearby stores and reports.');
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setLocationError('Your location is currently unavailable. Please try again.');
        } else if (geoError.code === geoError.TIMEOUT) {
          setLocationError('Location request timed out. Please try again.');
        } else {
          setLocationError('Could not get your location. Please try again.');
        }

        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-leaf-700">Community</p>
        <h1 className="mt-2 text-3xl font-bold text-leaf-950 sm:text-4xl">Nearby support and disease insights</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-leaf-800">
          Use your location to discover nearby agriculture support and common disease reports around your area.
        </p>
      </div>

      <section className="mb-6 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
              <MapPin aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-leaf-950">Location access</h2>
              <p className="text-sm text-leaf-700">Coordinates stay in your browser and are sent only for lookups.</p>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-900/15 transition hover:bg-leaf-800 disabled:cursor-not-allowed disabled:bg-leaf-300 disabled:text-leaf-700"
            disabled={isLocating || isLoading}
            onClick={handleUseLocation}
            type="button"
          >
            {isLocating || isLoading ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed aria-hidden="true" className="h-4 w-4" />
            )}
            {isLocating ? 'Getting Location...' : isLoading ? 'Loading Nearby Data...' : 'Use My Location'}
          </button>
        </div>

        {location ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-leaf-800">
            <span className="rounded-full bg-leaf-50 px-3 py-1.5 font-semibold">Location ready</span>
            <span className="rounded-full bg-leaf-50 px-3 py-1.5 font-mono">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </span>
          </div>
        ) : null}

        {locationError ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6">
        <StoreCards error={storesError} stores={stores} />
        <DiseaseInsights insights={insights} />
      </div>
    </div>
  );
}

export default CommunityPage;
