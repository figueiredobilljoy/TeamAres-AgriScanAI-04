import { Activity, BadgeCheck, FlaskConical, Leaf, Loader2, ShieldAlert } from 'lucide-react';
import React from 'react';

const emptyState = {
  crop: 'Awaiting image',
  disease: 'No analysis yet',
  confidence: '--',
  severity: '--',
  advice: 'Upload a crop image to see AI-powered disease detection results here.',
};

function ResultCard({ isLoading, result }) {
  const data = result ?? emptyState;

  return (
    <section className="rounded-3xl border border-leaf-100 bg-leaf-900 p-5 text-white shadow-soft sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Analysis Result</h2>
          <p className="mt-1 text-sm text-leaf-100">Disease details and next action.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-leaf-100">
          {isLoading ? (
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          ) : (
            <BadgeCheck aria-hidden="true" className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard icon={Leaf} label="Crop" value={data.crop} />
        <MetricCard icon={FlaskConical} label="Disease" value={data.disease} />
        <MetricCard icon={Activity} label="Confidence" value={data.confidence} />
        <MetricCard icon={ShieldAlert} label="Severity" value={data.severity} />
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-inner">
        <p className="text-sm font-medium uppercase tracking-normal text-leaf-200">
          Treatment Advice
        </p>
        <p className="mt-3 text-base leading-7 text-leaf-50">{data.advice}</p>
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/10 p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/15">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-800">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-normal text-leaf-200">{label}</p>
      <p className="mt-1 break-words text-lg font-semibold text-white">{value}</p>
    </article>
  );
}

export default ResultCard;
