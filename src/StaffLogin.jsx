
import { useState } from "react";
import { supabase } from "./supabase.js";

export default function StaffLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      const { data: staff, error: staffError } =
        await supabase
          .from("canteen_staff")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

      
if (staffError) {
  console.error("Staff lookup error:", staffError);
  throw new Error("Staff lookup failed: " + staffError.message);
}

if (!staff) {
  console.error("No staff record for logged-in user:", data.user.id);
  await supabase.auth.signOut();
  throw new Error("Staff record not found for this login.");
}


      onLogin();
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page">
      <div className="form-container">
        <h1>🍃 Canteen Staff Login</h1>
        <p>Sign in to access the MealMind AI dashboard.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p role="alert">{error}</p>}

          <button
            className="primary-btn submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            className="back-btn"
            type="button"
            onClick={onBack}
          >
            ← Back to Home
          </button>
        </form>
      </div>
    </main>
  );
}
