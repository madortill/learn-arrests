
import React from 'react';
import bgImage from '../../assets/bg-bookend.png';
import logosImage from '../../assets/idf-logos.png';
import dividerImage from '../../assets/bookend-divider.svg';
import './BookendScreen.css';

export default function BookendScreen({ isStart, onNext, onRestart }) {
    return (
        <div
            className="bookend-container"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* שכבת כהות עדינה ברקע */}
            <div className="bookend-overlay"></div>

            {/* לוגואים בצד שמאל למעלה */}
            <div className="bookend-top-left">
                <img
                    src={logosImage}
                    alt="לוגואים"
                    className="idf-logos-img"
                />
            </div>

            {/* תוכן המסך המרכזי */}
            <div className="bookend-content-wrapper">

                {/* כותרת ראשית */}
                <h1 className="bookend-main-title">
                    {isStart
                        ? "לומדת איסוף ממעצרים"
                        : "כל הכבוד! סיימת את הלומדה"}
                </h1>

                
                {/* Animated Diamond Divider */}
                <div className="bookend-divider">

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


                {/* תיבת הטקסט */}
                <div className="bookend-text-box">
                    <p>
                        {isStart
                            ? "בלומדה זאת תעבורו על סדר היום של חייל בתפקיד ליווי ותלמדו חוקים ונהלים חשובים."
                            : "לחצו כאן כדי לחזור להתחלה ולתרגל שוב את הלומדה."}
                    </p>
                </div>

                {/* כפתור מעבר */}
                <button
                    className="bookend-btn"
                    onClick={isStart ? onNext : onRestart}
                >
                    {isStart ? "בואו נתחיל את היום" : "לתחילת הלומדה"}
                </button>

            </div>
        </div>
    );
}
