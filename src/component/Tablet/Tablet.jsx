
import React from 'react';

import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import LocationMap from '../LocationMap/LocationMap';
import QuizScreen from '../QuizScreen/QuizScreen';

import defaultSoldierImg from '../../assets/tablet-soldier.png';
import maskImg from '../../assets/tablet-mask.png';

import './Tablet.css';

const tabletComponents = {
  WhatsAppChat,
  LocationMap,
  QuizScreen,
};

export default function Tablet({
  type,
  tabletType,
  soldierImage,
  children,
  onNext,
  onComplete,
  ...rest
}) {
  const currentType = type || tabletType;
  const InnerComponent = tabletComponents[currentType];

  const currentSoldierImg = soldierImage || defaultSoldierImg;

  return (
    <div className="tablet-stage-wrapper">

      {/* רקע מטושטש */}
      <div
        className="tablet-blur-backdrop"
        aria-hidden="true"
      />

      {/* תמונת החייל - שכבת בסיס */}
      <div className="tablet-character-container">

        <img
          src={currentSoldierImg}
          alt="חייל מחזיק טאבלט"
          className="soldier-base-img"
          draggable="false"
        />

        {/* מסכת הטאבלט */}
        <div
          className="tablet-mask-layer"
          style={{
            WebkitMaskImage: `url(${maskImg})`,
            maskImage: `url(${maskImg})`,
          }}
        >

          {/* המסך הפנימי */}
          <div className="tablet-inner-screen">

            <div className="tablet-screen-content">

              {InnerComponent ? (
                <InnerComponent
                  {...rest}
                  onComplete={onComplete}
                  onNext={onNext}
                />
              ) : children != null ? (
                children
              ) : (
                <div className="tablet-placeholder-screen">
                  <p>
                    תוכן השלב: {currentType || 'לא הוגדר'}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
