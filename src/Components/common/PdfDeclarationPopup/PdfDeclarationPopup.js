import React, { useState, useRef, useEffect } from 'react';
import './PdfDeclarationPopup.css';

const PdfDeclarationPopup = ({ id, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 992) {
      clearTimeout(timeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 992) {
      timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
    }
  };

  const handleTouch = (e) => {
    if (window.innerWidth < 992) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const closePopup = (e) => {
    e.preventDefault();
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`pdf-declaration-wrapper ${className || ''}`}>
      <label htmlFor={id} className="pdf-declaration-label">
        I further confirm having read and understood the contents of the{' '}
      </label>
      <span 
        className="pdf-highlight-text"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleTouch}
      >
        “Rights and Obligations” document(s) and “Risk Disclosure Document” MITC
      </span>
      <label htmlFor={id} className="pdf-declaration-label">
        . I / We do hereby agree to be bound by such provisions as outlined in these documents.
      </label>

      {isOpen && (
        <div 
          className="pdf-popup-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
           <div className="pdf-popup-header-mobile">
              <span className="pdf-popup-title">View Documents</span>
              <button type="button" className="pdf-popup-close-btn" onClick={closePopup} onTouchEnd={closePopup}>&times;</button>
           </div>
           <div className="pdf-popup-header-desktop">
              <span className="pdf-popup-title">View Documents</span>
           </div>
           <ul className="pdf-popup-list">
             <li>
               <a href="/pdfs/Rights-and-Obligations.pdf" target="_blank" rel="noopener noreferrer">
                 1. Rights and Obligations
               </a>
             </li>
             <li>
               <a href="/pdfs/Risk-Disclosure-Document-MITC.pdf" target="_blank" rel="noopener noreferrer">
                 2. Risk Disclosure Document – MITC
               </a>
             </li>
           </ul>
        </div>
      )}
    </div>
  );
};

export default PdfDeclarationPopup;
