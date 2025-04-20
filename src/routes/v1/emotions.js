// routes/emotions.js

const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();
const mongoUrl = process.env.MONGODB_URL; // your MongoDB connection string

// GET /emotions
// Returns all emotion log entries (no filtering)
router.get("/emotions", async (req, res) => {
  let client;

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db();                    // uses default DB from URL
    const collection = db.collection("emotion_logs");

    // Fetch all logs, sorted by timestamp ascending
    const logs = await collection
      .find({})
      .sort({ timestamp: 1 })
      .toArray();

    // Send back as JSON
    res.json(logs);
  } catch (err) {
    console.error("Error fetching emotions:", err);
    res.status(500).json({ error: "Failed to fetch emotion logs." });
  } finally {
    // Ensure we close the connection
    if (client) {
      client.close();
    }
  }
});

module.exports = router;
