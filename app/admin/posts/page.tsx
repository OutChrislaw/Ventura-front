"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
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
            className="admin-nav-link active"
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

export default function AdminPosts() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { fetchAllPosts, deletePost, updatePost, fetchAllComments, deleteComment } =
    useContext(AdminContext);
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

  // Wait for auth to finish loading
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

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <AdminNav />
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="admin-title">Post & Comment Management</h1>
            <span className="post-count">
              {posts.length} posts · {comments.length} comments
            </span>
          </div>

          <div className="admin-card">
            {loading ? (
              <div className="loading-spinner">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">No posts yet</div>
            ) : (
              <div className="posts-list-admin">
                {posts.map((post) => {
                  const postComments = getCommentsForPost(post.id);
                  const isExpanded = expandedPost === post.id;
                  const isEditing = editingPost === post.id;

                  return (
                    <div key={post.id} className="admin-post-item">
                      <div className="admin-post-header">
                        <div className="admin-post-user">
                          <div className="admin-post-avatar">
                            {post.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="admin-post-name">
                              {post.user?.name}
                            </div>
                            <div className="admin-post-email">
                              {post.user?.email}
                            </div>
                          </div>
                        </div>
                        <div className="admin-post-badges">
                          {!isEditing && (
                            <>
                              <span className={`status-badge ${post.status}`}>
                                {post.status?.replace(/_/g, " ")}
                              </span>
                              <button
                                className="edit-post-btn"
                                onClick={() => handleEditClick(post)}
                                title="Edit post"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                className="expand-comments-btn"
                                onClick={() => toggleExpand(post.id)}
                                title={isExpanded ? "Hide comments" : "Show comments"}
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

                      {/* Edit Form */}
                      {isEditing ? (
                        <div className="admin-edit-form">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({ ...editForm, title: e.target.value })
                            }
                            className="edit-input"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.body}
                            onChange={(e) =>
                              setEditForm({ ...editForm, body: e.target.value })
                            }
                            className="edit-textarea"
                            rows={4}
                            placeholder="Content"
                          />
                          <select
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({ ...editForm, status: e.target.value })
                            }
                            className="edit-select"
                          >
                            <option value="sharing_idea">💡 Sharing Idea</option>
                            <option value="open_to_collaborate">
                              🤝 Open to Collaborate
                            </option>
                            <option value="seeking_investment">
                              💰 Seeking Investment
                            </option>
                          </select>
                          <div className="edit-actions">
                            <button
                              className="edit-cancel"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </button>
                            <button
                              className="edit-save"
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
                          <div className="admin-post-content">
                            <h3 className="admin-post-title">{post.title}</h3>
                            <p className="admin-post-body">{post.body}</p>
                          </div>

                          {/* Comments Section */}
                          {isExpanded && postComments.length > 0 && (
                            <div className="admin-comments-section">
                              <div className="admin-comments-header">
                                <h4>Comments</h4>
                              </div>
                              <div className="admin-comments-list">
                                {postComments.map((comment) => (
                                  <div key={comment.id} className="admin-comment-item">
                                    <div className="admin-comment-header">
                                      <div className="admin-comment-user">
                                        <div className="admin-comment-avatar">
                                          {comment.user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                          <div className="admin-comment-name">
                                            {comment.user?.name}
                                          </div>
                                          <div className="admin-comment-email">
                                            {comment.user?.email}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="admin-comment-meta">
                                        <span className="admin-comment-date">
                                          {new Date(comment.created_at).toLocaleDateString()}{" "}
                                          at{" "}
                                          {new Date(comment.created_at).toLocaleTimeString()}
                                        </span>
                                        <button
                                          className="admin-delete-comment"
                                          onClick={() =>
                                            setShowDeleteConfirm({
                                              type: "comment",
                                              id: comment.id,
                                            })
                                          }
                                          title="Delete comment"
                                        >
                                          <Trash2 size={14} /> Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="admin-comment-body">
                                      <p>{comment.body}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {isExpanded && postComments.length === 0 && (
                            <div className="admin-comments-empty">
                              <p>No comments on this post yet.</p>
                            </div>
                          )}
                        </>
                      )}

                      <div className="admin-post-footer">
                        <span className="admin-post-date">
                          {new Date(post.created_at).toLocaleDateString()} at{" "}
                          {new Date(post.created_at).toLocaleTimeString()}
                        </span>
                        {!isEditing && (
                          <button
                            className="admin-delete-post"
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
        </div>

        {/* Delete Confirmation Modal */}
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
                <h3>
                  Delete {showDeleteConfirm.type === "post" ? "Post" : "Comment"}
                </h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this{" "}
                  {showDeleteConfirm.type === "post" ? "post" : "comment"}?
                </p>
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
                  onClick={() => {
                    if (showDeleteConfirm.type === "post") {
                      handleDeletePost(showDeleteConfirm.id);
                    } else {
                      handleDeleteComment(showDeleteConfirm.id);
                    }
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