import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import './ChecklistScreen.css';
import checkmarkImage from '../../assets/checkmark.png';

// =====================================================
// ASSETS
// =====================================================

const assets = import.meta.glob(
  '../../assets/ChecklistScreen/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
);

const imageMap = Object.fromEntries(
  Object.entries(assets).map(([path, url]) => [
    path.split('/').pop().toLowerCase(),
    url,
  ])
);

const getImage = (name) => {
  if (!name) return null;

  return imageMap[name.split('/').pop().toLowerCase()] || null;
};

// =====================================================
// COMPONENT
// =====================================================

export default function ChecklistScreen({
  items = [],
  variant = 'default',
  side = 'right',
  currentStep,

  checkedItems: externalCheckedItems,
  onCheckedItemsChange,
  onComplete,
  onInteractionStart,

  hasInteracted = false,
  isCompleted = false,
}) {
  const isMini = variant === 'mini';

  // =====================================================
  // STATE
  // =====================================================

  const [internalCheckedItems, setInternalCheckedItems] =
    useState({});

  const [hasStarted, setHasStarted] = useState(
    hasInteracted || isCompleted
  );

  const completionCalled = useRef(false);

  // =====================================================
  // REFS
  // =====================================================

  const scrollAreaRef = useRef(null);
  const boundaryRef = useRef(null);
  const itemRefs = useRef([]);
  const textRefs = useRef([]);

  // =====================================================
  // CHECKED ITEMS
  // =====================================================

  const checkedItems =
    externalCheckedItems ?? internalCheckedItems;

  const allChecked =
    items.length > 0 &&
    items.every((item) => Boolean(checkedItems[item.id]));

  const hasAnyChecked = items.some(
    (item) => Boolean(checkedItems[item.id])
  );

  // =====================================================
  // RESET
  // =====================================================

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }

    setHasStarted(hasInteracted || isCompleted);

    completionCalled.current = false;

    itemRefs.current = [];
    textRefs.current = [];
  }, [currentStep]);

  useEffect(() => {
    if (hasInteracted || isCompleted) {
      setHasStarted(true);
    }
  }, [hasInteracted, isCompleted]);

  // =====================================================
  // GET BOUNDARY POSITION
  // =====================================================

  const getBoundaryTop = useCallback(() => {
    if (boundaryRef.current) {
      return boundaryRef.current.getBoundingClientRect().top;
    }

    return window.innerHeight * 0.87;
  }, []);

  // =====================================================
  // GET ITEMS NOT FULLY ABOVE BOUNDARY (IN JSON ORDER)
  // =====================================================

  const getItemsNotFullyAboveBoundary = useCallback(() => {
    const boundaryTop = getBoundaryTop();
    const notAboveItems = [];

    for (let index = 0; index < items.length; index++) {
      const element = itemRefs.current[index];

      if (!element) continue;

      const rect = element.getBoundingClientRect();

      if (rect.height <= 0) continue;

      const isFullyAboveLine = rect.bottom <= boundaryTop - 2;

      if (!isFullyAboveLine) {
        notAboveItems.push({
          index,
          item: items[index],
          element,
          rect,
        });
      }
    }

    return notAboveItems;
  }, [items, getBoundaryTop]);

  // =====================================================
  // SCROLL FIRST OVERFLOWING ITEM ABOVE LINE (ON CLICK)
  // =====================================================

  const scrollFirstItemAboveBoundary = useCallback(() => {
    if (isMini) return;

    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) return;

    const itemsNotAbove = getItemsNotFullyAboveBoundary();

    // אם כל הנקודות כבר נמצאות מעל הקו - אין צורך בגלילה
    if (itemsNotAbove.length === 0) return;

    const firstOverflowItem = itemsNotAbove[0];
    const boundaryTop = getBoundaryTop();

    // מרווח ביטחון קטן מעל הקו כדי שהנקודה תהיה כל כולה מעליו
    const clearance = 8;
    const neededScrollDelta =
      firstOverflowItem.rect.bottom - boundaryTop + clearance;

    if (neededScrollDelta <= 1) return;

    const maxScroll =
      scrollArea.scrollHeight - scrollArea.clientHeight;

    const nextScrollTop = Math.min(
      scrollArea.scrollTop + neededScrollDelta,
      maxScroll
    );

    if (nextScrollTop <= scrollArea.scrollTop + 1) {
      return;
    }

    scrollArea.scrollTo({
      top: nextScrollTop,
      behavior: 'smooth',
    });
  }, [isMini, getItemsNotFullyAboveBoundary, getBoundaryTop]);

  // =====================================================
  // ITEM CLICK
  // =====================================================

  const handleItemClick = (itemId) => {
    if (isCompleted) return;

    // הגלילה האוטומטית מתבצעת תמיד בלחיצה (רק כשצריך)
    scrollFirstItemAboveBoundary();

    if (checkedItems[itemId]) return;

    if (!hasStarted) {
      setHasStarted(true);

      // בגרסת mini הלוח לא עולה למעלה ולכן בועת הדיבור נשארת גלויה
      if (!isMini) {
        onInteractionStart?.();
      }
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

  // =====================================================
  // COMPLETION
  // =====================================================

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

  // =====================================================
  // RENDER
  // =====================================================

  if (!items.length) return null;

  const clipboardImage = getImage(
    isMini ? 'ClipboardMini.png' : 'Clipboard.png'
  );

  const checkboxImage = getImage('Checkbox.png');

  return (
    <div
      className={`checklist-container side-${side} ${
        isMini ? 'mini-checklist' : ''
      }`}
      dir="rtl"
    >
      {/* קו גבול תחתון */}
      {!isMini && (
        <div
          ref={boundaryRef}
          className="checklist-click-boundary"
          aria-hidden="true"
        />
      )}

      {/* אזור גלילה */}
      <div
        ref={scrollAreaRef}
        className="checklist-scroll-area"
      >
        {/* לוח */}
        <div
          className={`clipboard-wrapper ${
            isMini ? 'clipboard-mini' : ''
          }`}
          style={{
            backgroundImage: clipboardImage
              ? `url("${clipboardImage}")`
              : 'none',
          }}
        >
          {/* רשימה */}
          <div className="checklist-viewport">
            <div className="checklist-items">
              {items.map((item, index) => {
                const isChecked =
                  isCompleted ||
                  Boolean(checkedItems[item.id]);

                const itemImage = getImage(item.image);

                const showFirstGlow =
                  index === 0 &&
                  !hasAnyChecked &&
                  !hasStarted &&
                  !isCompleted;

                return (
                  <div
                    key={item.id}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    className={`checklist-item ${
                      isChecked ? 'checked' : ''
                    } ${
                      itemImage ? 'has-image' : ''
                    } ${
                      showFirstGlow ? 'first-item-glow' : ''
                    }`}
                    onClick={() => handleItemClick(item.id)}
                    role="button"
                    tabIndex={isCompleted ? -1 : 0}
                    aria-pressed={isChecked}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();
                        handleItemClick(item.id);
                      }
                    }}
                  >
                    {/* CHECKBOX */}
                    <div
                      className="checkbox-box"
                      style={{
                        backgroundImage: checkboxImage
                          ? `url("${checkboxImage}")`
                          : 'none',
                      }}
                    >
                      <img
                        src={checkmarkImage}
                        alt=""
                        className="checkmark-img"
                      />
                    </div>

                    {/* TEXT + IMAGE */}
                    <div className="item-text-container">
                      <span
                        ref={(element) => {
                          textRefs.current[index] = element;
                        }}
                        className="item-text"
                      >
                        {item.text}
                      </span>

                      {itemImage && (
                        <img
                          src={itemImage}
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
      </div>
    </div>
  );
}