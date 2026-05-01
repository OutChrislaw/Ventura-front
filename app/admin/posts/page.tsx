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
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Check,
  Handshake,
  TrendingUp,
  Settings,
  User,
} from "lucide-react";
import "../admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");

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
          className="adminNavItem active"
          onClick={() => setActiveTab("posts")}
        >
          <FileText size={18} /> Posts
        </Link>
        <Link
          href="/admin/partnerships"
          className="adminNavItem"
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
        <button onClick={handleLogout} className="adminLogoutBtn">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AdminPosts() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const {
    fetchAllPosts,
    deletePost,
    updatePost,
    fetchAllComments,
    deleteComment,
  } = useContext(AdminContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "post" | "comment";
    id: number;
  } | null>(null);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    status: "",
  });
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.is_admin) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    setLoading(true);
    const [postsData, commentsData] = await Promise.all([
      fetchAllPosts(),
      fetchAllComments(),
    ]);
    setPosts(postsData);
    setComments(commentsData);
    setLoading(false);
  };

  const handleDeletePost = async (id: number) => {
    await deletePost(id);
    setShowDeleteConfirm(null);
    loadData();
  };

  const handleDeleteComment = async (id: number) => {
    await deleteComment(id);
    setShowDeleteConfirm(null);
    loadData();
  };

  const handleEditClick = (post: any) => {
    setEditingPost(post.id);
    setEditForm({
      title: post.title,
      body: post.body,
      status: post.status || "",
    });
  };

  const handleEditCancel = () => {
    setEditingPost(null);
    setEditForm({ title: "", body: "", status: "" });
  };

  const handleEditSave = async (postId: number) => {
    setUpdating(true);
    try {
      await updatePost(postId, editForm);
      setEditingPost(null);
      loadData();
    } catch (error) {
      console.error("Error updating post:", error);
    }
    setUpdating(false);
  };

  const getCommentsForPost = (postId: number) => {
    return comments.filter((comment) => comment.post_id === postId);
  };

  const toggleExpand = (postId: number) => {
    setExpandedPost(expandedPost === postId ? null : postId);
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
            <h1>Post & Comment Management</h1>
            <div className="adminHeaderRight">
              <span className="adminStatBadge">
                {posts.length} posts · {comments.length} comments
              </span>
            </div>
          </div>

          <div className="adminCard">
            {loading ? (
              <div className="adminLoadingInline">
                <Loader text="Loading posts..." />
              </div>
            ) : posts.length === 0 ? (
              <div className="adminEmptyState">No posts yet</div>
            ) : (
              <div className="adminPostsList">
                {posts.map((post) => {
                  const postComments = getCommentsForPost(post.id);
                  const isExpanded = expandedPost === post.id;
                  const isEditing = editingPost === post.id;

                  return (
                    <div key={post.id} className="adminPostItem">
                      <div className="adminPostHeader">
                        <div className="adminPostUser">
                          <div className="adminPostAvatar">
                            {post.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="adminPostName">
                              {post.user?.name}
                            </div>
                            <div className="adminPostEmail">
                              {post.user?.email}
                            </div>
                          </div>
                        </div>
                        <div className="adminPostBadges">
                          {!isEditing && (
                            <>
                              <span
                                className={`adminStatusBadge ${post.status}`}
                              >
                                {post.status?.replace(/_/g, " ")}
                              </span>
                              <button
                                className="adminEditPostBtn"
                                onClick={() => handleEditClick(post)}
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                className="adminExpandBtn"
                                onClick={() => toggleExpand(post.id)}
                              >
                                <MessageCircle size={14} />
                                <span>{postComments.length} comments</span>
                                {isExpanded ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="adminEditForm">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            className="adminEditInput"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.body}
                            onChange={(e) =>
                              setEditForm({ ...editForm, body: e.target.value })
                            }
                            className="adminEditTextarea"
                            rows={4}
                            placeholder="Content"
                          />
                          <select
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="adminEditSelect"
                          >
                            <option value="sharing_idea">
                              💡 Sharing Idea
                            </option>
                            <option value="open_to_collaborate">
                              🤝 Open to Collaborate
                            </option>
                            <option value="seeking_investment">
                              💰 Seeking Investment
                            </option>
                          </select>
                          <div className="adminEditActions">
                            <button
                              className="adminEditCancel"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </button>
                            <button
                              className="adminEditSave"
                              onClick={() => handleEditSave(post.id)}
                              disabled={updating}
                            >
                              {updating ? (
                                "Saving..."
                              ) : (
                                <>
                                  <Check size={14} /> Save
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="adminPostContent">
                            <h3 className="adminPostTitle">{post.title}</h3>
                            <p className="adminPostBody">{post.body}</p>
                          </div>

                          {isExpanded && postComments.length > 0 && (
                            <div className="adminCommentsSection">
                              <div className="adminCommentsHeader">
                                <h4>Comments</h4>
                              </div>
                              <div className="adminCommentsList">
                                {postComments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="adminCommentItem"
                                  >
                                    <div className="adminCommentHeader">
                                      <div className="adminCommentUser">
                                        <div className="adminCommentAvatar">
                                          {comment.user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                          <div className="adminCommentName">
                                            {comment.user?.name}
                                          </div>
                                          <div className="adminCommentEmail">
                                            {comment.user?.email}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="adminCommentMeta">
                                        <span className="adminCommentDate">
                                          {new Date(
                                            comment.created_at,
                                          ).toLocaleDateString()}{" "}
                                          at{" "}
                                          {new Date(
                                            comment.created_at,
                                          ).toLocaleTimeString()}
                                        </span>
                                        <button
                                          className="adminCommentDelete"
                                          onClick={() =>
                                            setShowDeleteConfirm({
                                              type: "comment",
                                              id: comment.id,
                                            })
                                          }
                                        >
                                          <Trash2 size={14} /> Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="adminCommentBody">
                                      <p>{comment.body}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {isExpanded && postComments.length === 0 && (
                            <div className="adminCommentsEmpty">
                              <p>No comments on this post yet.</p>
                            </div>
                          )}
                        </>
                      )}

                      <div className="adminPostFooter">
                        <span className="adminPostDate">
                          {new Date(post.created_at).toLocaleDateString()} at{" "}
                          {new Date(post.created_at).toLocaleTimeString()}
                        </span>
                        {!isEditing && (
                          <button
                            className="adminPostDelete"
                            onClick={() =>
                              setShowDeleteConfirm({
                                type: "post",
                                id: post.id,
                              })
                            }
                          >
                            <Trash2 size={16} /> Delete Post
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                <h3>
                  Delete{" "}
                  {showDeleteConfirm.type === "post" ? "Post" : "Comment"}
                </h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="adminModalBody">
                <p>
                  Are you sure you want to delete this{" "}
                  {showDeleteConfirm.type === "post" ? "post" : "comment"}?
                </p>
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
                  onClick={() => {
                    if (showDeleteConfirm.type === "post")
                      handleDeletePost(showDeleteConfirm.id);
                    else handleDeleteComment(showDeleteConfirm.id);
                  }}
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
