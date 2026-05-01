"use client";
import { useState } from "react";
import { Send, Loader2, Image, Hash } from "lucide-react";
import styles from "./PostForm.module.css";

interface Props {
  onSubmit: (data: {
    title: string;
    body: string;
    status: string;
  }) => Promise<void>;
  onClose?: () => void;
  isInline?: boolean;
}

export default function PostForm({ onSubmit, onClose, isInline }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("sharing_idea");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ title, body, status });
      setTitle("");
      setBody("");
      setStatus("sharing_idea");
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={isInline ? styles.inlineForm : styles.card}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's your vision? Give it a title..."
        className={styles.input}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your idea, pitch, or what you're looking for..."
        rows={isInline ? 2 : 3}
        className={styles.textarea}
      />
      <div className={styles.row}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
        >
          <option value="sharing_idea">Sharing Idea</option>
          <option value="open_to_collaborate">Open to Collaborate</option>
          <option value="seeking_investment">Seeking Investment</option>
        </select>
        <button
          type="submit"
          disabled={loading || !title.trim() || !body.trim()}
          className={styles.submit}
        >
          {loading ? (
            <Loader2 size={14} className={styles.spin} />
          ) : (
            <Send size={14} />
          )}
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
