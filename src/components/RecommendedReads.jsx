import React from 'react';
import { BookOpen, Clock } from 'lucide-react';

export default function RecommendedReads({ posts, onPostClick }) {
  if (posts.length === 0) {
    return (
      <section className="container" style={{ margin: '40px auto', textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No articles match your search or filter criteria.</p>
      </section>
    );
  }

  return (
    <section className="container" style={{ marginBottom: '56px' }}>
      <div className="section-header">
        <BookOpen className="section-icon" />
        <span className="section-title">Recommended Reads</span>
      </div>
      <div className="recommended-grid">
        {posts.map((post, index) => {
          // In the screenshot, there's a 3-item top row and a 2-item bottom row.
          // In CSS we defined:
          // .col-span-2 { grid-column: span 2; }
          // .col-span-3 { grid-column: span 3; }
          // We can use span-2 for the first three, and span-3 for the next two.
          // If filtering causes fewer than 5 items, we can just span-2 for all to keep it clean.
          let gridSpanClass = "col-span-2";
          if (posts.length >= 5) {
            gridSpanClass = index < 3 ? "col-span-2" : "col-span-3";
          } else {
            // For 4 items: let's make it span-3 for two rows of 2
            if (posts.length === 4 || posts.length === 2) {
              gridSpanClass = "col-span-3";
            }
          }

          return (
            <div 
              key={post.id} 
              className={`recommended-card ${gridSpanClass}`}
              onClick={() => onPostClick(post)}
            >
              <div className="card-image-wrapper">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="card-image"
                  loading="lazy"
                />
              </div>
              <div className="card-content">
                <div>
                  <div className="card-tag">{post.category}</div>
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-desc">{post.summary}</p>
                </div>
                <div className="card-meta">
                  <Clock className="meta-icon" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
