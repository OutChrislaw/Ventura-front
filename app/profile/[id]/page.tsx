"use client";
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  MessageSquare,
  Settings,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  XCircle,
  UserMinus,
  User,
  X,
  Check,
  TrendingUp,
  LogOut,
  LayoutDashboard,
  Bell,
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

interface Partner {
  id: number;
  name: string;
  role: string;
  partnership_id: number;
}

function AppNav() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();

  const totalPendingRequests = pendingRequests.length;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
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
          {unreadCount > 0 && <span className="navBadge">{unreadCount}</span>}
        </Link>
        <Link href="/trends" className="navItem">
          <TrendingUp size={18} />
          <span>Trends</span>
        </Link>
        <Link href="/settings" className="navItem">
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        {user?.is_admin && (
          <Link href="/admin" className="navItem">
            <LayoutDashboard size={18} />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      <div className="sidebarFooter">
        <div className="userInfo">
          <div className="userAvatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="userDetails">
            <span className="userName">{user?.name}</span>
            <span className="userRole">
              {user?.role === "innovator" ? "Innovator" : "Investor"}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="logoutBtn">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, token } = useContext(AuthContext);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnershipStatus, setPartnershipStatus] = useState<{
    status: string | null;
    partnership_id: number | null;
    is_requester: boolean;
  } | null>(null);
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const profileId = Number(id);
  const isOwner = currentUser?.id === profileId;

  const fetchPartnersList = useCallback(async () => {
    if (!token) return;
    setPartnersLoading(true);
    try {
      const res = await fetch(`${apiUrl}/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPartnersList(data.partners || []);
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setPartnersLoading(false);
    }
  }, [token, apiUrl]);

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
        setUserPosts(postsData.posts ?? []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPartnershipStatus = async () => {
      if (isOwner) return;
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

    if (isOwner) {
      fetchPartnersList();
    }
  }, [id, token, apiUrl, isOwner, fetchPartnersList]);

  const handleOpenPartnersModal = async () => {
    await fetchPartnersList();
    setShowPartnersModal(true);
  };

  const handlePartnershipAction = async (action?: string) => {
    if (!profile) return;
    setPartnershipLoading(true);
    try {
      if (action === "cancel" && partnershipStatus?.partnership_id) {
        const res = await fetch(
          `${apiUrl}/partners/${partnershipStatus.partnership_id}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          setPartnershipStatus(null);
          if (isOwner) await fetchPartnersList();
        }
      } else if (!partnershipStatus || partnershipStatus.status === null) {
        const res = await fetch(`${apiUrl}/partners/request/${profile.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setPartnershipStatus({
            status: "pending",
            partnership_id: data.partnership?.id,
            is_requester: true,
          });
        }
      } else if (
        partnershipStatus.status === "pending" &&
        !partnershipStatus.is_requester
      ) {
        const res = await fetch(
          `${apiUrl}/partners/${partnershipStatus.partnership_id}/accept`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          setPartnershipStatus({ ...partnershipStatus, status: "accepted" });
          if (isOwner) await fetchPartnersList();
        }
      } else if (partnershipStatus.status === "accepted") {
        const res = await fetch(
          `${apiUrl}/partners/${partnershipStatus.partnership_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          setPartnershipStatus(null);
          if (isOwner) await fetchPartnersList();
        }
      }
    } catch (err) {
      console.error("Error with partnership action:", err);
    } finally {
      setPartnershipLoading(false);
    }
  };

  const handleRemovePartnerFromList = async (partnershipId: number) => {
    try {
      const res = await fetch(`${apiUrl}/partners/${partnershipId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchPartnersList();
        if (partnershipStatus?.partnership_id === partnershipId) {
          setPartnershipStatus(null);
        }
      }
    } catch (err) {
      console.error("Error removing partner:", err);
    }
  };

  const handleUpdate = async (
    id: number,
    data: { title: string; body: string; status: string },
  ) => {};
  const handleDelete = async (id: number) => {};

  if (loading) {
    return <Loader fullPage text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="app">
          <AppNav />
          <main className="mainContent">
            <div className="emptyState">
              <p>User not found</p>
              <Link href="/feed" className="findBtn">
                Go to Feed
              </Link>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app">
        {/* BLACK SIDEBAR */}
        <AppNav />

        {/* WHITE MAIN CONTENT */}
        <main className="mainContent">
          {/* Header with Avatar */}
          <div className="headerRow">
            <h1>Profile</h1>
            <div className="headerRight">
              <Link
                href={`/profile/${currentUser?.id}`}
                className="headerAvatar"
              >
                {currentUser?.name?.[0]?.toUpperCase() || "U"}
              </Link>
            </div>
          </div>

          {/* Hero Card */}
          <div className="profileHeroCard">
            <div className="profileHeroBody">
              <div className="profileTopRow">
                <div className="profileBigAvatar">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isOwner && (
                  <div className="profileHeroActions">
                    <button
                      onClick={handleOpenPartnersModal}
                      className="secondaryBtn"
                    >
                      <Users size={14} />
                      Partners ({partnersList.length})
                    </button>
                  </div>
                )}
                {!isOwner && (
                  <div className="profileHeroActions">
                    {partnershipLoading ? (
                      <button className="secondaryBtn" disabled>
                        <Loader2 size={14} className="spin" />
                        ...
                      </button>
                    ) : !partnershipStatus ||
                      partnershipStatus.status === null ? (
                      <button
                        onClick={() => handlePartnershipAction()}
                        className="primaryBtn"
                      >
                        <UserPlus size={14} />
                        Add Partner
                      </button>
                    ) : partnershipStatus.status === "pending" ? (
                      partnershipStatus.is_requester ? (
                        <div className="partnerActions">
                          <span className="pendingBadge">
                            <Clock size={14} />
                            Request Sent
                          </span>
                          <button
                            onClick={() => handlePartnershipAction("cancel")}
                            className="cancelRequestBtn"
                            title="Cancel Request"
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePartnershipAction()}
                          className="acceptBtn"
                        >
                          <Check size={14} />
                          Accept Request
                        </button>
                      )
                    ) : partnershipStatus.status === "accepted" ? (
                      <div className="partnerActions">
                        <span className="partnerBadge">
                          <UserCheck size={14} />
                          Partner
                        </span>
                        <button
                          onClick={() => handlePartnershipAction()}
                          className="removeBtn"
                          title="Remove Partner"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : partnershipStatus.status === "declined" ? (
                      <button
                        onClick={() => handlePartnershipAction()}
                        className="primaryBtn"
                      >
                        <UserPlus size={14} />
                        Add Partner
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="profileNameBlock">
                <h1 className="profileFullName">{profile.name}</h1>
                <span
                  className={`roleTag ${profile.role === "innovator" ? "roleInnovator" : "roleInvestor"}`}
                >
                  {profile.role === "innovator" ? "Innovator" : "Investor"}
                </span>
              </div>

              <div className="profileMetaRow">
                <span className="profileMetaItem">{profile.email}</span>
                <span className="profileMetaItem">
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="profileBioSection">
                <p
                  className={
                    profile.bio ? "profileBioDisplay" : "profileBioEmpty"
                  }
                >
                  {profile.bio || "No bio yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Posts Card */}
          <div className="settingsCard">
            <h3 className="cardTitle">
              Posts <span className="postCount">({userPosts.length})</span>
            </h3>
            {userPosts.length === 0 ? (
              <div className="emptyState">
                <p>No posts yet.</p>
                {isOwner && (
                  <Link href="/feed" className="findBtn">
                    Create your first post
                  </Link>
                )}
              </div>
            ) : (
              <div className="postsList">
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
        </main>
      </div>

      {/* Partners List Modal */}
      {showPartnersModal && (
        <div
          className="modalOverlay"
          onClick={() => setShowPartnersModal(false)}
        >
          <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Your Partners ({partnersList.length})</h3>
              <button onClick={() => setShowPartnersModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modalBody">
              {partnersLoading ? (
                <div className="centerMsg">
                  <Loader2 size={24} className="spin" />
                  <p>Loading partners...</p>
                </div>
              ) : partnersList.length === 0 ? (
                <div className="centerMsg">
                  <p>No partners yet.</p>
                  <Link href="/partners" className="findLink">
                    Find Partners
                  </Link>
                </div>
              ) : (
                <div className="partnersList">
                  {partnersList.map((partner) => (
                    <div key={partner.id} className="partnerItem">
                      <div
                        className="partnerInfo"
                        onClick={() => {
                          setShowPartnersModal(false);
                          router.push(`/profile/${partner.id}`);
                        }}
                      >
                        <div className="partnerAvatar">
                          {partner.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="partnerName">{partner.name}</div>
                          <div className="partnerRole">
                            {partner.role === "innovator"
                              ? "Innovator"
                              : "Investor"}
                          </div>
                        </div>
                      </div>
                      <button
                        className="partnerRemoveBtn"
                        onClick={() =>
                          handleRemovePartnerFromList(partner.partnership_id)
                        }
                        title="Remove Partner"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
