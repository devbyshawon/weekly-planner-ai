import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import parseRoutes from "./routes/parseRoutes.js";

dotenv.config({ quiet: true });
connectDB();

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/parse", parseRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`));
