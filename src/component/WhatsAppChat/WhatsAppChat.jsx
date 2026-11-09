
import React, { useState, useEffect, useRef } from 'react';
import './WhatsAppChat.css';

const reportSample = `*דיווח עצורה:*
*שם מלא:* שי כהן
*מ.א:* 9476041
*ת.ז:* 218641473
*מגדר- זכר/נקבה:* זכר
*סוג עצור:* על"מ
*התייצבות/נעצר:* נעצרה במחסום מגב
*תאריך תחילת עבירה:* 13.01.26
*מקום המעצר/התייצבות:* ---
*בסיס מ״צ המטפל על בעצור* : מצ”ח חוף
*ייצוג סופי:* -
*תאריך מעצר* 05.07.26
*שעת מעצר:* 18:20
*שעת קבלה למעצר:* ייעודכן
*רמס:* 4
*הערות*:`;

const prisonerReport = `*דיווח עצור:*
*שם מלא:* שי כהן
*מ.א:* 9476041
*ת.ז:* 218641473
*מגדר- זכר/נקבה:* זכר
*סוג עצור:* משטמט
*התייצבות/נעצר:* נעצר במחסום מגב
*תאריך תחילת עבירה:* 13.01.26
*מקום המעצר/התייצבות:* נעצר במחסום מגב
*בסיס מ״צ המטפל על בעצור* : מ"צ אילת
*ייצוג סנגורי- צבאי/פרטי:* -
*תאריך מעצר* 05.07.26
*שעת מעצר:* 18:20
*שעת קבלה למעצר:* ייעודכן
*רמס:* 4
*הערות*:`;

const highlightText =
  '1. Lorem ipsum dolor sit amet consectetur. Cursus nulla et nisi odio eget quam adipiscing. Cras pretium ornare ut erat sociis venenatis pellentesque duis egestas. Facilisis erat ipsum.';

// הודעת שלב 2 במצב הסופי
const completedMessages = [
  {
    id: 1,
    type: 'incoming',
    sender: 'שולחי הדיווחים',
    text: reportSample,
    time: '05:43',
  },
  {
    id: 2,
    type: 'incoming',
    sender: 'שולחי הדיווחים',
    text: reportSample,
    time: '05:43',
  },
  {
    id: 3,
    type: 'incoming',
    sender: 'שולחי הדיווחים',
    text: reportSample,
    time: '05:44',
  },
  {
    id: 4,
    type: 'outgoing',
    text: 'זאת היתה פעימת הבוקר של 06:30',
    time: '05:44',
  },
  {
    id: 5,
    type: 'outgoing',
    text: 'בפעימה זאת מקבלים דיווחים עד השעה 06:00',
    time: '05:44',
  },
  {
    id: 6,
    type: 'outgoing',
    text: 'פלוגת הליוויים עובדת לפי ארבע פעימות',
    time: '05:45',
  },
  {
    id: 'confirmed-highlight',
    type: 'outgoing',
    text: highlightText,
    time: '05:45',
  },
  {
    id: 7,
    type: 'outgoing',
    text: 'עכשיו בוא נבין את פריסת המעצרים',
    time: '08:27',
  },
  {
    id: 8,
    type: 'outgoing',
    text: 'לחץ על המיקום בשביל להמשיך',
    time: '08:27',
  },
  {
    id: 9,
    type: 'location_card',
    time: '08:27',
  },
];

// שתי הודעות של שלב 8 במצב הסופי
const prisonerCompletedMessages = [
  {
    id: 1,
    type: 'outgoing',
    text: 'זה העצור שאנחנו נלווה היום:',
    time: '08:30',
  },
  {
    id: 2,
    type: 'outgoing',
    text: prisonerReport,
    time: '08:31',
  },
];

