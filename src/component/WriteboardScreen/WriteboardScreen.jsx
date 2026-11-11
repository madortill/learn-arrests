
import React, { useState, useMemo, useEffect, useRef } from 'react';
import './WriteboardScreen.css';

import whiteboardFrames from '../../assets/whiteboard_frames.png';
import blueMarker from '../../assets/blue_marker.png';

const WriteboardScreen = ({ whiteboardData, onComplete }) => {
  const {
    title = '',
    subtitle = '',
    bulletPoints = [],
    footerNote = '',
  } = whiteboardData || {};

  const [writtenWords, setWrittenWords] = useState({});
  const completionSent = useRef(false);

  // פירוק הטקסט למילים ומתן מזהה ייחודי לכל מילה
  const { bulletsParsed, footerParsed, totalWordsCount } = useMemo(() => {
    let count = 0;

    const parsedBullets = bulletPoints.map((point, bIdx) => {
      const words = point.trim().split(/\s+/).filter(Boolean);
      const startIdx = count;

      count += words.length;

      return { words, startIdx, bIdx };
    });

    const footerWords = footerNote.trim()
      ? footerNote.trim().split(/\s+/).filter(Boolean)
      : [];

    const footerStartIdx = count;
    count += footerWords.length;

    return {
      bulletsParsed: parsedBullets,
      footerParsed: {
        words: footerWords,
        startIdx: footerStartIdx,
      },
      totalWordsCount: count,
    };
  }, [bulletPoints, footerNote]);

  // איפוס החשיפה אם נתוני השלב משתנים
  useEffect(() => {
    setWrittenWords({});
    completionSent.current = false;
  }, [whiteboardData]);

  const handleWordHover = (wordGlobalIdx) => {
    setWrittenWords((prev) => {
      if (prev[wordGlobalIdx]) return prev;

      return {
        ...prev,
        [wordGlobalIdx]: true,
      };
    });
  };

  const writtenCount = Object.keys(writtenWords).length;

  // חייבים לחשוף את כל המילים
  const isFinished =
    totalWordsCount > 0 && writtenCount === totalWordsCount;

  // עדכון System פעם אחת בלבד כשהמשתמש סיים
  useEffect(() => {
    if (isFinished && !completionSent.current) {
      completionSent.current = true;
      onComplete?.();
    }
  }, [isFinished, onComplete]);

  const renderWords = (words, startIdx, fontClass) =>
    words.map((word, wIdx) => {
      const globalIdx = startIdx + wIdx;
      const isWritten = !!writtenWords[globalIdx];

      return (
        <span
          key={globalIdx}
          className="word-hit-area"
          onPointerEnter={() => handleWordHover(globalIdx)}
        >
          <span
            className={`board-word ${fontClass} ${
              isWritten ? 'written' : 'hidden'
            }`}
          >
            {word}
          </span>
        </span>
      );
    });

  return (
    <div
      className="whiteboard-container"
      dir="rtl"
      style={{
        '--marker-cursor': `url("${blueMarker}") 0 32, crosshair`,
      }}
    >
      <div
        className="whiteboard-frame-bg"
        style={{
          backgroundImage: `url("${whiteboardFrames}")`,
        }}
      >
        <div className="whiteboard-content">

          {/* כותרת ותת-כותרת */}
          <div className="whiteboard-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {/* שלוש המסגרות */}
          <div className="bullets-section">
            {bulletsParsed.map((bullet, bIdx) => (
              <div
                key={bIdx}
                className={`bullet-box-text box-${bIdx + 1}`}
              >
                <span className="bullet-number">{bIdx + 1}</span>

                <div className="bullet-words" dir="auto">
                  {renderWords(
                    bullet.words,
                    bullet.startIdx,
                    'font-lorem'
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* קו עליון והדגש בתחתית הלוח */}
          {footerParsed.words.length > 0 && (
            <div className="footer-section">
              <div className="footer-words" dir="rtl">
                {renderWords(
                  footerParsed.words,
                  footerParsed.startIdx,
                  'font-hebrew'
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteboardScreen;
