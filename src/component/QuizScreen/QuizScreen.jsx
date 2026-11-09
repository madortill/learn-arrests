
import React, { useState, useRef, useEffect } from 'react';
import quizBg from '../../assets/quiz-bg.png';
import './QuizScreen.css';

export default function QuizScreen({
  questions = [],
  onNext,
  onComplete,
  isCompleted = false,
  savedProgress = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(
    savedProgress?.currentIndex || 0
  );

  const [selectedAnswers, setSelectedAnswers] = useState(
    () => savedProgress?.selectedAnswers || {}
  );

  const [isReviewMode, setIsReviewMode] = useState(
    () => isCompleted || savedProgress?.isReviewMode || false
  );

  const [expandedExplanations, setExpandedExplanations] = useState(
    () => savedProgress?.expandedExplanations || {}
  );

  const [activeFlashingIdx, setActiveFlashingIdx] = useState(null);

  const cardRefs = useRef({});

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  // שמירת ההתקדמות
  const saveProgress = (updates = {}) => {
    onComplete?.({
      currentIndex,
      selectedAnswers,
      isReviewMode,
      expandedExplanations,
      ...updates,
    });
  };

  // בחירת תשובה
  const handleSelectOption = (optionIndex) => {
    if (isReviewMode) return;

    const updatedAnswers = {
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    };

    setSelectedAnswers(updatedAnswers);

    onComplete?.({
      currentIndex,
      selectedAnswers: updatedAnswers,
      isReviewMode: false,
      expandedExplanations,
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      onComplete?.({
        currentIndex: nextIndex,
        selectedAnswers,
        isReviewMode: false,
        expandedExplanations,
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      setCurrentIndex(previousIndex);

      onComplete?.({
        currentIndex: previousIndex,
        selectedAnswers,
        isReviewMode: false,
        expandedExplanations,
      });
    }
  };

  // מעבר לדף התשובות
  const handleCheckAll = () => {
    const firstWrongIndex = questions.findIndex(
      (q, idx) => selectedAnswers[idx] !== q.correctAnswer
    );

    const updatedExplanations =
      firstWrongIndex !== -1
        ? { [firstWrongIndex]: true }
        : {};

    setIsReviewMode(true);
    setExpandedExplanations(updatedExplanations);

    onComplete?.({
      currentIndex,
      selectedAnswers,
      isReviewMode: true,
      expandedExplanations: updatedExplanations,
    });

    if (firstWrongIndex !== -1) {
      setTimeout(() => {
        cardRefs.current[firstWrongIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  };

  // פתיחה וסגירה של הסברים
  const toggleExpand = (idx) => {
    const updatedExplanations = {
      ...expandedExplanations,
      [idx]: !expandedExplanations[idx],
    };

    setExpandedExplanations(updatedExplanations);

    onComplete?.({
      currentIndex,
      selectedAnswers,
      isReviewMode,
      expandedExplanations: updatedExplanations,
    });

    if (activeFlashingIdx === idx) {
      setActiveFlashingIdx(null);
    }
  };

  // המשך בסוף דף התשובות
  const handleFinalContinue = () => {
    const unviewedWrongIndex = questions.findIndex((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correctAnswer;

      return !isCorrect && !expandedExplanations[idx];
    });

    if (unviewedWrongIndex !== -1) {
      setActiveFlashingIdx(unviewedWrongIndex);

      const updatedExplanations = {
        ...expandedExplanations,
        [unviewedWrongIndex]: true,
      };

      setExpandedExplanations(updatedExplanations);

      onComplete?.({
        currentIndex,
        selectedAnswers,
        isReviewMode: true,
        expandedExplanations: updatedExplanations,
      });

      cardRefs.current[unviewedWrongIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setTimeout(() => {
        setActiveFlashingIdx(null);
      }, 2000);

      return;
    }

    saveProgress({
      isReviewMode: true,
    });

    onNext?.();
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div
      className="quiz-screen-container"
      style={{ backgroundImage: `url(${quizBg})` }}
    >

      <div className="quiz-top-right-header">
        <span>{isReviewMode ? 'תשובות' : 'זמן לשאלה'}</span>
      </div>

      <div className="quiz-counter-circle">
        <svg viewBox="0 0 100 100" className="circle-svg">
          <circle cx="50" cy="50" r="44" stroke="#000000" strokeWidth="4" fill="none" />
          <circle cx="50" cy="50" r="38" stroke="#000000" strokeWidth="1.5" fill="none" />
        </svg>

        <span className="circle-text">
          {isReviewMode
            ? `${totalQuestions}/${totalQuestions}`
            : `${currentIndex + 1}/${totalQuestions}`}
        </span>
      </div>

      <div className="quiz-content-body">

        {!isReviewMode ? (
          <div className="quiz-active-mode">

            <h2 className="quiz-question-title">
              {currentQ.question}
            </h2>

            <div className="quiz-options-grid">
              {currentQ.options.map((optionText, optIdx) => (
                <div
                  key={optIdx}
                  className={`quiz-option-card ${
                    selectedAnswers[currentIndex] === optIdx
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => handleSelectOption(optIdx)}
                >
                  <span className="option-text">
                    {optionText}
                  </span>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="quiz-summary-list">

            {questions.map((q, idx) => {
              const isCorrect =
                selectedAnswers[idx] === q.correctAnswer;

              const isExpanded =
                !!expandedExplanations[idx];

              const isFlashing =
                activeFlashingIdx === idx;

              const correctText = q.options[q.correctAnswer];

              return (
                <div
                  key={idx}
                  ref={el => cardRefs.current[idx] = el}
                  className={`summary-card ${
                    isCorrect ? 'correct' : 'wrong'
                  } ${isFlashing ? 'flashing-animation' : ''}`}
                >

                  <div
                    className="summary-card-header"
                    onClick={() => !isCorrect && toggleExpand(idx)}
                  >

                    <div className="summary-icons-right">
                      {isCorrect
                        ? <span className="icon-check">✓</span>
                        : <span className="icon-x">✗</span>}
                    </div>

                    <div className="summary-text-content">
                      <div className="summary-q-text">
                        {q.question}
                      </div>

                      <div className="summary-a-text">
                        {correctText}
                      </div>
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
                    <div className="summary-explanation">
                      {q.explanation}
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>

      <div className="quiz-footer-actions">

        {!isReviewMode ? (
          <>
            {currentIndex > 0 ? (
              <button
                className="quiz-nav-btn back-btn"
                onClick={handleBack}
              >
                חזור
              </button>
            ) : (
              <div className="spacer"></div>
            )}

            {currentIndex === totalQuestions - 1 ? (
              <button
                className="quiz-nav-btn check-btn"
                onClick={handleCheckAll}
                disabled={answeredCount < totalQuestions}
              >
                בדוק
              </button>
            ) : (
              <button
                className="quiz-nav-btn next-btn"
                onClick={handleNext}
                disabled={selectedAnswers[currentIndex] === undefined}
              >
                הבא
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="quiz-nav-btn back-btn"
              onClick={() => setIsReviewMode(false)}
            >
              חזור
            </button>

            <button
              className="quiz-nav-btn next-btn"
              onClick={handleFinalContinue}
            >
              המשך
            </button>
          </>
        )}

      </div>

    </div>
  );
}
