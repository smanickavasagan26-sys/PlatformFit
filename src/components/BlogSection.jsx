import React, { useState } from 'react';

// ── FAQ data — answers secondary SEO keywords inline ─────────────────────────
const FAQS = [
  {
    id: 'linkedin',
    tag: 'Platform Sizes',
    tagColor: 'amber',
    question: 'What are the correct LinkedIn image sizes?',
    answer: (
      <>
        <p>LinkedIn has different requirements for each image type:</p>
        <ul>
          <li><strong>Banner / Cover photo</strong> — 1584 × 396 px (4:1 ratio)</li>
          <li><strong>Profile photo</strong> — 400 × 400 px (minimum)</li>
          <li><strong>Post image</strong> — 1200 × 1200 px (square) or 1200 × 628 px (landscape)</li>
          <li><strong>Company logo</strong> — 300 × 300 px</li>
        </ul>
        <p>PlatformFit's <em>LinkedIn Banner</em> and <em>LinkedIn Post</em> presets crop and export at exactly these dimensions.</p>
      </>
    ),
  },
  {
    id: 'twitter',
    tag: 'Platform Sizes',
    tagColor: 'amber',
    question: 'What size is the Twitter / X header image?',
    answer: (
      <>
        <p>X (Twitter) has three main image slots:</p>
        <ul>
          <li><strong>Header / Banner</strong> — 1500 × 500 px (3:1 ratio)</li>
          <li><strong>Post image</strong> — 1200 × 675 px (16:9 ratio)</li>
          <li><strong>Profile photo</strong> — 400 × 400 px, displayed as a circle</li>
        </ul>
        <p>Use the <em>X Header</em> and <em>X Post</em> presets in PlatformFit to get a pixel-perfect crop every time.</p>
      </>
    ),
  },
  {
    id: 'instagram',
    tag: 'Platform Sizes',
    tagColor: 'amber',
    question: 'What are the best Instagram post image sizes?',
    answer: (
      <>
        <p>Instagram supports multiple aspect ratios. The recommended pixel sizes are:</p>
        <ul>
          <li><strong>Square post</strong> — 1080 × 1080 px (1:1) — safest, works everywhere</li>
          <li><strong>Portrait post</strong> — 1080 × 1350 px (4:5) — maximum feed real estate</li>
          <li><strong>Landscape post</strong> — 1080 × 566 px (1.91:1)</li>
          <li><strong>Stories / Reels</strong> — 1080 × 1920 px (9:16)</li>
        </ul>
        <p>The <em>Square</em> preset (1080 × 1080) in PlatformFit covers the most common Instagram use case.</p>
      </>
    ),
  },
  {
    id: 'webp-vs-jpg',
    tag: 'Format Guide',
    tagColor: 'blue',
    question: 'WebP vs JPG — which format should I use?',
    answer: (
      <>
        <p><strong>WebP</strong> is Google's modern image format. It produces files 25–35% smaller than JPG at the same visual quality, and it's supported by all major browsers (Chrome, Firefox, Safari, Edge).</p>
        <p><strong>Use WebP when:</strong> publishing images on a website, social media, or any modern platform where file size affects load speed.</p>
        <p><strong>Stick with JPG when:</strong> sending images by email, uploading to legacy systems, or sharing with people on older devices that may not support WebP.</p>
        <p>PlatformFit exports in WebP by default — you get maximum quality at the smallest possible file size with zero extra effort.</p>
      </>
    ),
  },
  {
    id: 'png-vs-webp',
    tag: 'Format Guide',
    tagColor: 'blue',
    question: 'PNG vs WebP — when does transparency matter?',
    answer: (
      <>
        <p>Both PNG and WebP support transparent backgrounds (alpha channel), but they behave differently:</p>
        <ul>
          <li><strong>PNG</strong> — lossless, perfect transparency, large file size. Best for logos, icons, and UI screenshots.</li>
          <li><strong>WebP (lossless)</strong> — same perfect transparency as PNG but typically 25% smaller. Ideal for web assets.</li>
          <li><strong>WebP (lossy)</strong> — smallest size, but slight quality reduction. Not recommended for sharp-edged logos.</li>
        </ul>
        <p>If you need a transparent WebP for social media posts, PlatformFit's WebP export preserves the alpha channel automatically.</p>
      </>
    ),
  },
  {
    id: 'crop-quality',
    tag: 'Best Practices',
    tagColor: 'green',
    question: 'How do I crop images without losing quality?',
    answer: (
      <>
        <p>Quality loss during cropping usually comes from two mistakes — starting with a low-resolution source, or re-compressing an already-compressed image. Here's how to avoid both:</p>
        <ul>
          <li><strong>Always start from the highest-resolution original</strong> — never crop a previously exported or compressed file.</li>
          <li><strong>Use aspect-ratio-locked cropping</strong> — PlatformFit locks the crop frame to the exact ratio of your chosen preset, so the output always matches the target dimensions without stretching.</li>
          <li><strong>Export at quality 80–90</strong> — the sweet spot where WebP files are 60–80% smaller than PNG with no visible degradation.</li>
          <li><strong>Avoid double-compression</strong> — download once, use that file. Each re-export introduces additional loss.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'convert-webp-to-jpg',
    tag: 'Converter Guide',
    tagColor: 'blue',
    question: 'How do I convert WebP to JPG online — free?',
    answer: (
      <>
        <p>Use PlatformFit's built-in <em>Convert WebP</em> tab — no signup, no server upload, completely free:</p>
        <ul>
          <li><strong>Step 1</strong> — Click the <em>Convert WebP</em> tab at the top of the tool.</li>
          <li><strong>Step 2</strong> — Drop your <code>.webp</code> file (or any image) into the upload zone.</li>
          <li><strong>Step 3</strong> — Select <em>.JPG</em> as the output format and adjust the quality slider.</li>
          <li><strong>Step 4</strong> — Click <em>Export .JPG</em> to download the converted file instantly.</li>
        </ul>
        <p>The conversion runs entirely in your browser — your files are never sent to any server. JPG is the best choice when you need broad compatibility (email, legacy apps, print).</p>
      </>
    ),
  },
  {
    id: 'convert-webp-to-png',
    tag: 'Converter Guide',
    tagColor: 'blue',
    question: 'How do I convert WebP to PNG and keep transparency?',
    answer: (
      <>
        <p>PNG is the only major format (alongside WebP itself) that preserves full alpha-channel transparency. Here's how to convert WebP to PNG in PlatformFit:</p>
        <ul>
          <li><strong>Step 1</strong> — Open the <em>Convert WebP</em> tab.</li>
          <li><strong>Step 2</strong> — Upload your <code>.webp</code> file.</li>
          <li><strong>Step 3</strong> — Choose <em>.PNG</em> as the output format. The quality slider disappears — PNG is always lossless.</li>
          <li><strong>Step 4</strong> — Click <em>Export .PNG</em> to download.</li>
        </ul>
        <p>Unlike JPG, PNG output retains any transparent areas in the original WebP. This makes it the right choice for logos, icons, and UI assets that need a clear background.</p>
      </>
    ),
  },
];

const TAG_COLORS = {
  amber: { bg: 'var(--amber-light)', color: 'var(--amber-deep)', border: 'var(--amber-mid)' },
  blue:  { bg: '#eff6ff',            color: '#1d4ed8',            border: '#bfdbfe'          },
  green: { bg: 'var(--success-light)', color: 'var(--success)',   border: '#6ee7b7'          },
};

// ── Single accordion item ─────────────────────────────────────────────────────
function FaqItem({ item, isOpen, onToggle }) {
  const tag = TAG_COLORS[item.tagColor] || TAG_COLORS.amber;

  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button
        className="faq-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-body-${item.id}`}
        id={`faq-trigger-${item.id}`}
      >
        <div className="faq-trigger-left">
          <span
            className="faq-tag"
            style={{ background: tag.bg, color: tag.color, borderColor: tag.border }}
          >
            {item.tag}
          </span>
          <span className="faq-question">{item.question}</span>
        </div>
        <span className="faq-chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <div
        className="faq-body"
        id={`faq-body-${item.id}`}
        role="region"
        aria-labelledby={`faq-trigger-${item.id}`}
        hidden={!isOpen}
      >
        <div className="faq-answer">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function BlogSection() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(prev => (prev === id ? null : id));

  return (
    <section className="blog-section" aria-labelledby="blog-section-heading">

      {/* Header */}
      <div className="blog-section-header">
        <div className="blog-section-eyebrow">✦ Quick Answers</div>
        <h2 className="blog-section-title" id="blog-section-heading">
          Image Sizes &amp; Format FAQ
        </h2>
        <p className="blog-section-desc">
          Everything you need to know about platform dimensions and image formats —
          answered in plain English, right here.
        </p>
      </div>

      {/* Accordion */}
      <div className="faq-list" role="list">
        {FAQS.map(item => (
          <FaqItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>

    </section>
  );
}
