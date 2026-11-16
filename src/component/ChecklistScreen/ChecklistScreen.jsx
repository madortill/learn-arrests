
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

  // מונע הרצה מיותרת בתחילת טעינת הקומפוננטה
  const previousCheckedRef = useRef(null);

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
    previousCheckedRef.current = null;

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

    return window.innerHeight * 0.82;
  }, []);

  // =====================================================
  // GET FIRST FULLY VISIBLE ITEM
  // =====================================================

  const getFirstFullyVisibleItem = useCallback(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) return null;

    const areaRect = scrollArea.getBoundingClientRect();
    const boundaryTop = getBoundaryTop();

    for (let index = 0; index < items.length; index++) {
      const element = itemRefs.current[index];

      if (!element) continue;

      const rect = element.getBoundingClientRect();

      const isFullyVisible =
        rect.height > 0 &&
        rect.top >= areaRect.top &&
        rect.bottom <= boundaryTop;

      if (isFullyVisible) {
        return {
          index,
          item: items[index],
          element,
          rect,
        };
      }
    }

    return null;
  }, [items, getBoundaryTop]);

  // =====================================================
  // CHECK LAST VISIBLE ITEM
  // =====================================================

  const isLastVisibleItemCrossingBoundary = useCallback(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) return false;

    const areaRect = scrollArea.getBoundingClientRect();
    const boundaryTop = getBoundaryTop();

    let lastVisible = null;

    for (let index = 0; index < items.length; index++) {
      const element = itemRefs.current[index];

      if (!element) continue;

      const rect = element.getBoundingClientRect();

      const intersectsVisibleArea =
        rect.top < boundaryTop &&
        rect.bottom > areaRect.top;

      if (intersectsVisibleArea) {
        lastVisible = rect;
      }
    }

    return Boolean(
      lastVisible &&
      lastVisible.bottom > boundaryTop
    );
  }, [items, getBoundaryTop]);

  // =====================================================
  // AUTOMATIC CLIPBOARD MOVEMENT
  // =====================================================

  useEffect(() => {
    if (isMini || isCompleted) return;

    const currentChecked = JSON.stringify(checkedItems);

    if (previousCheckedRef.current === null) {
      previousCheckedRef.current = currentChecked;
      return;
    }

    if (previousCheckedRef.current === currentChecked) {
      return;
    }

    previousCheckedRef.current = currentChecked;

    // ממתינים עד שהעדכון של הסימון הסתיים
    requestAnimationFrame(() => {
      const scrollArea = scrollAreaRef.current;

      if (!scrollArea) return;

      // תנאי ראשון:
      // הנקודה הראשונה שמוצגת במלואה כבר סומנה

      const firstItem = getFirstFullyVisibleItem();

      if (!firstItem) return;

      const firstItemChecked =
        Boolean(checkedItems[firstItem.item.id]);

      if (!firstItemChecked) return;

      // תנאי שני:
      // הנקודה האחרונה באזור התצוגה חוצה את הקו השקוף

      const lastItemCrosses =
        isLastVisibleItemCrossingBoundary();

      if (!lastItemCrosses) return;

      // =================================================
      // BOTH CONDITIONS MET
      // =================================================

      const itemHeight = firstItem.rect.height;

      // מרימים מספיק כדי שהנקודה הראשונה
      // כבר לא תהיה מוצגת במלואה.
      // לא מרימים את כל גובה הנקודה.

      const movement = itemHeight * 0.7;

      const maxScroll =
        scrollArea.scrollHeight - scrollArea.clientHeight;

      const nextScroll = Math.min(
        scrollArea.scrollTop + movement,
        maxScroll
      );

      if (nextScroll <= scrollArea.scrollTop + 2) {
        return;
      }

      scrollArea.scrollTo({
        top: nextScroll,
        behavior: 'smooth',
      });
    });
  }, [
    checkedItems,
    isMini,
    isCompleted,
    getFirstFullyVisibleItem,
    isLastVisibleItemCrossingBoundary,
  ]);

  // =====================================================
  // ITEM CLICK
  // =====================================================

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

      {/* קו שקוף */}

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