export default function WhatsAppChat({
  part = 1,
  onNext,
  onComplete,
  isCompleted = false,
}) {
  const isPrisonerPart = Number(part) === 2;

  const [messages, setMessages] = useState([]);

  const [sequenceStep, setSequenceStep] = useState(0);

  const [showHighlightCard, setShowHighlightCard] = useState(false);

  const [isConfirmed, setIsConfirmed] = useState(false);

  const [canScroll, setCanScroll] = useState(false);

  const lastMessageRef = useRef(null);

  // מונע קריאות כפולות ל-onComplete
  const completionNotifiedRef = useRef(false);

  const delay = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

  // גלילה להודעה האחרונה
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [messages, showHighlightCard]);

  // שחזור שלב שהושלם
  useEffect(() => {
    if (!isCompleted) return;

    if (isPrisonerPart) {
      // שלב 8: תמיד שתי הודעות רגילות בחזרה לשלב
      setMessages(prisonerCompletedMessages);
      setSequenceStep(2);
      setShowHighlightCard(false);
      setIsConfirmed(true);
      setCanScroll(true);

      // הצגת כפתור ההמשך האוניברסלי גם בחזרה לשלב
      if (!completionNotifiedRef.current) {
        completionNotifiedRef.current = true;
        onComplete?.();
      }

    } else {
      setMessages(completedMessages);
      setSequenceStep(2);
      setShowHighlightCard(false);
      setIsConfirmed(true);
      setCanScroll(true);
    }

  }, [isCompleted, isPrisonerPart, onComplete]);

  // הזרמת ההודעות
  useEffect(() => {
    if (isCompleted) return;

    let isMounted = true;

    const runSequence = async () => {

      // =================================
      // שלב 8 - דיווח עצור
      // =================================
      if (isPrisonerPart) {
        if (sequenceStep !== 0) return;

        await delay(400);
        if (!isMounted) return;

        // הודעה ראשונה
        setMessages([
          {
            id: 1,
            type: 'outgoing',
            text: 'זה העצור שאנחנו נלווה היום:',
            time: '08:30',
          },
        ]);

        // המתנה של שנייה וחצי
        await delay(1500);
        if (!isMounted) return;

        // הצגת ההודעה השנייה ככרטיס אישור
        setShowHighlightCard(true);

        setSequenceStep(1);

        return;
      }

      // =================================
      // שלב 2 - הזרמת הדיווחים
      // =================================
      if (sequenceStep === 0) {
        await delay(400);
        if (!isMounted) return;

        setMessages(prev => [
          ...prev,
          {
            id: 1,
            type: 'incoming',
            sender: 'שולחי הדיווחים',
            text: reportSample,
            time: '05:43',
          },
        ]);

        await delay(500);
        if (!isMounted) return;

        setMessages(prev => [
          ...prev,
          {
            id: 2,
            type: 'incoming',
            sender: 'שולחי הדיווחים',
            text: reportSample,
            time: '05:43',
          },
        ]);

        await delay(600);
        if (!isMounted) return;

        setMessages(prev => [
          ...prev,
          {
            id: 3,
            type: 'incoming',
            sender: 'שולחי הדיווחים',
            text: reportSample,
            time: '05:44',
          },
        ]);

        setSequenceStep(1);
      }

      // שלב 2 - הודעות הסבר
      if (sequenceStep === 1) {
        await delay(1800);
        if (!isMounted) return;

        setMessages(prev => [
          ...prev,
          {
            id: 4,
            type: 'outgoing',
            text: 'זאת היתה פעימת הבוקר של 06:30',
            time: '05:44',
          },
        ]);

        await delay(2200);
        if (!isMounted) return;

        setMessages(prev => [
          ...prev,
          {
            id: 5,
            type: 'outgoing',
            text: 'בפעימה זאת מקבלים דיווחים עד השעה 06:00',
            time: '05:44',
          },
        ]);

        await delay(2000);
        if (!isMounted) return;

        setMessages(prev => [
          ...prev,
          {
            id: 6,
            type: 'outgoing',
            text: 'פלוגת הליוויים עובדת לפי ארבע פעימות',
            time: '05:45',
          },
        ]);

        await delay(1200);
        if (!isMounted) return;

        setShowHighlightCard(true);
      }
    };

    runSequence();

    return () => {
      isMounted = false;
    };

  }, [sequenceStep, isCompleted, isPrisonerPart]);

  // =================================
  // אישור הכרטיס בשלב 2
  // =================================
  const handleConfirmHighlight = async () => {
    if (isConfirmed) return;

    setIsConfirmed(true);

    await delay(400);

    setMessages(prev => [
      ...prev,
      {
        id: 'confirmed-highlight',
        type: 'outgoing',
        text: highlightText,
        time: '05:45',
      },
    ]);

    setShowHighlightCard(false);

    await delay(1200);

    setMessages(prev => [
      ...prev,
      {
        id: 7,
        type: 'outgoing',
        text: 'עכשיו בוא נבין את פריסת המעצרים',
        time: '08:27',
      },
    ]);

    await delay(1600);

    setMessages(prev => [
      ...prev,
      {
        id: 8,
        type: 'outgoing',
        text: 'לחץ על המיקום בשביל להמשיך',
        time: '08:27',
      },
    ]);

    await delay(1400);

    setMessages(prev => [
      ...prev,
      {
        id: 9,
        type: 'location_card',
        time: '08:27',
      },
    ]);

    setCanScroll(true);

    onComplete?.();
  };

  // =================================
  // אישור דיווח העצור בשלב 8
  // =================================
  const handleConfirmPrisoner = () => {
    if (isConfirmed) return;

    setIsConfirmed(true);
    setShowHighlightCard(false);

    // הפיכת כרטיס האישור להודעה רגילה
    setMessages(prev => [
      ...prev,
      {
        id: 2,
        type: 'outgoing',
        text: prisonerReport,
        time: '08:31',
      },
    ]);

    setCanScroll(true);

    // סימון השלב כהושלם והצגת ההמשך האוניברסלי
    completionNotifiedRef.current = true;
    onComplete?.();
  };

  return (
    <div className="wa-chat-flow-container">

      <div className="wa-header">

        <div className="wa-header-right">
          <button className="wa-back-btn">➔</button>

          <div className="wa-avatar">👥</div>

          <div className="wa-title-container">
            <h2 className="wa-group-title">
              איסופים ממעצרים
            </h2>

            <span className="wa-group-sub">
              12 משתתפים
            </span>
          </div>
        </div>

        <div className="wa-header-actions">
          <button className="wa-icon-btn">📹</button>
          <button className="wa-icon-btn">📞</button>
          <button className="wa-icon-btn">⋮</button>
        </div>

      </div>

      <div className={`wa-body ${canScroll ? 'allow-scroll' : 'lock-scroll'}`}>

        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;

          if (msg.type === 'incoming') {
            return (
              <div
                key={msg.id}
                ref={isLast ? lastMessageRef : null}
                className="wa-message incoming-report"
              >
                <div className="wa-sender-name">
                  {msg.sender}
                </div>

                <pre className="wa-report-text">
                  {msg.text}
                </pre>

                <span className="wa-time">
                  {msg.time}
                </span>
              </div>
            );
          }

          if (msg.type === 'outgoing') {
            return (
              <div
                key={msg.id}
                ref={isLast ? lastMessageRef : null}
                className="wa-message outgoing"
              >
                <p>{msg.text}</p>

                <span className="wa-time">
                  {msg.time}{' '}
                  <span className="wa-ticks blue">✓✓</span>
                </span>
              </div>
            );
          }

          if (msg.type === 'location_card') {
            return (
              <div
                key={msg.id}
                ref={isLast ? lastMessageRef : null}
                className="wa-map-preview-card"
                onClick={onNext}
              >
                <div className="wa-map-preview-content">
                  <span className="map-icon">📍</span>

                  <div className="map-text-group">
                    <strong>מיקום מעצרים</strong>
                    <small>לחץ/י כאן לפתיחת המפה</small>
                  </div>
                </div>

                <span className="wa-time map-time">
                  {msg.time}{' '}
                  <span className="wa-ticks blue">✓✓</span>
                </span>
              </div>
            );
          }

          return null;
        })}

        {/* כרטיס אישור */}
        {showHighlightCard && (
          <div
            className="wa-highlight-card-wrapper"
            ref={lastMessageRef}
          >
            <div className="wa-highlight-card">

              <p className="wa-highlight-text">
                {isPrisonerPart ? prisonerReport : highlightText}
              </p>

              <button
                className={`wa-confirm-btn ${isConfirmed ? 'confirmed' : ''}`}
                onClick={
                  isPrisonerPart
                    ? handleConfirmPrisoner
                    : handleConfirmHighlight
                }
                disabled={isConfirmed}
              >
                {isPrisonerPart
                  ? 'אוקיי'
                  : isConfirmed
                    ? '✓'
                    : '👍'}
              </button>

            </div>
          </div>
        )}

      </div>

      <div className="wa-footer">
        <button className="wa-footer-btn">😃</button>

        <div className="wa-input-placeholder">
          הקלד/י הודעה...
        </div>

        <button className="wa-footer-btn">📎</button>
        <button className="wa-footer-btn">📷</button>
        <button className="wa-mic-btn">🎙️</button>
      </div>

    </div>
  );
}
