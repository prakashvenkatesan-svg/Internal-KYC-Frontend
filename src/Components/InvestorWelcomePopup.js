import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiBookOpen, FiShield, FiBarChart2, FiAlertTriangle, FiArrowRight, FiX, FiCheck } from "react-icons/fi";
import logo from "../assets/Aionionlogo.png";
import "./InvestorWelcomePopup.css";

const messages = {
  en: { points: ["Understand before you Invest", "Choose regulated Investment products", "Start early, Stay invested", "Beware of Investment frauds"], button: "Got it", footer: "Investor Awareness Month initiative by SEBI", close: "Close investor awareness notification" },
  hi: { points: ["निवेश करने से पहले समझें", "विनियमित निवेश उत्पाद चुनें", "जल्दी शुरू करें, निवेश बनाए रखें", "निवेश धोखाधड़ी से सावधान रहें"], button: "समझ गया", footer: "सेबी की निवेशक जागरूकता माह पहल", close: "निवेशक जागरूकता सूचना बंद करें" }
};
const icons = [FiBookOpen, FiShield, FiBarChart2, FiAlertTriangle];

function GrowthIllustration() {
  return <svg className="investor-welcome-growth" viewBox="0 0 260 280" aria-hidden="true">
    <defs>
      <linearGradient id="awareness-bar" x1="0" y1="0" x2="0.6" y2="1"><stop stopColor="#4242ff"/><stop offset="0.55" stopColor="#8d85ff"/><stop offset="1" stopColor="#ffc4dd"/></linearGradient>
      <linearGradient id="awareness-arrow" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#f19acc"/><stop offset="0.6" stopColor="#ff4a86"/><stop offset="1" stopColor="#ff8bac"/></linearGradient>
    </defs>
    <ellipse cx="159" cy="254" rx="101" ry="14" fill="#b3aaff" opacity=".16"/>
    <path d="M0 244 Q24 105 112 102 Q197 76 260 159 L260 280 L0 280Z" fill="#fac6df" opacity=".45"/>
    <path d="M0 229 Q81 155 164 221 Q225 263 260 194 L260 280 L0 280Z" fill="#a7b5ff" opacity=".35"/>
    {[{x:85,y:200,h:47},{x:141,y:166,h:81},{x:201,y:118,h:129}].map(({x,y,h}) => <g key={x}><path d={`M${x} ${y} l36 -6 v${h} l-36 0Z`} fill="url(#awareness-bar)"/><path d={`M${x+36} ${y-6} l16 5 v${h} l-16 -5Z`} fill="url(#awareness-bar)" opacity=".75"/><path d={`M${x} ${y} l36 -6 l16 5 l-36 7Z`} fill="#7974ff"/><path d={`M${x+36} ${y-6} v${h}`} stroke="#efdcff" opacity=".65"/></g>)}
    <path d="M96 178 C159 149 190 104 203 58 L183 48 Q180 45 185 41 L224 14 Q228 11 231 16 L235 71 Q235 76 230 73 L216 65 C203 118 160 160 96 178Z" fill="url(#awareness-arrow)"/>
    <path d="M231 16 L235 71 L229 68 L226 15Z" fill="#ffb2c9"/>
  </svg>;
}

export default function InvestorWelcomePopup() {
  const [open, setOpen] = useState(true);
  const [language, setLanguage] = useState("en");
  const dialogRef = useRef(null);
  const copy = messages[language];
  const dismiss = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); dismiss(); }
      if (event.key === "Tab") {
        const buttons = dialogRef.current.querySelectorAll("button");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
  }, [open]);

  if (!open) return null;
  return createPortal(<div className="investor-welcome-overlay">
    <section ref={dialogRef} className="investor-welcome-dialog" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="investor-welcome-title" aria-describedby="investor-welcome-points" lang={language}>
      <button className="investor-welcome-close" onClick={dismiss} aria-label={copy.close}><FiX /></button>
      <img className="investor-welcome-logo" src={logo} alt="Aionion Capital" />
      <div className="investor-welcome-languages" role="group" aria-label="Notification language">
        <button onClick={() => setLanguage("en")} aria-pressed={language === "en"}>English</button>
        <button onClick={() => setLanguage("hi")} aria-pressed={language === "hi"}>हिंदी</button>
      </div>
      <p className="investor-welcome-presenter"><span>SEBI</span> presents</p>
      <h2 id="investor-welcome-title">{language === "en" ? <><span className="investor-welcome-blue">Samajh</span> se<br/><span className="investor-welcome-gradient">Investing</span> simple</> : <><span className="investor-welcome-blue">समझ</span> से<br/><span className="investor-welcome-gradient">निवेश</span> आसान</>}</h2>
      <GrowthIllustration />
      <ul id="investor-welcome-points" className="investor-welcome-points">{copy.points.map((point, index) => { const Icon = icons[index]; return <li key={index}><span className={`investor-welcome-icon investor-welcome-icon-${index}`}><Icon /></span><span>{point}</span></li>; })}</ul>
      <button className="investor-welcome-confirm" onClick={dismiss}>{copy.button}<FiArrowRight /></button>
      <p className="investor-welcome-footer"><span><FiCheck /></span>{copy.footer}</p>
    </section>
  </div>, document.body);
}
