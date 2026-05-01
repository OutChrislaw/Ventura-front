"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Save,
  X,
  Check,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  Key,
  LogOut,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import "./settings.css";

export default function SettingsPage() {
  const { user, token, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const totalPendingRequests = pendingRequests.length;

  // Profile fields
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [role, setRole] = useState(user?.role ?? "innovator");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // UI states
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setBio(user.bio ?? "");
      setRole(user.role ?? "innovator");
    }
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      localStorage.removeItem("ventur_token");
      localStorage.removeItem("ventur_user");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, bio, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const data = await res.json();
      const storedUser = localStorage.getItem("ventur_user");
      if (storedUser) {
        const updatedUser = {
          ...JSON.parse(storedUser),
          name,
          email,
          bio,
          role,
        };
        localStorage.setItem("ventur_user", JSON.stringify(updatedUser));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${apiUrl}/users/${user?.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Current password is incorrect.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to delete your account.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const verifyRes = await fetch(`${apiUrl}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        setDeleteError(
          errorData.message || "Incorrect password. Please try again.",
        );
        setDeleting(false);
        return;
      }

      const deleteRes = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await deleteRes.json();
      if (!deleteRes.ok) {
        if (data.message && data.message.includes("only admin")) {
          setDeleteError(
            "Cannot delete account: You are the only admin. Please assign another admin first.",
          );
        } else if (data.message && data.message.includes("admin")) {
          setDeleteError(
            "Admin accounts cannot be deleted. Please contact another admin to remove your admin privileges first.",
          );
        } else {
          setDeleteError(data.message || "Failed to delete account");
        }
        setDeleting(false);
        return;
      }

      localStorage.removeItem("ventur_token");
      localStorage.removeItem("ventur_user");
      setShowDeleteModal(false);
      window.location.href = "/signup";
    } catch (err: any) {
      console.error("Delete account error:", err);
      setDeleteError(
        err.message || "Failed to delete account. Please try again.",
      );
      setDeleting(false);
    }
  };

  const hasChanges = () => {
    return (
      name !== (user?.name ?? "") ||
      email !== (user?.email ?? "") ||
      bio !== (user?.bio ?? "") ||
      role !== (user?.role ?? "innovator")
    );
  };

  const handleDiscard = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setBio(user?.bio ?? "");
    setRole(user?.role ?? "innovator");
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="app">
        {/* BLACK SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">
            <Link href="/feed" className="logoLink">
              <img src="/newhite.png" alt="VENTURA" className="logoImage" />
            </Link>
          </div>

          <nav className="sidebarNav">
            <Link href="/feed" className="navItem">
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link href="/partners" className="navItem">
              <Users size={18} />
              <span>Partners</span>
              {totalPendingRequests > 0 && (
                <span className="navBadge">{totalPendingRequests}</span>
              )}
            </Link>
            <Link href="/messages" className="navItem">
              <MessageSquare size={18} />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="navBadge">{unreadCount}</span>
              )}
            </Link>
            <Link href="/trends" className="navItem">
              <TrendingUp size={18} />
              <span>Trends</span>
            </Link>
            <Link href="/settings" className="navItem active">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            {user.is_admin && (
              <Link href="/admin" className="navItem">
                <LayoutDashboard size={18} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <div className="sidebarFooter">
            <div className="userInfo">
              <div className="userAvatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="userDetails">
                <span className="userName">{user.name}</span>
                <span className="userRole">
                  {user.role === "innovator" ? "Innovator" : "Investor"}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="logoutBtn">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* WHITE MAIN CONTENT */}
        <main className="mainContent">
          {/* Header */}
          <div className="headerRow">
            <h1>Account Settings</h1>
            <div className="headerRight">
              <Link href={`/profile/${user.id}`} className="headerAvatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </Link>
            </div>
          </div>

          {/* Settings Content */}
          <div className="settingsContent">
            {/* Profile Information */}
            <div className="settingsCard">
              <h3 className="cardTitle">Profile Information</h3>

              <div className="avatarRow">
                <div className="avatarPreview">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="avatarInfo">
                  <strong>Profile photo</strong>
                  <p>Upload a photo to personalize your profile.</p>
                  <button className="uploadBtn" disabled>
                    Coming soon
                  </button>
                </div>
              </div>

              <div className="formField">
                <label>Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="formField">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="formField">
                <label>Role</label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "innovator" | "investor")
                  }
                >
                  <option value="innovator">Innovator</option>
                  <option value="investor">Investor</option>
                </select>
              </div>

              <div className="formField">
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell the community about yourself..."
                />
              </div>

              {error && (
                <div className="errorMsg">
                  <X size={14} /> {error}
                </div>
              )}
              {saved && (
                <div className="successMsg">
                  <Check size={14} /> Profile updated successfully.
                </div>
              )}

              <div className="formActions">
                <button
                  className="discardBtn"
                  onClick={handleDiscard}
                  disabled={!hasChanges()}
                >
                  Discard Changes
                </button>
                <button
                  className="saveBtn"
                  onClick={handleSave}
                  disabled={saving || !hasChanges()}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="settingsCard">
              <h3 className="cardTitle">Change Password</h3>
              <p className="passwordHint">
                Enter your current password to change it. Forgot password?
                Contact an admin.
              </p>

              <div className="formField">
                <label>Current Password</label>
                <div className="passwordWrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="formField">
                <label>New Password</label>
                <div className="passwordWrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min. 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="formField">
                <label>Confirm New Password</label>
                <div className="passwordWrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="errorMsg">
                  <X size={14} /> {passwordError}
                </div>
              )}
              {passwordSaved && (
                <div className="successMsg">
                  <Check size={14} /> Password changed successfully.
                </div>
              )}

              <div className="formActions">
                <button
                  className="changePasswordBtn"
                  onClick={handleChangePassword}
                  disabled={
                    savingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {savingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="settingsCard dangerCard">
              <h3 className="cardTitle dangerTitle">Danger Zone</h3>

              <div className="dangerRow">
                <div>
                  <div className="dangerLabel">Sign out</div>
                  <div className="dangerSub">
                    Sign out of your VENTURA account on this device.
                  </div>
                </div>
                <button
                  className="dangerBtn"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>

              <div className="dangerRow">
                <div>
                  <div className="dangerLabel">Delete account</div>
                  <div className="dangerSub">
                    Permanently delete your account and all data. This action
                    cannot be undone.
                  </div>
                </div>
                <button
                  className="dangerBtn"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div
            className="modalOverlay"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="modalContainer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modalHeader">
                <h3>Delete Account</h3>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modalBody">
                <div className="deleteWarningIcon"></div>
                <p>Are you sure you want to delete your account?</p>
                <p className="modalWarning">
                  This action is permanent and cannot be undone. All your posts,
                  comments, conversations will be permanently deleted.
                </p>

                <div className="deletePasswordSection">
                  <label>
                    <Key size={16} /> Enter your password to confirm:
                  </label>
                  <div className="deletePasswordWrapper">
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      placeholder="Your account password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                    >
                      {showDeletePassword ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                  <p className="deleteHint">
                    Forgot your password? Please contact an admin.
                  </p>
                </div>

                {deleteError && <p className="deleteError">{deleteError}</p>}
              </div>
              <div className="modalFooter">
                <button
                  className="cancelBtn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="deleteAccountBtn"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
