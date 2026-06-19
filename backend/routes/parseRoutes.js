import express from "express";
import { parsePrompt } from "../utils/parser.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/parse — { text: "I pray fajr at 4:45 AM every day" }
// Returns a draft event object for the frontend to show as a confirmation
// preview before the user saves it (manual edits still possible before save).
router.post("/", protect, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Text is required" });
  }

  const draft = parsePrompt(text);
  if (!draft) {
    return res.status(422).json({
      message: "Couldn't find a date or time in that sentence. Try rephrasing, e.g. 'Gym at 6 PM every Monday'.",
    });
  }

  res.json(draft);
});

export default router;
