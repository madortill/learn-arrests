
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

      <div className="tablet-blur-backdrop"></div>

      <div className="tablet-character-container">

        <img
          src={currentSoldierImg}
          alt="חייל מחזיק טאבלט"
          className="soldier-base-img"
        />

        <div
          className="tablet-screen-viewport"
          style={{
            WebkitMaskImage: `url(${maskImg})`,
            maskImage: `url(${maskImg})`,
          }}
        >

          <div className="tablet-inner-rotator">

            {InnerComponent ? (
              <InnerComponent
                {...rest}
                onComplete={onComplete}
                onNext={onNext}
              />
            ) : children ? (
              children
            ) : (
              <div className="placeholder-screen">
                <p>תוכן השלב: {currentType || 'לא הוגדר'}</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
