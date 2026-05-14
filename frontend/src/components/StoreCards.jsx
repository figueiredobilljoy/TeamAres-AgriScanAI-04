import { MapPin, Store } from 'lucide-react';
import React from 'react';

function StoreCards({ error, stores }) {
  const storeList = Array.isArray(stores) ? stores : [];

  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
          <Store aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-leaf-950">Nearby agriculture stores</h2>
          <p className="text-sm text-leaf-700">OpenStreetMap-based location results.</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {storeList.length ? (
        <div className="grid gap-3">
          {storeList.map((store) => (
            <article
              className="rounded-2xl border border-leaf-100 bg-leaf-50 p-4"
              key={`${store.name}-${store.address}-${store.distance_km}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-leaf-950">{store.name}</h3>
                  <p className="mt-2 flex gap-2 text-sm leading-6 text-leaf-700">
                    <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
                    <span>{store.address || 'Address not available'}</span>
                  </p>
                </div>
                {typeof store.distance_km === 'number' ? (
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-leaf-900">
                    {store.distance_km.toFixed(2)} km
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-leaf-50 px-4 py-5 text-sm text-leaf-700">
          {error ? 'Try again with location enabled to refresh nearby stores.' : 'Share your location to load nearby stores.'}
        </p>
      )}
    </section>
  );
}

export default StoreCards;
