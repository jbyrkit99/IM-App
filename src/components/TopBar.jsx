import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dialogRef = useRef(null);

  const displayName =
    user?.displayName ||
    (user?.firstName || user?.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.email);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    if (showLogoutConfirm && !dlg.open) dlg.showModal();
    if (!showLogoutConfirm && dlg.open) dlg.close();
  }, [showLogoutConfirm]);

  async function confirmLogout() {
    try {
      setLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      nav("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="topbar">
      <div className="brand">
        Instant Messenger
        <span className="badge">{loc.pathname}</span>
      </div>

      <div className="hstack">
        <span className="topbarUser">{displayName}</span>

        <Link to="/app/profile" className="btn btnSmall">
          Profile
        </Link>

        <button
          className="btn btnDanger btnSmall"
          onClick={() => setShowLogoutConfirm(true)}
        >
          Logout
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setShowLogoutConfirm(false)}
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
        }}
      >
        <div className="modalCard">
          <div className="modalTitle">Log out?</div>
          <div className="kicker">
            Are you sure you want to log out of your account?
          </div>

          <div className="modalActions">
            <button
              type="button"
              className="btn"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={loggingOut}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btnDanger"
              onClick={confirmLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
