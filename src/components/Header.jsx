import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { categories } from '../data/posts';

export default function Header({ onSearch, onSelectCategory, selectedCategory, onLogoClick }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleCategorySelect = (catId) => {
    onSelectCategory(catId);
    setShowFilters(false);
  };

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Brand Logo & Name */}
        <div className="logo-section" onClick={onLogoClick}>
          <div className="logo-icon">T</div>
          <div className="logo-details">
            <span className="logo-title">TechBasics</span>
            <span className="logo-subtitle">Knowledge Hub</span>
          </div>
        </div>

        {/* Central Search Bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search articles..."
              className="search-input"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="filter-button" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {showFilters && (
            <div className="filters-dropdown">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 12px 8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                Filter by Category
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-option ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.name} ({cat.count} posts)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
