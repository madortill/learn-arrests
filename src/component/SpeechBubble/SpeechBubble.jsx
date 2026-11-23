import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';

import './SpeechBubble.css';

const TYPING_SPEED = 30;

const BUBBLE_COLOR = '#472C89';
const BORDER_COLOR = '#066EFA';

const BORDER_RADIUS = 14;
const BORDER_WIDTH = 1;

const TAIL_BASE = 93;
const TAIL_TIP_RADIUS = 4;

// יחס גובה-רוחב של מסך הייחוס (1440x1024)
const REFERENCE_ASPECT_RATIO = 1440 / 1024; // 1.40625

// ==========================================
// RESPONSIVE TAIL Y CALIBRATION
// ==========================================
// מתאים את אחוז הגובה (y) שהוגדר ב-JSON עבור 1440x1024
// לכל יחס מסך אחר (1440x900, 16:9, 1920x911 וכו') בהתאם לחיתוך הרקע.
function getCalibratedTailYPercent(basePercent, width, height) {
  if (!width || !height) return basePercent;

  const aspectRatio = width / height;
  const deltaRatio = aspectRatio - REFERENCE_ASPECT_RATIO;

  // התאמה חלקה:
  // AR 1.406 (1440x1024) -> 0% היסט (נשאר 30%)
  // AR 1.600 (1440x900)  -> -2.5% (27.5% ~ 28%)
  // AR 1.778 (16:9)      -> -5.0% (25%)
  // AR 2.108 (1920x911)  -> -9.7% (20.3% ~ 20%)
  const offset = deltaRatio * 13.8;
  const calibrated = basePercent - offset;

  return Math.max(0, Math.min(100, calibrated));
}

// ==========================================
// COORDINATES
// ==========================================

function parseCoordinate(value, total) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();

  if (trimmed.endsWith('%')) {
    return (parseFloat(trimmed) / 100) * total;
  }

  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }

  return parseFloat(trimmed) || 0;
}

function resolveTailTargetY(rawY, width, height) {
  if (rawY === undefined || rawY === null || rawY === '') {
    const defaultCalibrated = getCalibratedTailYPercent(30, width, height);
    return (defaultCalibrated / 100) * height;
  }

  if (typeof rawY === 'string' && rawY.trim().endsWith('%')) {
    const basePercent = parseFloat(rawY);
    const calibratedPercent = getCalibratedTailYPercent(
      basePercent,
      width,
      height
    );
    return (calibratedPercent / 100) * height;
  }

  if (typeof rawY === 'number') {
    const calibratedPercent = getCalibratedTailYPercent(rawY, width, height);
    return (calibratedPercent / 100) * height;
  }

  return parseCoordinate(rawY, height);
}

// ==========================================
// TEXT FORMATTING (HIGHLIGHT ✓ IN #F8B533)
// ==========================================

