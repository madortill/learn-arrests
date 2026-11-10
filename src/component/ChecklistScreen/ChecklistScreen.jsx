
import React, { useState, useEffect, useRef } from 'react';
import './ChecklistScreen.css';

import checkmark from '../../assets/checkmark.png';
import pekelim from '../../assets/Pekelim.png';
import clipboardMini from '../../assets/ClipboardMini.png';

const imageMap = {
  'Pekelim.png': pekelim,
};

export default function ChecklistScreen({
  items = [],
  variant = 'default',
  checkedItems: externalCheckedItems,
  onCheckedItemsChange,
  onComplete,
  onInteractionStart,
  hasInteracted = false,
  isCompleted = false,
}) {
  const isMini = variant === 'mini';

  const [internalCheckedItems, setInternalCheckedItems] = useState({});
  const [hasStarted, setHasStarted] = useState(
    hasInteracted || isCompleted
  );

  const completionCalled = useRef(false);

  // מאפשר שימוש גם עם State חיצוני וגם עצמאי
  const checkedItems = externalCheckedItems ?? internalCheckedItems;

  useEffect(() => {
    if (hasInteracted || isCompleted) {
      setHasStarted(true);
    }
  }, [hasInteracted, isCompleted]);

  const allChecked =
    items.length > 0 &&
    items.every(item => Boolean(checkedItems[item.id]));

  const handleItemClick = (itemId) => {
    if (isCompleted || checkedItems[itemId]) return;

    if (!hasStarted) {
      setHasStarted(true);
      onInteractionStart?.();
    }

    const updatedItems = {
      ...checkedItems,
      [itemId]: true,
    };

    if (externalCheckedItems === undefined) {
      setInternalCheckedItems(updatedItems);
    }

    onCheckedItemsChange?.(updatedItems);
  };

  useEffect(() => {
    if (!allChecked && !isCompleted) {
      completionCalled.current = false;
    }
  }, [allChecked, isCompleted]);

  useEffect(() => {
    if (
      !allChecked ||
      isCompleted ||
      completionCalled.current
    ) {
      return;
    }

    completionCalled.current = true;
    onComplete?.();
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
          {items.map(item => {
            const isChecked =
              isCompleted || Boolean(checkedItems[item.id]);

            return (
              <div
                key={item.id}
                className={`checklist-item ${
                  isChecked ? 'checked' : ''
                }`}
                onClick={() => handleItemClick(item.id)}
                role="button"
                tabIndex={isCompleted ? -1 : 0}
                aria-pressed={isChecked}
                onKeyDown={event => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    handleItemClick(item.id);
                  }
                }}
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
