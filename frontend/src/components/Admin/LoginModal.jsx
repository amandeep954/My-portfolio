import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function LoginModal() {
  const { isAdminModalOpen, setIsAdminModalOpen, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAdminModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl w-full max-w-md p-6 shadow-2xl relative text-[var(--text)] transition-colors">
        <button
          onClick={() => setIsAdminModalOpen(false)}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] text-xl font-bold transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-coral text-[.75rem] uppercase tracking-[2px] font-bold mb-1">
            Secure Access
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text)]">Admin Login</h2>
          <p className="text-[var(--muted)] text-xs mt-1">
            Enter admin credentials to access dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-coral transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-coral transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-coral hover:bg-coral2 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
