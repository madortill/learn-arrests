import React, { useState, useEffect, useRef } from 'react';
import idfLogos from '../../assets/idf-logos.png';
import './About.css';

const About = ({ currentStep = 0, totalSteps = 29 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const toggleAbout = () => {
    setIsOpen((prev) => !prev);
  };

  // סגירה בלחיצה מחוץ לקומפוננטה או במקש Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // הלוגו יופיע בכל השלבים חוץ מהראשון (0) והאחרון (אינדקס אחרון במערך או 28)
  const numericStep = Number(currentStep);
  const lastStepIndex = Math.max(0, Number(totalSteps) - 1);

  const isFirstOrLastStep =
    numericStep <= 0 ||
    numericStep >= lastStepIndex ||
    numericStep === 28;

  const shouldShowLogos = !isFirstOrLastStep;

  return (
    <div className="about-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`info-coin-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleAbout}
        aria-expanded={isOpen}
        aria-label="מידע אודות הלומדה"
      >
        i
      </button>

      <div
        className={`about-dropdown ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="about-text">
          <p>
            <strong>מפתחת לומדה:</strong>
            <span>יעלה בלושטיין</span>
          </p>
          <p>
            <strong>מפקדת טיל:</strong>
            <span>קטיה</span>
          </p>
          <p>
            <strong>מומחה תוכן:</strong>
            <span>יובל</span>
          </p>
        </div>

        {shouldShowLogos && (
          <div className="about-logos">
            <img
              src={idfLogos}
              alt="סמלי צה״ל ומדור טי״ל"
              className="about-idf-logos-img"
              draggable="false"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default About;