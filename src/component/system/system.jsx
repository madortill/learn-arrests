import React, { useState } from 'react';
import stages from '../../data/stages.json'; // ודאי שהנתיב ל-JSON שלך נכון
import Tablet from '../Tablet/Tablet';
import BookendScreen from '../BookendScreen/BookendScreen';
import EmptyState from '../EmptyState/EmptyState';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import ContinueBtn from '../ContinueBtn/ContinueBtn';
// import './System.css';

// מיפוי של כל הקומפוננטות הראשיות האפשריות בלומדה
const componentMap = {
  Tablet: Tablet,
  BookendScreen: BookendScreen,
  EmptyState: EmptyState
};

export default function System() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false); // האם המשימה בשלב הסתיימה?

  const stepData = stages[currentStep];
  if (!stepData) return <div>סוף הלומדה!</div>;

  const PrimaryComponent = componentMap[stepData.primaryComponent.type];

  // פונקציה שעוברת לשלב הבא (מופעלת ע"י ContinueBtn או ישירות ע"י QuizScreen)
  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
    setIsStepCompleted(false); // מאפסים את הסטטוס לשלב הבא
  };

  // הקומפוננטות הפנימיות קוראות לפונקציה הזו כשהן מסיימות את המשימה שלהן
  const handleComplete = () => {
    setIsStepCompleted(true);
  };

  return (
    <div className={`system-container ${stepData.background}`}>
      
      {/* 1. רינדור הקומפוננטה המרכזית (טאבלט, מסך פתיחה וכו') */}
      {PrimaryComponent && (
        <PrimaryComponent 
          {...stepData.primaryComponent.props} 
          onComplete={handleComplete} 
          onNext={handleNextStep} // מועבר ל-QuizScreen שמעביר שלב בעצמו
        />
      )}

      {/* 2. רינדור בועת דיבור גלובלית (אם מוגדרת בשלב הנוכחי ב-JSON) */}
      {stepData.speechBubble && (
        <SpeechBubble {...stepData.speechBubble} />
      )}

      {/* 3. רינדור כפתור ההמשך הגלובלי (רק אם השלב דורש אותו והמשימה הושלמה) */}
      {stepData.requiresContinueBtn && isStepCompleted && (
        <ContinueBtn onClick={handleNextStep} />
      )}

    </div>
  );
}