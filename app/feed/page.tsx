"use client";

import { useContext, useEffect, useState, useMemo } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  PlusCircle,
  X,
  Search,
  Users,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import Loader from "@/components/Loader";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./feed.module.css";

export default function FeedPage() {
  const { posts, loading, fetchPosts, createPost, updatePost, deletePost } =
    useContext(PostContext);
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const router = useRouter();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (data: {
    title: string;
    body: string;
    status: string;
  }) => {
    await createPost(data);
    setShowPostForm(false);
    setShowMobileModal(false);
  };

  const handleCancelForm = () => {
    setShowPostForm(false);
  };

  const handleUpdate = async (
    id: number,
    data: { title: string; body: string; status: string },
  ) => {
    await updatePost(id, data);
  };

  const handleDelete = async (id: number) => {
    await deletePost(id);
  };

  // ── USER-SPECIFIC STATS (for "My Stats" sidebar) ──

  const userStats = useMemo(() => {
    const userPosts = posts.filter((p) => p.user_id === user?.id);
    return {
      total: userPosts.length,
      ideas: userPosts.filter((p) => p.status === "sharing_idea").length,
      collab: userPosts.filter((p) => p.status === "open_to_collaborate").length,
      investment: userPosts.filter((p) => p.status === "seeking_investment").length,
    };
  }, [posts, user?.id]);

  // ── DERIVED DATA (must be before early returns to keep hook order consistent) ──

  // Unique users from posts (for sidebar — top users)
  const uniqueUsers = useMemo(() => {
    const map = new Map<number, { id: number; name: string; role: string }>();
    posts.forEach((p) => {
      if (p.user && !map.has(p.user.id)) {
        map.set(p.user.id, p.user);
      }
    });
    return Array.from(map.values()).slice(0, 5);
  }, [posts]);

  // ── FILTERING ──

  const getFilteredPosts = () => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.user?.name?.toLowerCase().includes(q),
      );
    }

    if (activeFilter !== "all") {
      result = result.filter((post) => post.status === activeFilter);
    }

    if (roleFilter !== "all") {
      result = result.filter((post) => post.user?.role === roleFilter);
    }

    return result;
  };

  const filteredPosts = getFilteredPosts();

  const getFilterCount = (status: string | null) => {
    let base = posts;
    if (roleFilter !== "all") {
      base = base.filter((p) => p.user?.role === roleFilter);
    }
    if (status === null) return base.length;
    return base.filter((post) => post.status === status).length;
  };

  const getRoleCount = (role: string) => {
    let base = posts;
    if (activeFilter !== "all") {
      base = base.filter((p) => p.status === activeFilter);
    }
    if (role === "all") return base.length;
    return base.filter((post) => post.user?.role === role).length;
  };

  const filters = [
    { id: "all", label: "All Posts", count: getFilterCount(null) },
    {
      id: "sharing_idea",
      label: "Ideas",
      count: getFilterCount("sharing_idea"),
    },
    {
      id: "open_to_collaborate",
      label: "Collab",
      count: getFilterCount("open_to_collaborate"),
    },
    {
      id: "seeking_investment",
      label: "Investors",
      count: getFilterCount("seeking_investment"),
    },
  ];

  if (!user) return null;

  const userRoleLabel = user.role === "innovator" ? "Innovator" : "Investor";

  return (
    <div className={styles.app}>
      {/* TOP NAV */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/feed" className={styles.brand}>
            VENTURA
          </Link>
          <div className={styles.navLinks}>
            <Link href="/feed" className={`${styles.navLink} ${styles.active}`}>
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link href="/partners" className={styles.navLink}>
              <Users size={18} />
              <span>Partners</span>
            </Link>
            <Link href="/messages" className={styles.navLink}>
              <MessageSquare size={18} />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </Link>
            <Link href="/settings" className={styles.navLink}>
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            {user.is_admin && (
              <Link href="/admin" className={styles.navLink}>
                <User size={18} />
                <span>Admin</span>
              </Link>
            )}
          </div>
          <div className={styles.navRight}>
            <Link href={`/profile/${user.id}`} className={styles.avatarBtn}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </Link>
          </div>
        </div>
      </header>

      {/* CENTER FEED */}
      <div className={styles.centerLayout}>
        <div className={styles.feedLayout}>
          {/* ─── LEFT SIDEBAR - Filters ─── */}
          <aside className={styles.leftSidebar}>
            <div className={styles.leftSidebarInner}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>People</h3>
                <div className={styles.filterVertical}>
                  <button
                    className={`${styles.filterVerticalBtn} ${
                      roleFilter === "all" ? styles.activeStatus : ""
                    }`}
                    onClick={() => setRoleFilter("all")}
                  >
                    <Users size={16} />
                    <span>Everyone</span>
                    <span className={styles.filterCountPill}>{getRoleCount("all")}</span>
                  </button>
                  <button
                    className={`${styles.filterVerticalBtn} ${
                      roleFilter === "innovator" ? styles.activeInnovator : ""
                    }`}
                    onClick={() => setRoleFilter("innovator")}
                  >
                    <span className={styles.roleDot}>I</span>
                    <span>Innovators</span>
                    <span className={styles.filterCountPill}>{getRoleCount("innovator")}</span>
                  </button>
                  <button
                    className={`${styles.filterVerticalBtn} ${
                      roleFilter === "investor" ? styles.activeInvestor : ""
                    }`}
                    onClick={() => setRoleFilter("investor")}
                  >
                    <span className={styles.roleDot}>V</span>
                    <span>Investors</span>
                    <span className={styles.filterCountPill}>{getRoleCount("investor")}</span>
                  </button>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Post Type</h3>
                <div className={styles.filterVertical}>
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      className={`${styles.filterVerticalBtn} ${
                        activeFilter === filter.id ? styles.activeStatus : ""
                      }`}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      <span className={styles.statusLabel}>{filter.label}</span>
                      <span className={styles.filterCountPill}>{filter.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ─── MAIN FEED ─── */}
          <main className={styles.feedContainer}>
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search posts by title, content, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Create Post Card */}
            <div className={styles.createPostCard}>
              {!showPostForm ? (
                <div className={styles.createPostHeader}>
                  <div className={styles.createPostAvatar}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      className={styles.createPostTrigger}
                      onClick={() => setShowPostForm(true)}
                    >
                      What's your vision, {user.name?.split(" ")[0]}?
                    </button>
                    <span
                      className={`${styles.roleBadge} ${
                        user.role === "innovator"
                          ? styles.innovator
                          : styles.investor
                      }`}
                      style={{ marginTop: 6, display: "inline-block" }}
                    >
                      {userRoleLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.createPostFormContainer}>
                  <div className={styles.createPostFormHeader}>
                    <h4>Create Post</h4>
                    <button
                      className={styles.closeFormBtn}
                      onClick={handleCancelForm}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <PostForm
                    onSubmit={handleCreate}
                    onClose={handleCancelForm}
                  />
                </div>
              )}
            </div>

            {/* Mobile Create Post Button */}
            <button
              className={styles.mobileCreateBtn}
              onClick={() => setShowMobileModal(true)}
            >
              <PlusCircle size={18} /> Create Post
            </button>

            {/* Mobile Modal */}
            {showMobileModal && (
              <div
                className={styles.modalOverlay}
                onClick={() => setShowMobileModal(false)}
              >
                <div
                  className={styles.modalContainer}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.modalHeader}>
                    <h3>Create Post</h3>
                    <button
                      className={styles.modalClose}
                      onClick={() => setShowMobileModal(false)}
                    >
                      ×
                    </button>
                  </div>
                  <PostForm
                    onSubmit={handleCreate}
                    onClose={() => setShowMobileModal(false)}
                  />
                </div>
              </div>
            )}

            {/* Feed List with Loading Animation */}
            {loading ? (
              <>
                <Loader text="Loading posts..." />
                <div className={styles.skeletonCard} />
                <div className={styles.skeletonCard} />
              </>
            ) : filteredPosts.length === 0 ? (
              <div className={styles.emptyFeed}>
                {searchQuery ? (
                  <>
                    <p>No posts match "{searchQuery}".</p>
                    <button onClick={() => setSearchQuery("")}>
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <p>No posts found in this category.</p>
                    <button onClick={() => setActiveFilter("all")}>
                      View all posts
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </main>

          {/* ─── RIGHT SIDEBAR - People & Stats ─── */}
          <aside className={styles.rightSidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Active People</h3>
              {uniqueUsers.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  No active users yet.
                </p>
              ) : (
                uniqueUsers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.id}`}
                    className={styles.suggestedUser}
                  >
                    <div className={styles.suggestedAvatar}>
                      {u.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className={styles.suggestedInfo}>
                      <div className={styles.suggestedName}>{u.name}</div>
                      <div className={styles.suggestedRole}>
                        {u.role === "innovator" ? "Innovator" : "Investor"}
                      </div>
                    </div>
                    <span
                      className={styles.suggestedMsgBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/messages?userId=${u.id}&userName=${encodeURIComponent(u.name)}&userRole=${u.role}`);
                      }}
                    >
                      Message
                    </span>
                  </Link>
                ))
              )}
            </div>

            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>My Stats</h3>
              <div className={styles.statsList}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Total Posts</span>
                  <span className={styles.statValue}>{userStats.total}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Ideas Shared</span>
                  <span className={styles.statValue}>{userStats.ideas}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Open to Collab</span>
                  <span className={styles.statValue}>{userStats.collab}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Seeking Investment</span>
                  <span className={styles.statValue}>{userStats.investment}</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Your Role</span>
                  <span className={styles.statRoleBadge}>{userRoleLabel}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
