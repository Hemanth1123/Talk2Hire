// utils/ai.js - small placeholders for AI behaviour
module.exports = {
  getNextQuestion: async (userMessage, chatHistory) => {
    const followUps = [
      "That's interesting. Can you elaborate on that?",
      "What would you say is your biggest strength in this area?",
      "Describe a challenging situation you faced and how you handled it.",
      "Understood. Where do you see yourself in the next five years?"
    ];
    return followUps[Math.floor(Math.random() * followUps.length)];
  },
  textToSpeech: async (text) => {
    // placeholder base64 audio string (not real)
    return "UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  }
};

