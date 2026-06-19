import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log in. Check your details.");
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-ink-soft rounded-2xl p-8 w-full max-w-sm border border-white/5"
      >
        <h1 className="font-display text-2xl text-sand mb-1">Welcome back</h1>
        <p className="text-ink-faint text-sm mb-6">Log in to your weekly planner</p>

        {error && <p className="text-clay text-sm mb-4">{error}</p>}

        <label className="block text-sand text-sm mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand focus:outline-none focus:ring-2 focus:ring-gold"
        />

        <label className="block text-sand text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand focus:outline-none focus:ring-2 focus:ring-gold"
        />

        <button
          type="submit"
          className="w-full bg-gold text-ink font-medium py-2 rounded-lg hover:opacity-90 transition"
        >
          Log in
        </button>

        <p className="text-ink-faint text-sm mt-4 text-center">
          No account? <Link to="/register" className="text-gold">Register</Link>
        </p>
      </form>
    </div>
  );
}
