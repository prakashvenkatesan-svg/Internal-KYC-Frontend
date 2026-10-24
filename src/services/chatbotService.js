import api from "./api";

const CLIENT_CARE_DETAILS =
  "Phone: (+91) 92402 62108\n" +
  "Email: clientcare@aionioncapital.com";

const CLIENT_CARE_CONTACT = `Please contact our Client Care team:\n${CLIENT_CARE_DETAILS}`;

/**
 * Ask the chatbot backend.
 * Returns { answer, matchedQuestion } - matchedQuestion is the stored question
 * a direct answer belongs to (null for suggestions, greetings and fallbacks).
 */
export const askChatbot = async (message) => {
  try {
    const response = await api.post("/chatbot/message", {
      message,
    });

    const data = response?.data?.data || response?.data || {};

    return {
      answer: data.answer || `I couldn't catch that. ${CLIENT_CARE_CONTACT}`,
      matchedQuestion: data.matched_question || null,
    };
  } catch (error) {
    console.error("Chatbot service error:", error.response?.data || error.message);
    return {
      answer:
        "We're having a little trouble connecting right now. Please try again in a moment. " +
        `If you need help sooner, our Client Care team will be happy to assist:\n${CLIENT_CARE_DETAILS}`,
      matchedQuestion: null,
    };
  }
};
