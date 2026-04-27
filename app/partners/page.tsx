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
  Clock,
  UserMinus,
  Check,
  Users,
  Loader2,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import { MessageContext } from "@/context/MessageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./partners.module.css";

type Tab = "search" | "my-partners" | "requests";

export default function PartnersPage() {
  const { user } = useContext(AuthContext);
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
  } = useContext(PartnershipContext);

  const [activeTab, setActiveTab] = useState<Tab>("my-partners");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPartners();
    fetchRequests();
    fetchSentRequests();
  }, []);

  // Debounced search
  useEffect(() => {
    if (activeTab !== "search") return;
    if (!searchQuery.trim() && !roleFilter) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchUsers(searchQuery, roleFilter || undefined);
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, activeTab]);

  const handleSendRequest = async (userId: number) => {
    setActionLoading(userId);
    const result = await sendRequest(userId);
    if (result.success) {
      // Refresh search results to reflect updated status
      const results = await searchUsers(searchQuery, roleFilter || undefined);
      setSearchResults(results);
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

  const handleRemovePartner = async (partnershipId: number | null | undefined) => {
    if (!partnershipId) return;
    setActionLoading(partnershipId);
    await removePartner(partnershipId);
    await fetchPartners();
    setActionLoading(null);
  };

  if (!user) return null;

  const userRoleLabel = user.role === "innovator" ? "Innovator" : "Investor";

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "my-partners", label: "My Partners", count: partners.length },
    { id: "search", label: "Find People", count: undefined },
    { id: "requests", label: "Requests", count: pendingRequests.length },
  ];

  return (
    <div className={styles.app}>
      {/* Top Nav */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/feed" className={styles.brand}>VENTURA</Link>
          <div className={styles.navLinks}>
            <Link href="/feed" className={styles.navLink}>
              <Home size={18} /><span>Feed</span>
            </Link>
            <Link href="/partners" className={`${styles.navLink} ${styles.active}`}>
              <Users size={18} /><span>Partners</span>
            </Link>
            <Link href="/messages" className={styles.navLink}>
              <MessageSquare size={18} /><span>Messages</span>
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </Link>
            <Link href="/settings" className={styles.navLink}>
              <Settings size={18} /><span>Settings</span>
            </Link>
            {user.is_admin && (
              <Link href="/admin" className={styles.navLink}>
                <User size={18} /><span>Admin</span>
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

      <div className={styles.layout}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Partnerships</h1>
              <p className={styles.subtitle}>
                Find and connect with innovators and investors
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsRow}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={styles.tabCount}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className={styles.content}>
            {activeTab === "search" && (
              <div className={styles.searchSection}>
                {/* Search + filters */}
                <div className={styles.searchBar}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className={styles.clearBtn} onClick={() => setSearchQuery("")}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className={styles.roleFilters}>
                  <button
                    className={`${styles.roleChip} ${roleFilter === "" ? styles.roleChipActive : ""}`}
                    onClick={() => setRoleFilter("")}
                  >
                    All
                  </button>
                  <button
                    className={`${styles.roleChip} ${roleFilter === "innovator" ? styles.roleChipInnovator : ""}`}
                    onClick={() => setRoleFilter("innovator")}
                  >
                    Innovators
                  </button>
                  <button
                    className={`${styles.roleChip} ${roleFilter === "investor" ? styles.roleChipInvestor : ""}`}
                    onClick={() => setRoleFilter("investor")}
                  >
                    Investors
                  </button>
                </div>

                {/* Search Results */}
                {searching ? (
                  <div className={styles.centerMsg}>
                    <Loader2 size={24} className={styles.spin} />
                    <p>Searching...</p>
                  </div>
                ) : searchQuery.trim() || roleFilter ? (
                  searchResults.length === 0 ? (
                    <div className={styles.centerMsg}>
                      <User size={32} />
                      <p>No users found.</p>
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
                                <UserCheck size={14} /> Partner
                              </span>
                            ) : u.is_request_sent ? (
                              <span className={styles.pendingBadge}>
                                <Clock size={14} /> Requested
                              </span>
                            ) : u.is_request_received ? (
                              <div className={styles.actionBtns}>
                                <button
                                  className={styles.acceptBtn}
                                  onClick={() => handleAcceptRequest(u.partnership_id)}
                                  disabled={actionLoading === u.partnership_id}
                                >
                                  <Check size={14} /> Accept
                                </button>
                                <button
                                  className={styles.declineBtn}
                                  onClick={() => handleDeclineRequest(u.partnership_id)}
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
                  )
                ) : (
                  <div className={styles.centerMsg}>
                    <Search size={32} />
                    <p>Search for people to partner with</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "my-partners" && (
              <div>
                {loading ? (
                  <div className={styles.centerMsg}>
                    <Loader2 size={24} className={styles.spin} />
                    <p>Loading partners...</p>
                  </div>
                ) : partners.length === 0 ? (
                  <div className={styles.centerMsg}>
                    <Users size={32} />
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
                                `/messages?userId=${p.id}&userName=${encodeURIComponent(p.name)}&userRole=${p.role}`
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

            {activeTab === "requests" && (
              <div>
                {/* Pending requests received */}
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
                              {req.requester?.name?.charAt(0)?.toUpperCase() || "?"}
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Sent requests */}
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
                              {req.requested?.name?.charAt(0)?.toUpperCase() || "?"}
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
                            <span className={styles.pendingBadge}>
                              <Clock size={14} /> Pending
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingRequests.length === 0 && sentRequests.length === 0 && (
                  <div className={styles.centerMsg}>
                    <Clock size={32} />
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
        </div>
      </div>
    </div>
  );
}
