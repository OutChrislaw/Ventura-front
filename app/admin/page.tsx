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
  MessageCircle,
  Mail,
  LogOut,
  LayoutDashboard,
  Handshake,
} from "lucide-react";
import "./admin.css";

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const { dashboardData, loading, fetchDashboard } = useContext(AdminContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.is_admin) {
      fetchDashboard().finally(() => {
        setInitialLoad(false);
      });
    } else if (!authLoading && (!user || !user.is_admin)) {
      setInitialLoad(false);
    }
  }, [authLoading, user, fetchDashboard]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isLoading = initialLoad || authLoading || loading;

  if (isLoading) {
    return (
      <div className="adminLoadingBlack">
        <Loader fullPage text="Loading admin..." />
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
        {/* WHITE SIDEBAR */}
        <aside className="adminSidebar">
          <div className="adminLogo">
            <Link href="/admin" className="adminLogoLink">
              <span className="adminLogoText">VENTURA ADMIN</span>
            </Link>
          </div>

          <nav className="adminSidebarNav">
            <Link
              href="/admin"
              className={`adminNavItem ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/users"
              className={`adminNavItem ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <Users size={18} />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/posts"
              className={`adminNavItem ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              <FileText size={18} />
              <span>Posts</span>
            </Link>
            <Link
              href="/admin/messages"
              className={`adminNavItem ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => setActiveTab("messages")}
            >
              <Mail size={18} />
              <span>Messages</span>
            </Link>
            <Link
              href="/admin/partnerships"
              className={`adminNavItem ${activeTab === "partnerships" ? "active" : ""}`}
              onClick={() => setActiveTab("partnerships")}
            >
              <Handshake size={18} />
              <span>Partnerships</span>
            </Link>
            <Link href="/feed" className="adminNavItem">
              <Home size={18} />
              <span>Back to Feed</span>
            </Link>
          </nav>

          <div className="adminSidebarFooter">
            <div className="adminUserInfo">
              <div className="adminUserAvatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="adminUserDetails">
                <span className="adminUserName">{user.name}</span>
                <span className="adminUserRole">Admin</span>
              </div>
            </div>
            <button onClick={handleLogout} className="adminLogoutBtn">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* BLACK MAIN CONTENT */}
        <main className="adminMainContent">
          <div className="adminHeaderRow">
            <h1>Dashboard Overview</h1>
            <div className="adminHeaderRight">
              <div className="adminHeaderAvatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="adminStatsGrid">
            <div className="adminStatCard">
              <div className="adminStatIcon">
                <Users size={24} />
              </div>
              <div className="adminStatInfo">
                <span className="adminStatValue">
                  {dashboardData?.total_users?.toLocaleString() || 0}
                </span>
                <span className="adminStatTitle">Total Users</span>
              </div>
            </div>
            <div className="adminStatCard">
              <div className="adminStatIcon">
                <FileText size={24} />
              </div>
              <div className="adminStatInfo">
                <span className="adminStatValue">
                  {dashboardData?.total_posts?.toLocaleString() || 0}
                </span>
                <span className="adminStatTitle">Total Posts</span>
              </div>
            </div>
            <div className="adminStatCard">
              <div className="adminStatIcon">
                <MessageCircle size={24} />
              </div>
              <div className="adminStatInfo">
                <span className="adminStatValue">
                  {dashboardData?.total_comments?.toLocaleString() || 0}
                </span>
                <span className="adminStatTitle">Total Comments</span>
              </div>
            </div>
            <div className="adminStatCard">
              <div className="adminStatIcon">
                <Mail size={24} />
              </div>
              <div className="adminStatInfo">
                <span className="adminStatValue">
                  {dashboardData?.total_messages?.toLocaleString() || 0}
                </span>
                <span className="adminStatTitle">Total Messages</span>
              </div>
            </div>
          </div>

          {/* Posts by Category */}
          <div className="adminCard">
            <h3 className="adminCardTitle">Posts by Category</h3>
            <div className="adminStatusGrid">
              <div
                className="adminStatusCard"
                style={{ borderLeftColor: "#efd09b" }}
              >
                <span className="adminStatusLabel">Sharing Idea</span>
                <span className="adminStatusCount">
                  {dashboardData?.posts_by_status?.sharing_idea || 0}
                </span>
              </div>
              <div
                className="adminStatusCard"
                style={{ borderLeftColor: "#2f51d6" }}
              >
                <span className="adminStatusLabel">Open to Collaborate</span>
                <span className="adminStatusCount">
                  {dashboardData?.posts_by_status?.open_to_collaborate || 0}
                </span>
              </div>
              <div
                className="adminStatusCard"
                style={{ borderLeftColor: "#0a6428" }}
              >
                <span className="adminStatusLabel">Seeking Investment</span>
                <span className="adminStatusCount">
                  {dashboardData?.posts_by_status?.seeking_investment || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="adminTwoColGrid">
            {/* Top Contributors */}
            <div className="adminCard">
              <h3 className="adminCardTitle">Top Contributors</h3>
              <div className="adminTableWrapper">
                <table className="adminTable">
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
                          <td className="adminRankCell">#{idx + 1}</td>
                          <td>{user.name}</td>
                          <td>
                            <span className={`adminRoleBadge ${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="adminPostsCount">
                            {user.posts_count}
                          </td>
                        </tr>
                      ),
                    )}
                    {(!dashboardData?.top_contributors ||
                      dashboardData.top_contributors.length === 0) && (
                      <tr>
                        <td colSpan={4} className="adminEmptyTable">
                          No contributors yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Users */}
            <div className="adminCard">
              <h3 className="adminCardTitle">Recent Users</h3>
              <div className="adminRecentList">
                {dashboardData?.recent_users?.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="adminRecentItem">
                    <div className="adminRecentInfo">
                      <span className="adminRecentTitle">{u.name}</span>
                      <span className="adminRecentEmail">{u.email}</span>
                    </div>
                    <span className={`adminRoleBadgeSmall ${u.role}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
                {(!dashboardData?.recent_users ||
                  dashboardData.recent_users.length === 0) && (
                  <div className="adminEmptyList">No users yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="adminCard">
            <h3 className="adminCardTitle">Recent Posts</h3>
            <div className="adminRecentPostsList">
              {dashboardData?.recent_posts?.slice(0, 5).map((post: any) => (
                <div key={post.id} className="adminRecentPostItem">
                  <div className="adminRecentPostInfo">
                    <span className="adminRecentPostTitle">{post.title}</span>
                    <span className="adminRecentPostUser">
                      by {post.user?.name}
                    </span>
                  </div>
                  <span className={`adminStatusBadgeSmall ${post.status}`}>
                    {post.status?.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
              {(!dashboardData?.recent_posts ||
                dashboardData.recent_posts.length === 0) && (
                <div className="adminEmptyList">No posts yet</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
