"use client";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useContext(AuthContext);
  const [post, setPost] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setPost(data.post);
        setEditTitle(data.post.title);
        setEditBody(data.post.body);
        setEditStatus(data.post.status || "");
      });
  }, [id]);

  const handleUpdate = async () => {
    const res = await fetch(`${apiUrl}/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        body: editBody,
        status: editStatus,
      }),
    });
    const data = await res.json();
    setPost(data.post);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await fetch(`${apiUrl}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push("/feed");
  };

  if (!post) return null;
  const isOwner = user?.id === post.user_id;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="border border-zinc-800 p-8">
            {isEditing ? (
              <div className="space-y-4">
                <label className="form-label" htmlFor="edit-title">
                  Title
                </label>
                <input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-white"
                  placeholder="Post title"
                  title="Edit post title"
                />
                <label className="form-label" htmlFor="edit-body">
                  Body
                </label>
                <textarea
                  id="edit-body"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:border-white resize-none"
                  placeholder="Write your post..."
                  title="Edit post body"
                />
                <label className="form-label" htmlFor="edit-status">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:border-white"
                  title="Edit post status"
                >
                  <option value="">No status tag</option>
                  <option value="seeking_investment">Seeking Investment</option>
                  <option value="open_to_collaborate">
                    Open to Collaborate
                  </option>
                  <option value="sharing_idea">Sharing Idea</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    className="bg-white text-black px-6 py-2 font-semibold hover:bg-gray-200 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="border border-zinc-700 px-6 py-2 text-sm hover:border-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-2xl font-bold">{post.title}</h1>
                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {post.status && <StatusBadge status={post.status} />}
                <p className="mt-4 text-gray-300 leading-relaxed">
                  {post.body}
                </p>
                <p className="mt-6 text-xs text-gray-600">
                  by {post.user?.name} ·{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
          <CommentSection post_id={post.id} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
