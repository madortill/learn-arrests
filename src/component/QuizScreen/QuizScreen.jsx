import React, { useState, useRef, useEffect } from 'react';
import quizBg from '../../assets/quiz-bg.jpg';
import './QuizScreen.css';

export default function QuizScreen({
  questions = [],
  onNext,
  onComplete,
  isCompleted = false,
  savedStepState,
  onSaveStepState,
}) {
  const [currentIndex, setCurrentIndex] = useState(
    () => savedStepState?.currentIndex ?? 0
  );

  const [selectedAnswers, setSelectedAnswers] = useState(
    () => savedStepState?.selectedAnswers ?? {}
  );

  const [isReviewMode, setIsReviewMode] = useState(() => {
    if (savedStepState) {
      return Boolean(savedStepState.isReviewMode || isCompleted);
    }
    return Boolean(isCompleted);
  });

  const [expandedExplanations, setExpandedExplanations] = useState(
    () => savedStepState?.expandedExplanations ?? {}
  );

  const [viewedExplanations, setViewedExplanations] = useState(() => {
    if (savedStepState?.viewedExplanations) {
      return savedStepState.viewedExplanations;
    }
    if (isCompleted) {
      const allViewed = {};
      questions.forEach((_, idx) => {
        allViewed[idx] = true;
      });
      return allViewed;
    }
    return {};
  });

  const [flashingIndex, setFlashingIndex] = useState(null);

  const bodyRef = useRef(null);
  const cardRefs = useRef({});
  const flashTimerRef = useRef(null);

  // סנכרון מלא בזמן אמת ל-System בכל שינוי
  useEffect(() => {
    onSaveStepState?.({
      currentIndex,
      selectedAnswers,
      isReviewMode,
      expandedExplanations,
      viewedExplanations,
    });
  }, [
    currentIndex,
    selectedAnswers,
    isReviewMode,
    expandedExplanations,
    viewedExplanations,
    onSaveStepState,
  ]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  if (!questions || questions.length === 0) return null;

  const totalQuestions = questions.length;
  const safeIndex = Math.min(currentIndex, totalQuestions - 1);
  const currentQuestion = questions[safeIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  // גלילה פנימית חלקה לכרטיס שגוי בתוך אזור התוכן
  const scrollCardIntoBody = (idx) => {
    requestAnimationFrame(() => {
      const container = bodyRef.current;
      const card = cardRefs.current[idx];
      if (!container || !card) return;

      const targetTop =
        card.offsetTop - container.offsetTop - container.clientHeight * 0.15;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    });
  };

  // בחירת תשובה
  const handleSelectOption = (optionIndex) => {
    if (isReviewMode) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [safeIndex]: optionIndex,
    }));
  };

  // ניווט בין השאלות
  const handleNextQuestion = () => {
    if (safeIndex < totalQuestions - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  // מעבר לדף התשובות ("בדוק") — פותח אוטומטית את ההסבר של השגיאה הראשונה
  const handleCheckAll = () => {
    const firstWrongIndex = questions.findIndex(
      (q, idx) => selectedAnswers[idx] !== q.correctAnswer
    );

    const nextExpanded = { ...expandedExplanations };
    const nextViewed = { ...viewedExplanations };

    if (firstWrongIndex !== -1) {
      nextExpanded[firstWrongIndex] = true;
      nextViewed[firstWrongIndex] = true;
    }

    setIsReviewMode(true);
    setExpandedExplanations(nextExpanded);
    setViewedExplanations(nextViewed);

    if (firstWrongIndex !== -1) {
      scrollCardIntoBody(firstWrongIndex);
    }
  };

  // פתיחה וסגירה של הסבר לתשובה שגויה
  const handleToggleExplanation = (idx) => {
    const willOpen = !expandedExplanations[idx];

    setExpandedExplanations((prev) => ({
      ...prev,
      [idx]: willOpen,
    }));

    if (willOpen) {
      setViewedExplanations((prev) => ({
        ...prev,
        [idx]: true,
      }));
    }

    if (flashingIndex === idx) {
      setFlashingIndex(null);
    }
  };

  // לחיצה על "המשך" בדף התשובות — מוודא שכל ההסברים השגויים נפתחו לפחות פעם אחת
  const handleFinalContinue = () => {
    const unviewedWrongIndex = questions.findIndex((q, idx) => {
      const isWrong = selectedAnswers[idx] !== q.correctAnswer;
      return isWrong && !viewedExplanations[idx];
    });

    if (unviewedWrongIndex !== -1) {
      setExpandedExplanations((prev) => ({
        ...prev,
        [unviewedWrongIndex]: true,
      }));
      setViewedExplanations((prev) => ({
        ...prev,
        [unviewedWrongIndex]: true,
      }));
      setFlashingIndex(unviewedWrongIndex);

      scrollCardIntoBody(unviewedWrongIndex);

      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        setFlashingIndex(null);
      }, 1800);

      return;
    }

    onComplete?.();
    onNext?.();
  };

  return (
    <div
      className="quiz-screen-container"
      style={{ backgroundImage: `url(${quizBg})` }}
    >
      {/* שורת כותרת עליונה */}
      <header className="quiz-header-bar">
        <div className="quiz-top-right-header">
          <span>{isReviewMode ? 'תשובות' : 'זמן לשאלה'}</span>
        </div>

        <div className="quiz-counter-circle">
          <svg viewBox="0 0 100 100" className="circle-svg" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#000000"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#000000"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <span className="circle-text">
            {isReviewMode
              ? `${totalQuestions}/${totalQuestions}`
              : `${safeIndex + 1}/${totalQuestions}`}
          </span>
        </div>
      </header>

      {/* גוף השאלה או סיכום התשובות */}
      <main ref={bodyRef} className="quiz-content-body">
        {!isReviewMode ? (
          <div className="quiz-active-mode">
            <h2 className="quiz-question-title">{currentQuestion.question}</h2>

            <div className="quiz-options-grid">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[safeIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <span className="option-text">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="quiz-summary-list">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correctAnswer;
              const isExpanded = Boolean(expandedExplanations[idx]);
              const isFlashing = flashingIndex === idx;
              const correctText = q.options[q.correctAnswer];

              return (
                <div
                  key={idx}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className={`summary-card ${isCorrect ? 'correct' : 'wrong'} ${
                    isFlashing ? 'flashing-animation' : ''
                  }`}
                >
                  <div
                    className="summary-card-header"
                    role={!isCorrect ? 'button' : undefined}
                    tabIndex={!isCorrect ? 0 : undefined}
                    onClick={() => !isCorrect && handleToggleExplanation(idx)}
                    onKeyDown={(e) => {
                      if (!isCorrect && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleToggleExplanation(idx);
                      }
                    }}
                  >
                    <div className="summary-icons-right">
                      {isCorrect ? (
                        <span className="icon-check">✓</span>
                      ) : (
                        <span className="icon-x">✗</span>
                      )}
                    </div>

                    <div className="summary-text-content">
                      <div className="summary-q-text">{q.question}</div>
                      <div className="summary-a-text">{correctText}</div>
                    </div>

                    {!isCorrect && (
                      <div
                        className={`summary-dropdown-icon ${
                          isExpanded ? 'open' : ''
                        }`}
                      >
                        ▼
                      </div>
                    )}
                  </div>

                  {!isCorrect && isExpanded && q.explanation && (
                    <div className="summary-explanation">{q.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* כפתורי ניווט תחתונים */}
      <footer className="quiz-footer-actions">
        {!isReviewMode ? (
          <>
            {safeIndex > 0 ? (
              <button
                type="button"
                className="quiz-nav-btn back-btn"
                onClick={handlePrevQuestion}
              >
                חזור
              </button>
            ) : (
              <div className="spacer" />
            )}

            {safeIndex === totalQuestions - 1 ? (
              <button
                type="button"
                className="quiz-nav-btn check-btn"
                onClick={handleCheckAll}
                disabled={answeredCount < totalQuestions}
              >
                בדוק
              </button>
            ) : (
              <button
                type="button"
                className="quiz-nav-btn next-btn"
                onClick={handleNextQuestion}
                disabled={selectedAnswers[safeIndex] === undefined}
              >
                הבא
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              className="quiz-nav-btn back-btn"
              onClick={() => setIsReviewMode(false)}
            >
              חזור
            </button>

            <button
              type="button"
              className="quiz-nav-btn next-btn"
              onClick={handleFinalContinue}
            >
              המשך
            </button>
          </>
        )}
      </footer>
    </div>
  );
}