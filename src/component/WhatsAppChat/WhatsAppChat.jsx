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

export default function WhatsAppChat({ onNext }) {
  const [messages, setMessages] = useState([]);
  const [sequenceStep, setSequenceStep] = useState(0);
  const [showHighlightCard, setShowHighlightCard] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }, [messages, showHighlightCard]);

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      // --- חלק 1: הזרמת הדיווחים ---
      if (sequenceStep === 0) {
        await new Promise(r => setTimeout(r, 400));
        if (!isMounted) return;
        setMessages(prev => [...prev, { id: 1, type: 'incoming', sender: 'שולחי הדיווחים', text: reportSample, time: '05:43' }]);

        await new Promise(r => setTimeout(r, 500));
        if (!isMounted) return;
        setMessages(prev => [...prev, { id: 2, type: 'incoming', sender: 'שולחי הדיווחים', text: reportSample, time: '05:43' }]);

        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;
        setMessages(prev => [...prev, { id: 3, type: 'incoming', sender: 'שולחי הדיווחים', text: reportSample, time: '05:44' }]);

        setSequenceStep(1);
      }

      // --- חלק 2: הודעות הסבר ---
      if (sequenceStep === 1) {
        await new Promise(r => setTimeout(r, 1800));
        if (!isMounted) return;
        setMessages(prev => [...prev, { id: 4, type: 'outgoing', text: 'זאת היתה פעימת הבוקר של 06:30', time: '05:44' }]);

        await new Promise(r => setTimeout(r, 2200));
        if (!isMounted) return;
        setMessages(prev => [...prev, { id: 5, type: 'outgoing', text: 'בפעימה זאת מקבלים דיווחים עד השעה 06:00', time: '05:44' }]);

        await new Promise(r => setTimeout(r, 2000));
        if (!isMounted) return;
        setMessages(prev => [...prev, { id: 6, type: 'outgoing', text: 'פלוגת הליוויים עובדת לפי ארבע פעימות', time: '05:45' }]);

        await new Promise(r => setTimeout(r, 1200));
        if (!isMounted) return;
        setShowHighlightCard(true);
      }
    };

    runSequence();

    return () => { isMounted = false; };
  }, [sequenceStep]);

  // בלחיצה על אישור ההודעה המודגשת - הזנת ההודעות האחרונות אחת-אחת בהשהיה
  const handleConfirmHighlight = async () => {
    setIsConfirmed(true);
    await new Promise(r => setTimeout(r, 400));

    // 1. הפיכת ההודעה המודגשת להודעה רגילה
    setMessages(prev => [
      ...prev,
      {
        id: 'confirmed-highlight',
        type: 'outgoing',
        text: '1. Lorem ipsum dolor sit amet consectetur. Cursus nulla et nisi odio eget quam adipiscing. Cras pretium ornare ut erat sociis venenatis pellentesque duis egestas. Facilisis erat ipsum.',
        time: '05:45'
      }
    ]);
    setShowHighlightCard(false);

    // 2. הזרמת 3 ההודעות האחרונות אחת אחרי השנייה
    await new Promise(r => setTimeout(r, 1200));
    setMessages(prev => [
      ...prev,
      { id: 7, type: 'outgoing', text: 'עכשיו בוא נבין את פריסת המעצרים', time: '08:27' }
    ]);

    await new Promise(r => setTimeout(r, 1600));
    setMessages(prev => [
      ...prev,
      { id: 8, type: 'outgoing', text: 'לחץ על המיקום בשביל להמשיך', time: '08:27' }
    ]);

    await new Promise(r => setTimeout(r, 1400));
    setMessages(prev => [
      ...prev,
      { id: 9, type: 'location_card', time: '08:27' }
    ]);

    setCanScroll(true); // פתיחת אפשרות הגלילה בסיום
  };

  return (
    <div className="wa-chat-flow-container">
      <div className="wa-header">
        <div className="wa-header-right">
          <button className="wa-back-btn">➔</button>
          <div className="wa-avatar">👥</div>
          <div className="wa-title-container">
            <h2 className="wa-group-title">איסופים ממעצרים</h2>
            <span className="wa-group-sub">12 משתתפים</span>
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
              <div key={msg.id} ref={isLast ? lastMessageRef : null} className="wa-message incoming-report">
                <div className="wa-sender-name">{msg.sender}</div>
                <pre className="wa-report-text">{msg.text}</pre>
                <span className="wa-time">{msg.time}</span>
              </div>
            );
          }

          if (msg.type === 'outgoing') {
            return (
              <div key={msg.id} ref={isLast ? lastMessageRef : null} className="wa-message outgoing">
                <p>{msg.text}</p>
                <span className="wa-time">{msg.time} <span className="wa-ticks blue">✓✓</span></span>
              </div>
            );
          }

          if (msg.type === 'location_card') {
            return (
              <div key={msg.id} ref={isLast ? lastMessageRef : null} className="wa-map-preview-card" onClick={onNext}>
                <div className="wa-map-preview-content">
                  <span className="map-icon">📍</span>
                  <div className="map-text-group">
                    <strong>מיקום מעצרים</strong>
                    <small>לחץ/י כאן לפתיחת המפה</small>
                  </div>
                </div>
                <span className="wa-time map-time">{msg.time} <span className="wa-ticks blue">✓✓</span></span>
              </div>
            );
          }

          return null;
        })}

        {showHighlightCard && (
          <div className="wa-highlight-card-wrapper" ref={lastMessageRef}>
            <div className="wa-highlight-card">
              <p className="wa-highlight-text">
                1. Lorem ipsum dolor sit amet consectetur. Cursus nulla et nisi odio eget quam adipiscing. Cras pretium ornare ut erat sociis venenatis pellentesque duis egestas. Facilisis erat ipsum.
              </p>
              <button 
                className={`wa-confirm-btn ${isConfirmed ? 'confirmed' : ''}`}
                onClick={handleConfirmHighlight}
                disabled={isConfirmed}
              >
                {isConfirmed ? '✓' : '👍'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="wa-footer">
        <button className="wa-footer-btn">😃</button>
        <div className="wa-input-placeholder">הקלד/י הודעה...</div>
        <button className="wa-footer-btn">📎</button>
        <button className="wa-footer-btn">📷</button>
        <button className="wa-mic-btn">🎙️</button>
      </div>
    </div>
  );
}