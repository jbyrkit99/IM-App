import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

function getPasswordErrors(pw) {
  const errors = [];
  if (pw.length < 8) errors.push("At least 8 characters");
  if (!/[a-z]/.test(pw)) errors.push("At least 1 lowercase letter");
  if (!/[A-Z]/.test(pw)) errors.push("At least 1 uppercase letter");
  if (!/[0-9]/.test(pw)) errors.push("At least 1 number");
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("At least 1 special character");
  return errors;
}

export default function Register() {
  const { register, user } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) nav("/app", { replace: true });
  }, [user, nav]);

  const passwordErrors = useMemo(() => getPasswordErrors(password), [password]);
  const passwordsMatch = password === confirmPassword;

  const showMismatch =
    touched.confirm && confirmPassword.length > 0 && !passwordsMatch;

  const canSubmit =
    email.trim().length > 0 &&
    passwordErrors.length === 0 &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      setErr("Please fix the password requirements above.");
      return;
    }

    try {
      await register(email, password);
      nav("/app", { replace: true });
    } catch (ex) {
      setErr(ex.message || "Registration failed.");
    }
  }

  return (
    <div className="authWrap">
      <div className="authBubble">
        <div>
          <h2 className="authBubbleTitle">Create Account</h2>
          <div className="authBubbleSub">Start a new conversation</div>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />

          <div className="inputWrap">
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="inputIconBtn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {(touched.password || password.length > 0) && (
            <div style={{ fontSize: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Password must include:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {passwordErrors.length === 0 ? (
                  <li style={{ color: "#86efac", fontWeight: 700 }}>
                    All requirements met ✅
                  </li>
                ) : (
                  passwordErrors.map((m) => (
                    <li key={m} style={{ color: "#fecaca" }}>
                      {m}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          <div className="inputWrap">
            <input
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              placeholder="Confirm Password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="inputIconBtn"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              title={showConfirm ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>

          {showMismatch ? (
            <div style={{ color: "#fecaca", fontSize: 14, fontWeight: 700 }}>
              Passwords do not match.
            </div>
          ) : null}

          {/* Big themed submit button */}
          <button className="authSubmit" type="submit" disabled={!canSubmit}>
            Create Account
          </button>

          {err ? <div className="error">{err}</div> : null}
        </form>

        <div className="authFooter">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
