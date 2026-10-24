import { useState } from "react";

import chatbotImage from "../../assets/chatbotimg.png";
import { renderMessage } from "./formatMessage";

// Answers longer than this start collapsed with a "Read more" toggle.
const COLLAPSE_AFTER_CHARS = 600;

const ChatMessage = ({ chat, onSuggestionClick }) => {
  const isBot = chat.role === "bot";
  const isLong = isBot && chat.text.length > COLLAPSE_AFTER_CHARS;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`chatbot-message ${
        isBot ? "chatbot-message-bot" : "chatbot-message-user"
      }`}
    >
      {isBot ? (
        <img src={chatbotImage} alt='' className='chatbot-message-avatar' aria-hidden='true' />
      ) : null}

      <div className='chatbot-message-text'>
        {isBot ? (
          <>
            {chat.answeredFor ? (
              <p className='chatbot-answered-for'>
                Answer to: <span>{chat.answeredFor}</span>
              </p>
            ) : null}
            <div
              className={`chatbot-message-content ${
                isLong && !expanded ? "chatbot-message-content-collapsed" : ""
              }`}
            >
              {renderMessage(chat.text, { onSuggestionClick })}
            </div>
            {isLong ? (
              <button
                type='button'
                className='chatbot-read-more'
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            ) : null}
          </>
        ) : (
          chat.text
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
