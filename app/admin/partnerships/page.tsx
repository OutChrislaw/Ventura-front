"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  Users,
  FileText,
  X,
  LogOut,
  LayoutDashboard,
  Mail,
  Loader2,
  Search,
  Handshake,
  TrendingUp,
  Settings,
  User,
} from "lucide-react";
import "../admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("partnerships");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="adminSidebar">
      <div className="adminLogo">
        <Link href="/admin" className="adminLogoLink">
          <span className="adminLogoText">VENTURA ADMIN</span>
        </Link>
      </div>

      <nav className="adminSidebarNav">
        <Link
          href="/admin"
          className="adminNavItem"
          onClick={() => setActiveTab("dashboard")}
        >
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link
          href="/admin/users"
          className="adminNavItem"
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} /> Users
        </Link>
        <Link
          href="/admin/posts"
          className="adminNavItem"
          onClick={() => setActiveTab("posts")}
        >
          <FileText size={18} /> Posts
        </Link>
        <Link
          href="/admin/partnerships"
          className="adminNavItem active"
          onClick={() => setActiveTab("partnerships")}
        >
          <Handshake size={18} /> Partnerships
        </Link>
        <Link
          href="/admin/messages"
          className="adminNavItem"
          onClick={() => setActiveTab("messages")}
        >
          <Mail size={18} /> Messages
        </Link>
        <Link href="/feed" className="adminNavItem">
          <Home size={18} /> Back to Feed
        </Link>
      </nav>

      <div className="adminSidebarFooter">
        <div className="adminUserInfo">
          <div className="adminUserAvatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="adminUserDetails">
            <span className="adminUserName">{user?.name}</span>
            <span className="adminUserRole">Admin</span>
          </div>
        </div>
        <button onClick={logout} className="adminLogoutBtn">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}

interface PartnershipView {
  id: number;
  name: string;
  role: string;
  status: string;
  since: string;
}

export default function AdminPartnerships() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const { adminSearchUsers } = useContext(AdminContext);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [partnershipsList, setPartnershipsList] = useState<PartnershipView[]>(
    [],
  );
  const [loadingPartnerships, setLoadingPartnerships] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const results = await adminSearchUsers(searchQuery);
        setSearchResults(results || []);
      } catch (error) {
        setSearchError("Failed to search users");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, adminSearchUsers]);

  const handleSelectUser = async (selected: any) => {
    setSearchResults([]);
    setSelectedUser(selected);
    setLoadingPartnerships(true);
    setPartnershipsList([]);

    try {
      const res = await fetch(
        `${apiUrl}/admin/user-partnerships/${selected.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      const formatted: PartnershipView[] = [];

      if (data.pending_from_others && data.pending_from_others.length > 0) {
        data.pending_from_others.forEach((p: any) => {
          formatted.push({
            id: p.requester_id,
            name: p.requester?.name || "Unknown",
            role: p.requester?.role || "-",
            status: "Pending Approval",
            since: new Date(p.created_at).toLocaleDateString(),
          });
        });
      }

      if (data.requested_to_others && data.requested_to_others.length > 0) {
        data.requested_to_others.forEach((p: any) => {
          formatted.push({
            id: p.requested_id,
            name: p.requested?.name || "Unknown",
            role: p.requested?.role || "-",
            status: "Requested",
            since: new Date(p.created_at).toLocaleDateString(),
          });
        });
      }

      if (data.partners && data.partners.length > 0) {
        data.partners.forEach((p: any) => {
          const partnerId =
            p.requester_id === selected.id ? p.requested_id : p.requester_id;
          const partner =
            p.requester_id === selected.id ? p.requested : p.requester;
          formatted.push({
            id: partnerId,
            name: partner?.name || "Unknown",
            role: partner?.role || "-",
            status: "Partners",
            since: new Date(p.created_at).toLocaleDateString(),
          });
        });
      }

      setPartnershipsList(formatted);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      setPartnershipsList([]);
    } finally {
      setLoadingPartnerships(false);
    }
  };

  if (authLoading) {
    return (
      <div className="adminLoadingBlack">
        <Loader fullPage text="Authenticating..." />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <ProtectedRoute>
        <div className="adminAccessDenied">
          <div className="adminAccessDeniedCard">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <Link href="/feed">Go to Feed</Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="adminApp">
        <AdminNav />
        <main className="adminMainContent">
          <div className="adminHeaderRow">
            <h1>Partnership Management</h1>
          </div>

          <div className="adminSearchSection">
            <label className="adminSearchLabel">Search User</label>
            <div className="adminSearchCard">
              <div className="adminSearchWrapper">
                <Search size={18} className="adminSearchIcon" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="adminSearchInput"
                />
              </div>
            </div>
            {searching && (
              <div className="adminSearchLoading">Searching...</div>
            )}
            {searchError && (
              <div className="adminSearchError">{searchError}</div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="adminResultsCard">
              <div className="adminResultsHeader">
                Search Results ({searchResults.length})
              </div>
              <div className="adminResultsList">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="adminResultItem"
                    onClick={() => handleSelectUser(result)}
                  >
                    <div className="adminResultAvatar">
                      {result.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="adminResultDetails">
                      <div className="adminResultName">{result.name}</div>
                      <div className="adminResultEmail">{result.email}</div>
                      <div className="adminResultRole">
                        {result.role === "innovator" ? "Innovator" : "Investor"}
                      </div>
                    </div>
                    <div className="adminResultArrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="adminTableCard">
              <div className="adminTableHeader">
                <h3>{selectedUser.name} - Partnerships</h3>
              </div>
              <div className="adminDataTable">
                <div className="adminTableRowHeader">
                  <div className="colId">ID</div>
                  <div className="colName">Name</div>
                  <div className="colRole">ROLE</div>
                  <div className="colStatus">Status</div>
                  <div className="colSince">Since</div>
                </div>
                {loadingPartnerships ? (
                  <div className="adminTableLoading">
                    <Loader2 size={24} className="adminSpin" />
                    <p>Loading partnerships...</p>
                  </div>
                ) : partnershipsList.length === 0 ? (
                  <div className="adminTableEmpty">No partners yet.</div>
                ) : (
                  partnershipsList.map((p) => (
                    <div key={p.id} className="adminTableRow">
                      <div className="colId">#{p.id}</div>
                      <div className="colName">{p.name}</div>
                      <div className="colRole">
                        <span
                          className={`adminRoleBadge ${p.role === "innovator" ? "roleInnovator" : "roleInvestor"}`}
                        >
                          {p.role === "innovator" ? "Innovator" : "Investor"}
                        </span>
                      </div>
                      <div className="colStatus">{p.status}</div>
                      <div className="colSince">{p.since}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
