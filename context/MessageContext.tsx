"use client";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { AuthContext } from "./AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  deleted_by_sender?: boolean;
  deleted_by_receiver?: boolean;
  sender?: { id: number; name: string; role: string };
  receiver?: { id: number; name: string; role: string };
}

export interface Conversation {
  id: number;
  user_one: number;
  user_two: number;
  last_message_at: string;
  user_one_data?: {
    id: number;
    name: string;
    role: string;
    avatar_url?: string;
  };
  user_two_data?: {
    id: number;
    name: string;
    role: string;
    avatar_url?: string;
  };
  messages?: Message[];
  last_message?: Message;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  unreadCount: number;
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: number) => Promise<void>;
  sendMessage: (userId: number, message: string) => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;
  markAsRead: (messageId: number) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
  deleteMessage: (messageId: number, type: 'for_everyone' | 'for_me') => Promise<{ success: boolean; messageId: number; type?: string }>;
}

export const MessageContext = createContext<MessageContextType>(
  {} as MessageContextType,
);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { token, user } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = async () => {
    if (!token || !user) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error("Unauthorized - token may be expired");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const convs = data.conversations || [];
      setConversations(convs);

      const unread = convs.reduce((count: number, conv: any) => {
        const visibleMessages = (conv.messages || []).filter((msg: any) => {
          if (msg.sender_id === user?.id) {
            return !msg.deleted_by_sender;
          } else {
            return !msg.deleted_by_receiver;
          }
        });
        const unreadMessages = visibleMessages.filter(
          (msg: any) => msg.receiver_id === user?.id && !msg.is_read,
        ).length;
        return count + unreadMessages;
      }, 0);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    }
    setLoading(false);
  };

  const fetchMessages = async (userId: number) => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/conversations/${userId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error("Unauthorized - token may be expired");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
    setLoading(false);
  };

  const sendMessage = async (userId: number, message: string) => {
    if (!token || !user) return;

    try {
      const res = await fetch(`${API}/conversations/${userId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        await fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!token || !user || query.length < 1) return [];

    try {
      const res = await fetch(
        `${API}/users/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.users || [];
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  const markAsRead = async (messageId: number) => {
    if (!token || !user) return;

    try {
      await fetch(`${API}/messages/${messageId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchConversations();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteConversation = async (conversationId: number) => {
    if (!token || !user) return;

    try {
      await fetch(`${API}/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchConversations();
      setMessages([]);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const deleteMessage = async (messageId: number, type: 'for_everyone' | 'for_me') => {
    if (!token || !user) return { success: false, messageId };
    
    try {
      const res = await fetch(`${API}/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      // Refresh conversations to update unread counts
      await fetchConversations();
      
      return { success: true, messageId, type: data.type };
    } catch (error) {
      console.error("Error deleting message:", error);
      return { success: false, messageId };
    }
  };

  // Initial fetch when token and user are available
  useEffect(() => {
    if (token && user) {
      fetchConversations();
    }
  }, [token, user]);

  // Poll for new messages every 5 seconds (only when authenticated)
  useEffect(() => {
    if (!token || !user) return;

    const interval = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [token, user]);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        loading,
        unreadCount,
        fetchConversations,
        fetchMessages,
        sendMessage,
        searchUsers,
        markAsRead,
        deleteConversation,
        deleteMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}