import React from 'react';
import { ArrowRight, Folder } from 'lucide-react';
import { categories } from '../data/posts';

export default function Categories({ onSelectCategory, selectedCategory }) {
  return (
    <section className="container browse-section">
      <div className="category-title-bar">
        <span className="section-title">Browse by Category</span>
      </div>
      <div className="category-grid">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className={`category-card ${selectedCategory === cat.id ? 'active-cat' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
            style={selectedCategory === cat.id ? { border: '2px solid var(--accent-purple)' } : {}}
          >
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="category-card-image"
              loading="lazy"
            />
            <div className="category-card-overlay">
              <div className="category-card-header">
                <span className="category-card-name">{cat.name}</span>
                <span className="category-card-count">{cat.count} {cat.count === 1 ? 'post' : 'posts'}</span>
              </div>
              <div className="category-card-footer">
                <Folder className="category-card-footer-icon" />
                <span>Browse posts</span>
                <ArrowRight className="category-card-arrow" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
