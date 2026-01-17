import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

function initialsFrom(user, displayName, firstName, lastName) {
  const base =
    (displayName || "").trim() ||
    `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim() ||
    (user?.email || "").trim();

  const parts = base.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "?";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const nav = useNavigate();

  // New fields
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState(""); // yyyy-mm-dd
  const [avatarUrl, setAvatarUrl] = useState(""); // stored/persisted
  const [avatarPreview, setAvatarPreview] = useState(""); // local preview
  const [avatarFile, setAvatarFile] = useState(null);

  const fileRef = useRef(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) nav("/login", { replace: true });
  }, [user, nav]);

  // Initialize from user (adapt to your user shape)
  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setDisplayName(user.displayName || "");
    setBirthday(user.birthday || "");       // expect "YYYY-MM-DD"
    setAvatarUrl(user.avatarUrl || "");     // could be URL or dataURL
    setAvatarPreview("");
    setAvatarFile(null);
  }, [user]);

  // Clean up preview object URLs if you ever switch to URL.createObjectURL
  useEffect(() => {
    return () => {
      // nothing to cleanup because we use dataURL preview
    };
  }, []);

  const initials = useMemo(
    () => initialsFrom(user, displayName, firstName, lastName),
    [user, displayName, firstName, lastName]
  );

  async function onPickAvatar(e) {
    setErr("");
    setMsg("");

    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Basic checks
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr("Please choose an image under 2MB.");
      return;
    }

    setAvatarFile(file);

    // Preview now (dataURL). If you have backend storage later, you’ll upload file instead.
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarPreview(dataUrl);
    } catch (ex) {
      setErr(ex.message || "Failed to preview avatar.");
    }
  }

  function onRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarUrl(""); // removing persisted avatar
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSave(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    const f = firstName.trim();
    const l = lastName.trim();
    const dn = displayName.trim();

    if (!f || !l) {
      setErr("First and last name are required.");
      return;
    }

    // If display name empty, you can allow it (fallback to real name)
    // Birthday optional; if provided, it should be yyyy-mm-dd from input[type=date]

    try {
      setSaving(true);

      const avatarToSave = avatarPreview || avatarUrl || "";

      await updateProfile({
        firstName: f,
        lastName: l,
        displayName: dn,
        birthday: birthday || "",
        avatarUrl: avatarToSave,
      });

      setMsg("Profile updated.");
    } catch (ex) {
      setErr(ex.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profileWrap">
      <div className="profileCard">
        <div className="profileHeader">
          <h2 className="profileTitle">Profile</h2>
          <div className="profileSub">
            Update your avatar and how your name appears in chats
          </div>
        </div>

        <form onSubmit={onSave}>
          <div className="profileSection">
            <div className="profileSectionTitle">Avatar</div>

            <div className="avatarRow">
              <div className="avatarCircle">
                {avatarPreview || avatarUrl ? (
                  <img
                    className="avatarImg"
                    src={avatarPreview || avatarUrl}
                    alt="Avatar preview"
                  />
                ) : (
                  <div className="avatarFallback">{initials}</div>
                )}
              </div>

              <div className="avatarActions">
                <input
                  ref={fileRef}
                  className="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={onPickAvatar}
                />

                <button
                  type="button"
                  className="btn"
                  onClick={() => fileRef.current && fileRef.current.click()}
                >
                  Upload avatar
                </button>

                <button type="button" className="btn btnDanger" onClick={onRemoveAvatar}>
                  Remove
                </button>
              </div>
            </div>

            <div className="kicker" style={{ marginTop: 10 }}>
              PNG/JPG recommended. Max 2MB.
            </div>
          </div>

          <div className="profileSection">
            <div className="profileSectionTitle">Name</div>

            <div className="profileGrid3">
              <div>
                <div className="fieldLabel">Display name</div>
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How others see you (optional)"
                />
              </div>

              <div>
                <div className="fieldLabel">First name</div>
                <input
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div>
                <div className="fieldLabel">Last name</div>
                <input
                  className="input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="kicker" style={{ marginTop: 10 }}>
              If display name is empty, we’ll fall back to your real name.
            </div>
          </div>

          <div className="profileSection">
            <div className="profileSectionTitle">Birthday</div>

            <div className="profileGrid">
              <div>
                <div className="fieldLabel">Birthday</div>
                <input
                  className="input"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="profileActions">
            <button className="btn btnPrimary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>

          {msg ? <div style={{ color: "#86efac", marginTop: 12 }}>{msg}</div> : null}
          {err ? <div className="error" style={{ marginTop: 12 }}>{err}</div> : null}
        </form>
      </div>
    </div>
  );
}
