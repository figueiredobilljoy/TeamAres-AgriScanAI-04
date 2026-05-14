import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ImageUp, Leaf, Loader2, Sparkles } from 'lucide-react';
import ImageUploader from './components/ImageUploader.jsx';
import ResultCard from './components/ResultCard.jsx';

const API_URL = 'http://localhost:5000/analyze';
const CROP_OPTIONS = [
  { id: 'apple', name: 'Apple' },
  { id: 'mango', name: 'Mango' },
  { id: 'potato', name: 'Potato' },
  { id: 'tomato', name: 'Tomato' },
];

function App() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setResult(null);
    setError('');
  };

  const handleCropSelect = (cropId) => {
    setSelectedCrop(cropId);
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedCrop) {
      setError('Please select the crop type before detecting disease.');
      return;
    }

    if (!selectedFile || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('crop', selectedCrop);
    formData.append('image', selectedFile);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'The analysis service could not process this image.');
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while analyzing the image.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcefc6,transparent_32%),linear-gradient(135deg,#f6fbf2_0%,#dfead7_50%,#c6d8b8_100%)] px-4 py-8 text-leaf-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full">
          <header className="mx-auto mb-8 max-w-3xl text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-700 text-leaf-50 shadow-lg shadow-leaf-900/20">
              <Leaf aria-hidden="true" className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-bold tracking-normal text-leaf-900 sm:text-5xl">
              AgriScan AI
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-leaf-800 sm:text-lg">
              Upload a crop leaf photo and get fast disease insights with severity and treatment guidance.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
                  <ImageUp aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-leaf-900">Disease Detection</h2>
                  <p className="text-sm text-leaf-700">Choose the crop, then upload a leaf photo.</p>
                </div>
              </div>

              <div className="mb-5">
                <p className="mb-3 text-sm font-semibold text-leaf-900">Crop type</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CROP_OPTIONS.map((crop) => {
                    const isSelected = selectedCrop === crop.id;

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left transition duration-200 ${
                          isSelected
                            ? 'border-leaf-700 bg-leaf-700 text-white shadow-lg shadow-leaf-900/15'
                            : 'border-leaf-200 bg-leaf-50 text-leaf-900 hover:-translate-y-0.5 hover:border-leaf-500 hover:bg-white'
                        }`}
                        disabled={isAnalyzing}
                        key={crop.id}
                        onClick={() => handleCropSelect(crop.id)}
                        type="button"
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <Leaf aria-hidden="true" className="h-5 w-5" />
                          {isSelected ? (
                            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                          ) : null}
                        </span>
                        <span className="text-base font-semibold">{crop.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <ImageUploader
                disabled={isAnalyzing || !selectedCrop}
                onFileSelect={handleFileSelect}
                previewUrl={previewUrl}
                selectedFile={selectedFile}
              />

              {!selectedCrop ? (
                <p className="mt-3 text-sm text-leaf-700">
                  Select a crop type first so AgriScan AI can use the matching trained model.
                </p>
              ) : null}

              {error ? (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-leaf-900/20 transition duration-200 hover:-translate-y-0.5 hover:bg-leaf-800 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-leaf-300 disabled:text-leaf-700 disabled:shadow-none disabled:hover:translate-y-0"
                disabled={!selectedCrop || !selectedFile || isAnalyzing}
                onClick={handleAnalyze}
                type="button"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles aria-hidden="true" className="h-5 w-5" />
                    Detect Disease
                  </>
                )}
              </button>
            </section>

            <ResultCard isLoading={isAnalyzing} result={result} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
