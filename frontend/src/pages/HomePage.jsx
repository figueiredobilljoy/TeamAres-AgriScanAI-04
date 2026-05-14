import {
  Bot,
  MapPin,
  Megaphone,
  Mic,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import React from 'react';

const features = [
  {
    icon: ScanSearch,
    title: 'AI crop disease detection',
    text: 'Upload a clear leaf image and route it to crop-specific TensorFlow models.',
  },
  {
    icon: Bot,
    title: 'Gemini AI advisory',
    text: 'Get concise farmer-friendly guidance for severity, causes, treatment, and prevention.',
  },
  {
    icon: MapPin,
    title: 'Nearby agriculture stores',
    text: 'Use your location to find nearby agri stores, fertilizer shops, pesticide stores, and pharmacies.',
  },
  {
    icon: Megaphone,
    title: 'Community disease insights',
    text: 'See common disease reports around your area from saved local detections.',
  },
  {
    icon: Mic,
    title: 'Text-to-speech support',
    text: 'Listen to disease results and advisory steps directly from the Detect page.',
  },
];

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid min-h-[calc(100vh-9rem)] items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-white px-4 py-2 text-sm font-semibold text-leaf-800 shadow-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Crop diagnosis, advice, and local support
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal text-leaf-950 sm:text-6xl">
            Smarter crop health support for faster field decisions.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-leaf-800">
            AgriScan AI combines trained disease models, Gemini advisory, local store discovery,
            and community insights in a clean workflow for farmers and agritech demos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-2xl bg-leaf-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-leaf-900/20 transition hover:bg-leaf-800"
              href="/detect"
            >
              Detect Disease
            </a>
            <a
              className="inline-flex items-center justify-center rounded-2xl border border-leaf-300 bg-white px-6 py-3.5 text-base font-semibold text-leaf-800 transition hover:border-leaf-600 hover:bg-leaf-50"
              href="/community"
            >
              Explore Community
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
          <div className="rounded-3xl bg-leaf-900 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-800">
                <ShieldCheck aria-hidden="true" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-normal text-leaf-200">Live workflow</p>
                <h2 className="text-2xl font-semibold">Detect. Advise. Connect.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {['Select crop', 'Upload leaf image', 'Review AI advice', 'Find nearby support'].map((step, index) => (
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4" key={step}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-100 text-sm font-bold text-leaf-900">
                    {index + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <article className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-soft" key={title}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-leaf-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-leaf-700">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
