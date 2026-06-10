import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from './Modal';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  actionLabel?: string;
  currentFileName?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const SUPPORTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/webm'];
const SUPPORTED_EXTENSIONS = ['.wav', '.mp3', '.aiff', '.aac', '.ogg', '.flac', '.webm'];

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  actionLabel = 'Upload & Transcribe',
  currentFileName,
}) => {
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Audio File"
      maxWidth="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="yap-ghost-button px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)] hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="yap-violet-button px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-[var(--yap-surface-3)] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      }
    >
        <div className="space-y-4">
          {currentFileName && !selectedFile && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Currently loaded file
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-200 truncate mt-1">
                    {currentFileName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Panel */}
          <div className="yap-glass-card bg-blue-50 dark:bg-[rgba(255,255,255,0.035)] border border-blue-200 dark:border-[var(--yap-glass-border)] rounded-lg p-4">
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
              "yap-drop-zone relative rounded-xl p-8 transition-all",
              dragActive 
                ? "is-drag-active border-purple-500 bg-purple-50 dark:bg-[var(--yap-violet-mist)]" 
                : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-[var(--yap-violet-ring)]",
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
                <div className="p-4 rounded-full bg-gray-100 dark:bg-[var(--yap-violet-mist)] mb-4">
                  <Upload size={32} className="text-gray-400 dark:text-[var(--yap-violet-hover)]" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-1)] mb-2">
                  Drag & drop your audio file here
                </p>
                <p className="text-xs text-gray-500 dark:text-[var(--yap-text-2)] mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="yap-violet-button px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
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
                    <p className="text-sm font-medium text-gray-900 dark:text-[var(--yap-text-1)] truncate">
                      {selectedFile.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[var(--yap-text-2)]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 dark:text-[var(--yap-violet-hover)] mt-2 font-medium"
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
    </Modal>
  );
};

