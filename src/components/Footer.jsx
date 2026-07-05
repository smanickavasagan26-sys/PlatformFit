import React from 'react';

export default function Footer({ onHomeClick, onAboutClick, onPrivacyClick, onTermsClick }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        {/* Logo and Brand Info */}
        <div className="footer-left">
          <div className="footer-logo" style={{ cursor: 'pointer' }} onClick={onHomeClick}>
            <div className="footer-logo-icon">T</div>
            <span className="footer-logo-title">TechBasics</span>
          </div>
          <span className="footer-copyright">
            © {currentYear} TechBasics.online. All rights reserved.
          </span>
        </div>

        {/* Directory Link */}
        <div className="footer-center">
          <a 
            href="https://www.blogarama.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-directory-link"
          >
            Blogarama - Blog Directory
          </a>
        </div>

        {/* Footer Nav Links */}
        <div className="footer-right">
          <button 
            onClick={onHomeClick} 
            className="footer-link"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Home
          </button>
          <button 
            onClick={onAboutClick} 
            className="footer-link"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            About
          </button>
          <button 
            onClick={onPrivacyClick} 
            className="footer-link"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Privacy Policy
          </button>
          <button 
            onClick={onTermsClick} 
            className="footer-link"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Terms of Service
          </button>
        </div>
      </div>
      <div className="container footer-bottom-line">
        TechBasics is dedicated to translating complex code, setups, AI models, and startup concepts into clean, reader-friendly developer guides.
      </div>
    </footer>
  );
}
