import React from 'react';
import './ImportantPoints.css';

export default function ImportantPoints({ title = "דגשים חשובים", text, onClose }) {
  return (
    <div className="important-points-overlay" onClick={onClose}>
      <div className="important-points-card" onClick={(e) => e.stopPropagation()}>
        
        {/* אייקון אזהרה צהוב */}
        <div className="warning-icon-wrapper">
          <span className="warning-emoji">⚠️</span>
        </div>

        <h3 className="modal-title">{title}</h3>

        <div className="modal-text-content">
          <p>{text}</p>
        </div>

        <button className="modal-ok-btn" onClick={onClose}>
          אישור
        </button>
      </div>
    </div>
  );
}