import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Link2, Clock } from 'lucide-react';
import { marked } from 'marked';

export default function ArticleView({ post, onBack }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Scroll Progress logic
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse Headings for TOC
  const headings = useMemo(() => {
    if (!post || !post.content) return [];
    const lines = post.content.split('\n');
    return lines
      .filter(line => line.startsWith('## ') || line.startsWith('### '))
      .map(line => {
        const depth = line.startsWith('## ') ? 2 : 3;
        const text = line.replace(/^#{2,3}\s+/, '').replace(/\*+/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return { depth, text, id };
      });
  }, [post]);

  // Table of Contents Highlight Active Heading on Scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      let currentActiveId = '';
      // We check from top to bottom. Find the last heading that is above the screen line (e.g. 160px from top)
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            currentActiveId = heading.id;
          }
        }
      }
      setActiveHeadingId(currentActiveId || headings[0].id);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call to set active heading
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Compile Markdown HTML and Inject Headings with matching IDs
  const parsedHtml = useMemo(() => {
    if (!post || !post.content) return '';
    let html = marked.parse(post.content);
    
    // We replace heading elements in the HTML to inject standard IDs matching the TOC links
    headings.forEach(heading => {
      const tag = `h${heading.depth}`;
      // Clean target header text that matches standard marked rendering
      const headingTextEscaped = heading.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`<h${heading.depth}>(${headingTextEscaped})</h${heading.depth}>`, 'i');
      html = html.replace(regex, `<h${heading.depth} id="${heading.id}">$1</h${heading.depth}>`);
    });

    return html;
  }, [post, headings]);

  // Social Share handlers
  const articleUrl = `${window.location.origin}/#${post.slug}`;
  const shareText = `Read "${post.title}" on TechBasics!`;

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareOnLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(articleUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    });
  };

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90; // Header spacing
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="container">
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <div className="article-reader-container">
        {/* Main Article Content */}
        <article className="article-main">
          {/* Back button */}
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          {/* Header Metadata */}
          <header className="article-header">
            <span className="article-category">{post.category}</span>
            <h1 className="article-title-text">{post.title}</h1>
            <div className="article-author-meta">
              <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
              <div className="author-details">
                <span className="author-name">{post.author.name}</span>
                <span className="author-role-date">{post.author.role} • {post.date}</span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          <div className="article-cover-wrapper">
            <img src={post.coverImage} alt={post.title} className="article-cover-image" />
          </div>

          {/* Markdown Content Area */}
          <div 
            className="markdown-body" 
            dangerouslySetInnerHTML={{ __html: parsedHtml }} 
          />
        </article>

        {/* Sticky Sidebar Navigation (TOC + Share) */}
        <aside className="article-sidebar">
          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="sidebar-widget">
              <h4 className="widget-title">Table of Contents</h4>
              <ul className="toc-list">
                {headings.map((heading, i) => (
                  <li 
                    key={i} 
                    className={`toc-item h${heading.depth} ${activeHeadingId === heading.id ? 'active' : ''}`}
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    {heading.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Actions widget */}
          <div className="sidebar-widget">
            <h4 className="widget-title">Share Article</h4>
            <div className="share-buttons">
              <button className="share-btn" onClick={shareOnTwitter} title="Share on X (Twitter)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="share-btn" onClick={shareOnLinkedin} title="Share on LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </button>
              <button className="share-btn" onClick={copyLink} title="Copy Article URL">
                <Link2 size={18} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Copy link success toast */}
      {showToast && (
        <div className="copy-success-toast">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
