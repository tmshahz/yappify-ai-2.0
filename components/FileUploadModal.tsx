import React, { useState, useRef } from 'react';
import { X, Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const SUPPORTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/webm'];
const SUPPORTED_EXTENSIONS = ['.wav', '.mp3', '.aiff', '.aac', '.ogg', '.flac', '.webm'];

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 20MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = SUPPORTED_FORMATS.some(format => file.type.includes(format.split('/')[1])) ||
                       SUPPORTED_EXTENSIONS.includes(fileExtension || '');
    
    if (!isValidType) {
      return `Unsupported file format. Please use: ${SUPPORTED_EXTENSIONS.join(', ')}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
          <h2 className="text-lg font-semibold dark:text-white">Upload Audio File</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info Panel */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
                <p className="font-medium">File Requirements:</p>
                <ul className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Max size: <strong>20MB</strong></li>
                  <li>• Formats: <strong>WAV, MP3, AIFF, AAC, OGG, FLAC, WEBM</strong></li>
                  <li>• Max duration: <strong>~9 hours</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={clsx(
              "relative border-2 border-dashed rounded-xl p-8 transition-all",
              dragActive 
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600",
              selectedFile && "border-green-500 bg-green-50 dark:bg-green-900/20"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_EXTENSIONS.join(',')}
              onChange={handleChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Upload size={32} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drag & drop your audio file here
                </p>
                <p className="text-xs text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <File size={16} className="text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {selectedFile.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 mt-2 font-medium"
                  >
                    Choose different file
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Upload & Transcribe
          </button>
        </div>
      </div>
    </div>
  );
};

