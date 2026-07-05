import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

export default function DropZone({ onImageLoaded }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onImageLoaded({ url, file, name: file.name, size: file.size });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    // Reset so same file can be re-uploaded
    e.target.value = '';
  };

  return (
    <div
      className={`dropzone ${isDragging ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragLeave}
      role="button"
      tabIndex={0}
      aria-label="Upload image"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="visually-hidden"
        onChange={handleInputChange}
      />

      <div className="dz-icon-bg">
        <FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 30 }} />
      </div>

      <p className="dz-title">
        {isDragging ? 'Drop to upload' : 'Drop an image, or click to upload'}
      </p>
      <p className="dz-sub">
        Choose a photo, screenshot, or banner to crop and optimize for any platform.
      </p>

      <div className="dz-hint">
        <span className="dz-chip">PNG</span>
        <span className="dz-chip">JPG</span>
        <span className="dz-chip">WEBP</span>
      </div>
    </div>
  );
}
