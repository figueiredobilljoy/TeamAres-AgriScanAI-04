import { UploadCloud } from 'lucide-react';
import React from 'react';
import { useRef, useState } from 'react';

function ImageUploader({ disabled, onFileSelect, previewUrl, selectedFile }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleInputChange = (event) => {
    selectFile(event.target.files?.[0]);
  };

  const openPicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div>
      <button
        className={`group relative flex min-h-72 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition duration-200 ${
          isDragging
            ? 'border-leaf-600 bg-leaf-100'
            : 'border-leaf-200 bg-leaf-50/80 hover:border-leaf-500 hover:bg-leaf-100/80'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        disabled={disabled}
        onClick={openPicker}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        {previewUrl ? (
          <>
            <img
              alt="Uploaded crop preview"
              className="absolute inset-0 h-full w-full object-cover"
              src={previewUrl}
            />
            <div className="absolute inset-0 bg-leaf-950/30 transition duration-200 group-hover:bg-leaf-950/40" />
            <div className="relative z-10 rounded-2xl bg-white/90 px-4 py-3 shadow-lg">
              <p className="max-w-xs truncate text-sm font-semibold text-leaf-900">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-leaf-700">Click or drop to replace image</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-leaf-700 shadow-md transition duration-200 group-hover:-translate-y-1">
              <UploadCloud aria-hidden="true" className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-leaf-900">Drop your crop image here</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-leaf-700">
              Drag and drop a clear leaf photo, or click to choose one from your device.
            </p>
          </>
        )}
      </button>

      <input
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />

      {selectedFile ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800">
          <span className="min-w-0 truncate">{selectedFile.name}</span>
          <span className="shrink-0 text-leaf-600">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default ImageUploader;
