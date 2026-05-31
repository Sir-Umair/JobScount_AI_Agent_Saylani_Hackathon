'use client';

import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
          onFileSelect(file);
        } else {
          alert('Please upload a PDF or DOCX file.');
        }
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`${styles.container} ${isDragActive ? styles.dragActive : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      role="button"
      aria-label="Upload CV"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className={styles.hiddenInput}
        disabled={isLoading}
        aria-hidden="true"
      />

      <UploadCloud size={48} className={styles.icon} />
      <h3 className={styles.title}>Upload your CV</h3>
      <p className={styles.subtitle}>Drag & drop your PDF or DOCX here, or click to browse</p>

      <button type="button" className={styles.selectButton} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Select File'}
      </button>

      {isLoading && (
        <div className={styles.loadingOverlay} role="alert" aria-live="assertive">
          <Loader2 size={32} className={`animate-spin ${styles.spinner}`} />
          <p className={styles.loadingText}>Analyzing CV with AI…</p>
        </div>
      )}
    </div>
  );
}
