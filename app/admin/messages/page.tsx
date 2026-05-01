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
  Trash2,
  X,
  LogOut,
  LayoutDashboard,
  Mail,
  Handshake,
  Search,
  TrendingUp,
  Settings,
  User,
} from "lucide-react";
import "../admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("messages");

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
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/admin/users"
          className="adminNavItem"
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} />
          <span>Users</span>
        </Link>
        <Link
          href="/admin/posts"
          className="adminNavItem"
          onClick={() => setActiveTab("posts")}
        >
          <FileText size={18} />
          <span>Posts</span>
        </Link>
        <Link
          href="/admin/partnerships"
          className="adminNavItem"
          onClick={() => setActiveTab("partnerships")}
        >
          <Handshake size={18} />
          <span>Partnerships</span>
        </Link>
        <Link
          href="/admin/messages"
          className="adminNavItem active"
          onClick={() => setActiveTab("messages")}
        >
          <Mail size={18} />
          <span>Messages</span>
        </Link>
        <Link href="/feed" className="adminNavItem">
          <Home size={18} />
          <span>Back to Feed</span>
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
        <button onClick={handleLogout} className="adminLogoutBtn">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminMessages() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { fetchAllMessages, deleteMessage } = useContext(AdminContext);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [searchFromQuery, setSearchFromQuery] = useState("");
  const [searchToQuery, setSearchToQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.is_admin) {
      loadMessages();
    }
  }, [authLoading, user]);

  const loadMessages = async () => {
    setLoading(true);
    const data = await fetchAllMessages();
    setMessages(data);
    setLoading(false);
  };

  const handleDeleteMessage = async (id: number) => {
    await deleteMessage(id);
    setShowDeleteConfirm(null);
    loadMessages();
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesFrom =
      !searchFromQuery.trim() ||
      msg.sender?.name?.toLowerCase().includes(searchFromQuery.toLowerCase());
    const matchesTo =
      !searchToQuery.trim() ||
      msg.receiver?.name?.toLowerCase().includes(searchToQuery.toLowerCase());
    return matchesFrom && matchesTo;
  });

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
            <h1>Message Management</h1>
            <div className="adminHeaderRight">
              <span className="adminStatBadge">
                {filteredMessages.length} total messages
              </span>
            </div>
          </div>

          {/* Dual Search Section */}
          <div className="adminDualSearch">
            <div className="adminSearchGroup">
              <label className="adminSearchLabel">Search from:</label>
              <div className="adminSearchWrapper">
                <Search size={16} className="adminSearchIcon" />
                <input
                  type="text"
                  placeholder="Search by sender name..."
                  value={searchFromQuery}
                  onChange={(e) => setSearchFromQuery(e.target.value)}
                  className="adminSearchInput"
                />
                {searchFromQuery && (
                  <button
                    className="adminSearchClear"
                    onClick={() => setSearchFromQuery("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="adminSearchGroup">
              <label className="adminSearchLabel">Search to:</label>
              <div className="adminSearchWrapper">
                <Search size={16} className="adminSearchIcon" />
                <input
                  type="text"
                  placeholder="Search by receiver name..."
                  value={searchToQuery}
                  onChange={(e) => setSearchToQuery(e.target.value)}
                  className="adminSearchInput"
                />
                {searchToQuery && (
                  <button
                    className="adminSearchClear"
                    onClick={() => setSearchToQuery("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="adminCard">
            {loading ? (
              <div className="adminLoadingInline">
                <Loader text="Loading messages..." />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="adminEmptyState">
                {searchFromQuery || searchToQuery
                  ? "No messages match your search."
                  : "No messages yet"}
              </div>
            ) : (
              <div className="adminMessagesList">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className="adminMessageItem">
                    <div className="adminMessageHeader">
                      <div className="adminMessageUsers">
                        <div className="adminMessageAvatar">
                          {msg.sender?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="adminMessageSender">
                          <span className="adminMessageName">
                            {msg.sender?.name}
                          </span>
                          <span className="adminMessageLabel">→</span>
                          <span className="adminMessageName">
                            {msg.receiver?.name}
                          </span>
                        </div>
                      </div>
                      <div className="adminMessageMeta">
                        <span className="adminMessageDate">
                          {new Date(msg.created_at).toLocaleDateString()} at{" "}
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                        <button
                          className="adminMessageDelete"
                          onClick={() => setShowDeleteConfirm(msg.id)}
                        >
                          <Trash2 size={16} /> Delete Message
                        </button>
                      </div>
                    </div>
                    <div className="adminMessageContent">
                      <p className="adminMessageText">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {showDeleteConfirm !== null && (
          <div
            className="adminModalOverlay"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className="adminModalContainer adminWarningModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="adminModalHeader">
                <h3>Delete Message</h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="adminModalBody">
                <p>Are you sure you want to delete this message?</p>
                <p className="adminModalWarning">
                  This action cannot be undone.
                </p>
              </div>
              <div className="adminModalFooter">
                <button
                  className="adminModalCancel"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="adminModalDelete"
                  onClick={() => handleDeleteMessage(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
