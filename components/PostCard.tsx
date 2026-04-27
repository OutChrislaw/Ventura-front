"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Mail, Pencil, Trash2, Check, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import CommentSection from "./CommentSection";
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
    data: { title: string; body: string; status: string }
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function PostCard({
  post,
  currentUserId,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [status, setStatus] = useState(post.status ?? "sharing_idea");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const isOwner = post.user_id === currentUserId;

  const messageUrl = `/messages?userId=${post.user_id}&userName=${encodeURIComponent(post.user?.name || "")}&userRole=${post.user?.role || ""}`;

  const save = async () => {
    setLoading(true);
    await onUpdate(post.id, { title, body, status });
    setLoading(false);
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
              {post.user?.role === "innovator" ? "Innovator" : "Investor"} ·{" "}
              {formatDate(post.created_at)}
            </p>
          </div>
          {post.status && <StatusBadge status={post.status} />}
          {isOwner && !editing && (
            <div className={styles.ownerActions}>
              <button
                onClick={() => setEditing(true)}
                className={styles.iconAction}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={handleDeleteClick}
                className={`${styles.iconAction} ${styles.danger}`}
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
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="Content"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={styles.input}
            >
              <option value="sharing_idea">Looking for Ideas</option>
              <option value="open_to_collaborate">
                Looking to Collaborate
              </option>
              <option value="seeking_investment">Looking for Investors</option>
            </select>
            <div className={styles.editActions}>
              <button
                onClick={save}
                disabled={loading}
                className={styles.primaryBtn}
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={14} /> Save
                  </>
                )}
              </button>
              <button onClick={cancel} className={styles.ghostBtn}>
                <X size={14} /> Cancel
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