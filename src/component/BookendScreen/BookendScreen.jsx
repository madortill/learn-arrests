import React from 'react';
import bgImage from '../../assets/bg-bookend.png';
import logosImage from '../../assets/idf-logos.png';
import './BookendScreen.css';

export default function BookendScreen({ isStart, onNext, onRestart }) {
  const dividerElement = (
    <div className="bookend-divider" aria-hidden="true">
      <div className="divider-line divider-line-left" />

      <div className="divider-diamond">
        <svg
          className="diamond-svg"
          viewBox="0 0 160 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="diamond-facets">
            {/* המסגרת החיצונית */}
            <path
              className="diamond-outline"
              d="M80 5 L145 42 L80 115 L15 42 Z"
            />

            {/* החלק העליון */}
            <path
              className="diamond-facet facet-top"
              d="M15 42 L55 42 L80 5 L105 42 L145 42"
            />

            {/* חלוקה פנימית */}
            <path
              className="diamond-facet facet-middle"
              d="M15 42 L80 65 L145 42"
            />

            <path
              className="diamond-facet facet-left"
              d="M55 42 L80 115 L80 65"
            />

            <path
              className="diamond-facet facet-right"
              d="M105 42 L80 115"
            />

            {/* קו מרכזי */}
            <path
              className="diamond-center"
              d="M80 5 L80 115"
            />
          </g>
        </svg>
      </div>

      <div className="divider-line divider-line-right" />
    </div>
  );

  return (
    <div
      className={`bookend-container ${isStart ? 'is-start' : 'is-end'}`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* שכבת כהות עדינה ברקע */}
      <div className="bookend-overlay" aria-hidden="true"></div>

      {/* לוגואים בצד שמאל למעלה */}
      <div className="bookend-top-left">
        <img
          src={logosImage}
          alt="לוגואים"
          className="idf-logos-img"
          draggable="false"
        />
      </div>

      {/* תוכן המסך המרכזי */}
      <div className="bookend-content-wrapper">
        {isStart ? (
          <>
            {/* מסך פתיחה */}
            <h1 className="bookend-main-title">
              לומדת איסוף ממעצרים
            </h1>

            {dividerElement}

            <div className="bookend-text-box">
              <p>
                בלומדה זאת תעבורו על סדר היום של חייל בתפקיד ליווי ותלמדו חוקים ונהלים חשובים.
              </p>
            </div>

            <button
              type="button"
              className="bookend-btn"
              onClick={onNext}
              draggable="false"
            >
              בואו נתחיל את היום
            </button>
          </>
        ) : (
          <>
            {/* מסך סיום */}
            <div className="bookend-text-box is-end-text">
              <p>
                כל הכבוד סימת את היום וגם את הלומדה
                <br />
                אבל אתה תמיד יכול להתחיל מחדש
              </p>
            </div>

            {dividerElement}

            <h1 className="bookend-main-title">
              לומדת איסוף ממעצרים
            </h1>

            <button
              type="button"
              className="bookend-btn"
              onClick={onRestart}
              draggable="false"
            >
              לתחילת הלומדה
            </button>
          </>
        )}
      </div>
    </div>
  );
}