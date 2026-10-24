// Turns a plain-text chatbot answer into React nodes: paragraphs, bullet
// lists, and clickable links, emails and phone numbers. Built from React
// elements only (no innerHTML), so answer text can never inject markup.

const BULLET_REGEX = /^\s*[•\-*]\s+/;
const SUGGESTION_HEADER_REGEX = /did you mean:?\s*$/i;

// URL | email | Indian phone number, in that order of precedence.
const INLINE_REGEX =
  /(https?:\/\/[^\s)]+[^\s).,;:!?])|([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})|(\(?\+91\)?[\s-]?\d{5}[\s-]?\d{5})/gi;

const renderInline = (text, keyPrefix) => {
  const nodes = [];
  let lastIndex = 0;
  let match;

  INLINE_REGEX.lastIndex = 0;
  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [value, url, email, phone] = match;
    const key = `${keyPrefix}-${match.index}`;

    if (url) {
      nodes.push(
        <a key={key} href={url} target='_blank' rel='noopener noreferrer'>
          {url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>,
      );
    } else if (email) {
      nodes.push(
        <a key={key} href={`mailto:${email}`}>
          {email}
        </a>,
      );
    } else if (phone) {
      nodes.push(
        <a key={key} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
          {value}
        </a>,
      );
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

/**
 * Split an answer into blocks:
 *   { type: "paragraph", text }
 *   { type: "list", items: [text] }
 *   { type: "suggestions", items: [question] }   (after a "Did you mean:" line)
 */
export const parseMessage = (text) => {
  const blocks = [];
  let inSuggestions = false;

  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) {
        inSuggestions = false;
        return;
      }

      if (BULLET_REGEX.test(line)) {
        const item = line.replace(BULLET_REGEX, "");
        const type = inSuggestions ? "suggestions" : "list";
        const last = blocks[blocks.length - 1];
        if (last && last.type === type) {
          last.items.push(item);
        } else {
          blocks.push({ type, items: [item] });
        }
        return;
      }

      inSuggestions = SUGGESTION_HEADER_REGEX.test(line);
      blocks.push({ type: "paragraph", text: line });
    });

  return blocks;
};

export const renderMessage = (text, { onSuggestionClick } = {}) =>
  parseMessage(text).map((block, index) => {
    const key = `block-${index}`;

    if (block.type === "list") {
      return (
        <ul key={key} className='chatbot-list'>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    }

    if (block.type === "suggestions") {
      return (
        <div key={key} className='chatbot-suggestions'>
          {block.items.map((item, itemIndex) => (
            <button
              key={`${key}-${itemIndex}`}
              type='button'
              className='chatbot-chip'
              onClick={() => onSuggestionClick?.(item)}
              disabled={!onSuggestionClick}
            >
              {item}
            </button>
          ))}
        </div>
      );
    }

    return (
      <p key={key} className='chatbot-paragraph'>
        {renderInline(block.text, key)}
      </p>
    );
  });
