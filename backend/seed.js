/**
 * Demo seed script
 * ----------------
 * Populates the database with a realistic weekly schedule for demo/CV screenshots.
 * Creates a demo user and a full set of recurring events.
 *
 * Run once: node seed.js
 * (from the backend/ directory, with .env present)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Event from "./models/Event.js";

dotenv.config({ quiet: true });

const DEMO_EMAIL = "demo@weeklyplanner.ai";
const DEMO_PASSWORD = "demo123456";
const DEMO_NAME = "Arham (Demo)";

const EVENTS = [
  // Prayer times (Dhaka)
  { title: "Fajr prayer", category: "prayer", startTime: "04:45", endTime: "05:00", priority: "high", recurrence: { type: "daily" } },
  { title: "Dhuhr prayer", category: "prayer", startTime: "13:00", endTime: "13:15", priority: "high", recurrence: { type: "daily" } },
  { title: "Asr prayer", category: "prayer", startTime: "16:30", endTime: "16:45", priority: "high", recurrence: { type: "daily" } },
  { title: "Maghrib prayer", category: "prayer", startTime: "18:45", endTime: "19:00", priority: "high", recurrence: { type: "daily" } },
  { title: "Isha prayer", category: "prayer", startTime: "20:15", endTime: "20:30", priority: "high", recurrence: { type: "daily" } },

  // Study
  { title: "CascadeVLM thesis work", category: "study", startTime: "09:00", endTime: "12:00", priority: "high", recurrence: { type: "custom", daysOfWeek: [0, 1, 2, 3, 4] } },
  { title: "IELTS prep", category: "study", startTime: "15:00", endTime: "16:00", priority: "medium", recurrence: { type: "custom", daysOfWeek: [1, 3, 5] } },
  { title: "Literature review reading", category: "study", startTime: "21:00", endTime: "22:30", priority: "medium", recurrence: { type: "custom", daysOfWeek: [0, 3, 5] } },

  // Gym
  { title: "Gym — cardio & weights", category: "gym", startTime: "06:30", endTime: "07:30", priority: "medium", recurrence: { type: "custom", daysOfWeek: [0, 2, 4] } },

  // Freelance
  { title: "Upwork proposals", category: "freelance", startTime: "20:30", endTime: "21:30", priority: "medium", recurrence: { type: "custom", daysOfWeek: [0, 1, 3, 5] } },
  { title: "Fiverr gig delivery", category: "freelance", startTime: "14:00", endTime: "15:00", priority: "high", recurrence: { type: "weekly", daysOfWeek: [5] } },

  // Personal
  { title: "Quran recitation", category: "personal", startTime: "05:15", endTime: "05:45", priority: "high", recurrence: { type: "daily" } },
  { title: "Family time", category: "personal", startTime: "19:30", endTime: "20:15", priority: "medium", recurrence: { type: "custom", daysOfWeek: [5, 6] } },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Remove existing demo data
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await Event.deleteMany({ user: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log("Cleared existing demo data");
  }

  const user = await User.create({ name: DEMO_NAME, email: DEMO_EMAIL, password: DEMO_PASSWORD });
  console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  for (const ev of EVENTS) {
    await Event.create({
      ...ev,
      user: user._id,
      recurrence: {
        type: ev.recurrence.type,
        daysOfWeek: ev.recurrence.daysOfWeek || [],
        startDate: null,
        endDate: null,
      },
      source: "manual",
    });
  }

  console.log(`Seeded ${EVENTS.length} events`);
  console.log("\nLogin with:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
