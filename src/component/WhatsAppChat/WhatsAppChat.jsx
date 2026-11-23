import React, { useState, useEffect, useRef, useMemo } from 'react';
import highlightConfirmIcon from '../../assets/highlight-confirm-icon.svg';
import './WhatsAppChat.css';

/* =========================================
   אייקונים וקטוריים של WhatsApp
========================================= */

const Icons = {
  BackArrow: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z" />
    </svg>
  ),
  GroupAvatar: () => (
    <svg viewBox="0 0 212 212" width="100%" height="100%">
      <path
        fill="#DFE5E7"
        d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"
      />
      <path
        fill="#FFFFFF"
        d="M127.7 109.9c8.6-5.2 14.3-14.6 14.3-25.4 0-16.4-13.3-29.7-29.7-29.7-6.9 0-13.2 2.4-18.3 6.3 5.7 6.2 9.2 14.4 9.2 23.4 0 9.6-3.9 18.2-10.3 24.5 10.6 3.5 18.8 12.1 21.6 22.9h29.9c0-14.7-7.1-27.7-16.7-32zm-41.4-2.1c13.8 0 25-11.2 25-25s-11.2-25-25-25-25 11.2-25 25 11.2 25 25 25zm0 12.5c-16.7 0-50 8.4-50 25v12.5h100v-12.5c0-16.6-33.3-25-50-25z"
      />
    </svg>
  ),
  VideoCall: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  ),
  VoiceCall: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon-sm" fill="currentColor">
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  ),
  MenuDots: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z" />
    </svg>
  ),
  DoubleCheck: () => (
    <svg viewBox="0 0 16 11" className="wa-tick-svg" fill="currentColor">
      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273zm3.69 0a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.134-.635.782 1.445 1.445a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273z" />
    </svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  ),
  Attach: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" className="wa-svg-icon" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
    </svg>
  ),
  LocationPin: () => (
    <svg viewBox="0 0 24 24" className="wa-pin-svg" fill="#008069">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  ),
};

/* =========================================
   פרסור טקסט בסגנון WhatsApp
========================================= */

