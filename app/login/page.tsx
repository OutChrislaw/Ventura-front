"use client";

import Link from "next/link";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/feed");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="main">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <Link href="/" className="header-logo-link">
              <h1 className="header-logo">VENTURA</h1>
            </Link>
          </div>
          <div className="header-center">
            <Link href="/" className="header-options-link">
              <h1 className="header-options">Home</h1>
            </Link>
            <Link href="/#for-innovators" className="header-options-link">
              <h1 className="header-options">Platform</h1>
            </Link>
            <Link href="/#meet-creators" className="header-options-link">
              <h1 className="header-options">Creators</h1>
            </Link>
          </div>
          <div className="header-right">
            <Link href="/login" className="btn-login">
              Log In
            </Link>
            <Link href="/signup" className="btn-signup">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <Link href="/" className="auth-logo">
            <h1 className="auth-logo-img">VENTURA</h1>
          </Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your VENTURA account</p>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                placeholder="ex. carmona@ventura.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-footer">
            No account yet ?{" "}
            <Link href="/signup" className="auth-link">
              Sign up
            </Link>
          </p>

          <p className="auth-forgot-password">
            Forgot your password? Please contact the admin.
          </p>
        </div>
      </div>
    </main>
  );
}
