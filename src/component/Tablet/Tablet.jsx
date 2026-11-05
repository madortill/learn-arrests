import React from 'react';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import LocationMap from '../LocationMap/LocationMap';
import SpeechBubble from '../SpeechBubble/SpeechBubble'; 
import QuizScreen from '../QuizScreen/QuizScreen';
import defaultSoldierImg from '../../assets/tablet-soldier.png';
import maskImg from '../../assets/tablet-mask.png';
import './Tablet.css';

const tabletComponents = {
  WhatsAppChat: WhatsAppChat,
  LocationMap: LocationMap,
  QuizScreen: QuizScreen,
};

// חילצנו את speechBubbleText החוצה מהפרופס
export default function Tablet({ type, soldierImage, speechBubbleText, children, onNext, ...rest }) {
  const InnerComponent = tabletComponents[type];
  const currentSoldierImg = soldierImage || defaultSoldierImg;

  // ... (שאר הקוד למעלה נשאר אותו הדבר)
  return (
    <div className="tablet-stage-wrapper">
      <div className="tablet-blur-backdrop"></div>
      <div className="tablet-character-container">
        <img src={currentSoldierImg} alt="חייל מחזיק טאבלט" className="soldier-base-img" />
        <div 
          className="tablet-screen-viewport"
          style={{
            WebkitMaskImage: `url(${maskImg})`,
            maskImage: `url(${maskImg})`
          }}
        >
          <div className="tablet-inner-rotator">
            {InnerComponent ? (
              /* כאן הוספנו את onComplete כדי שיעבור לקומפוננטות הפנימיות */
              <InnerComponent onComplete={onComplete} onNext={onNext} {...rest} />
            ) : children ? (
              children
            ) : (
              <div className="placeholder-screen">תוכן השלב: {type}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}