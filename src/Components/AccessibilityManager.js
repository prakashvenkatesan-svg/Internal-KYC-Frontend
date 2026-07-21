import React, { useEffect, useRef, useState } from "react";
import {
  FaAdjust,
  FaFont,
  FaImage,
  FaPauseCircle,
  FaRedo,
  FaTimes,
  FaUniversalAccess,
  FaVolumeUp,
} from "react-icons/fa";

const STORAGE_KEYS = {
  highContrast: "aionion_high_contrast",
  audio: "aionion_tts",
  altText: "aionion_alt_text",
  readable: "aionion_readable",
  reduceMotion: "aionion_reduce_motion",
  textSize: "aionion_text_size",
};

const TEXT_SIZE_MIN = -3;
const TEXT_SIZE_MAX = 3;
const BASE_FONT_SIZE = 100;
const FONT_SIZE_STEP = 8;

const readBooleanSetting = (key) => localStorage.getItem(key) === "true";

const readTextSizeSetting = () => {
  const parsed = Number.parseInt(localStorage.getItem(STORAGE_KEYS.textSize) || "0", 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, parsed));
};

const getReadableText = (target) => {
  const labelledText =
    target.getAttribute("aria-label") ||
    target.getAttribute("title") ||
    target.getAttribute("alt");

  if (labelledText) return labelledText.trim();

  const image = target instanceof HTMLImageElement ? target : target.querySelector("img");
  if (image?.alt) return image.alt.trim();

  const shouldReadText =
    target.children.length === 0 ||
    /^(A|BUTTON|H[1-6]|P|LI|TD|TH|SPAN)$/i.test(target.tagName);

  if (!shouldReadText) return "";

  return target.innerText?.trim().replace(/\s+/g, " ") || "";
};

