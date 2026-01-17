import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) nav("/app", { replace: true });
  }, [user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (ex) {
      setErr(ex.message || "Login failed.");
    }
  }

  return (
    <div className="authWrap">
      <div className="authBubble">
        <div>
          <h2 className="authBubbleTitle">Login</h2>
          <div className="authBubbleSub">Welcome back — continue the conversation</div>
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
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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

          {/* Big themed submit button */}
          <button className="authSubmit" type="submit">
            Login
          </button>

          {err ? <div className="error">{err}</div> : null}
        </form>

        <div className="authFooter">
          No account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
