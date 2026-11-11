
import React from 'react';
import './DoorsScreen.css';

import doorClosed from '../../assets/door_closed.png';
import doorLocked from '../../assets/door_locked.png';
import doorOpen from '../../assets/door_open.png';
import hallBackground from '../../assets/doors_hall_bg.jpg';

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
    lockReason: 'יש להשלים את שלבים 25, 26 ו-27 קודם.',
  },
];

export default function DoorsScreen({
  completedStages = {},
  onEnterStage,
  onComplete,
}) {
  const allCompleted = [25, 26, 27, 28].every(
    (id) => completedStages[id]
  );

  const isLocked = (id) => {
    if (completedStages[id]) return false;

    if (id === 26) {
      return !completedStages[25];
    }

    if (id === 28) {
      return !(
        completedStages[25] &&
        completedStages[26] &&
        completedStages[27]
      );
    }

    return false;
  };

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
          const locked = isLocked(door.id);

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

          return (
            <div className="door-wrapper" key={door.id}>

              {/* תווית מצב */}
              <div
                className={`door-status-label ${
                  isDone
                    ? 'status-done'
                    : locked
                      ? 'status-locked'
                      : 'status-not-done'
                }`}
              >
                {status}
              </div>

              {/* הדלת */}
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

                {/* שם החדר */}
                {!isDone && !locked && (
                  <div className="door-title">
                    {door.title}
                  </div>
                )}

                {/* הסבר נעילה */}
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

      {/* מעבר הלאה רק לאחר השלמת כל החדרים */}
      {allCompleted && (
        <button
          type="button"
          className="doors-continue-btn"
          onClick={onComplete}
        >
          המשך
          <span>❯</span>
        </button>
      )}

    </div>
  );
}