function renderFormattedText(content) {
  if (!content) return null;

  const parts = String(content).split(/(✓)/g);

  return parts.map((part, index) =>
    part === '✓' ? (
      <span key={index} className="speech-checkmark">
        ✓
      </span>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  );
}

// ==========================================
// BUBBLE + LEFT TAIL
// ==========================================

function createBubblePath(rect, target = null) {
  const {
    left,
    top,
    right,
    bottom,
    width,
    height,
  } = rect;

  const radius = Math.min(
    BORDER_RADIUS,
    width / 2,
    height / 2
  );

  // בועה ללא זנב (כאשר הדובר מחוץ למסך)
  if (!target) {
    return `
      M ${left + radius} ${top}
      L ${right - radius} ${top}
      Q ${right} ${top} ${right} ${top + radius}
      L ${right} ${bottom - radius}
      Q ${right} ${bottom} ${right - radius} ${bottom}
      L ${left + radius} ${bottom}
      Q ${left} ${bottom} ${left} ${bottom - radius}
      L ${left} ${top + radius}
      Q ${left} ${top} ${left + radius} ${top}
      Z
    `;
  }

  const base = Math.min(
    TAIL_BASE,
    Math.max(24, height - radius * 2)
  );

  const centerY = Math.max(
    top + radius + base / 2,
    Math.min(bottom - radius - base / 2, target.y)
  );

  const upperY = centerY - base / 2;
  const lowerY = centerY + base / 2;

  const tipX = Math.min(target.x, left - 8);
  const tipY = target.y;
  const tipRadius = TAIL_TIP_RADIUS;

  return `
    M ${left + radius} ${top}
    L ${right - radius} ${top}
    Q ${right} ${top} ${right} ${top + radius}

    L ${right} ${bottom - radius}
    Q ${right} ${bottom} ${right - radius} ${bottom}

    L ${left + radius} ${bottom}
    Q ${left} ${bottom} ${left} ${bottom - radius}

    L ${left} ${lowerY}

    L ${tipX + tipRadius} ${tipY + tipRadius}
    Q ${tipX - tipRadius} ${tipY}
      ${tipX + tipRadius} ${tipY - tipRadius}

    L ${left} ${upperY}

    L ${left} ${top + radius}
    Q ${left} ${top} ${left + radius} ${top}

    Z
  `;
}

const DEFAULT_POSITION = {
  top: '20%',
  right: '15%',
};

// ==========================================
// COMPONENT
// ==========================================

export default function SpeechBubble({
  text = '',
  step = null,
  currentStep = null,
  typeAnimation = true,
  position = DEFAULT_POSITION,
  tailTarget = null,
  centered = false,
  zIndex,
  isCompleted = false,
  onComplete,
}) {
  const resolvedStep = step ?? currentStep;
  const isStepOne = Number(resolvedStep) === 1;

  const [displayedText, setDisplayedText] = useState(
    isCompleted || !typeAnimation ? text : ''
  );

  const [geometry, setGeometry] = useState({
    path: '',
    width: 0,
    height: 0,
  });

  const bubbleRef = useRef(null);
  const layerRef = useRef(null);

  const onCompleteRef = useRef(onComplete);
  const completedTextRef = useRef(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ==========================================
  // COMPLETE ONCE
  // ==========================================

  const completeOnce = useCallback(() => {
    if (completedTextRef.current === text) return;

    completedTextRef.current = text;
    onCompleteRef.current?.();
  }, [text]);

  // ==========================================
  // TYPEWRITER ANIMATION
  // ==========================================

  useEffect(() => {
    let currentIndex = 0;
    let timer;

    if (isCompleted || !typeAnimation) {
      setDisplayedText(text);
      completeOnce();
      return;
    }

    completedTextRef.current = null;
    const characters = Array.from(text);
    setDisplayedText('');

    if (!characters.length) {
      completeOnce();
      return;
    }

    const typeNextCharacter = () => {
      currentIndex++;

      setDisplayedText(
        characters.slice(0, currentIndex).join('')
      );

      if (currentIndex < characters.length) {
        timer = setTimeout(typeNextCharacter, TYPING_SPEED);
      } else {
        completeOnce();
      }
    };

    timer = setTimeout(typeNextCharacter, TYPING_SPEED);

    return () => clearTimeout(timer);
  }, [text, typeAnimation, isCompleted, completeOnce]);

  // ==========================================
  // UPDATE SVG GEOMETRY
  // ==========================================

  const updateGeometry = useCallback(() => {
    if (!bubbleRef.current || !layerRef.current) return;

    const bubble = bubbleRef.current.getBoundingClientRect();
    const layer = layerRef.current.getBoundingClientRect();

    const rect = {
      left: bubble.left - layer.left,
      top: bubble.top - layer.top,
      right: bubble.right - layer.left,
      bottom: bubble.bottom - layer.top,
      width: bubble.width,
      height: bubble.height,
    };

    let target = null;

    if (tailTarget) {
      target = {
        x: parseCoordinate(tailTarget.x, layer.width),
        y: resolveTailTargetY(tailTarget.y, layer.width, layer.height),
      };
    }

    const nextGeometry = {
      path: createBubblePath(rect, target),
      width: layer.width,
      height: layer.height,
    };

    setGeometry((previous) => {
      if (
        previous.path === nextGeometry.path &&
        previous.width === nextGeometry.width &&
        previous.height === nextGeometry.height
      ) {
        return previous;
      }

      return nextGeometry;
    });
  }, [tailTarget]);

  // ==========================================
  // OBSERVE SIZE CHANGES
  // ==========================================

  useLayoutEffect(() => {
    updateGeometry();

    if (!bubbleRef.current || !layerRef.current) return;

    const observer = new ResizeObserver(updateGeometry);
    observer.observe(bubbleRef.current);
    observer.observe(layerRef.current);

    window.addEventListener('resize', updateGeometry);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateGeometry);
    };
  }, [updateGeometry, position, text, centered, isStepOne]);

  const resolvedBubbleStyle = centered
    ? {
        left: '50%',
        transform: 'translateX(-50%)',
        top: position?.top ?? 'auto',
        bottom: position?.bottom ?? '8%',
      }
    : position;

  const layerClasses = [
    'speech-bubble-layer',
    centered ? 'is-centered' : '',
    isStepOne ? 'is-step-1' : 'is-default-step',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={layerClasses}
      style={zIndex !== undefined ? { zIndex } : undefined}
      ref={layerRef}
    >
      <svg
        className="speech-bubble-shape"
        width={geometry.width}
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        aria-hidden="true"
      >
        {geometry.path && (
          <path
            d={geometry.path}
            fill={BUBBLE_COLOR}
            stroke={BORDER_COLOR}
            strokeWidth={BORDER_WIDTH}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </svg>

      <div
        ref={bubbleRef}
        className="speech-bubble"
        style={resolvedBubbleStyle}
      >
        <div className="speech-content">
          {/* טקסט למדידת גובה ורוחב הבועה */}
          <p className="speech-measure-text">
            {text ? renderFormattedText(text) : ' '}
          </p>

          {/* טקסט מוצג */}
          <p className="speech-visible-text">
            {renderFormattedText(displayedText)}
          </p>
        </div>
      </div>
    </div>
  );
}