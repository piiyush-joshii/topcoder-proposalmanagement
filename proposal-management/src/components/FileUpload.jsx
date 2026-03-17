import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import './FileUpload.css';

export default function FileUpload({ onFilesSelected, uploadProgress = {}, uploadedFiles = [] }) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setDragActive(false);
    if (onFilesSelected) onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const progressEntries = Object.entries(uploadProgress);

  return (
    <div className="file-upload-wrapper" id="file-upload-area">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
      >
        <input {...getInputProps()} id="file-input" />
        <div className="dropzone-content">
          <div className="dropzone-icon">
            <Upload size={28} />
          </div>
          <p className="dropzone-title">
            {isDragActive ? 'Drop files here...' : 'Drag & drop context documents'}
          </p>
          <p className="dropzone-subtitle">
            or <span className="dropzone-browse">browse files</span>
          </p>
          <p className="dropzone-hint">
            PDF, DOC, DOCX, TXT, CSV, XLS, XLSX • Max 25MB
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {progressEntries.length > 0 && (
        <div className="upload-progress-list">
          {progressEntries.map(([id, progress]) => (
            <div key={id} className="upload-progress-item">
              <File size={16} />
              <div className="upload-progress-bar-wrapper">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="upload-progress-text">{progress}%</span>
              </div>
              {progress === 100 && <CheckCircle size={16} className="text-success" />}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files" id="uploaded-files-list">
          <h4 className="uploaded-files-title">
            Uploaded Documents ({uploadedFiles.length})
          </h4>
          {uploadedFiles.map((doc) => (
            <div key={doc.id} className="uploaded-file-item">
              <div className="uploaded-file-info">
                <File size={16} className="uploaded-file-icon" />
                <div>
                  <p className="uploaded-file-name">{doc.name}</p>
                  <p className="uploaded-file-meta">{formatSize(doc.size)}</p>
                </div>
              </div>
              <CheckCircle size={16} className="text-success" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
