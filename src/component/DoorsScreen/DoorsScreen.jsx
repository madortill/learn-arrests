import React from 'react';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import './DoorsScreen.css';

import doorClosed from '../../assets/DoorsScreen/door_closed.png';
import doorLocked from '../../assets/DoorsScreen/door_locked.png';
import doorOpen from '../../assets/DoorsScreen/door_open.png';
import hallBackground from '../../assets/DoorsScreen/doors_hall_bg.jpg';

// ==========================================
// נתוני הדלתות (שלבים 24-27)
// ==========================================

const doorsData = [
  {
    id: 24,
    title: 'אחריות\nהמלווים\nבקבלה',
    lockReason: '',
  },
  {
    id: 25,
    title: 'קליטת\nעצור\nבמצ"ח',
    lockReason: 'יש לסיים קודם את שלב אחריות המלווים בקבלה.',
  },
  {
    id: 26,
    title: 'דגשים\nלקבלה',
    lockReason: '',
  },
  {
    id: 27,
    title: 'תרגול\nאחרון',
    lockReason: 'יש להשלים את השלבים האחרים קודם.',
  },
];

// ==========================================
// הגדרות מיקום בועת הדיבור
// ==========================================

const DOORS_SPEECH_POSITION = {
  top: '10%',
  right: '30%',
};

const DOORS_SPEECH_TAIL_TARGET = {
  x: '-5%',
  y: '15%',
};

// ==========================================
// טקסט דינמי לבועת הדיבור לפי כמות הדלתות שנותרו
// ==========================================

const getSpeechBubbleText = (remainingCount) => {
  switch (remainingCount) {
    case 4:
      return 'מעולה הגעתם כמעט לסוף נשארו לכם רק עוד 4 כיתות לעבור בהם';
    case 3:
      return 'מעולה! נשארו לכם רק עוד 3 כיתות לעבור בהן';
    case 2:
      return 'כל הכבוד! נשארו לכם רק עוד 2 כיתות לעבור בהן';
    case 1:
      return 'אלופים! נשארה לכם רק עוד כיתה אחת לעבור בה';
    default:
      return 'כל הכבוד! סיימתם את כל הכיתות, לחצו על כפתור ההמשך כדי לסיים';
  }
};

// ==========================================
// בדיקת נעילת דלת
// ==========================================

const isDoorLocked = (id, completedStages) => {
  // חדר שהושלם כבר אינו נעול
  if (completedStages[id]) return false;

  // חדר 25 נפתח לאחר השלמת חדר 24
  if (id === 25) {
    return !completedStages[24];
  }

  // חדר 27 נפתח לאחר השלמת שלושת החדרים הראשונים
  if (id === 27) {
    return !(
      completedStages[24] &&
      completedStages[25] &&
      completedStages[26]
    );
  }

  return false;
};

// ==========================================
// קומפוננטת מסדרון הדלתות
// ==========================================

export default function DoorsScreen({
  completedStages = {},
  onEnterStage,
}) {
  const completedCount = doorsData.filter((door) =>
    Boolean(completedStages[door.id])
  ).length;

  const remainingDoorsCount = doorsData.length - completedCount;
  const speechBubbleText = getSpeechBubbleText(remainingDoorsCount);

  return (
    <div className="doors-container">
      {/* רקע המסדרון */}
      <img
        src={hallBackground}
        alt=""
        className="doors-hall-bg"
        draggable="false"
      />

      {/* בועת דיבור דינמית */}
      <SpeechBubble
        step={24}
        text={speechBubbleText}
        typeAnimation={false}
        position={DOORS_SPEECH_POSITION}
        tailTarget={DOORS_SPEECH_TAIL_TARGET}
      />

      {/* ארבע הדלתות */}
      <div className="doors-row">
        {doorsData.map((door) => {
          const isDone = Boolean(completedStages[door.id]);
          const locked = isDoorLocked(door.id, completedStages);

          const doorImage = isDone
            ? doorOpen
            : locked
              ? doorLocked
              : doorClosed;

          const status = isDone
            ? 'בוצע'
            : locked
              ? 'סגור'
              : 'לא בוצע';

          const statusClass = isDone
            ? 'status-done'
            : locked
              ? 'status-locked'
              : 'status-not-done';

          return (
            <div className="door-wrapper" key={door.id}>
              {/* תווית מצב הדלת */}
              <div className={`door-status-label ${statusClass}`}>
                {isDone ? (
                  'בוצע'
                ) : locked ? (
                  'סגור'
                ) : (
                  <>
                    לא
                    <br />
                    בוצע
                  </>
                )}
              </div>

              {/* הדלת עצמה */}
              <button
                type="button"
                className={`door-frame ${
                  locked ? 'locked-cursor' : 'pointer-cursor'
                }`}
                onClick={() => {
                  if (!locked) {
                    onEnterStage?.(door.id);
                  }
                }}
                aria-label={`${door.title.replaceAll('\n', ' ')} - ${status}`}
                aria-disabled={locked}
              >
                <img
                  src={doorImage}
                  alt=""
                  className="door-img"
                  draggable="false"
                />

                {/* כותרת החדר */}
                {!isDone && !locked && (
                  <div className="door-title">
                    {door.title}
                  </div>
                )}

                {/* הסבר על דלת נעולה */}
                {locked && (
                  <div className="locked-tooltip">
                    {door.lockReason}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}