import React, { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons';

export default function CompareSlider({ beforeSrc, afterSrc, height = 480 }) {
  const [position, setPosition] = useState(50); // percentage
  const wrapperRef = useRef(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  // Mouse events
  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    updatePosition(e.clientX);

    const onMouseMove = (e) => {
      if (dragging.current) updatePosition(e.clientX);
    };
    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch events
  const onTouchStart = (e) => {
    dragging.current = true;
    updatePosition(e.touches[0].clientX);
  };
  const onTouchMove = (e) => {
    if (dragging.current) updatePosition(e.touches[0].clientX);
  };
  const onTouchEnd = () => { dragging.current = false; };

  return (
    <div
      ref={wrapperRef}
      className="compare-wrapper"
      style={{ height }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* BEFORE (original) — full width, underneath */}
      <div className="compare-before" style={{ position: 'absolute', inset: 0 }}>
        <img
          src={beforeSrc}
          alt="Original"
          className="compare-img"
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
          draggable={false}
        />
      </div>

      {/* AFTER (compressed) — clipped to right side */}
      <div
        className="compare-after"
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 0 ${position}%)`,
        }}
      >
        <img
          src={afterSrc}
          alt="Compressed"
          className="compare-img"
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
          draggable={false}
        />
      </div>

      {/* Divider line + handle */}
      <div className="compare-divider" style={{ left: `${position}%` }}>
        <div className="compare-handle">
          <FontAwesomeIcon icon={faLeftRight} style={{ fontSize: 14 }} />
        </div>
      </div>

      {/* Labels */}
      <span className="compare-label before">Original</span>
      <span className="compare-label after">Compressed</span>
    </div>
  );
}
