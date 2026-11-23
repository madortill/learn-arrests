import React, { useState, useRef, useEffect } from 'react';
import quizBg from '../../assets/quiz-bg.jpg';
import './QuizScreen.css';

export default function QuizScreen({
  questions = [],
  onNext,
  onComplete,
  isCompleted = false,
  savedProgress = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(
    savedProgress?.currentIndex ?? 0
  );
  const [selectedAnswers, setSelectedAnswers] = useState(
    savedProgress?.selectedAnswers ?? {}
  );
  const [isReviewMode, setIsReviewMode] = useState(
    Boolean(isCompleted || savedProgress?.isReviewMode)
  );
  const [expandedExplanations, setExpandedExplanations] = useState(
    savedProgress?.expandedExplanations ?? {}
  );
  const [viewedExplanations, setViewedExplanations] = useState(() => {
    if (isCompleted) {
      const allViewed = {};
      questions.forEach((_, idx) => {
        allViewed[idx] = true;
      });
      return allViewed;
    }
    return savedProgress?.viewedExplanations ?? savedProgress?.expandedExplanations ?? {};
  });
  const [flashingIndex, setFlashingIndex] = useState(null);

  const bodyRef = useRef(null);
  const cardRefs = useRef({});
  const flashTimerRef = useRef(null);

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

  const syncProgress = (overrides = {}) => {
    onComplete?.({
      currentIndex: safeIndex,
      selectedAnswers,
      isReviewMode,
      expandedExplanations,
      viewedExplanations,
      ...overrides,
    });
  };

  // גלילה פנימית חלקה לכרטיס שגוי בתוך אזור התוכן בלבד
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

    const updatedAnswers = {
      ...selectedAnswers,
      [safeIndex]: optionIndex,
    };

    setSelectedAnswers(updatedAnswers);
    syncProgress({
      selectedAnswers: updatedAnswers,
      isReviewMode: false,
    });
  };

  // ניווט בין השאלות
  const handleNextQuestion = () => {
    if (safeIndex >= totalQuestions - 1) return;
    const nextIdx = safeIndex + 1;
    setCurrentIndex(nextIdx);
    syncProgress({ currentIndex: nextIdx, isReviewMode: false });
  };

  const handlePrevQuestion = () => {
    if (safeIndex <= 0) return;
    const prevIdx = safeIndex - 1;
    setCurrentIndex(prevIdx);
    syncProgress({ currentIndex: prevIdx, isReviewMode: false });
  };

  // מעבר למסך התשובות ("בדוק") — פותח אוטומטית את ההסבר של השגיאה הראשונה
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

    syncProgress({
      isReviewMode: true,
      expandedExplanations: nextExpanded,
      viewedExplanations: nextViewed,
    });

    if (firstWrongIndex !== -1) {
      scrollCardIntoBody(firstWrongIndex);
    }
  };

  // פתיחה/סגירה ידנית של הסבר לתשובה שגויה
  const handleToggleExplanation = (idx) => {
    const willOpen = !expandedExplanations[idx];

    const nextExpanded = {
      ...expandedExplanations,
      [idx]: willOpen,
    };

    const nextViewed = willOpen
      ? { ...viewedExplanations, [idx]: true }
      : viewedExplanations;

    setExpandedExplanations(nextExpanded);
    setViewedExplanations(nextViewed);

    if (flashingIndex === idx) {
      setFlashingIndex(null);
    }

    syncProgress({
      expandedExplanations: nextExpanded,
      viewedExplanations: nextViewed,
    });
  };

  // כפתור "המשך" במסך התשובות — מוודא שכל ההסברים השגויים נפתחו לפחות פעם אחת
  const handleFinalContinue = () => {
    const unviewedWrongIndex = questions.findIndex((q, idx) => {
      const isWrong = selectedAnswers[idx] !== q.correctAnswer;
      return isWrong && !viewedExplanations[idx];
    });

    if (unviewedWrongIndex !== -1) {
      const nextExpanded = {
        ...expandedExplanations,
        [unviewedWrongIndex]: true,
      };
      const nextViewed = {
        ...viewedExplanations,
        [unviewedWrongIndex]: true,
      };

      setExpandedExplanations(nextExpanded);
      setViewedExplanations(nextViewed);
      setFlashingIndex(unviewedWrongIndex);

      syncProgress({
        isReviewMode: true,
        expandedExplanations: nextExpanded,
        viewedExplanations: nextViewed,
      });

      scrollCardIntoBody(unviewedWrongIndex);

      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        setFlashingIndex(null);
      }, 1800);

      return;
    }

    syncProgress({ isReviewMode: true });
    onNext?.();
  };

  return (
    <div
      className="quiz-screen-container"
      style={{ backgroundImage: `url(${quizBg})` }}
    >
      {/* שורת כותרת עליונה מיושרת */}
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