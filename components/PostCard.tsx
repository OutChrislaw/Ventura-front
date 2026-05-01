"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import CommentSection from "./CommentSection";
import { PostContext } from "@/context/PostContext";
import styles from "./PostCard.module.css";

interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  status: string | null;
  created_at: string;
  user?: { id: number; name: string; role: string };
}

interface Props {
  post: Post;
  currentUserId: number;
  onUpdate: (
    id: number,
    data: { title: string; body: string; status: string },
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function PostCard({
  post,
  currentUserId,
  onUpdate,
  onDelete,
}: Props) {
  const { updatingPostId } = useContext(PostContext);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [status, setStatus] = useState(post.status ?? "sharing_idea");
  const [localLoading, setLocalLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = post.user_id === currentUserId;
  const isUpdating = updatingPostId === post.id;

  const messageUrl = `/messages?userId=${post.user_id}&userName=${encodeURIComponent(post.user?.name || "")}&userRole=${post.user?.role || ""}`;

  const save = async () => {
    setLocalLoading(true);
    await onUpdate(post.id, { title, body, status });
    setLocalLoading(false);
    setEditing(false);
  };

  const cancel = () => {
    setTitle(post.title);
    setBody(post.body);
    setStatus(post.status ?? "sharing_idea");
    setEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await onDelete(post.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60 / 60);
    if (diff < 1) return "just now";
    if (diff < 24) return `${diff}h ago`;
    return date.toLocaleDateString();
  };

  // Show loading state for the entire card while updating
  if (isUpdating) {
    return (
      <article className={styles.card}>
        <div className={styles.updatingOverlay}>
          <Loader2 size={24} className={styles.spin} />
          <p>Updating post...</p>
        </div>
      </article>
    );
  }

  return (
    <>
      <article className={styles.card}>
        <header className={styles.head}>
          <div className={styles.avatar}>
            {post.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className={styles.headInfo}>
            <Link href={`/profile/${post.user_id}`} className={styles.author}>
              {post.user?.name ?? "Unknown"}
            </Link>
            <p className={styles.meta}>
              {post.user?.role === "innovator"
                ? "Innovator"
                : post.user?.role === "investor"
                  ? "Investor"
                  : "User"}{" "}
              · {formatDate(post.created_at)}
            </p>
          </div>
          {post.status && <StatusBadge status={post.status} />}
          {isOwner && !editing && (
            <div className={styles.ownerActions}>
              <button
                onClick={() => setEditing(true)}
                className={styles.iconAction}
                disabled={localLoading}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={handleDeleteClick}
                className={`${styles.iconAction} ${styles.danger}`}
                disabled={localLoading}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </header>

        {editing ? (
          <div className={styles.editForm}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Title"
              disabled={localLoading}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="Content"
              disabled={localLoading}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={styles.input}
              disabled={localLoading}
            >
              <option value="sharing_idea">💡 Sharing Idea</option>
              <option value="open_to_collaborate">
                🤝 Open to Collaborate
              </option>
              <option value="seeking_investment">💰 Seeking Investment</option>
            </select>
            {/* ✅ BUTTONS ON THE RIGHT SIDE */}
            <div className={styles.editActionsRight}>
              <button
                onClick={cancel}
                className={styles.cancelBtn}
                disabled={localLoading}
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={save}
                disabled={localLoading}
                className={styles.saveBtn}
              >
                {localLoading ? (
                  <>
                    <Loader2 size={14} className={styles.spin} /> Saving...
                  </>
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
            <h3 className={styles.title}>{post.title}</h3>
            <p className={styles.body}>{post.body}</p>
          </>
        )}

        <footer className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => setShowComments(!showComments)}
            disabled={localLoading}
          >
            <MessageCircle size={16} />
            <span>Comment</span>
          </button>
          <Link href={messageUrl} className={styles.actionBtn}>
            <Mail size={16} />
            <span>Message</span>
          </Link>
        </footer>

        {showComments && (
          <div className={styles.commentSectionWrapper}>
            <CommentSection post_id={post.id} />
          </div>
        )}
      </article>

      {showDeleteConfirm && (
        <div className={styles.confirmOverlay} onClick={cancelDelete}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Post</h3>
            <p>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={cancelDelete} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmDelete} className={styles.deleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
