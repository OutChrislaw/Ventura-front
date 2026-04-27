"use client";

import Link from "next/link";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"innovator" | "investor">("innovator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password visibility states (default: hidden)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load saved form data from sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem("signup_form_data");
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.name) setName(data.name);
      if (data.email) setEmail(data.email);
      if (data.role) setRole(data.role);
      sessionStorage.removeItem("signup_form_data");
    }
  }, []);

  const saveFormData = () => {
    const formData = { name, email, role };
    sessionStorage.setItem("signup_form_data", JSON.stringify(formData));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleRoleChange = (newRole: "innovator" | "investor") => {
    setRole(newRole);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        role,
      });
      sessionStorage.removeItem("signup_form_data");
      router.push("/feed");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join VENTURA today</p>

          {error && <p className="error-msg">{error}</p>}

          <div className="role-select-group">
            <button
              type="button"
              onClick={() => handleRoleChange("innovator")}
              className={`role-btn ${role === "innovator" ? "active" : ""}`}
            >
              Innovator
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("investor")}
              className={`role-btn ${role === "investor" ? "active" : ""}`}
            >
              Investor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-options form-options-spacing">
              <label className="checkbox-label">
                <input type="checkbox" required /> I agree to the{" "}
                <Link
                  href="/terms"
                  onClick={saveFormData}
                  className="auth-link"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  onClick={saveFormData}
                  className="auth-link"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                placeholder="ex. Rommel Carmona"
                value={name}
                onChange={handleNameChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                placeholder="ex. carmona@ventura.com"
                value={email}
                onChange={handleEmailChange}
                className="form-input"
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (atelast 8 characters)"
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

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input password-input"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="password-toggle-btn"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