function FormattedWhatsAppText({ text, allowBold = true }) {
  if (!text) return null;

  const cleanText = allowBold ? text : text.replace(/\*/g, '');
  const lines = cleanText.split('\n');

  return (
    <div className="wa-formatted-text">
      {lines.map((line, lineIdx) => {
        if (!allowBold) {
          return (
            <div key={lineIdx} className="wa-text-line">
              {line}
            </div>
          );
        }

        const parts = line.split(/(\*[^*]+\*)/g);
        return (
          <div key={lineIdx} className="wa-text-line">
            {parts.map((part, partIdx) => {
              if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                return <strong key={partIdx}>{part.slice(1, -1)}</strong>;
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================
   קיבוץ הודעות שצריכות להופיע יחד (כמו 8 ו-9)
========================================= */

function groupMessagesIntoBatches(list) {
  const batches = [];
  for (const item of list) {
    if (item.groupWithPrevious && batches.length > 0) {
      batches[batches.length - 1].items.push(item);
    } else {
      batches.push({
        batchId: `batch-${item.id}`,
        delay: item.delay,
        items: [item],
      });
    }
  }
  return batches;
}

/* =========================================
   נתוני ברירת מחדל
========================================= */

const DEFAULT_CHAT_DATA = {
  1: {
    groupTitle: 'איסופים ממעצרים',
    groupSubtitle: '12 משתתפים',
    reportSamples: [],
    introMessages: [],
    highlightMessage: null,
    afterConfirmMessages: [],
  },
  2: {
    groupTitle: 'איסופים ממעצרים',
    groupSubtitle: '12 משתתפים',
    reportSamples: [],
    introMessages: [],
    highlightMessage: null,
    afterConfirmMessages: [],
  },
};

export default function WhatsAppChat({
  part = 1,
  chatData,
  onNext,
  onComplete,
  isCompleted = false,
}) {
  const activeData = useMemo(() => {
    const fallback = DEFAULT_CHAT_DATA[Number(part)] || DEFAULT_CHAT_DATA[1];
    return {
      groupTitle: chatData?.groupTitle || fallback.groupTitle,
      groupSubtitle: chatData?.groupSubtitle || fallback.groupSubtitle,
      reportSamples: chatData?.reportSamples || fallback.reportSamples,
      introMessages: chatData?.introMessages || fallback.introMessages,
      highlightMessage: chatData?.highlightMessage || fallback.highlightMessage,
      afterConfirmMessages:
        chatData?.afterConfirmMessages || fallback.afterConfirmMessages,
    };
  }, [part, chatData]);

  const [messageBatches, setMessageBatches] = useState([]);
  const [showHighlightCard, setShowHighlightCard] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const chatBodyRef = useRef(null);
  const firstIntroRef = useRef(null);
  const lastBatchRef = useRef(null);
  const hasAnchoredFirstIntroRef = useRef(false);
  const isPartFinishedRef = useRef(false);
  const completionNotifiedRef = useRef(false);

  const firstIntroId = activeData.introMessages?.[0]?.id;

  const highlightLayout = useMemo(() => {
    const text = activeData.highlightMessage?.text || '';
    const lineCount = text.split('\n').length;
    const charLength = text.length;

    if (lineCount >= 10 || charLength >= 260) {
      return {
        densityClass: 'density-compact',
        iconScale: 1.35,
      };
    }
    if (lineCount >= 5 || charLength >= 150) {
      return {
        densityClass: 'density-medium',
        iconScale: 1.18,
      };
    }
    return {
      densityClass: 'density-normal',
      iconScale: 1,
    };
  }, [activeData.highlightMessage]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // פתיחת גלילה חופשית + גלילה אוטומטית חלקה להודעה הכי אחרונה בסיום החלק
  const finishPartAndScrollToBottom = () => {
    isPartFinishedRef.current = true;
    setCanScroll(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = chatBodyRef.current;
        if (!container) return;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      });
    });

    if (!completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.();
    }
  };

  // גלילה פנימית מדויקת במהלך ההזרמה
  useEffect(() => {
    if (isCompleted || isPartFinishedRef.current) return;

    const timer = setTimeout(() => {
      const container = chatBodyRef.current;
      if (!container) return;

      const allMessages = messageBatches.flatMap((b) => b.items);
      const hasFirstIntro =
        firstIntroId != null && allMessages.some((m) => m.id === firstIntroId);

      // 1. ברגע שהודעת introMessages הראשונה מופיעה — מעלים אותה לראש המסך הנראה
      if (
        hasFirstIntro &&
        !hasAnchoredFirstIntroRef.current &&
        firstIntroRef.current
      ) {
        hasAnchoredFirstIntroRef.current = true;
        const topGap = Math.max(18, container.clientHeight * 0.035);
        const targetScrollTop = Math.max(
          0,
          firstIntroRef.current.offsetTop - topGap
        );
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
        return;
      }

      // 2. אחרי שהודעת הפתיחה הירוקה למעלה: גוללים רק אם הבלוק האחרון חורג מתחתית המסך
      if (hasAnchoredFirstIntroRef.current) {
        if (lastBatchRef.current) {
          const el = lastBatchRef.current;
          const bottomGap = Math.max(14, container.clientHeight * 0.025);
          const elementBottom = el.offsetTop + el.offsetHeight;
          const visibleBottom = container.scrollTop + container.clientHeight;

          if (elementBottom > visibleBottom - bottomGap) {
            const desiredScrollTop =
              elementBottom - container.clientHeight + bottomGap;
            container.scrollTo({
              top: Math.max(container.scrollTop, desiredScrollTop),
              behavior: 'smooth',
            });
          }
        }
        return;
      }

      // 3. בזמן הגעת ההודעות הלבנות (reportSamples) — מציגים כל הודעה מראשה
      if (lastBatchRef.current) {
        const el = lastBatchRef.current;
        const topGap = Math.max(14, container.clientHeight * 0.025);
        container.scrollTo({
          top: Math.max(0, el.offsetTop - topGap),
          behavior: 'smooth',
        });
      }
    }, 30);

    return () => clearTimeout(timer);
  }, [messageBatches, showHighlightCard, firstIntroId, isCompleted]);

  // שחזור שלב שהושלם
  useEffect(() => {
    if (!isCompleted) return;

    const allFinalItems = [
      ...activeData.reportSamples.map((r) => ({ ...r, isReportSample: true })),
      ...activeData.introMessages,
      ...(activeData.highlightMessage ? [activeData.highlightMessage] : []),
      ...activeData.afterConfirmMessages,
    ];

    setMessageBatches(groupMessagesIntoBatches(allFinalItems));
    setShowHighlightCard(false);
    setIsConfirmed(true);
    finishPartAndScrollToBottom();
  }, [isCompleted, activeData]);

  // הזרמת הודעות מתוך ה-JSON
  useEffect(() => {
    if (isCompleted) return;

    let isMounted = true;
    setMessageBatches([]);
    setShowHighlightCard(false);
    setIsConfirmed(false);
    setCanScroll(false);
    hasAnchoredFirstIntroRef.current = false;
    isPartFinishedRef.current = false;
    completionNotifiedRef.current = false;

    const runSequence = async () => {
      // 1. כל הודעה ב-reportSamples מופיעה, נשארת שנייה אחת להסתכל עליה, ואז גוללים להודעה הבאה
      const reportBatches = groupMessagesIntoBatches(
        activeData.reportSamples.map((r) => ({ ...r, isReportSample: true }))
      );

      for (let idx = 0; idx < reportBatches.length; idx++) {
        const batch = reportBatches[idx];
        if (idx === 0) {
          await delay(batch.delay ?? 400);
          if (!isMounted) return;
        }

        setMessageBatches((prev) => [...prev, batch]);

        await delay(1000);
        if (!isMounted) return;
      }

      // 2. שליחת הודעות ההסבר מתוך introMessages
      const introBatches = groupMessagesIntoBatches(activeData.introMessages);
      for (let idx = 0; idx < introBatches.length; idx++) {
        const batch = introBatches[idx];
        if (!(idx === 0 && reportBatches.length > 0)) {
          await delay(batch.delay ?? 1200);
          if (!isMounted) return;
        }
        setMessageBatches((prev) => [...prev, batch]);
      }

      // 3. הצגת כרטיס האישור המודגש או סיום החלק
      if (activeData.highlightMessage) {
        await delay(activeData.highlightMessage.delay ?? 1100);
        if (!isMounted) return;
        setShowHighlightCard(true);
      } else {
        finishPartAndScrollToBottom();
      }
    };

    runSequence();

    return () => {
      isMounted = false;
    };
  }, [activeData, isCompleted]);

  // אישור הכרטיס המודגש, הצגת הודעות ההמשך, וסיום החלק עם גלילה אוטומטית להודעה האחרונה ופתיחת גלילה חופשית
  const handleConfirmHighlight = async () => {
    if (isConfirmed) return;

    setIsConfirmed(true);
    setShowHighlightCard(false);

    if (activeData.highlightMessage) {
      setMessageBatches((prev) => [
        ...prev,
        {
          batchId: `batch-${activeData.highlightMessage.id}`,
          items: [activeData.highlightMessage],
        },
      ]);
    }

    const afterBatches = groupMessagesIntoBatches(
      activeData.afterConfirmMessages || []
    );

    for (const batch of afterBatches) {
      await delay(batch.delay ?? 1100);
      setMessageBatches((prev) => [...prev, batch]);
    }

    // בסיום החלק: גלילה אוטומטית למטה להודעה הכי אחרונה ופתיחת אפשרות לגלילה חופשית
    finishPartAndScrollToBottom();
  };

  const renderSingleMessage = (msg) => {
    const isFirstIntro = msg.id === firstIntroId;

    if (msg.type === 'incoming') {
      return (
        <div
          key={msg.id}
          ref={isFirstIntro ? firstIntroRef : null}
          className="wa-message incoming-report wa-animate-in"
        >
          {msg.sender && <div className="wa-sender-name">{msg.sender}</div>}

          <FormattedWhatsAppText
            text={msg.text}
            allowBold={!msg.isReportSample}
          />

          <span className="wa-time">{msg.time}</span>
        </div>
      );
    }

    if (msg.type === 'outgoing') {
      return (
        <div
          key={msg.id}
          ref={isFirstIntro ? firstIntroRef : null}
          className="wa-message outgoing wa-animate-in"
        >
          <FormattedWhatsAppText text={msg.text} allowBold={true} />

          <span className="wa-time">
            {msg.time}
            <span className="wa-ticks blue">
              <Icons.DoubleCheck />
            </span>
          </span>
        </div>
      );
    }

    if (msg.type === 'location_card') {
      return (
        <div
          key={msg.id}
          ref={isFirstIntro ? firstIntroRef : null}
          className="wa-map-preview-card wa-animate-in"
          onClick={onNext}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNext?.();
          }}
        >
          <div className="wa-map-visual">
            <div className="wa-map-pin-badge">
              <Icons.LocationPin />
            </div>
          </div>

          <div className="wa-map-preview-content">
            <div className="map-text-group">
              <strong>{msg.title || 'מיקום מעצרים'}</strong>
              <small>{msg.subtitle || 'לחץ/י כאן לפתיחת המפה'}</small>
            </div>
          </div>

          <span className="wa-time map-time">
            {msg.time}
            <span className="wa-ticks blue">
              <Icons.DoubleCheck />
            </span>
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="wa-chat-flow-container">
      {/* סרגל עליון קבוע לחלוטין */}
      <header className="wa-header">
        <div className="wa-header-right">
          <button
            type="button"
            className="wa-back-btn"
            aria-label="חזרה"
            tabIndex={-1}
          >
            <Icons.BackArrow />
          </button>

          <div className="wa-avatar">
            <Icons.GroupAvatar />
          </div>

          <div className="wa-title-container">
            <h2 className="wa-group-title">{activeData.groupTitle}</h2>
            <span className="wa-group-sub">{activeData.groupSubtitle}</span>
          </div>
        </div>

        <div className="wa-header-actions">
          <button type="button" className="wa-icon-btn" tabIndex={-1}>
            <Icons.VideoCall />
          </button>
          <button type="button" className="wa-icon-btn" tabIndex={-1}>
            <Icons.VoiceCall />
          </button>
          <button type="button" className="wa-icon-btn" tabIndex={-1}>
            <Icons.MenuDots />
          </button>
        </div>
      </header>

      {/* גוף השיחה (היחיד שנגלל) */}
      <div
        ref={chatBodyRef}
        className={`wa-body ${canScroll ? 'allow-scroll' : 'lock-scroll'}`}
      >
        {messageBatches.map((batch, batchIndex) => {
          const isLastBatch =
            batchIndex === messageBatches.length - 1 && !showHighlightCard;

          return (
            <div
              key={batch.batchId}
              ref={isLastBatch ? lastBatchRef : null}
              className="wa-message-batch"
            >
              {batch.items.map((msg) => renderSingleMessage(msg))}
            </div>
          );
        })}

        {/* כרטיס אישור מודגש */}
        {showHighlightCard && activeData.highlightMessage && (
          <div
            className="wa-highlight-card-wrapper wa-animate-in"
            ref={lastBatchRef}
          >
            <div
              className={`wa-highlight-card ${highlightLayout.densityClass}`}
              style={{ '--icon-scale': highlightLayout.iconScale }}
            >
              <div className="wa-highlight-text">
                <FormattedWhatsAppText
                  text={activeData.highlightMessage.text}
                  allowBold={true}
                />
              </div>

              <button
                type="button"
                className={`wa-confirm-btn ${isConfirmed ? 'confirmed' : ''}`}
                onClick={handleConfirmHighlight}
                disabled={isConfirmed}
                aria-label="אישור"
              >
                <img
                  src={highlightConfirmIcon}
                  alt="אישור"
                  className="wa-confirm-btn-icon"
                  draggable="false"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* סרגל תחתון קבוע לחלוטין */}
      <footer className="wa-footer">
        <button type="button" className="wa-footer-btn" tabIndex={-1}>
          <Icons.Emoji />
        </button>

        <div className="wa-input-box">
          <span className="wa-input-placeholder">הודעה</span>
          <div className="wa-input-icons">
            <Icons.Attach />
            <Icons.Camera />
          </div>
        </div>

        <button type="button" className="wa-mic-btn" tabIndex={-1}>
          <Icons.Mic />
        </button>
      </footer>
    </div>
  );
}