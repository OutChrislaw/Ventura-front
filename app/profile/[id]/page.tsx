"use client";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  MessageSquare,
  Settings,
  Edit2,
  X,
  Check,
  LogOut,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
} from "lucide-react";
import "./profile.css";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "innovator" | "investor";
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  status: string | null;
  created_at: string;
  user?: { id: number; name: string; role: string };
}

function AppNav() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  return (
    <header className="profile-nav">
      <div className="profile-nav-inner">
        <Link href="/feed" className="profile-brand">
          VENTURA
        </Link>
        <div className="profile-nav-links">
          <Link href="/feed" className="profile-nav-link">
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/partners" className="profile-nav-link">
            <Users size={18} />
            <span>Partners</span>
          </Link>
          <Link href="/messages" className="profile-nav-link">
            <MessageSquare size={18} />
            <span>Messages</span>
          </Link>
          <Link href="/settings" className="profile-nav-link">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
        <div className="profile-nav-right">
          <button className="profile-icon-btn"></button>
          <div
            className="profile-avatar-btn"
            onClick={() => router.push(`/profile/${user?.id}`)}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              (user?.name?.charAt(0)?.toUpperCase() ?? "U")
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [partnershipStatus, setPartnershipStatus] = useState<{
    status: string | null;
    partnership_id: number | null;
    is_requester: boolean;
  } | null>(null);
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!token || !id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`${apiUrl}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/users/${id}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();

        setProfile(profileData.user);
        setBio(profileData.user.bio ?? "");
        setUserPosts(postsData.posts ?? []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPartnershipStatus = async () => {
      if (currentUser?.id === Number(id)) return;
      try {
        const res = await fetch(`${apiUrl}/partners/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPartnershipStatus(data);
      } catch (err) {
        console.error("Error fetching partnership status:", err);
      }
    };

    fetchProfile();
    fetchPartnershipStatus();
  }, [id, token, currentUser?.id]);

  const handlePartnershipAction = async () => {
    if (!profile) return;
    setPartnershipLoading(true);
    try {
      if (!partnershipStatus || partnershipStatus.status === null) {
        // Send request
        const res = await fetch(`${apiUrl}/partners/request/${profile.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPartnershipStatus({ status: "pending", partnership_id: data.partnership?.id, is_requester: true });
        }
      } else if (partnershipStatus.status === "pending" && !partnershipStatus.is_requester) {
        // Accept
        const res = await fetch(`${apiUrl}/partners/${partnershipStatus.partnership_id}/accept`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setPartnershipStatus({ ...partnershipStatus, status: "accepted" });
        }
      } else if (partnershipStatus.status === "accepted") {
        // Remove
        const res = await fetch(`${apiUrl}/partners/${partnershipStatus.partnership_id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setPartnershipStatus(null);
        }
      }
    } catch (err) {
      console.error("Error with partnership action:", err);
    } finally {
      setPartnershipLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`${apiUrl}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/users/${id}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();

        setProfile(profileData.user);
        setBio(profileData.user.bio ?? "");
        setUserPosts(postsData.posts ?? []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio }), // Removed status
      });
      const data = await res.json();
      setProfile(data.user);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push("/login");
  };

  const isOwner = currentUser?.id === Number(id);

  // No-op handlers for PostCard (profile view only - no editing from here)
  const handleUpdate = async (id: number, data: { title: string; body: string; status: string }) => {};
  const handleDelete = async (id: number) => {};

  // Loader while fetching data
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="profile-page">
          <AppNav />
          <div className="profile-layout">
            <Loader text="Loading profile..." />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="profile-page">
          <AppNav />
          <div className="profile-layout">
            <div className="profile-error-card">
              <p>User not found</p>
              <Link href="/feed" className="profile-error-btn">
                Go to Feed
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="profile-page">
        <AppNav />
        <div className="profile-layout">
          {/* Hero Card */}
          <div className="profile-hero-card">
            <div className="profile-cover">
              <div className="profile-cover-pattern" />
            </div>
            <div className="profile-hero-body">
              <div className="profile-top-row">
                <div className="profile-big-avatar">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isOwner && (
                  <div className="profile-hero-actions">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="profile-btn-outline"
                    >
                      <Edit2 size={14} />
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                    <Link href="/settings" className="profile-btn-outline">
                      <Settings size={14} />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="profile-btn-danger"
                    >
                      <LogOut size={14} />
                      {isLoggingOut ? "..." : "Sign Out"}
                    </button>
                  </div>
                )}
                {!isOwner && (
                  <div className="profile-hero-actions">
                    {partnershipLoading ? (
                      <button className="profile-btn-outline" disabled>
                        <Loader2 size={14} className="profile-spin" />
                        ...
                      </button>
                    ) : !partnershipStatus || partnershipStatus.status === null ? (
                      <button onClick={handlePartnershipAction} className="profile-btn-partner">
                        <UserPlus size={14} />
                        Add Partner
                      </button>
                    ) : partnershipStatus.status === "pending" ? (
                      partnershipStatus.is_requester ? (
                        <span className="profile-badge-pending">
                          <Clock size={14} />
                          Request Sent
                        </span>
                      ) : (
                        <button onClick={handlePartnershipAction} className="profile-btn-accept">
                          <Check size={14} />
                          Accept Request
                        </button>
                      )
                    ) : partnershipStatus.status === "accepted" ? (
                      <div className="profile-partner-actions">
                        <span className="profile-badge-partner">
                          <UserCheck size={14} />
                          Partner
                        </span>
                        <button onClick={handlePartnershipAction} className="profile-btn-remove" title="Remove Partner">
                          <X size={14} />
                        </button>
                      </div>
                    ) : partnershipStatus.status === "declined" ? (
                      <button onClick={handlePartnershipAction} className="profile-btn-partner">
                        <UserPlus size={14} />
                        Add Partner
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="profile-name-block">
                <h1 className="profile-full-name">{profile.name}</h1>
                <span
                  className={`profile-role-tag ${profile.role === "innovator" ? "role-innovator" : "role-investor"}`}
                >
                  {profile.role === "innovator" ? "Innovator" : "Investor"}
                </span>
              </div>

              {/* Status section REMOVED */}

              <div className="profile-meta-row">
                <span className="profile-meta-item">{profile.email}</span>
                <span className="profile-meta-item">
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="profile-card">
            <div className="profile-card-title">About</div>
            {isEditing ? (
              <div className="profile-edit-form">
                <textarea
                  className="profile-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your story..."
                  rows={4}
                />
                {/* Status dropdown REMOVED */}
                {saved && (
                  <div className="profile-success-msg">
                    <Check size={14} />
                    Changes saved successfully.
                  </div>
                )}
                <div className="profile-edit-actions">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="profile-btn-cancel"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="profile-btn-save"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check size={14} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={
                  profile.bio ? "profile-bio-display" : "profile-bio-empty"
                }
              >
                {profile.bio || "No bio yet."}
              </p>
            )}
          </div>

          {/* Posts Card */}
          <div className="profile-card">
            <div className="profile-card-title">
              Posts{" "}
              <span className="profile-post-count">({userPosts.length})</span>
            </div>
            {userPosts.length === 0 ? (
              <div className="profile-no-posts">
                <p>No posts yet.</p>
                {isOwner && (
                  <Link href="/feed" className="profile-no-posts-btn">
                    Create your first post
                  </Link>
                )}
              </div>
            ) : (
              <div className="profile-posts-list">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id || 0}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
