import { AlertCircle, CheckCircle2, Globe, ImageUp, Leaf, Loader2, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ImageUploader from '../components/ImageUploader.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { API_BASE_URL, apiUrl } from '../config/api.js';
import { getSavedLocation, saveLatestResult } from '../utils/storage.js';

const API_URL = apiUrl('/analyze');
const CROP_OPTIONS = [
  { id: 'apple', name: 'Apple' },
  { id: 'mango', name: 'Mango' },
  { id: 'potato', name: 'Potato' },
  { id: 'tomato', name: 'Tomato' },
];
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
];

function DetectPage() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
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
    formData.append('language', selectedLanguage);

    const savedLocation = getSavedLocation();

    if (savedLocation) {
      formData.append('latitude', String(savedLocation.latitude));
      formData.append('longitude', String(savedLocation.longitude));
    }

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
      saveLatestResult(data);
    } catch (requestError) {
      const isNetworkError =
        requestError instanceof TypeError && /failed to fetch|network/i.test(requestError.message);
      setError(
        isNetworkError
          ? `Could not connect to the analysis server at ${API_BASE_URL}. The backend may be starting, unavailable, or blocked by CORS.`
          : requestError instanceof Error
            ? requestError.message
            : 'Something went wrong while analyzing the image.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-leaf-700">Detect</p>
        <h1 className="mt-2 text-3xl font-bold text-leaf-950 sm:text-4xl">Crop disease detection</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-leaf-800">
          Choose a crop, upload a clear leaf image, and review model confidence with Gemini-powered advice.
        </p>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <DetectionForm
          error={error}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          onCropSelect={(cropId) => {
            setSelectedCrop(cropId);
            setResult(null);
            setError('');
          }}
          onFileSelect={(file) => {
            setSelectedFile(file);
            setResult(null);
            setError('');
          }}
          onLanguageSelect={setSelectedLanguage}
          previewUrl={previewUrl}
          selectedCrop={selectedCrop}
          selectedFile={selectedFile}
          selectedLanguage={selectedLanguage}
        />
        <ResultCard isLoading={isAnalyzing} language={selectedLanguage} result={result} />
      </div>
    </div>
  );
}

export default DetectPage;

function DetectionForm({
  error,
  isAnalyzing,
  onAnalyze,
  onCropSelect,
  onFileSelect,
  onLanguageSelect,
  previewUrl,
  selectedCrop,
  selectedFile,
  selectedLanguage,
}) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
          <ImageUp aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-leaf-900">Upload leaf image</h2>
          <p className="text-sm text-leaf-700">Crop selection and image upload only.</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:gap-6">
        <div className="flex-1">
          <p className="mb-3 text-sm font-semibold text-leaf-900">Crop type</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
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
                  onClick={() => onCropSelect(crop.id)}
                  type="button"
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <Leaf aria-hidden="true" className="h-5 w-5" />
                    {isSelected ? <CheckCircle2 aria-hidden="true" className="h-5 w-5" /> : null}
                  </span>
                  <span className="text-base font-semibold">{crop.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:w-48">
          <p className="mb-3 text-sm font-semibold text-leaf-900">Advisory language</p>
          <div className="relative">
            <Globe aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-leaf-600" />
            <select
              className="w-full appearance-none rounded-2xl border border-leaf-200 bg-leaf-50 py-3 pl-9 pr-4 text-sm font-semibold text-leaf-900 transition hover:border-leaf-500 hover:bg-white focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-200"
              disabled={isAnalyzing}
              onChange={(e) => onLanguageSelect(e.target.value)}
              value={selectedLanguage}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-leaf-600">Only advisory text is translated.</p>
        </div>
      </div>

      <div className="flex-1">
        <ImageUploader
          disabled={isAnalyzing || !selectedCrop}
          onFileSelect={onFileSelect}
          previewUrl={previewUrl}
          selectedFile={selectedFile}
        />
      </div>

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
        onClick={onAnalyze}
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
  );
}
