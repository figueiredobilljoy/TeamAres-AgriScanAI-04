import {
  Activity,
  BadgeCheck,
  Volume2,
  FlaskConical,
  Leaf,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import React from 'react';

const emptyState = {
  crop: 'Awaiting image',
  disease: 'No analysis yet',
  confidence: '--',
  severity: '--',
  disclaimer: '',
  causes: [],
  treatment: ['Upload a crop image to see AI-powered disease detection results here.'],
  prevention: [],
};

function ResultCard({ isLoading, onSpeak, result }) {
  const data = result ?? emptyState;
  const hasStructuredAdvice =
    Array.isArray(data.causes) || Array.isArray(data.treatment) || Array.isArray(data.prevention);

  return (
    <section className="rounded-3xl border border-leaf-100 bg-leaf-900 p-5 text-white shadow-soft sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Analysis Result</h2>
          <p className="mt-1 text-sm text-leaf-100">Disease details and next action.</p>
        </div>
        <div className="flex items-center gap-2">
          {result ? (
            <button
              aria-label="Read result aloud"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-leaf-100 transition hover:bg-white/15"
              onClick={onSpeak}
              type="button"
            >
              <Volume2 aria-hidden="true" className="h-5 w-5" />
            </button>
          ) : null}
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-leaf-100">
            {isLoading ? (
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            ) : (
              <BadgeCheck aria-hidden="true" className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard icon={Leaf} label="Crop" value={data.crop} />
        <MetricCard icon={FlaskConical} label="Disease" value={data.disease} />
        <MetricCard icon={Activity} label="Confidence" value={data.confidence} />
        <MetricCard icon={ShieldAlert} label="Severity" value={data.severity} />
      </div>

      {data.disclaimer ? (
        <div className="mt-4 rounded-2xl border border-amber-200/30 bg-amber-100/15 px-4 py-3 text-sm leading-6 text-amber-50">
          {data.disclaimer}
        </div>
      ) : null}

      <div className="mt-4 space-y-4 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-inner">
        <AdviceSection title="Causes" items={data.causes} />
        <AdviceSection title="Treatment Advice" items={data.treatment ?? data.advice} />
        {hasStructuredAdvice ? <AdviceSection title="Prevention Tips" items={data.prevention} /> : null}
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

function AdviceSection({ title, items }) {
  const adviceItems = normalizeAdviceItems(items);

  if (!adviceItems.length) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-normal text-leaf-200">{title}</p>
      <ul className="mt-2 space-y-2 text-base leading-7 text-leaf-50">
        {adviceItems.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-200" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function normalizeAdviceItems(items) {
  if (Array.isArray(items)) {
    return items.filter(Boolean);
  }

  if (typeof items === 'string' && items.trim()) {
    return [items];
  }

  return [];
}

export default ResultCard;
