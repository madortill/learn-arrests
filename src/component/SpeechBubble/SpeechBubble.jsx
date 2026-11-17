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

// ==========================================
// RESPONSIVE TAIL CALIBRATION
// ==========================================

function getResponsiveTailY(width, height) {
  const value =
    24.030896 -
    0.0133882595 * width +
    0.0237727429 * height;

  return Math.max(0, Math.min(100, value));
}

// ==========================================
// COORDINATES
// ==========================================

function parseCoordinate(value, total) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  if (value.endsWith('%')) {
    return (parseFloat(value) / 100) * total;
  }

  if (value.endsWith('px')) {
    return parseFloat(value);
  }

  return parseFloat(value) || 0;
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
  typeAnimation = true,
  position = DEFAULT_POSITION,
  tailTarget = null,
  responsiveTailTarget = true,
  centered = false,
  zIndex,
  isCompleted = false,
  onComplete,
}) {
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
      const responsiveY = responsiveTailTarget
        ? `${getResponsiveTailY(
            window.innerWidth,
            window.innerHeight
          )}%`
        : tailTarget.y;

      target = {
        x: parseCoordinate(tailTarget.x, layer.width),
        y: parseCoordinate(responsiveY, layer.height),
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
  }, [tailTarget, responsiveTailTarget]);

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
  }, [updateGeometry, position, text, centered]);

  const resolvedBubbleStyle = centered
    ? {
        left: '50%',
        transform: 'translateX(-50%)',
        top: position?.top ?? 'auto',
        bottom: position?.bottom ?? '8%',
      }
    : position;

  return (
    <div
      className={`speech-bubble-layer ${centered ? 'is-centered' : ''}`}
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
            {text || ' '}
          </p>

          {/* טקסט מוצג */}
          <p className="speech-visible-text">
            {displayedText}
          </p>
        </div>
      </div>
    </div>
  );
}