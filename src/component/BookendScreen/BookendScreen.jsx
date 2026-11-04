import React from 'react';
import bgImage from '../../assets/bg-bookend.png';
import logosImage from '../../assets/idf-logos.png';
import './BookendScreen.css';

export default function BookendScreen({ isStart, onNext, onRestart }) {
    return (
        <div className="bookend-container" style={{ backgroundImage: `url(${bgImage})` }}>
            {/* שכבת כהות עדינה ברקע */}
            <div className="bookend-overlay"></div>

            {/* לוגואים בצד שמאל למעלה */}
            <div className="bookend-top-left">
                <img src={logosImage} alt="לוגואים" className="idf-logos-img" />
            </div>

            {/* תוכן המסך המרכזי המדויק לפי המפרט שלך */}
            <div className="bookend-content-wrapper">
                
                {/* כותרת ראשית בעיצוב מסגרת אדומה ושוליים לבנים */}
                <h1 className="bookend-main-title">
                    {isStart ? "לומדת איסוף ממעצרים" : "כל הכבוד! סיימת את הלומדה"}
                </h1>

                {/* קו הפרדה מעוצב עם יהלום באמצע (Frame 3) */}
                <div className="bookend-divider">
                    <div className="line-side"></div>
                    <div className="divider-diamond">
                        <svg viewBox="0 0 100 85" className="diamond-svg">
                            <polygon points="50,5 85,25 98,38 50,80 2,38 15,25" fill="#a3b8cd" stroke="#5d7893" strokeWidth="2" />
                            <polygon points="50,5 85,25 50,38 15,25" fill="#e2edf7" />
                            <polygon points="15,25 50,38 2,38" fill="#88a4be" />
                            <polygon points="85,25 50,38 98,38" fill="#5d7893" />
                            <polygon points="50,38 98,38 50,80" fill="#3b5268" />
                            <polygon points="50,38 2,38 50,80" fill="#6d87a3" />
                        </svg>
                    </div>
                    <div className="line-side"></div>
                </div>

                {/* תיבת הטקסט הלבנה עם הצללה */}
                <div className="bookend-text-box">
                    <p>
                        {isStart 
                            ? "בלומדה זאת תעבורו על סדר היום של חייל בתפקיד ליווי ותלמדו חוקים ונהלים חשובים." 
                            : "לחצו כאן כדי לחזור להתחלה ולתרגל שוב את הלומדה."}
                    </p>
                </div>

                {/* כפתור מעבר עם מסגרת מדורגת יוקרתית */}
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