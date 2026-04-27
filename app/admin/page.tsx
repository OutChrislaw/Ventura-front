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
  MessageCircle,
  Mail,
  TrendingUp,
  Trash2,
  Edit,
  PlusCircle,
  X,
  LogOut,
  LayoutDashboard,
  List,
} from "lucide-react";
import "./admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

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
            className={`admin-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={`admin-nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            Users
          </Link>
          <Link
            href="/admin/posts"
            className={`admin-nav-link ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            <FileText size={16} />
            Posts
          </Link>
          <Link
  href="/admin/messages"
  className="admin-nav-link"
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

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value?.toLocaleString() || 0}</span>
        <span className="stat-card-title">{title}</span>
      </div>
    </div>
  );
}

function StatusCard({ label, count, color }: any) {
  return (
    <div className="status-card" style={{ borderLeftColor: color }}>
      <span className="status-label">{label}</span>
      <span className="status-count">{count || 0}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { dashboardData, loading, fetchDashboard } = useContext(AdminContext);
  const router = useRouter();

  useEffect(() => {
    // Only fetch dashboard after auth is done and user is admin
    if (!authLoading && user?.is_admin) {
      fetchDashboard();
    }
  }, [authLoading, user]);

  // Show loading while auth is being restored
  if (authLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // After loading is done, check if user is admin
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

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <AdminNav />
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="admin-title">Dashboard Overview</h1>
            <p className="admin-subtitle">Hello! {user.name}</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Users"
              value={dashboardData?.total_users}
              icon={<Users size={24} />}
              color="#62656a"
            />
            <StatCard
              title="Total Posts"
              value={dashboardData?.total_posts}
              icon={<FileText size={24} />}
              color="#3d554d"
            />
            <StatCard
              title="Total Comments"
              value={dashboardData?.total_comments}
              icon={<MessageCircle size={24} />}
              color="#ceb17e"
            />
            <StatCard
              title="Total Messages"
              value={dashboardData?.total_messages}
              icon={<Mail size={24} />}
              color="#ae9bdb"
            />
          </div>

          {/* Posts by Category */}
          <div className="admin-card">
            <h2 className="card-title">Posts by Category</h2>
            <div className="status-grid">
              <StatusCard
                label="Sharing Idea"
                count={dashboardData?.posts_by_status?.sharing_idea}
                color="#efd09b"
              />
              <StatusCard
                label="Open to Collaborate"
                count={dashboardData?.posts_by_status?.open_to_collaborate}
                color="#6ea593"
              />
                <StatusCard
                label="Seeking Investment"
                count={dashboardData?.posts_by_status?.seeking_investment}
                color="#647a9e"
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="two-col-grid">
            {/* Top Contributors */}
            <div className="admin-card">
              <h2 className="card-title">Top Contributors</h2>
              <div className="contributors-list">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Posts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.top_contributors?.map(
                      (user: any, idx: number) => (
                        <tr key={user.id}>
                          <td className="rank-cell">#{idx + 1}</td>
                          <td>{user.name}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="posts-count">{user.posts_count}</td>
                        </tr>
                      ),
                    )}
                    {(!dashboardData?.top_contributors ||
                      dashboardData.top_contributors.length === 0) && (
                      <tr>
                        <td colSpan={4} className="empty-table">
                          No contributors yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Users */}
            <div className="admin-card">
              <h2 className="card-title">Recent Users</h2>
              <div className="recent-list">
                {dashboardData?.recent_users?.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-title">{u.name}</span>
                      <span className="recent-email">{u.email}</span>
                    </div>
                    <span className={`role-badge-small ${u.role}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
                {(!dashboardData?.recent_users ||
                  dashboardData.recent_users.length === 0) && (
                  <div className="empty-list">No users yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="admin-card">
            <h2 className="card-title">Recent Posts</h2>
            <div className="recent-posts-list">
              {dashboardData?.recent_posts?.slice(0, 5).map((post: any) => (
                <div key={post.id} className="recent-post-item">
                  <div className="recent-post-info">
                    <span className="recent-post-title">{post.title}</span>
                    <span className="recent-post-user">
                      by {post.user?.name}
                    </span>
                  </div>
                  <span className={`status-badge-small ${post.status}`}>
                    {post.status?.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
              {(!dashboardData?.recent_posts ||
                dashboardData.recent_posts.length === 0) && (
                <div className="empty-list">No posts yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}