
import React, { useState, useEffect, useRef } from 'react';
import './ChecklistScreen.css';

import checkmark from '../../assets/checkmark.png';
import pekelim from '../../assets/pekelim.png';
import clipboardMini from '../../assets/ClipboardMini.png';

const imageMap = {
  'pekelim.png': pekelim,
};

export default function ChecklistScreen({
  items = [],
  variant = 'default',
  checkedItems = {},
  onCheckedItemsChange,
  onComplete,
  onInteractionStart,
  hasInteracted = false,
  isCompleted = false,
}) {
  const isMini = variant === 'mini';

  const [hasStarted, setHasStarted] = useState(
    hasInteracted || isCompleted
  );

  const completionCalled = useRef(false);

  // שחזור מצב הלוח
  useEffect(() => {
    if (hasInteracted || isCompleted) {
      setHasStarted(true);
    }
  }, [hasInteracted, isCompleted]);

  // בדיקה שכל הפריטים סומנו
  const allChecked =
    items.length > 0 &&
    items.every(
      item => isCompleted || checkedItems[item.id]
    );

  // לחיצה על פריט
  const handleItemClick = (itemId) => {
    if (isCompleted || checkedItems[itemId]) return;

    if (!hasStarted) {
      setHasStarted(true);
      onInteractionStart?.();
    }

    onCheckedItemsChange?.({
      ...checkedItems,
      [itemId]: true,
    });
  };

  // השלמת השלב
  useEffect(() => {
    if (!allChecked || isCompleted || completionCalled.current) {
      return;
    }

    const timeout = setTimeout(() => {
      if (completionCalled.current) return;

      completionCalled.current = true;
      onComplete?.();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [allChecked, isCompleted, onComplete]);

  if (!items.length) return null;

  return (
    <div
      className={`checklist-container ${
        isMini ? 'mini-checklist' : ''
      }`}
      dir="rtl"
    >
      <div
        className={`clipboard-wrapper ${
          isMini ? 'clipboard-mini' : ''
        } ${
          !isMini && hasStarted ? 'moved-up' : ''
        }`}
        style={
          isMini
            ? { backgroundImage: `url(${clipboardMini})` }
            : undefined
        }
      >
        <div className="checklist-items">

          {items.map((item) => {
            const isChecked =
              isCompleted || Boolean(checkedItems[item.id]);

            return (
              <div
                key={item.id}
                className={`checklist-item ${
                  isChecked ? 'checked' : ''
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="checkbox-box">
                  <img
                    src={checkmark}
                    alt=""
                    className="checkmark-img"
                  />
                </div>

                <div className="item-text-container">

                  <span className="item-text">
                    {item.text}
                  </span>

                  {item.image && imageMap[item.image] && (
                    <img
                      src={imageMap[item.image]}
                      alt="פריט חובה"
                      className="item-image"
                    />
                  )}

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
