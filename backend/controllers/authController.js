import User from "../models/User.js";
import { generateToken } from "../middleware/authMiddleware.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      weekStartsOn: user.weekStartsOn,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      weekStartsOn: user.weekStartsOn,
      location: user.location,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateLocation = async (req, res) => {
  try {
    const { city, lat, lng } = req.body;
    req.user.location = { city, lat, lng };
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
