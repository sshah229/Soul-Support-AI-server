// open2.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require('mongodb');
require("dotenv").config();

const genAI = new GoogleGenerativeAI("AIzaSyD02kJ3dqI2k0v9hLbEfH-l0igviqq-S04");
const mongoUrl = process.env.MONGODB_URL;  // from .env

/**
 * AnalyzeEmotion:
 *  - Sends user prompt to Gemini for sentiment & emotion analysis.
 *  - Cleans and parses JSON response.
 *  - Appends an ISO timestamp.
 *  - Inserts the result into MongoDB.
 *  - Logs and returns the structured result.
 */
async function AnalyzeEmotion(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const enhancedPrompt = `Analyze the following user entry for sentiment and emotion:

"${prompt}"

Provide the response STRICTLY in this JSON format:
{
  "sentiment_score": float between -1.0 (negative) and 1.0 (positive),
  "emotion_category": one of ["Happy", "Sad", "Neutral", "Anxious", "Angry"],
  "emotion_intensity": integer between 1 (low intensity) and 10 (high intensity)
}`;

  let responseText = '';
  try {
    const result = await model.generateContent(enhancedPrompt);
    responseText = result.response.text();

    // Remove any markdown fences or extraneous formatting
    responseText = responseText.replace(/```json|```/g, '').trim();

    // Parse JSON
    const parsed = JSON.parse(responseText);

    // Append timestamp
    const entry = {
      ...parsed,
      timestamp: new Date().toISOString()
    };

    // Insert into MongoDB
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db();                   // default DB from URL
    const collection = db.collection('emotion_logs');
    await collection.insertOne(entry);
    client.close();

    console.log("Inserted into MongoDB:", entry);
    return entry;
  } catch (err) {
    console.error("Error in AnalyzeEmotion:", err);
    console.error("Raw response was:", responseText);
    return null;
  }
}

module.exports = AnalyzeEmotion;
