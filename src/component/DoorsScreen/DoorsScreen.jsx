
import React from 'react';
import './DoorsScreen.css';

import doorClosed from '../../assets/DoorsScreen/door_closed.png';
import doorLocked from '../../assets/DoorsScreen/door_locked.png';
import doorOpen from '../../assets/DoorsScreen/door_open.png';
import hallBackground from '../../assets/DoorsScreen/doors_hall_bg.jpg';

// ==========================================
// נתוני הדלתות
// ==========================================

const doorsData = [
  {
    id: 25,
    title: 'אחריות\nהמלווים\nבקבלה',
    lockReason: '',
  },
  {
    id: 26,
    title: 'קליטת\nעצור\nבמצ"ח',
    lockReason: 'יש לסיים קודם את שלב אחריות המלווים בקבלה.',
  },
  {
    id: 27,
    title: 'דגשים\nלקבלה',
    lockReason: '',
  },
  {
    id: 28,
    title: 'תרגול\nאחרון',
    lockReason: 'יש להשלים את השלבים האחרים קודם.',
  },
];

// ==========================================
// בדיקת נעילת דלת
// ==========================================

const isDoorLocked = (id, completedStages) => {
  // חדר שהושלם כבר אינו נעול.
  if (completedStages[id]) return false;

  // חדר 26 נפתח לאחר השלמת חדר 25.
  if (id === 26) {
    return !completedStages[25];
  }

  // חדר 28 נפתח לאחר השלמת שלושת החדרים הראשונים.
  if (id === 28) {
    return !(
      completedStages[25] &&
      completedStages[26] &&
      completedStages[27]
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
  return (
    <div className="doors-container">

      {/* רקע המסדרון */}
      <img
        src={hallBackground}
        alt=""
        className="doors-hall-bg"
        draggable="false"
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
