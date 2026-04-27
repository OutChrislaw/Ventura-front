"use client";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { Trash2, Send, X } from "lucide-react";
import styles from "./CommentSection.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  body: string;
  created_at: string;
  user?: { id: number; name: string; role: string };
}

export default function CommentSection({ post_id }: { post_id: number }) {
  const { token, user } = useContext(AuthContext);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchComments();
  }, [post_id]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/posts/${post_id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      setComments([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/posts/${post_id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: newComment }),
      });
      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: number) => {
    setShowDeleteConfirm(commentId);
  };

  const confirmDelete = async (commentId: number) => {
    await fetch(`${API}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.commentTitle}>Comments ({comments.length})</h3>

      {/* Comment List */}
      <div className={styles.commentList}>
        {loading ? (
          <p className={styles.loadingText}>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className={styles.emptyText}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentAvatar}>
                {comment.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <Link
                    href={`/profile/${comment.user_id}`}
                    className={styles.commentAuthor}
                  >
                    {comment.user?.name}
                  </Link>
                  <span className={styles.commentRole}>
                    {comment.user?.role === "innovator"
                      ? "Innovator"
                      : "Investor"}
                  </span>
                  <span className={styles.commentTime}>
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className={styles.commentBody}>{comment.body}</p>
              </div>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => handleDeleteClick(comment.id)}
                  className={styles.deleteCommentBtn}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className={styles.commentInput}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className={styles.commentSubmit}
        >
          {submitting ? (
            <Send size={14} className={styles.spin} />
          ) : (
            <Send size={14} />
          )}
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>

      {/* Delete Comment Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className={styles.confirmOverlay} onClick={cancelDelete}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.confirmClose} onClick={cancelDelete}>
              <X size={18} />
            </button>
            <h3>Delete Comment</h3>
            <p>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={cancelDelete} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
