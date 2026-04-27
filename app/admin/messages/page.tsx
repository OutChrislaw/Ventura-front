"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Users,
  FileText,
  Trash2,
  X,
  LogOut,
  LayoutDashboard,
  Mail,
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
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <Link href="/admin" className="admin-brand">
          VENTURA ADMIN
        </Link>
        <div className="admin-nav-links">
          <Link
            href="/admin"
            className="admin-nav-link"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="admin-nav-link"
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            Users
          </Link>
          <Link
            href="/admin/posts"
            className="admin-nav-link"
            onClick={() => setActiveTab("posts")}
          >
            <FileText size={16} />
            Posts
          </Link>
          <Link
            href="/admin/messages"
            className={`admin-nav-link active`}
            onClick={() => setActiveTab("messages")}
          >
            <Mail size={16} />
            Messages
          </Link>
          <Link href="/feed" className="admin-nav-link">
            <Home size={16} />
            Back to Feed
          </Link>
        </div>
        <div className="admin-nav-right">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className={`admin-user-role ${user?.role}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
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

  if (authLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <ProtectedRoute>
        <div className="admin-access-denied">
          <div className="access-denied-card">
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
      <div className="admin-page">
        <AdminNav />
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="admin-title">Message Management</h1>
            <span className="post-count">{messages.length} total messages</span>
          </div>

          <div className="admin-card">
            {loading ? (
              <div className="loading-spinner">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">No messages yet</div>
            ) : (
              <div className="messages-list-admin">
                {messages.map((msg) => (
                  <div key={msg.id} className="admin-message-item">
                    <div className="admin-message-header">
                      <div className="admin-message-users">
                        <div className="admin-message-avatar">
                          {msg.sender?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="admin-message-sender">
                          <span className="admin-message-name">
                            {msg.sender?.name}
                          </span>
                          <span className="admin-message-label">→</span>
                          <span className="admin-message-name">
                            {msg.receiver?.name}
                          </span>
                        </div>
                      </div>
                      <div className="admin-message-meta">
                        <span className="admin-message-date">
                          {new Date(msg.created_at).toLocaleDateString()} at{" "}
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                        <button
                          className="admin-delete-message"
                          onClick={() => setShowDeleteConfirm(msg.id)}
                          title="Delete message"
                        >
                          <Trash2 size={16} /> Delete Message
                        </button>
                      </div>
                    </div>
                    <div className="admin-message-content">
                      <p className="admin-message-text">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal with clear message */}
        {showDeleteConfirm !== null && (
          <div
            className="modal-overlay"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className="modal-container delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Delete Message</h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this message?</p>
                <p className="modal-warning">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-delete"
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
