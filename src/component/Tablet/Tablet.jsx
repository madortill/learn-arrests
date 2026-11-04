import React from 'react';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import soldierImg from '../../assets/tablet-soldier.png';
import maskImg from '../../assets/tablet-mask.png';
import './Tablet.css';

const tabletComponents = {
  WhatsAppChat: WhatsAppChat,
  // LocationMap: LocationMap,
  // QuizScreen: QuizScreen,
};

export default function Tablet({ type, props, children, onNext }) {
  const InnerComponent = tabletComponents[type];

  return (
    <div className="tablet-stage-wrapper">
      {/* טשטוש רקע בלומדה */}
      <div className="tablet-blur-backdrop"></div>

      {/* מיכל שמחזיק את תמונת החייל בצורה פרופורציונלית */}
      <div className="tablet-character-container">
        <img 
          src={soldierImg} 
          alt="חייל מחזיק טאבלט" 
          className="soldier-base-img" 
        />

        {/* ה-Viewport שנחתך ע"י המסכה (Subtract.png) */}
        <div 
          className="tablet-screen-viewport"
          style={{
            WebkitMaskImage: `url(${maskImg})`,
            maskImage: `url(${maskImg})`
          }}
        >
          {/* הדיב הפנימי שמסובב את התוכן להתאמה לזווית הטאבלט */}
          <div className="tablet-inner-rotator">
            {InnerComponent ? (
              <InnerComponent {...props} onNext={onNext} />
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