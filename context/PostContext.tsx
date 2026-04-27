"use client";
import { createContext, useState, useContext, ReactNode } from "react";
import { AuthContext } from "./AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

// Must match Laravel posts table columns
interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  status: "seeking_investment" | "open_to_collaborate" | "sharing_idea" | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string; role: string };
}

interface PostContextType {
  posts: Post[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  createPost: (data: {
    title: string;
    body: string;
    status: string;
  }) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  updatePost: (
    id: number,
    data: { title: string; body: string; status: string | null },
  ) => Promise<void>;
}

export const PostContext = createContext<PostContextType>(
  {} as PostContextType,
);

export function PostProvider({ children }: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(data.posts || []); // If undefined, use empty array
    } catch (error) {
      setPosts([]); // On error, set empty array
    }
    setLoading(false);
  };

  const createPost = async (postData: {
    title: string;
    body: string;
    status: string;
  }) => {
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    setPosts((prev) => [data.post, ...prev]);
  };

  const deletePost = async (id: number) => {
    await fetch(`${API}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePost = async (
    id: number,
    data: { title: string; body: string; status: string | null },
  ) => {
    const res = await fetch(`${API}/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (res.ok) {
      setPosts((prev) =>
        prev.map((post) => (post.id === id ? responseData.post : post)),
      );
    }
  };

  return (
    <PostContext.Provider
      value={{ posts, loading, fetchPosts, createPost, deletePost, updatePost }}
    >
      {children}
    </PostContext.Provider>
  );
}
