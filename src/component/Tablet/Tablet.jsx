import React from 'react';

import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import LocationMap from '../LocationMap/LocationMap';
import QuizScreen from '../QuizScreen/QuizScreen';

import defaultTabletImg from '../../assets/tablet-new.png';
import maskImg from '../../assets/tablet-mask-new.png';

import './Tablet.css';

const tabletComponents = {
  WhatsAppChat,
  LocationMap,
  QuizScreen,
};

export default function Tablet({
  type,
  tabletType,
  tabletImage,
  children,
  onNext,
  onComplete,
  ...rest
}) {
  const currentType = type || tabletType;
  const InnerComponent = tabletComponents[currentType];
  const currentTabletImg = tabletImage || defaultTabletImg;

  return (
    <div className="tablet-stage-wrapper">
      <div className="tablet-device-frame">
        {/* תמונת הטאבלט */}
        <img
          src={currentTabletImg}
          alt="טאבלט"
          className="tablet-base-img"
          draggable="false"
        />

        {/* תוכן המסך - נחתך בדיוק לפי המסכה הפנימית */}
        <div
          className="tablet-mask-layer"
          style={{
            WebkitMaskImage: `url(${maskImg})`,
            maskImage: `url(${maskImg})`,
          }}
        >
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
                <p>תוכן השלב: {currentType || 'לא הוגדר'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}