import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp, faDownload, faCopy, faCheck,
  faRotateLeft, faScissors, faChevronDown, faArrowRight,
  faLeftRight, faImage, faBolt, faShield, faXmark
} from '@fortawesome/free-solid-svg-icons';
import { PRESETS, DEFAULT_PRESET_ID, DEFAULT_QUALITY, LS_PRESET_KEY, LS_QUALITY_KEY } from './utils/presets';
import BlogSection from './components/BlogSection';
import WebpConverter from './components/WebpConverter';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function getCroppedCanvas(imageSrc, pixelCrop, outW, outH) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      canvas.getContext('2d').drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);
      resolve(canvas);
    };
    img.src = imageSrc;
  });
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── CompareSlider ─────────────────────────────────────────────────────────────
function CompareSlider({ beforeSrc, afterSrc }) {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef(null);
  const dragging = useRef(false);

  const update = useCallback((clientX) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onMouseDown = (e) => {
    e.preventDefault(); dragging.current = true; update(e.clientX);
    const up = () => { dragging.current = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    const move = (e) => { if (dragging.current) update(e.clientX); };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  };
  const onTouchStart = (e) => { dragging.current = true; update(e.touches[0].clientX); };
  const onTouchMove  = (e) => { if (dragging.current) update(e.touches[0].clientX); };
  const onTouchEnd   = () => { dragging.current = false; };

  return (
    <div ref={wrapRef} className="compare-wrapper"
      style={{ height: '100%', minHeight: 240 }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      <div className="compare-before">
        <img src={beforeSrc} alt="Original" className="compare-img" draggable={false} />
      </div>
      <div className="compare-after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={afterSrc} alt="Compressed" className="compare-img" draggable={false} />
      </div>
      <div className="compare-divider" style={{ left: `${pos}%` }}>
        <div className="compare-handle"><FontAwesomeIcon icon={faLeftRight} style={{ fontSize: 13 }} /></div>
      </div>
      <span className="compare-label before">Original</span>
      <span className="compare-label after">Compressed</span>
    </div>
  );
}

// ── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ onImageLoaded }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const process = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onImageLoaded({ url, file, name: file.name, size: file.size });
  };

  return (
    <div
      className={`dropzone ${isDragging ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); process(e.dataTransfer.files?.[0]); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp"
        className="visually-hidden"
        onChange={(e) => { process(e.target.files?.[0]); e.target.value = ''; }}
      />
      <div className="dz-icon"><FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 26 }} /></div>
      <p className="dz-title">{isDragging ? 'Drop to upload' : 'Upload Image'}</p>
      <p className="dz-sub">Drag &amp; drop or click to browse</p>
      <div className="dz-chips">
        <span className="dz-chip">PNG</span>
        <span className="dz-chip">JPG</span>
        <span className="dz-chip">WEBP</span>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // Persisted prefs
  const [presetId, setPresetId] = useState(() => localStorage.getItem(LS_PRESET_KEY) || DEFAULT_PRESET_ID);
  const [quality, setQuality]   = useState(() => Number(localStorage.getItem(LS_QUALITY_KEY)) || DEFAULT_QUALITY);
  const preset = PRESETS.find(p => p.id === presetId) || PRESETS[0];

  useEffect(() => localStorage.setItem(LS_PRESET_KEY, presetId),  [presetId]);
  useEffect(() => localStorage.setItem(LS_QUALITY_KEY, quality), [quality]);

  // Image state
  const [image, setImage]                 = useState(null);
  const [crop, setCrop]                   = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                   = useState(1);
  const [croppedAreaPx, setCroppedAreaPx] = useState(null);
  const [isCropDone, setIsCropDone]       = useState(false);

  // Output state
  const [origPreviewUrl, setOrigPreviewUrl] = useState(null);
  const [compUrl, setCompUrl]               = useState(null);
  const [compSize, setCompSize]             = useState(null);
  const [compBlob, setCompBlob]             = useState(null);
  const [isOptimal, setIsOptimal]           = useState(false);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState(null);
  const [copying, setCopying]     = useState(false);
  const clipboardOk = typeof ClipboardItem !== 'undefined';
  const toolRef = useRef(null);

  // Reset when new image loaded
  const loadImage = (img) => {
    setImage(img);
    setCrop({ x: 0, y: 0 }); setZoom(1);
    setCroppedAreaPx(null); setIsCropDone(false);
    setOrigPreviewUrl(null); setCompUrl(null);
    setCompSize(null); setCompBlob(null); setIsOptimal(false);
  };

  const onCropComplete = useCallback((_, px) => setCroppedAreaPx(px), []);

  // Canvas compression pipeline
  const runCompression = useCallback(async (pixels, q, p, imgUrl, origSize) => {
    if (!pixels || !imgUrl) return;
    const canvas = await getCroppedCanvas(imgUrl, pixels, p.width, p.height);
    setOrigPreviewUrl(canvas.toDataURL('image/png'));
    canvas.toBlob((blob) => {
      if (!blob) return;
      setIsOptimal(blob.size >= origSize);
      setCompSize(blob.size);
      const url = URL.createObjectURL(blob);
      setCompUrl(url); setCompBlob(blob);
    }, 'image/webp', q / 100);
  }, []);

  const debouncedCompress = useRef(
    debounce((px, q, p, url, sz) => runCompression(px, q, p, url, sz), 100)
  ).current;

  useEffect(() => {
    if (isCropDone && croppedAreaPx && image)
      debouncedCompress(croppedAreaPx, quality, preset, image.url, image.size);
  }, [quality, preset, isCropDone, croppedAreaPx, image, debouncedCompress]);

  const handleApplyCrop = async () => {
    if (!croppedAreaPx || !image) return;
    setIsCropDone(true);
    await runCompression(croppedAreaPx, quality, preset, image.url, image.size);
  };

  const handleReset = () => {
    setIsCropDone(false);
    setOrigPreviewUrl(null); setCompUrl(null);
    setCompSize(null); setCompBlob(null); setIsOptimal(false);
  };

  // Download
  const handleDownload = () => {
    if (!compBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(compBlob);
    a.download = `platformfit-${preset.id}-${Date.now()}.webp`;
    a.click();
    showToast('✓ Downloaded successfully!');
    setShowModal(false);
  };

  // Copy
  const handleCopy = async () => {
    if (!compBlob || !clipboardOk) return;
    try {
      setCopying(true);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': compBlob })]);
      showToast('✓ Image copied to clipboard!');
      setShowModal(false);
    } catch { showToast('Copy failed — please use Download instead.'); }
    finally { setCopying(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const savings = image && compSize != null
    ? Math.round((1 - compSize / image.size) * 100)
    : null;

  // Scroll to tool on CTA click
  const scrollToTool = () => toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">P</div>
            <div className="logo-text">
              <h1>PlatformFit</h1>
              <p>Visual Asset Optimizer</p>
            </div>
          </div>
          <a
            href="https://techbasics.online"
            target="_blank"
            rel="noopener noreferrer"
            className="visit-blog-btn"
          >
            Visit Our Blog ↗
          </a>
        </div>
      </header>

      <div className="page-wrapper">

        {/* ── HERO SECTION ── */}
        <section className="hero-section">
          <div className="hero-badge">✦ Free · No signup · 100% Private</div>
          <h2 className="hero-title">
            Resize &amp; Compress Images<br />
            for <span>Any Platform</span>, Instantly.
          </h2>
          <p className="hero-desc">
            Drop your image, pick a platform preset — OG Share Card, LinkedIn Banner, X Header,
            App Store Screenshot and more — then export a pixel-perfect WebP in seconds.
            Or convert any WebP to JPG / PNG instantly. Your files never leave your device.
          </p>
          <button className="hero-cta" onClick={scrollToTool}>
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 16 }} />
            Get Started — It's Free
          </button>
          <div className="hero-sub">
            <span className="hero-sub-item">✓ No upload to server</span>
            <span className="hero-sub-item">✓ No account required</span>
            <span className="hero-sub-item">✓ WebP · JPG · PNG export</span>
          </div>
        </section>

        {/* ── TOOL SECTION ── */}
        <section ref={toolRef} className="tool-section">

          {/* Preset grid header */}
          <div className="preset-header">
            <span className="preset-header-label">Platform Preset</span>
            <div className="preset-grid">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`preset-tile ${presetId === p.id ? 'active' : ''}`}
                  onClick={() => { setPresetId(p.id); if (isCropDone) handleReset(); }}
                  title={p.description}
                >
                  <span className="preset-tile-icon">{p.icon}</span>
                  <span className="preset-tile-name">{p.label}</span>
                  <span className="preset-tile-dim">{p.width}×{p.height}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload + Preview grid */}
          <div className="tool-grid">

            {/* LEFT: Upload / Crop */}
            <div className="upload-panel">
              <div className="panel-header">
                <span className="panel-label">
                  {!image ? '① Upload' : isCropDone ? '✓ Cropped' : '② Crop'}
                </span>
                {image && (
                  <button className="btn-sm ghost" style={{ width:'auto', padding:'5px 11px', fontSize:'0.7rem' }}
                    onClick={() => { setImage(null); handleReset(); }}>
                    <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: 11 }} /> New
                  </button>
                )}
              </div>

              <div className="panel-body">
                {!image ? (
                  <DropZone onImageLoaded={loadImage} />
                ) : !isCropDone ? (
                  <>
                    <div className="crop-workspace" style={{ flex:1, minHeight:240 }}>
                      <div className="crop-bar">
                        <span className="crop-badge">{preset.label}</span>
                        <span className="crop-badge indigo">{preset.width}×{preset.height}</span>
                      </div>
                    <Cropper
                        image={image.url}
                        crop={crop} zoom={zoom}
                        aspect={preset.aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{ containerStyle: { background:'#1a1714', borderRadius:'12px', height:240, position:'relative' } }}
                      />
                    </div>
                    <div className="crop-actions">
                      <button className="btn-sm primary" onClick={handleApplyCrop}>
                        <FontAwesomeIcon icon={faScissors} style={{ fontSize: 12 }} /> Apply Crop &amp; Preview
                      </button>
                    </div>
                    <p style={{ fontSize:'0.68rem', color:'var(--text-3)', textAlign:'center' }}>
                      Scroll to zoom · Drag to reposition
                    </p>
                  </>
                ) : (
                  <div style={{ flex:1, borderRadius:'var(--r-lg)', overflow:'hidden', border:'1.5px solid var(--border)', minHeight:240, background:'#1a1714', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {origPreviewUrl
                      ? <img src={origPreviewUrl} alt="Cropped" style={{ maxWidth:'100%', maxHeight:280, objectFit:'contain', display:'block' }} />
                      : <span style={{ color:'var(--text-3)', fontSize:'0.8rem' }}>Processing…</span>
                    }
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Size / Preview */}
            <div className="preview-panel">
              <div className="panel-header">
                <span className="panel-label">③ Size &amp; Preview</span>
                {compSize != null && (
                  <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--success)', fontFamily:'var(--font-display)' }}>
                    {savings > 0 ? `↓ ${savings}% smaller` : 'Optimized'}
                  </span>
                )}
              </div>

              <div className="preview-body">
                {/* Compare Slider or placeholder */}
                {origPreviewUrl && compUrl ? (
                  <div style={{ flex:1, minHeight:240, borderRadius:'var(--r-lg)', overflow:'hidden', border:'1.5px solid var(--border)' }}>
                    <CompareSlider beforeSrc={origPreviewUrl} afterSrc={compUrl} />
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <FontAwesomeIcon icon={faImage} style={{ fontSize: 36, opacity: 0.35 }} />
                    <p>Preview will appear here</p>
                    <p style={{ fontSize:'0.72rem' }}>Upload → Crop → See the result</p>
                  </div>
                )}

                {/* Size ticker */}
                <div className="size-ticker">
                  <div className="ticker-col">
                    <span className="ticker-lbl">Original</span>
                    <span className="ticker-val">{image ? formatBytes(image.size) : '—'}</span>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 14, color: 'var(--text-3)' }} />
                  <div className="ticker-col right">
                    <span className="ticker-lbl">Compressed</span>
                    <span className={`ticker-val ${compSize ? 'green' : ''}`}>{compSize ? formatBytes(compSize) : '—'}</span>
                  </div>
                </div>
                {savings !== null && (
                  <div className={`savings-pill ${savings > 0 ? 'good' : savings === 0 ? 'neutral' : 'bad'}`}>
                    {savings > 0 ? `🎉 ${savings}% file size saved` : savings === 0 ? 'Same file size' : '⚠ Original was smaller'}
                  </div>
                )}
                {isOptimal && <p className="optimal-notice">Original was already optimal — exporting as-is.</p>}

                {/* Quality slider */}
                <div className="quality-row">
                  <label>Quality</label>
                  <input type="range" className="slider" min={1} max={100} value={quality}
                    onChange={e => setQuality(Number(e.target.value))}
                    style={{ background:`linear-gradient(to right, var(--amber) ${quality}%, var(--border) ${quality}%)` }}
                  />
                  <span className="q-val">{quality}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Export bar */}
          <div className="tool-export-bar">
            <p>
              {!compBlob
                ? 'Upload and crop your image to unlock export options.'
                : `Ready to export as "${preset.label}" — ${preset.width}×${preset.height}px WebP`}
            </p>
            <button
              className="export-btn"
              disabled={!compBlob}
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: 14 }} />
              Export
            </button>
          </div>

        </section>
        <section className="other-conv-section">
          <div className="other-conv-header">
            <div className="seo-label">⇄ Other Conversions</div>
            <h2 className="other-conv-title">Convert WebP · JPG · PNG</h2>
            <p className="other-conv-desc">
              Upload any image and convert it to JPG, PNG, or WebP instantly —
              100% in your browser, no account needed.
            </p>
          </div>
          <WebpConverter showToast={showToast} />
        </section>

        {/* ── SEO SECTION ── */}
        <section className="seo-section">
          <div className="seo-label">✦ Why PlatformFit</div>
          <h2 className="seo-title">The Fastest Way to Resize &amp; Compress Images for Social Media</h2>
          <p className="seo-desc">
            PlatformFit is a 100% client-side image optimizer built for indie hackers, founders, and content creators.
            No sign-up. No server uploads. Just drop your image, pick a platform preset, and export a pixel-perfect WebP
            in seconds — with live before/after comparison and real-time file size savings.
          </p>
          <div className="seo-grid">
            <div className="seo-card">
              <div className="seo-card-icon"><FontAwesomeIcon icon={faShield} style={{ fontSize: 16 }} /></div>
              <div className="seo-card-title">100% Private</div>
              <div className="seo-card-desc">Your images are processed entirely in your browser. No files are ever uploaded to any server.</div>
            </div>
            <div className="seo-card">
              <div className="seo-card-icon"><FontAwesomeIcon icon={faBolt} style={{ fontSize: 16 }} /></div>
              <div className="seo-card-title">7 Platform Presets</div>
              <div className="seo-card-desc">OG Share Card, X Post &amp; Header, LinkedIn Banner &amp; Post, App Store Screenshot, and Square — all the exact pixel dimensions.</div>
            </div>
            <div className="seo-card">
              <div className="seo-card-icon"><FontAwesomeIcon icon={faImage} style={{ fontSize: 16 }} /></div>
              <div className="seo-card-title">WebP Export</div>
              <div className="seo-card-desc">Export in modern WebP format with a quality slider. Up to 80% smaller than PNG with no visible quality loss.</div>
            </div>
          </div>
        </section>

        {/* ── BLOG SECTION ── */}
        <BlogSection />

      </div>{/* end page-wrapper */}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-mark">P</div>
            <span className="footer-name">PlatformFit</span>
          </div>
          <span className="footer-copy">© {new Date().getFullYear()} PlatformFit · Images never leave your device</span>
          <div className="footer-right">
            <a href="https://techbasics.online" target="_blank" rel="noopener noreferrer" className="footer-blog-link">
              Visit TechBasic Blog ↗
            </a>
            {/* tinystartups · Launched on Tiny Startups stamp (light) */}
            <a href="https://www.tinystartups.com/startup/platformfit" target="_blank" rel="noopener noreferrer"
               style={{
                 display: 'inline-flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 gap: '8px',
                 padding: '22px 28px 20px',
                 borderRadius: '18px',
                 textDecoration: 'none',
                 fontFamily: "'Inter', system-ui, sans-serif",
                 background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#3525E6,#D81FE0,#22B8F0) border-box',
                 border: '2.5px solid transparent',
                 width: '220px',
                 textAlign: 'center',
                 color: '#0E0B1F'
               }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#6A6585'
              }}>Launched on</span>
              <svg width="76" height="76" viewBox="0 0 100 100">
                <defs><linearGradient id="tsg2" x1=".1" y1="0" x2=".9" y2="1">
                  <stop offset="0%" stopColor="#3525E6"/><stop offset="55%" stopColor="#D81FE0"/><stop offset="100%" stopColor="#22B8F0"/>
                </linearGradient></defs>
                <path d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z" fill="url(#tsg2)"/>
              </svg>
              <span style={{
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '-0.025em',
                color: '#0E0B1F',
                lineHeight: '1.1'
              }}>PlatformFit</span>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#6A6585'
              }}>July 6, 2026</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#0E0B1F',
                marginTop: '10px',
                paddingTop: '12px',
                borderTop: '1px solid #ECEAF3',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <svg width="14" height="14" viewBox="0 0 100 100"><defs><linearGradient id="tsgm" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0%" stopColor="#3525E6"/><stop offset="55%" stopColor="#D81FE0"/><stop offset="100%" stopColor="#22B8F0"/></linearGradient></defs><path d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z" fill="url(#tsgm)"/></svg> tinystartups
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* ── EXPORT MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Export Image</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
              </button>
            </div>
            <div className="modal-body">

              {/* Thumbnail */}
              {compUrl && (
                <div className="modal-thumb">
                  <img src={compUrl} alt="Compressed preview" />
                </div>
              )}

              {/* Details grid */}
              <div className="modal-details">
                <div className="detail-card">
                  <div className="detail-label">Preset</div>
                  <div className="detail-value brand">{preset.label}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Output Size</div>
                  <div className="detail-value">{preset.width} × {preset.height}px</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Original Size</div>
                  <div className="detail-value">{image ? formatBytes(image.size) : '—'}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Compressed Size</div>
                  <div className="detail-value green">{compSize ? formatBytes(compSize) : '—'}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Quality</div>
                  <div className="detail-value brand">{quality} / 100</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Savings</div>
                  <div className={`detail-value ${savings > 0 ? 'green' : ''}`}>
                    {savings !== null ? (savings > 0 ? `${savings}% smaller` : 'No savings') : '—'}
                  </div>
                </div>
              </div>

              {isOptimal && <p className="optimal-notice">Original was already optimal — exporting at full quality.</p>}

              {/* Export options */}
              <div className="modal-actions">
                <button className="btn-full primary" onClick={handleDownload} disabled={!compBlob}>
                  <FontAwesomeIcon icon={faDownload} style={{ fontSize: 14 }} />
                  Download as .webp
                </button>
                {clipboardOk ? (
                  <button className="btn-full secondary" onClick={handleCopy} disabled={!compBlob || copying}>
                    {copying
                      ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />
                      : <FontAwesomeIcon icon={faCopy} style={{ fontSize: 14 }} />
                    }
                    {copying ? 'Copied!' : 'Copy Image to Clipboard'}
                  </button>
                ) : (
                  <p className="no-clipboard">Clipboard API not supported in this browser — please use Download.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
