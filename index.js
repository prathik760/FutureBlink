const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Data = require("./models/Data");

const app = express();
const PORT = process.env.PORT || 5001;
const geminiApiKey = process.env.GEMINI_API_KEY;

let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = require("@google/generative-ai"));
} catch (error) {
  console.error("Missing @google/generative-ai package:", error.message);
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ── Routes ────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

// Ask AI
app.post("/api/ask-ai", async (req, res) => {
  const prompt = req.body?.prompt?.trim();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  if (!geminiApiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
  }
  if (!GoogleGenerativeAI) {
    return res.status(500).json({ error: "@google/generative-ai package not found" });
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ response: text });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ error: error.message || "Gemini request failed" });
  }
});

// Save prompt + response
app.post("/api/save", async (req, res) => {
  const { prompt, response } = req.body;

  // Validate both fields before touching the DB
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  if (!response || !response.trim()) {
    return res.status(400).json({ error: "Response is required" });
  }

  try {
    const newData = new Data({ prompt: prompt.trim(), response: response.trim() });
    await newData.save();
    console.log("✅ Saved — prompt:", prompt.slice(0, 60));
    res.json({ message: "Saved successfully", id: newData._id });
  } catch (error) {
    console.error("❌ Save error:", error);
    res.status(500).json({ error: "Database save failed" });
  }
});

// Get all saved entries
app.get("/api/history", async (req, res) => {
  try {
    const entries = await Data.find().sort({ createdAt: -1 }).limit(50);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Gemini key loaded: ${Boolean(geminiApiKey)}`);
});