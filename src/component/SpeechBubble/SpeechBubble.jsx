import React, { useState, useEffect } from 'react';
import ContinueBtn from '../ContinueBtn/ContinueBtn'; // ייבוא כפתור ההמשך
import './SpeechBubble.css';

export default function SpeechBubble({ 
  text = '', 
  typeAnimation = true, 
  tailPosition = 'left-top', 
  position = { top: '20%', right: '15%' },
  speed = 30,
  onNext // הפונקציה למעבר לשלב הבא
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [showContinueBtn, setShowContinueBtn] = useState(false);

  useEffect(() => {
    // מקרה 1: אין אנימציית הקלדה - מציג את כל הטקסט ואת הכפתור מיד
    if (!typeAnimation) {
      setDisplayedText(text);
      setShowContinueBtn(true);
      return;
    }

    // מקרה 2: יש אנימציית הקלדה - מאפס וממתין לסיום ההקלדה
    setDisplayedText('');
    setShowContinueBtn(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setShowContinueBtn(true); // כפתור ההמשך מופיע רק בגמר ההקלדה!
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, typeAnimation, speed]);

  return (
    <div className="speech-bubble-wrapper" style={{ ...position }}>
      <div className={`speech-bubble tail-${tailPosition}`}>
        
        {/* קודקוד הדיבור */}
        {tailPosition !== 'none' && (
          <div className="speech-tail">
            <svg viewBox="0 0 30 30" className="tail-svg">
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

        {/* תוכן הטקסט */}
        <div className="speech-content">
          <p>{displayedText}</p>
          {typeAnimation && !showContinueBtn && (
            <span className="typing-cursor">|</span>
          )}
        </div>
      </div>

      {/* כפתור ההמשך מוצג מתחת לבועה רק כשהתנאי מתקיים */}
      {showContinueBtn && onNext && (
        <div className="speech-continue-container">
          <ContinueBtn onClick={onNext} />
        </div>
      )}
    </div>
  );
}