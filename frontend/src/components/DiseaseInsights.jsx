import { Activity, MapPin } from 'lucide-react';
import React from 'react';

function DiseaseInsights({ insights }) {
  const items = Array.isArray(insights) ? insights : [];

  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
          <Activity aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-leaf-950">Community disease insights</h2>
          <p className="text-sm text-leaf-700">Based on stored nearby reports above 60% confidence.</p>
        </div>
      </div>

      {items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <article className="rounded-2xl border border-leaf-100 bg-leaf-50 p-4" key={`${item.crop}-${item.disease}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-leaf-950">{item.message}</h3>
                  <p className="mt-1 text-sm text-leaf-700">
                    {item.crop} • {item.count} report{item.count === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-leaf-900">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {item.average_distance_km} km
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-leaf-50 px-4 py-5 text-sm text-leaf-700">
          No nearby disease reports yet. Successful predictions with confidence of 60% or higher will appear here.
        </p>
      )}
    </section>
  );
}

export default DiseaseInsights;
