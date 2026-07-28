import React, { useState, useEffect } from 'react';
import '../css/SplashCover.css';

export default function SplashCover({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Trigger scale & fade-out after 600ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 600);

    // Unmount completely from DOM after 850ms (< 1s total)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 850);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`safira-preloader-cover ${isFadingOut ? 'preloader-fade-out' : ''}`}>
      <div className="safira-loader-wrapper">
        <div className="safira-press-container">
          <span className="safira-press-text">Safira</span>
        </div>
      </div>
    </div>
  );
}
