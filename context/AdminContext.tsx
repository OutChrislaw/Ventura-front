"use client";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

interface DashboardData {
  total_users: number;
  total_posts: number;
  total_comments: number;
  total_messages: number;
  posts_by_status: {
    sharing_idea: number;
    open_to_collaborate: number;
    seeking_investment: number;
  };
  top_contributors: any[];
  recent_posts: any[];
  recent_users: any[];
}

interface AdminContextType {
  dashboardData: DashboardData | null;
  loading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchUsers: () => Promise<any[]>;
  fetchAllPosts: () => Promise<any[]>;
  createUser: (data: any) => Promise<void>;
  updateUserRole: (
    userId: number,
    role: string,
    isAdmin: boolean,
  ) => Promise<void>;
  updateUser: (
    userId: number,
    email: string,
    password?: string,
  ) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  fetchAllMessages: () => Promise<any[]>;
  deleteMessage: (messageId: number) => Promise<void>;
  fetchAllComments: () => Promise<any[]>;
  deleteComment: (commentId: number) => Promise<void>;
  updatePost: (
    postId: number,
    data: { title: string; body: string; status: string },
  ) => Promise<void>;
  adminSearchUsers: (query: string) => Promise<any[]>;
}

export const AdminContext = createContext<AdminContextType>(
  {} as AdminContextType,
);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return [];
    const res = await fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.users;
  }, [token]);

  const fetchAllPosts = useCallback(async () => {
    if (!token) return [];
    const res = await fetch(`${API}/admin/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.posts;
  }, [token]);

  const createUser = useCallback(
    async (userData: any) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Failed to create user");
    },
    [token],
  );

  const updateUserRole = useCallback(
    async (userId: number, role: string, isAdmin: boolean) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, is_admin: isAdmin }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
    },
    [token],
  );

  const updateUser = useCallback(
    async (userId: number, email: string, password?: string) => {
      if (!token) return;
      const body: any = { email };
      if (password) {
        body.password = password;
      }
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update user");
    },
    [token],
  );

  const deleteUser = useCallback(
    async (userId: number) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    [token],
  );

  const deletePost = useCallback(
    async (postId: number) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    [token],
  );

  const fetchAllMessages = useCallback(async () => {
    if (!token) return [];
    const res = await fetch(`${API}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.messages;
  }, [token]);

  const deleteMessage = useCallback(
    async (messageId: number) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete message");
    },
    [token],
  );

  const fetchAllComments = useCallback(async () => {
    if (!token) return [];
    const res = await fetch(`${API}/admin/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.comments;
  }, [token]);

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    [token],
  );

  const updatePost = useCallback(
    async (
      postId: number,
      data: { title: string; body: string; status: string },
    ) => {
      if (!token) return;
      const res = await fetch(`${API}/admin/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update post");
    },
    [token],
  );

  const adminSearchUsers = useCallback(
    async (query: string) => {
      if (!token) return [];
      if (!query || query.length < 2) return [];
      try {
        const res = await fetch(
          `${API}/admin/users/search?q=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        return data.users || [];
      } catch (error) {
        console.error("Error searching users:", error);
        return [];
      }
    },
    [token],
  );

  return (
    <AdminContext.Provider
      value={{
        dashboardData,
        loading,
        fetchDashboard,
        fetchUsers,
        fetchAllPosts,
        createUser,
        updateUserRole,
        updateUser,
        deleteUser,
        deletePost,
        fetchAllMessages,
        deleteMessage,
        fetchAllComments,
        deleteComment,
        updatePost,
        adminSearchUsers,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
