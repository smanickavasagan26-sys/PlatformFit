import React, { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp, faDownload, faCopy, faCheck,
  faRotateLeft, faImage, faArrowRight, faXmark,
} from '@fortawesome/free-solid-svg-icons';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

/**
 * Normalise a File's MIME type, falling back to extension when the browser
 * reports an empty string (common for .webp on some Windows installs).
 */
function resolveType(file) {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  const ext = file.name.split('.').pop().toLowerCase();
  const map = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
  return map[ext] ?? 'image/webp';
}

/** Return 'webp' | 'jpg' | 'png' for a MIME type string. */
function mimeToKey(mime) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png')  return 'png';
  return 'webp';
}

/**
 * Draw the image onto a canvas and return a Blob in the requested MIME type.
 * For JPEG, transparent pixels are filled white (no alpha in JPEG).
 */
function convertImage(imgSrc, mimeType, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      // PNG is lossless — never pass a quality value so the browser encodes at max fidelity
      if (mimeType === 'image/png') {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')),
          'image/png',
        );
      } else {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')),
          mimeType,
          quality / 100,
        );
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imgSrc;
  });
}

// ── All supported output formats ──────────────────────────────────────────────
const ALL_FORMATS = [
  { key: 'jpg',  label: '.JPG',  note: 'smaller',  mime: 'image/jpeg' },
  { key: 'png',  label: '.PNG',  note: 'lossless', mime: 'image/png'  },
  { key: 'webp', label: '.WEBP', note: 'modern',   mime: 'image/webp' },
];

