// utils/open2.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const genAI = new GoogleGenerativeAI("AIzaSyD02kJ3dqI2k0v9hLbEfH-l0igviqq-S04");
const mongoUrl = process.env.MONGODB_URL;

// Accumulates all user messages across AnalyzeEmotion calls
let running_message = "";

async function AnalyzeEmotion(prompt) {
  // 1) Append this prompt to our running history
  running_message += prompt + "\n";

  // 2) Emotion analysis prompt
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const enhancedPrompt = `Analyze the following user entry for sentiment and emotion:

"${prompt}"

Provide the response STRICTLY in this JSON format:
{
  "sentiment_score": float between -1.0 (negative) and 1.0 (positive),
  "emotion_category": one of ["Happy", "Sad", "Neutral", "Anxious", "Angry"],
  "emotion_intensity": integer between 1 (low intensity) and 10 (high intensity)
}`;

  let responseText = "";
  let parsed;
  let entry;
  let client;

  try {
    // Call Gemini
    const result = await model.generateContent(enhancedPrompt);
    responseText = result.response.text();

    // Clean & parse
    responseText = responseText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(responseText);

    // Build our emotion log entry
    entry = {
      ...parsed,
      timestamp: new Date().toISOString(),
    };

    // 3) Insert into MongoDB
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    await db.collection("emotion_logs").insertOne(entry);
    console.log("Inserted into emotion_logs:", entry);

    // 4) If intensity > 8, summarize entire history and journal it
    if (parsed.emotion_intensity > 8) {
      const summaryPrompt = `
You are a thoughtful mental health companion. Summarize the following user conversation in 2-3 sentences, highlighting key feelings and offering gentle guidance:
${running_message}
`;
      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryText = summaryResult.response.text().trim();

      const journalEntry = {
        summary: summaryText,
        timestamp: new Date().toISOString(),
        latest_emotion_category: parsed.emotion_category,
      };
      await db.collection("journal").insertOne(journalEntry);
      console.log("Inserted into journal:", journalEntry);
    }

    return entry;
  } catch (err) {
    console.error("Error in AnalyzeEmotion:", err);
    console.error("Raw response was:", responseText);
    return null;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

module.exports = AnalyzeEmotion;