const ToggleRow = ({ icon, label, checked, onChange }) => (
  <div className='accessibility-toggle-row'>
    <div className='accessibility-toggle-label'>
      <span className='accessibility-toggle-icon' aria-hidden='true'>
        {icon}
      </span>
      <span>{label}</span>
    </div>
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={`Toggle ${label}`}
      className={`accessibility-switch ${checked ? "active" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  </div>
);

const AccessibilityManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [altTextEnabled, setAltTextEnabled] = useState(false);
  const [readableEnabled, setReadableEnabled] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [textSizeLevel, setTextSizeLevel] = useState(0);
  const lastSpokenRef = useRef("");
  const panelRef = useRef(null);

  useEffect(() => {
    setHighContrast(readBooleanSetting(STORAGE_KEYS.highContrast));
    setAudioEnabled(readBooleanSetting(STORAGE_KEYS.audio));
    setAltTextEnabled(readBooleanSetting(STORAGE_KEYS.altText));
    setReadableEnabled(readBooleanSetting(STORAGE_KEYS.readable));
    setReduceMotionEnabled(readBooleanSetting(STORAGE_KEYS.reduceMotion));
    setTextSizeLevel(readTextSizeSetting());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem(STORAGE_KEYS.highContrast, String(highContrast));
  }, [highContrast, isReady]);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(STORAGE_KEYS.audio, String(audioEnabled));
    if (!audioEnabled) {
      window.speechSynthesis?.cancel();
      lastSpokenRef.current = "";
    }
  }, [audioEnabled, isReady]);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("alt-text-mode", altTextEnabled);
    localStorage.setItem(STORAGE_KEYS.altText, String(altTextEnabled));
  }, [altTextEnabled, isReady]);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("readable-mode", readableEnabled);
    localStorage.setItem(STORAGE_KEYS.readable, String(readableEnabled));
  }, [readableEnabled, isReady]);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("reduce-motion", reduceMotionEnabled);
    localStorage.setItem(STORAGE_KEYS.reduceMotion, String(reduceMotionEnabled));
  }, [reduceMotionEnabled, isReady]);

  useEffect(() => {
    if (!isReady) return;
    const boundedLevel = Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, textSizeLevel));
    document.documentElement.style.fontSize = `${BASE_FONT_SIZE + boundedLevel * FONT_SIZE_STEP}%`;
    localStorage.setItem(STORAGE_KEYS.textSize, String(boundedLevel));
  }, [textSizeLevel, isReady]);

  useEffect(() => {
    if (!isReady || !audioEnabled || !window.speechSynthesis) return undefined;

    window.speechSynthesis.getVoices();

    const handleMouseOver = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-accessibility-panel]")) return;

      const textToSpeak = getReadableText(target);
      if (!textToSpeak || textToSpeak === lastSpokenRef.current || textToSpeak.length > 260) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }

      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = textToSpeak;
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.speechSynthesis.cancel();
    };
  }, [audioEnabled, isReady]);

  const resetSettings = () => {
    setHighContrast(false);
    setAudioEnabled(false);
    setAltTextEnabled(false);
    setReadableEnabled(false);
    setReduceMotionEnabled(false);
    setTextSizeLevel(0);
  };

  return (
    <div data-accessibility-panel className='accessibility-panel' ref={panelRef}>
      {isOpen && (
        <div className='accessibility-menu' role='dialog' aria-label='Accessibility settings'>
          <div className='accessibility-menu-header'>
            <div>
              <p>Accessibility</p>
            </div>
            <div className='accessibility-header-actions'>
              <button
                type='button'
                className='accessibility-icon-button'
                onClick={resetSettings}
                aria-label='Reset accessibility settings'
                title='Reset'
              >
                <FaRedo aria-hidden='true' />
              </button>
              <button
                type='button'
                className='accessibility-icon-button'
                onClick={() => setIsOpen(false)}
                aria-label='Close accessibility settings'
                title='Close'
              >
                <FaTimes aria-hidden='true' />
              </button>
            </div>
          </div>

          <div className='accessibility-menu-body'>
            <div className='accessibility-text-size'>
              <div className='accessibility-text-size-label'>
                <FaFont aria-hidden='true' />
                <span>Text Size</span>
              </div>
              <div className='accessibility-text-size-buttons'>
                <button
                  type='button'
                  className={textSizeLevel < 0 ? "active" : ""}
                  aria-label='Decrease text size'
                  onClick={() => setTextSizeLevel((level) => Math.max(TEXT_SIZE_MIN, level - 1))}
                >
                  A-
                </button>
                <button
                  type='button'
                  className={textSizeLevel === 0 ? "active" : ""}
                  aria-label='Reset text size'
                  onClick={() => setTextSizeLevel(0)}
                >
                  A
                </button>
                <button
                  type='button'
                  className={textSizeLevel > 0 ? "active" : ""}
                  aria-label='Increase text size'
                  onClick={() => setTextSizeLevel((level) => Math.min(TEXT_SIZE_MAX, level + 1))}
                >
                  A+
                </button>
              </div>
            </div>

            <ToggleRow
              icon={<FaAdjust />}
              label='Contrast'
              checked={highContrast}
              onChange={setHighContrast}
            />
            <ToggleRow
              icon={<FaPauseCircle />}
              label='Reduce Motion'
              checked={reduceMotionEnabled}
              onChange={setReduceMotionEnabled}
            />
            <ToggleRow
              icon={<FaVolumeUp />}
              label='Audio'
              checked={audioEnabled}
              onChange={setAudioEnabled}
            />
            <ToggleRow
              icon={<FaImage />}
              label='Alt Text'
              checked={altTextEnabled}
              onChange={setAltTextEnabled}
            />
            <ToggleRow
              icon={<FaUniversalAccess />}
              label='Readable'
              checked={readableEnabled}
              onChange={setReadableEnabled}
            />
          </div>
        </div>
      )}

      <button
        type='button'
        className='accessibility-button'
        onClick={() => setIsOpen((open) => !open)}
        aria-label='Universal Accessibility Settings'
        aria-expanded={isOpen}
        title='Accessibility'
      >
        <FaUniversalAccess aria-hidden='true' />
      </button>
    </div>
  );
};

export default AccessibilityManager;
