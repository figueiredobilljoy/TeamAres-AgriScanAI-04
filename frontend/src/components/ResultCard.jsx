import {
  Activity,
  BadgeCheck,
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

const ADVISORY_LABELS = {
  en: {
    severity: 'Severity',
    causes: 'Causes',
    treatment: 'Treatment Advice',
    prevention: 'Prevention Tips',
  },
  hi: {
    severity: '\u0917\u0902\u092d\u0940\u0930\u0924\u093e',
    causes: '\u0915\u093e\u0930\u0923',
    treatment: '\u0909\u092a\u091a\u093e\u0930 \u0938\u0932\u093e\u0939',
    prevention: '\u0930\u094b\u0915\u0925\u093e\u092e \u0915\u0947 \u0909\u092a\u093e\u092f',
  },
  mr: {
    severity: '\u0924\u0940\u0935\u094d\u0930\u0924\u093e',
    causes: '\u0915\u093e\u0930\u0923\u0947',
    treatment: '\u0909\u092a\u091a\u093e\u0930 \u0938\u0932\u094d\u0932\u093e',
    prevention: '\u092a\u094d\u0930\u0924\u093f\u092c\u0902\u0927\u093e\u0924\u094d\u092e\u0915 \u0909\u092a\u093e\u092f',
  },
};

function getLabel(language, key) {
  const labels = ADVISORY_LABELS[language] || ADVISORY_LABELS.en;
  return labels[key] || ADVISORY_LABELS.en[key];
}

function ResultCard({ isLoading, language = 'en', result }) {
  const data = result ?? emptyState;
  const hasStructuredAdvice =
    Array.isArray(data.causes) || Array.isArray(data.treatment) || Array.isArray(data.prevention);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-leaf-100 bg-leaf-900 p-5 text-white shadow-soft sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Analysis Result</h2>
          <p className="mt-1 text-sm text-leaf-100">Disease details and next action.</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-leaf-100">
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
        <MetricCard icon={Activity} label="Confidence" value={formatConfidence(data.confidence)} />
        <MetricCard icon={ShieldAlert} label="Severity" value={data.severity} />
      </div>

      {data.alternative_disease ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-normal text-leaf-200">Possible Alternative</p>
          <p className="mt-1 text-base font-medium text-leaf-50">
            {data.alternative_disease} - {formatConfidence(data.alternative_confidence)}
          </p>
        </div>
      ) : null}

      {data.disclaimer ? (
        <div className="mt-4 rounded-2xl border border-amber-200/30 bg-amber-100/15 px-4 py-3 text-sm leading-6 text-amber-50">
          {data.disclaimer}
        </div>
      ) : null}

      <div className="mt-4 flex-1 space-y-4 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-inner">
        <AdviceSection title={getLabel(language, 'causes')} items={data.causes} />
        <AdviceSection title={getLabel(language, 'treatment')} items={data.treatment ?? data.advice} />
        {hasStructuredAdvice ? <AdviceSection title={getLabel(language, 'prevention')} items={data.prevention} /> : null}
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

function formatConfidence(confStr) {
  if (!confStr || confStr === '--') return confStr;
  const val = parseFloat(confStr);
  if (isNaN(val)) return confStr;
  const capped = Math.min(val, 95);
  return `${Math.round(capped)}%`;
}

export default ResultCard;
