"use client";
import { useContext, useEffect, useState, useMemo } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Search,
  X,
  UserPlus,
  UserCheck,
  UserMinus,
  Check,
  Users,
  Loader2,
  XCircle,
  LogOut,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import { MessageContext } from "@/context/MessageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./partners.module.css";

type Tab = "search" | "my-partners" | "requests";

export default function PartnersPage() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const router = useRouter();
  const {
    partners,
    pendingRequests,
    sentRequests,
    loading,
    fetchPartners,
    fetchRequests,
    fetchSentRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removePartner,
    cancelSentRequest,
  } = useContext(PartnershipContext);

  // Default tab is now "search" (Find People)
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterChanging, setFilterChanging] = useState(false);

  // Calculate total pending requests for badge
  const totalPendingRequests = pendingRequests.length;

  // Initial fetch for partners and requests
  useEffect(() => {
    fetchPartners();
    fetchRequests();
    fetchSentRequests();
  }, []);

  // Fetch all users when "Everyone" filter is selected with no search query
  useEffect(() => {
    if (activeTab !== "search") return;

    // When "Everyone" is selected (roleFilter === "") and no search query
    if (roleFilter === "" && !searchQuery.trim()) {
      const fetchAllUsers = async () => {
        setFilterChanging(true);
        setSearching(true);
        try {
          const results = await searchUsers("", undefined);
          setSearchResults(results);
        } catch (error) {
          console.error("Error fetching all users:", error);
          setSearchResults([]);
        } finally {
          setSearching(false);
          setFilterChanging(false);
        }
      };
      fetchAllUsers();
    }
  }, [roleFilter, activeTab, searchUsers]);

  // Debounced search with centered loading (for when search query exists)
  useEffect(() => {
    if (activeTab !== "search") return;

    // Skip if no search query and roleFilter is empty (handled by above useEffect)
    if (!searchQuery.trim() && roleFilter === "") {
      return;
    }

    // Skip if no search query but roleFilter has value (fetch filtered users)
    if (!searchQuery.trim() && roleFilter !== "") {
      const fetchFilteredUsers = async () => {
        setFilterChanging(true);
        setSearching(true);
        try {
          const results = await searchUsers("", roleFilter);
          setSearchResults(results);
        } finally {
          setSearching(false);
          setFilterChanging(false);
        }
      };
      fetchFilteredUsers();
      return;
    }

    // Search with query
    setFilterChanging(true);
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery, roleFilter || undefined);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
        setFilterChanging(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      setFilterChanging(false);
    };
  }, [searchQuery, roleFilter, activeTab, searchUsers]);

  const handleSendRequest = async (userId: number) => {
    setActionLoading(userId);
    const result = await sendRequest(userId);
    if (result.success) {
      // Refresh current view
      if (roleFilter === "" && !searchQuery.trim()) {
        const results = await searchUsers("", undefined);
        setSearchResults(results);
      } else if (!searchQuery.trim() && roleFilter !== "") {
        const results = await searchUsers("", roleFilter);
        setSearchResults(results);
      } else {
        const results = await searchUsers(searchQuery, roleFilter || undefined);
        setSearchResults(results);
      }
      fetchSentRequests();
    }
    setActionLoading(null);
  };

  const handleAcceptRequest = async (id: number) => {
    setActionLoading(id);
    await acceptRequest(id);
    await fetchRequests();
    await fetchPartners();
    setActionLoading(null);
  };

  const handleDeclineRequest = async (id: number) => {
    setActionLoading(id);
    await declineRequest(id);
    await fetchRequests();
    setActionLoading(null);
  };

  const handleCancelRequest = async (id: number) => {
    setActionLoading(id);
    await cancelSentRequest(id);
    await fetchSentRequests();
    setActionLoading(null);
  };

  const handleRemovePartner = async (
    partnershipId: number | null | undefined,
  ) => {
    if (!partnershipId) return;
    setActionLoading(partnershipId);
    await removePartner(partnershipId);
    await fetchPartners();
    setActionLoading(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "my-partners", label: "My Partners", count: partners.length },
    { id: "search", label: "Find People", count: undefined },
    { id: "requests", label: "Requests", count: totalPendingRequests },
  ];

  // Show loading state for initial data fetch
  if (loading && activeTab === "my-partners") {
    return (
      <div className={styles.fullscreenLoader}>
        <div className={styles.spinner}></div>
        <p>Loading partners...</p>
      </div>
    );
  }

  if (loading && activeTab === "requests") {
    return (
      <div className={styles.fullscreenLoader}>
        <div className={styles.spinner}></div>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      {/* BLACK SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/feed" className={styles.logoLink}>
            <img
              src="/newhite.png"
              alt="VENTURA"
              className={styles.logoImage}
            />
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/feed" className={styles.navItem}>
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link
            href="/partners"
            className={`${styles.navItem} ${styles.active}`}
          >
            <Users size={18} />
            <span>Partners</span>
            {totalPendingRequests > 0 && (
              <span className={styles.navBadge}>{totalPendingRequests}</span>
            )}
          </Link>
          <Link href="/messages" className={styles.navItem}>
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className={styles.navBadge}>{unreadCount}</span>
            )}
          </Link>
          <Link href="/trends" className={styles.navItem}>
            <TrendingUp size={18} />
            <span>Trends</span>
          </Link>
          <Link href="/settings" className={styles.navItem}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user.is_admin && (
            <Link href="/admin" className={styles.navItem}>
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.sidebarUserName}>{user.name}</span>
              <span className={styles.userRole}>
                {user.role === "innovator" ? "Innovator" : "Investor"}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* WHITE MAIN CONTENT */}
      <main className={styles.mainContent}>
        {/* Header with Tabs and Avatar on same line */}
        <div className={styles.headerRow}>
          <div className={styles.tabsWrapper}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={styles.tabCount}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className={styles.headerRight}>
            <Link href={`/profile/${user.id}`} className={styles.headerAvatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </Link>
          </div>
        </div>

        {/* Search Bar (only for search tab) */}
        {activeTab === "search" && (
          <div className={styles.searchSection}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.searchClear}
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Role Filters (only for search tab) */}
        {activeTab === "search" && (
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>FILTER BY PEOPLE</label>
              <div className={styles.filterButtons}>
                <button
                  className={`${styles.filterBtn} ${roleFilter === "" ? styles.active : ""}`}
                  onClick={() => setRoleFilter("")}
                >
                  Everyone
                </button>
                <button
                  className={`${styles.filterBtn} ${roleFilter === "innovator" ? styles.active : ""}`}
                  onClick={() => setRoleFilter("innovator")}
                >
                  Innovators
                </button>
                <button
                  className={`${styles.filterBtn} ${roleFilter === "investor" ? styles.active : ""}`}
                  onClick={() => setRoleFilter("investor")}
                >
                  Investors
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* Search Tab Content */}
          {activeTab === "search" && (
            <div className={styles.searchResults}>
              {/* Centered loading when changing filters or searching */}
              {filterChanging || searching ? (
                <div className={styles.centerLoader}>
                  <div className={styles.spinner}></div>
                  <p>Searching for users...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className={styles.centerMsg}>
                  <Search size={48} />
                  <p>
                    {searchQuery.trim() || roleFilter
                      ? "No users found."
                      : "Search for people to partner with"}
                  </p>
                </div>
              ) : (
                <div className={styles.userList}>
                  {searchResults.map((u) => (
                    <div key={u.id} className={styles.userCard}>
                      <div
                        className={styles.userCardLeft}
                        onClick={() => router.push(`/profile/${u.id}`)}
                      >
                        <div className={styles.userAvatar}>
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{u.name}</div>
                          <div className={styles.userRole}>
                            {u.role === "innovator" ? "Innovator" : "Investor"}
                          </div>
                          {u.bio && (
                            <div className={styles.userBio}>{u.bio}</div>
                          )}
                        </div>
                      </div>
                      <div className={styles.userCardRight}>
                        {u.is_partner ? (
                          <span className={styles.partnerBadge}>
                            <UserCheck size={14} />
                          </span>
                        ) : u.is_request_sent ? (
                          <button
                            className={styles.cancelBtn}
                            onClick={() =>
                              handleCancelRequest(u.partnership_id)
                            }
                            disabled={actionLoading === u.partnership_id}
                          >
                            {actionLoading === u.partnership_id ? (
                              <Loader2 size={14} className={styles.spin} />
                            ) : (
                              <X size={14} />
                            )}
                            Cancel
                          </button>
                        ) : u.is_request_received ? (
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.acceptBtn}
                              onClick={() =>
                                handleAcceptRequest(u.partnership_id)
                              }
                              disabled={actionLoading === u.partnership_id}
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              className={styles.declineBtn}
                              onClick={() =>
                                handleDeclineRequest(u.partnership_id)
                              }
                              disabled={actionLoading === u.partnership_id}
                            >
                              <X size={14} /> Decline
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.addBtn}
                            onClick={() => handleSendRequest(u.id)}
                            disabled={actionLoading === u.id}
                          >
                            {actionLoading === u.id ? (
                              <Loader2 size={14} className={styles.spin} />
                            ) : (
                              <UserPlus size={14} />
                            )}
                            Add Partner
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Partners Tab Content */}
          {activeTab === "my-partners" && (
            <div className={styles.partnersList}>
              {partners.length === 0 ? (
                <div className={styles.centerMsg}>
                  <Users size={48} />
                  <p>You have no partners yet.</p>
                  <button
                    className={styles.findBtn}
                    onClick={() => setActiveTab("search")}
                  >
                    Find People
                  </button>
                </div>
              ) : (
                <div className={styles.userList}>
                  {partners.map((p) => (
                    <div key={p.id} className={styles.userCard}>
                      <div
                        className={styles.userCardLeft}
                        onClick={() => router.push(`/profile/${p.id}`)}
                      >
                        <div className={styles.userAvatar}>
                          {p.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{p.name}</div>
                          <div className={styles.userRole}>
                            {p.role === "innovator" ? "Innovator" : "Investor"}
                          </div>
                          {p.bio && (
                            <div className={styles.userBio}>{p.bio}</div>
                          )}
                        </div>
                      </div>
                      <div className={styles.userCardRight}>
                        <button
                          className={styles.msgBtn}
                          onClick={() =>
                            router.push(
                              `/messages?userId=${p.id}&userName=${encodeURIComponent(p.name)}&userRole=${p.role}`,
                            )
                          }
                        >
                          <MessageSquare size={14} /> Message
                        </button>
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemovePartner(p.partnership_id)}
                          disabled={actionLoading === p.partnership_id}
                        >
                          {actionLoading === p.partnership_id ? (
                            <Loader2 size={14} className={styles.spin} />
                          ) : (
                            <UserMinus size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab Content */}
          {activeTab === "requests" && (
            <div className={styles.requestsList}>
              {pendingRequests.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h3 className={styles.sectionTitle}>
                    Received ({pendingRequests.length})
                  </h3>
                  <div className={styles.userList}>
                    {pendingRequests.map((req) => (
                      <div key={req.id} className={styles.userCard}>
                        <div
                          className={styles.userCardLeft}
                          onClick={() =>
                            router.push(`/profile/${req.requester?.id}`)
                          }
                        >
                          <div className={styles.userAvatar}>
                            {req.requester?.name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div className={styles.userInfo}>
                            <div className={styles.userName}>
                              {req.requester?.name || "Unknown"}
                            </div>
                            <div className={styles.userRole}>
                              {req.requester?.role === "innovator"
                                ? "Innovator"
                                : "Investor"}
                            </div>
                          </div>
                        </div>
                        <div className={styles.userCardRight}>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.acceptBtn}
                              onClick={() => handleAcceptRequest(req.id)}
                              disabled={actionLoading === req.id}
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              className={styles.declineBtn}
                              onClick={() => handleDeclineRequest(req.id)}
                              disabled={actionLoading === req.id}
                            >
                              <X size={14} /> Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sentRequests.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h3 className={styles.sectionTitle}>
                    Sent ({sentRequests.length})
                  </h3>
                  <div className={styles.userList}>
                    {sentRequests.map((req) => (
                      <div key={req.id} className={styles.userCard}>
                        <div
                          className={styles.userCardLeft}
                          onClick={() =>
                            router.push(`/profile/${req.requested?.id}`)
                          }
                        >
                          <div className={styles.userAvatar}>
                            {req.requested?.name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div className={styles.userInfo}>
                            <div className={styles.userName}>
                              {req.requested?.name || "Unknown"}
                            </div>
                            <div className={styles.userRole}>
                              {req.requested?.role === "innovator"
                                ? "Innovator"
                                : "Investor"}
                            </div>
                          </div>
                        </div>
                        <div className={styles.userCardRight}>
                          <button
                            className={styles.cancelSentBtn}
                            onClick={() => handleCancelRequest(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 size={14} className={styles.spin} />
                            ) : (
                              <X size={14} />
                            )}
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingRequests.length === 0 && sentRequests.length === 0 && (
                <div className={styles.centerMsg}>
                  <p>No partnership requests.</p>
                  <button
                    className={styles.findBtn}
                    onClick={() => setActiveTab("search")}
                  >
                    Find People
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
