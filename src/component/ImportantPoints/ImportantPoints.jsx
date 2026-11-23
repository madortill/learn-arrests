import React from 'react';
import defaultWarningIcon from '../../assets/LocationMap/warning-emoji.svg';
import './ImportantPoints.css';

export default function ImportantPoints({
  title = 'דגשים חשובים',
  text,
  icon = defaultWarningIcon,
  buttonText = 'אישור',
  onClose,
}) {
  if (!text) return null;

  return (
    <div className="apple-alert-overlay" onClick={onClose}>
      <div
        className="apple-alert-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="apple-alert-title"
        aria-describedby="apple-alert-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="apple-alert-body">
          <div className="apple-alert-icon-wrapper">
            <img
              src={icon}
              alt=""
              className="apple-alert-icon"
              draggable="false"
            />
          </div>

          <h3 id="apple-alert-title" className="apple-alert-title">
            {title}
          </h3>

          <p id="apple-alert-message" className="apple-alert-message">
            {text}
          </p>
        </div>

        <div className="apple-alert-actions">
          <button
            type="button"
            className="apple-alert-action-btn"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}