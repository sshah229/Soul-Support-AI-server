// routes/journal.js
const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();
const mongoUrl = process.env.MONGODB_URL;

/**
 * GET /journal
 * Returns all journal summary entries sorted by most recent first
 */
router.get("/journal", async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    const entries = await db
      .collection("journal")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    res.json(entries);
  } catch (err) {
    console.error("Error fetching journal entries:", err);
    res.status(500).json({ error: "Failed to fetch journal entries." });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

module.exports = router;
