import React, { useState } from 'react';
import './About.css';

const About = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAbout = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="about-wrapper">
      <button 
        className={`info-coin-btn ${isOpen ? 'spin' : ''}`} 
        onClick={toggleAbout}
        aria-label="מידע אודות הלומדה"
      >
        i
      </button>

      <div className={`about-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="about-text">
          <p><strong>מפתחת לומדה:</strong> [שם המפתחת]</p>
          <p><strong>מפקדת טי"ל:</strong> [שם המפקדת]</p>
          <p><strong>מומחה תוכן:</strong> [שם המומחה]</p>
        </div>
        
        <div className="about-logos">
          <div className="logo-placeholder">לוגו 1</div>
          <div className="logo-placeholder">לוגו 2</div>
        </div>
      </div>
    </div>
  );
};

export default About;