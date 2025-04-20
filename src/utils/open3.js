// open3.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔐 Ensure GOOGLE_API_KEY is set in your .env
const genAI = new GoogleGenerativeAI("AIzaSyD02kJ3dqI2k0v9hLbEfH-l0igviqq-S04");

/**
 * Detects extreme risk (self-harm/suicidal ideation) in user messages.
 * Returns 1 if risk is detected, else 0.
 * @param {string} userMessage - The user's latest message.
 * @returns {Promise<number|null>} - 1 for self-harm risk, 0 for no risk, or null on error.
 */
async function detectExtremeRisk(userMessage) {
  // Instruction and user content combined into a single user message (system role unsupported)
  const systemPrompt = `
You are a content-safety classifier.
Classify whether the following user message indicates the risk of self-harm or suicidal ideation.
Respond with exactly one word: RISK or NO_RISK.
`.trim();

  // Merge system prompt and user text into one user role
  const combinedPrompt = `${systemPrompt}\n\nMessage: ${userMessage}`;
  const contents = [
    { role: "user", parts: [{ text: combinedPrompt }] }
  ];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({ contents });
    const classification = result.response.text().trim().toUpperCase();

    // Map classification to numeric flag
    const isRisk = classification === "RISK" ? 1 : 0;
    console.log("🛑 Self-harm risk detected:", isRisk);
    return isRisk;
  } catch (err) {
    console.error("Error during extreme-risk detection:", err);
    return null;
  }
}

module.exports = detectExtremeRisk;
