// src/utils/open2.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const genAI = new GoogleGenerativeAI("AIzaSyD02kJ3dqI2k0v9hLbEfH-l0igviqq-S04");
const mongoUrl = process.env.MONGODB_URL;

async function AnalyzeEmotion(prompt, email) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const enhanced = `
Analyze the following user entry for sentiment & emotion:

"${prompt}"

Respond STRICTLY as JSON:
{
  "sentiment_score": float -1.0→1.0,
  "emotion_category": one of ["Happy","Sad","Neutral","Anxious","Angry"],
  "emotion_intensity": integer 1→10
}
`;

  let responseText = "";
  try {
    const result = await model.generateContent(enhanced);
    responseText = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(responseText);

    const entry = {
      ...parsed,
      timestamp: new Date().toISOString(),
      email,
    };

    const client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.db().collection("emotion_logs").insertOne(entry);
    client.close();

    console.log("Inserted emotion log:", entry);
    return entry;
  } catch (err) {
    console.error("AnalyzeEmotion error:", err, "raw:", responseText);
    return null;
  }
}

module.exports = AnalyzeEmotion;
