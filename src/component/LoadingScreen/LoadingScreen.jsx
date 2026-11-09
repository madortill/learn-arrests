
import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ type = 'initial' }) {
  return (
    <div className={`loading-screen loading-${type}`}>

      {type === 'initial' ? (
        <div className="initial-loader">
          <div className="loading-diamond">
            ◆
          </div>
          <p>טוענים את הלומדה...</p>
        </div>
      ) : (
        <div className="transition-loader">

          <div className="road-scene">

            <div className="road">
              <div className="road-lines" />
            </div>

            <div className="loading-car">
              <div className="car-roof" />
              <div className="car-body">
                <div className="car-window" />
                <div className="car-light" />
              </div>
              <div className="car-wheel wheel-front" />
              <div className="car-wheel wheel-back" />
            </div>

          </div>

          <p>ממשיכים לדרך...</p>

        </div>
      )}

    </div>
  );
}
