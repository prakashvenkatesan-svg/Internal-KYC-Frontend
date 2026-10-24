import { useEffect, useRef, useState } from "react";

import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import chatbotImage from "../../assets/chatbotimg.png";
import { askChatbot } from "../../services/chatbotService";
import "./chatbot.css";

const initialBotMessage = {
  role: "bot",
  text: "Hello! How can I help you today?",
};

// Shown under the greeting until the user asks something. Each one is a
// stored question, so it always gets a direct answer.
const STARTER_QUESTIONS = [
  "How do I open an account online?",
  "What documents are required to open an account?",
  "What is DDPI and how to activate it?",
  "How to add a nominee online?",
  "How to apply for an IPO?",
];

// The conversation is kept in sessionStorage so it survives reloads and
// redirects within the same browser tab, and is gone once the tab closes.
const HISTORY_STORAGE_KEY = "aeonAssistantChatHistory";
const MAX_STORED_MESSAGES = 50;

const simplify = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const loadHistory = () => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(HISTORY_STORAGE_KEY));
    if (
      Array.isArray(stored) &&
      stored.length &&
      stored.every((chat) => ["bot", "user"].includes(chat?.role) && typeof chat.text === "string")
    ) {
      return stored;
    }
  } catch (error) {
    // Storage unavailable or corrupt: start a fresh conversation.
  }
  return [initialBotMessage];
};

const saveHistory = (history) => {
  try {
    if (history.length > 1) {
      sessionStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history.slice(-MAX_STORED_MESSAGES)),
      );
    } else {
      sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  } catch (error) {
    // Storage unavailable (private mode, quota): history just won't persist.
  }
};

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState(loadHistory);
  const [showChatbot, setShowChatbot] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatBodyRef = useRef(null);
  const lastMessageRef = useRef(null);
  const inputRef = useRef(null);
  const togglerRef = useRef(null);

  useEffect(() => {
    saveHistory(chatHistory);
  }, [chatHistory]);

  const closeChatbot = () => {
    setShowChatbot(false);
    togglerRef.current?.focus();
  };

  // Esc closes the chat and returns focus to the toggle button.
  useEffect(() => {
    if (!showChatbot) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowChatbot(false);
        togglerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showChatbot]);

  const startOver = () => {
    if (isLoading) return;
    setChatHistory([initialBotMessage]);
    setInputValue("");
    inputRef.current?.focus();
  };

  // New user messages scroll to the bottom; a new bot answer scrolls to its
  // first line, so long answers are read from the top.
  useEffect(() => {
    const body = chatBodyRef.current;
    const last = lastMessageRef.current;
    if (!body) return;

    const lastChat = chatHistory[chatHistory.length - 1];
    const top =
      lastChat?.role === "bot" && last && chatHistory.length > 1
        ? last.offsetTop - 12
        : body.scrollHeight;

    body.scrollTo({ top, behavior: "smooth" });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (showChatbot && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChatbot]);

  const sendMessage = async (rawMessage) => {
    const message = String(rawMessage || "").trim();

    if (!message || isLoading) {
      return;
    }

    setInputValue("");
    setIsLoading(true);
    setChatHistory((prev) => [...prev, { role: "user", text: message }]);

    const { answer, matchedQuestion } = await askChatbot(message);

    // Show which stored question was answered, unless the user asked it word
    // for word (e.g. by tapping a suggestion).
    const answeredFor =
      matchedQuestion && simplify(matchedQuestion) !== simplify(message)
        ? matchedQuestion
        : null;

    setChatHistory((prev) => [...prev, { role: "bot", text: answer, answeredFor }]);
    setIsLoading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const showStarters = chatHistory.length === 1 && !isLoading;

  return (
    <div
      className={`chatbot-wrapper ${showChatbot ? "chatbot-wrapper-open" : ""}`}
    >
      <button
        ref={togglerRef}
        onClick={() => setShowChatbot((prev) => !prev)}
        className='chatbot-toggler'
        type='button'
        aria-label={showChatbot ? "Close AEON Assistant" : "Open AEON Assistant"}
        aria-expanded={showChatbot}
        aria-controls='aeon-advisor-chat'
      >
        {showChatbot ? (
          <span className='chatbot-toggler-close' aria-hidden='true'>
            <span className='chatbot-toggler-close-disc'>
              <span className='chatbot-toggler-close-text'>&times;</span>
            </span>
          </span>
        ) : (
          <img
            src={chatbotImage}
            alt=''
            className='chatbot-toggler-icon'
            aria-hidden='true'
          />
        )}
      </button>

      <div
        id='aeon-advisor-chat'
        className='chatbot-popup'
        role='dialog'
        aria-label='AEON Assistant chat'
        aria-hidden={!showChatbot}
        inert={!showChatbot}
      >
        <div className='chatbot-header'>
          <div className='chatbot-header-info'>
            <img
              src={chatbotImage}
              alt='AEON Assistant'
              className='chatbot-avatar'
            />
            <div>
              <h2 className='chatbot-logo-text'>AEON Assistant</h2>
              <p className='chatbot-header-subtitle'>
                <span className='chatbot-status-dot' aria-hidden='true' />
                Accounts, KYC, IPOs and more
              </p>
            </div>
          </div>

          <div className='chatbot-header-actions'>
            {chatHistory.length > 1 ? (
              <button
                onClick={startOver}
                className='chatbot-restart-btn'
                type='button'
                disabled={isLoading}
              >
                Start over
              </button>
            ) : null}
            <button
              onClick={closeChatbot}
              className='chatbot-close-btn'
              type='button'
              aria-label='Close AEON Assistant'
            >
              &times;
            </button>
          </div>
        </div>

        <div ref={chatBodyRef} className='chatbot-body' aria-live='polite'>
          {chatHistory.map((chat, index) => (
            <div
              key={`${chat.role}-${index}`}
              ref={index === chatHistory.length - 1 ? lastMessageRef : null}
            >
              <ChatMessage chat={chat} onSuggestionClick={sendMessage} />
            </div>
          ))}

          {showStarters ? (
            <div className='chatbot-suggestions chatbot-starters'>
              {STARTER_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type='button'
                  className='chatbot-chip'
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}

          {isLoading ? (
            <div className='chatbot-message chatbot-message-bot'>
              <img src={chatbotImage} alt='' className='chatbot-message-avatar' aria-hidden='true' />
              <div className='chatbot-message-text chatbot-typing' aria-label='AEON Assistant is typing'>
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
        </div>

        <div className='chatbot-footer'>
          <ChatForm
            inputValue={inputValue}
            onInputChange={(event) => setInputValue(event.target.value)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            inputRef={inputRef}
          />
          <p className='chatbot-disclaimer'>
            For general information only, not investment advice. Investments in the securities market are subject to market risks; read all related documents carefully before investing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
