"use client";
import { useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Users, MessageCircle, Search, X, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { PartnershipContext } from "@/context/PartnershipContext";
import { AuthContext } from "@/context/AuthContext";
import styles from "./RightPanel.module.css";

// Simulate online status — in production this would come from a real-time connection
function useOnlineStatus(partnerId: number) {
  const [status, setStatus] = useState<"online" | "offline">("offline");

  useEffect(() => {
    // Deterministic pseudo-random based on partnerId so it's stable per session
    const hash = (partnerId * 7 + partnerId % 13) % 10;
    const isOnline = hash > 3; // ~60% chance online
    setStatus(isOnline ? "online" : "offline");

    // Simulate occasional status changes every few minutes
    const interval = setInterval(() => {
      const newHash = (partnerId * 7 + partnerId % 13 + Math.floor(Date.now() / 60000)) % 10;
      setStatus(newHash > 3 ? "online" : "offline");
    }, 30000); // re-evaluate every 30s

    return () => clearInterval(interval);
  }, [partnerId]);

  return status;
}

function getLastSeenLabel(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function PartnerItem({
  partner,
  onMessage,
}: {
  partner: { id: number; name: string; role: string; partnership_id?: number | null };
  onMessage: (id: number) => void;
}) {
  const onlineStatus = useOnlineStatus(partner.id);

  // Generate a fake last-seen time for offline users
  const lastSeenDate = new Date(
    Date.now() - Math.floor(Math.random() * 720) * 60000,
  );

  const initials = partner.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className={styles.partnerItem}>
      <Link href={`/profile/${partner.id}`} className={styles.partnerLink}>
        <div className={styles.partnerAvatarWrap}>
          <div className={styles.partnerAvatar}>
            {initials}
          </div>
          <span
            className={`${styles.statusDot} ${
              onlineStatus === "online" ? styles.online : styles.offline
            }`}
          />
        </div>
        <div className={styles.partnerInfo}>
          <span className={styles.partnerName}>{partner.name}</span>
          <span className={styles.partnerStatus}>
            {onlineStatus === "online" ? (
              <span className={styles.statusTextOnline}>Online</span>
            ) : (
              <span className={styles.statusTextOffline}>
                Last seen {getLastSeenLabel(lastSeenDate)}
              </span>
            )}
          </span>
          <span
            className={`${styles.partnerRoleTag} ${
              partner.role === "innovator"
                ? styles.roleInnovator
                : styles.roleInvestor
            }`}
          >
            {partner.role === "innovator" ? "Innovator" : "Investor"}
          </span>
        </div>
      </Link>
      <button
        className={styles.messageBtn}
        onClick={() => onMessage(partner.id)}
        title="Send message"
      >
        <MessageCircle size={15} />
      </button>
    </div>
  );
}

export default function RightPanel() {
  const { partners, fetchPartners, pendingRequests } =
    useContext(PartnershipContext);
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchPartners();
      hasFetched.current = true;
    }
  }, [fetchPartners]);

  if (!user) return null;

  const filteredPartners = partners.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const innovatorCount = partners.filter(
    (p) => p.role === "innovator",
  ).length;
  const investorCount = partners.filter(
    (p) => p.role === "investor",
  ).length;

  return (
    <aside className={styles.panel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div
          className={styles.panelHeaderTop}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className={styles.panelTitleWrap}>
            <Users size={16} className={styles.panelIcon} />
            <h3 className={styles.panelTitle}>Partners</h3>
            <span className={styles.partnerCount}>{partners.length}</span>
          </div>
          <button className={styles.collapseBtn}>
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>

        {/* Stats row */}
        {!collapsed && (
          <div className={styles.panelStats}>
            <span className={styles.statItem}>
              <span className={styles.statDotInnovator} />
              <span>Innovators {innovatorCount}</span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statDotInvestor} />
              <span>Investors {investorCount}</span>
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className={styles.searchWrap}>
          <div className={styles.searchInner}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => setSearchQuery("")}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Partners list */}
      {!collapsed && (
        <div className={styles.partnerList}>
          {filteredPartners.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery
                ? "No partners match your search."
                : "No partners yet. Connect with others!"}
            </div>
          ) : (
            filteredPartners.map((partner) => (
              <PartnerItem
                key={partner.id}
                partner={partner}
                onMessage={(id) => {
                  window.location.href = `/messages?userId=${id}&userName=${encodeURIComponent(partner.name)}&userRole=${partner.role}`;
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Quick link */}
      {!collapsed && (
        <div className={styles.panelFooter}>
          <Link href="/partners" className={styles.findPartnersLink}>
            <UserPlus size={14} />
            <span>Find partners</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
