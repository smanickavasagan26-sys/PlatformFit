import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="container hero-section">
      <div className="hero-badge">
        <Sparkles size={12} />
        <span>Tech Explained Simply.</span>
      </div>
      <h1 className="hero-title">Tech Explained Simply.</h1>
      <p className="hero-desc">
        TechBasics is a minimalist blog for people learning tech. We explain AI, 
        programming, startups, and technology—without the jargon.
      </p>
    </section>
  );
}
