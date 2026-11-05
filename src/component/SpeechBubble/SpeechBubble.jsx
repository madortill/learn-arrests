
import React, { useState, useEffect } from 'react';

import './SpeechBubble.css';

export default function SpeechBubble({
  text = '',
  typeAnimation = true,
  tailPosition = 'left-top',
  position = { top: '20%', right: '15%' },
  speed = 30,
  onComplete,
}) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    let interval;

    setDisplayedText('');

    const finishTyping = () => {
      if (onComplete) {
        onComplete();
      }
    };

    if (!typeAnimation || !text) {
      setDisplayedText(text);
      finishTyping();
      return;
    }

    interval = setInterval(() => {
      currentIndex++;

      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(interval);
        finishTyping();
      }
    }, speed);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [text, typeAnimation, speed, onComplete]);

  return (
    <div
      className="speech-bubble-wrapper"
      style={{ ...position }}
    >
      <div className={`speech-bubble tail-${tailPosition}`}>

        {tailPosition !== 'none' && (
          <div className="speech-tail">
            <svg
              viewBox="0 0 30 30"
              className="tail-svg"
            >
              <path
                d="M 30,0 L 0,15 L 30,30 Z"
                fill="#3e2888"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <div className="speech-content">
          <p>{displayedText}</p>

          {typeAnimation && displayedText.length < text.length && (
            <span className="typing-cursor">|</span>
          )}
        </div>

      </div>
    </div>
  );
}