// ── Drop zone ─────────────────────────────────────────────────────────────────
function ConvDropZone({ onFileLoaded }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const process = (file) => {
    if (!file) return;
    const type = resolveType(file);
    if (!type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onFileLoaded({ url, file, name: file.name, size: file.size, type });
  };

  return (
    <div
      className={`dropzone ${drag ? 'drag-over' : ''}`}
      style={{ minHeight: 220 }}
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => { e.preventDefault(); setDrag(false); process(e.dataTransfer.files?.[0]); }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/png,image/jpeg,.webp,.png,.jpg,.jpeg"
        className="visually-hidden"
        onChange={(e) => { process(e.target.files?.[0]); e.target.value = ''; }}
      />
      <div className="dz-icon">
        <FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 26 }} />
      </div>
      <p className="dz-title">{drag ? 'Drop to convert' : 'Upload Image'}</p>
      <p className="dz-sub">Drag &amp; drop or click to browse</p>
      <div className="dz-chips">
        <span className="dz-chip">WEBP</span>
        <span className="dz-chip">PNG</span>
        <span className="dz-chip">JPG</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WebpConverter({ showToast }) {
  const [source, setSource]         = useState(null);
  const [format, setFormat]         = useState('jpg');
  const [quality, setQuality]       = useState(88);
  const [outBlob, setOutBlob]       = useState(null);
  const [outUrl, setOutUrl]         = useState(null);
  const [outSize, setOutSize]       = useState(null);
  const [converting, setConverting] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [copying, setCopying]       = useState(false);
  const clipboardOk = typeof ClipboardItem !== 'undefined';

  // All three output formats always available, but same-type as source is blocked
  const sourceKey    = source ? mimeToKey(source.type) : null;
  const activeFormat = ALL_FORMATS.find(f => f.key === format) ?? ALL_FORMATS[0];
  const ext          = activeFormat.key;

  // Run conversion
  const runConvert = useCallback(async (src, fmt, q) => {
    if (!src) return;
    setConverting(true);
    try {
      const targetFmt = ALL_FORMATS.find(f => f.key === fmt) ?? ALL_FORMATS[0];
      const blob = await convertImage(src.url, targetFmt.mime, q);
      const url  = URL.createObjectURL(blob);
      setOutBlob(blob);
      setOutUrl(url);
      setOutSize(blob.size);
    } catch {
      showToast('Conversion failed — please try another file.');
    } finally {
      setConverting(false);
    }
  }, [showToast]);

  const handleFileLoaded = (file) => {
    if (source?.url) URL.revokeObjectURL(source.url);
    if (outUrl)      URL.revokeObjectURL(outUrl);
    setSource(file);
    setOutBlob(null); setOutUrl(null); setOutSize(null);

    // If the currently selected format matches the uploaded file type, switch to first other
    const srcKey = mimeToKey(file.type);
    const chosen = (format !== srcKey)
      ? format
      : (ALL_FORMATS.find(f => f.key !== srcKey)?.key ?? 'jpg');
    setFormat(chosen);
    runConvert(file, chosen, quality);
  };

  const handleFormatChange = (f) => {
    setFormat(f);
    if (source) runConvert(source, f, quality);
  };

  const qTimer = useRef(null);
  const handleQualityChange = (v) => {
    setQuality(v);
    clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => {
      if (source) runConvert(source, format, v);
    }, 120);
  };

  const handleReset = () => {
    if (source?.url) URL.revokeObjectURL(source.url);
    if (outUrl)      URL.revokeObjectURL(outUrl);
    setSource(null); setOutBlob(null); setOutUrl(null); setOutSize(null);
  };

  const handleDownload = () => {
    if (!outBlob) return;
    const a = document.createElement('a');
    a.href     = URL.createObjectURL(outBlob);
    a.download = `platformfit-converted-${Date.now()}.${ext}`;
    a.click();
    showToast(`✓ Downloaded as .${ext}!`);
    setShowModal(false);
  };

  const handleCopy = async () => {
    if (!outBlob || !clipboardOk) return;
    try {
      setCopying(true);
      // Clipboard API only accepts PNG
      const pngBlob = ext === 'png'
        ? outBlob
        : await convertImage(source.url, 'image/png', 100);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
      showToast('✓ Image copied to clipboard!');
      setShowModal(false);
    } catch { showToast('Copy failed — please use Download instead.'); }
    finally { setCopying(false); }
  };

  const savings = source && outSize != null
    ? Math.round((1 - outSize / source.size) * 100)
    : null;

  return (
    <div className="conv-root">

      {/* ── Toolbar ── */}
      <div className="conv-toolbar">
        <div className="conv-toolbar-left">
          <span className="conv-toolbar-label">Convert to</span>
          <div className="conv-format-tabs">
            {ALL_FORMATS.map(f => {
              const isBlocked = sourceKey === f.key;
              return (
                <button
                  key={f.key}
                  className={`conv-format-btn ${activeFormat?.key === f.key ? 'active' : ''} ${isBlocked ? 'conv-format-disabled' : ''}`}
                  onClick={() => !isBlocked && handleFormatChange(f.key)}
                  disabled={isBlocked}
                  title={isBlocked ? `Source is already .${f.key.toUpperCase()} — choose a different format` : undefined}
                >
                  {f.label}
                  <span className="conv-format-note">{isBlocked ? 'source' : f.note}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality slider — JPG and WEBP only; PNG is always lossless at max quality */}
        {(activeFormat?.key === 'jpg' || activeFormat?.key === 'webp') && (
          <div className="conv-quality-row">
            <span className="conv-toolbar-label">Quality</span>
            <input
              type="range"
              className="slider"
              min={1} max={100}
              value={quality}
              onChange={e => handleQualityChange(Number(e.target.value))}
              style={{ width: 110, background: `linear-gradient(to right, var(--amber) ${quality}%, var(--border) ${quality}%)` }}
            />
            <span className="q-val">{quality}</span>
          </div>
        )}
        {activeFormat?.key === 'png' && (
          <span className="conv-lossless-badge">✓ Lossless — max quality</span>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className="tool-grid" style={{ minHeight: 320 }}>

        {/* LEFT — drop zone or source preview */}
        <div className="upload-panel">
          <div className="panel-header">
            <span className="panel-label">
              {!source ? '① Upload Image' : `✓ Source · .${sourceKey?.toUpperCase()}`}
            </span>
            {source && (
              <button
                className="btn-sm ghost"
                style={{ width: 'auto', padding: '5px 11px', fontSize: '0.7rem' }}
                onClick={handleReset}
              >
                <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: 11 }} /> New
              </button>
            )}
          </div>
          <div className="panel-body">
            {!source ? (
              <ConvDropZone onFileLoaded={handleFileLoaded} />
            ) : (
              <div style={{
                flex: 1, borderRadius: 'var(--r-lg)', overflow: 'hidden',
                border: '1.5px solid var(--border)', minHeight: 220,
                background: '#1a1714', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={source.url}
                  alt="Source"
                  style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — converted preview */}
        <div className="preview-panel">
          <div className="panel-header">
            <span className="panel-label">② Output .{ext.toUpperCase()} Preview</span>
            {outSize != null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
                {savings > 0 ? `↓ ${savings}% smaller` : savings < 0 ? `↑ ${Math.abs(savings)}% larger` : 'Same size'}
              </span>
            )}
          </div>
          <div className="preview-body">
            {outUrl ? (
              <div style={{
                flex: 1, minHeight: 220, borderRadius: 'var(--r-lg)',
                overflow: 'hidden', border: '1.5px solid var(--border)',
                background: '#1a1714', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={outUrl}
                  alt={`Converted .${ext}`}
                  style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
                />
              </div>
            ) : (
              <div className="preview-placeholder" style={{ minHeight: 220 }}>
                <FontAwesomeIcon icon={faImage} style={{ fontSize: 36, opacity: 0.35 }} />
                <p>{converting ? 'Converting…' : 'Preview will appear here'}</p>
                <p style={{ fontSize: '0.72rem' }}>Upload an image to get started</p>
              </div>
            )}

            <div className="size-ticker">
              <div className="ticker-col">
                <span className="ticker-lbl">Original</span>
                <span className="ticker-val">{source ? formatBytes(source.size) : '—'}</span>
              </div>
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 14, color: 'var(--text-3)' }} />
              <div className="ticker-col right">
                <span className="ticker-lbl">.{ext.toUpperCase()} Output</span>
                <span className={`ticker-val ${outSize ? 'green' : ''}`}>
                  {converting ? '…' : outSize ? formatBytes(outSize) : '—'}
                </span>
              </div>
            </div>

            {savings !== null && !converting && (
              <div className={`savings-pill ${savings > 0 ? 'good' : savings === 0 ? 'neutral' : 'bad'}`}>
                {savings > 0
                  ? `🎉 ${savings}% smaller as .${ext.toUpperCase()}`
                  : savings === 0
                    ? 'Same file size'
                    : `⚠ .${ext.toUpperCase()} is ${Math.abs(savings)}% larger`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Export bar ── */}
      <div className="tool-export-bar">
        <p>
          {!outBlob
            ? 'Upload an image to unlock export.'
            : `Ready — .${sourceKey?.toUpperCase()} → .${ext.toUpperCase()} · ${formatBytes(outSize)}`}
        </p>
        <button
          className="export-btn"
          disabled={!outBlob || converting}
          onClick={() => setShowModal(true)}
        >
          <FontAwesomeIcon icon={faDownload} style={{ fontSize: 14 }} />
          Export .{ext.toUpperCase()}
        </button>
      </div>

      {/* ── Export modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Export as .{ext.toUpperCase()}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
              </button>
            </div>
            <div className="modal-body">

              {outUrl && (
                <div className="modal-thumb">
                  <img src={outUrl} alt="Converted preview" />
                </div>
              )}

              <div className="modal-details">
                <div className="detail-card">
                  <div className="detail-label">Source Format</div>
                  <div className="detail-value">.{sourceKey?.toUpperCase() ?? '—'}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Output Format</div>
                  <div className="detail-value brand">.{ext.toUpperCase()}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Original Size</div>
                  <div className="detail-value">{source ? formatBytes(source.size) : '—'}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Converted Size</div>
                  <div className="detail-value green">{outSize ? formatBytes(outSize) : '—'}</div>
                </div>
                {(ext === 'jpg' || ext === 'webp') && (
                  <div className="detail-card">
                    <div className="detail-label">Quality</div>
                    <div className="detail-value brand">{quality} / 100</div>
                  </div>
                )}
                <div className="detail-card">
                  <div className="detail-label">Savings</div>
                  <div className={`detail-value ${savings > 0 ? 'green' : ''}`}>
                    {savings !== null
                      ? savings > 0 ? `${savings}% smaller`
                      : savings < 0 ? `${Math.abs(savings)}% larger`
                      : 'Same'
                      : '—'}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-full primary" onClick={handleDownload} disabled={!outBlob}>
                  <FontAwesomeIcon icon={faDownload} style={{ fontSize: 14 }} />
                  Download as .{ext}
                </button>
                {clipboardOk ? (
                  <button className="btn-full secondary" onClick={handleCopy} disabled={!outBlob || copying}>
                    {copying
                      ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />
                      : <FontAwesomeIcon icon={faCopy} style={{ fontSize: 14 }} />}
                    {copying ? 'Copied!' : 'Copy Image to Clipboard'}
                  </button>
                ) : (
                  <p className="no-clipboard">Clipboard API not supported — please use Download.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
