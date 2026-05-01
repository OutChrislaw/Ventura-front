"use client";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Partner {
  id: number;
  name: string;
  email: string;
  role: "innovator" | "investor";
  bio: string | null;
  avatar_url: string | null;
  partnership_id?: number | null;
}

interface PartnershipRequest {
  id: number;
  requester_id: number;
  requested_id: number;
  status: string;
  requester?: {
    id: number;
    name: string;
    role: string;
    avatar_url: string | null;
  };
  requested?: {
    id: number;
    name: string;
    role: string;
    avatar_url: string | null;
  };
  created_at: string;
}

interface PartnershipContextType {
  loading: boolean;
  partners: Partner[];
  pendingRequests: PartnershipRequest[];
  sentRequests: PartnershipRequest[];
  searchResults: any[];
  fetchPartners: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchSentRequests: () => Promise<void>;
  searchUsers: (q: string, role?: string) => Promise<any[]>;
  sendRequest: (userId: number) => Promise<any>;
  acceptRequest: (id: number) => Promise<any>;
  declineRequest: (id: number) => Promise<any>;
  removePartner: (id: number) => Promise<any>;
  getPartnershipStatus: (userId: number) => Promise<any>;
  cancelSentRequest: (id: number) => Promise<any>; // ✅ ADD THIS LINE
}

export const PartnershipContext = createContext<PartnershipContextType>(
  {} as PartnershipContextType,
);

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
});

export function PartnershipProvider({ children }: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PartnershipRequest[]>(
    [],
  );
  const [sentRequests, setSentRequests] = useState<PartnershipRequest[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchPartners = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/partners`, {
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      setPartners(data.partners ?? []);
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/partners/requests`, {
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      setPendingRequests(data.requests ?? []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchSentRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/partners/sent`, {
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      setSentRequests(data.requests ?? []);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
    }
  };

  const searchUsers = async (q: string, role?: string) => {
    if (!token) return [];
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (role) params.append("role", role);
      const res = await fetch(`${API}/partners/search?${params}`, {
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return data.users ?? [];
    } catch (err) {
      console.error("Error searching users:", err);
      return [];
    }
  };

  const sendRequest = async (userId: number) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API}/partners/request/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (err) {
      console.error("Error sending request:", err);
      return { success: false, message: "Network error" };
    }
  };

  const acceptRequest = async (id: number) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API}/partners/${id}/accept`, {
        method: "PUT",
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (err) {
      console.error("Error accepting request:", err);
      return { success: false };
    }
  };

  const declineRequest = async (id: number) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API}/partners/${id}/decline`, {
        method: "PUT",
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (err) {
      console.error("Error declining request:", err);
      return { success: false };
    }
  };

  const removePartner = async (id: number) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API}/partners/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (err) {
      console.error("Error removing partner:", err);
      return { success: false };
    }
  };

  const getPartnershipStatus = async (userId: number) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API}/partners/status/${userId}`, {
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error getting status:", err);
      return null;
    }
  };

  const cancelSentRequest = async (id: number) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API}/partners/${id}/cancel`, {
        method: "PUT",
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (err) {
      console.error("Error cancelling request:", err);
      return { success: false };
    }
  };

  // Auto-fetch partners and pending requests when token is available
  useEffect(() => {
    if (token) {
      fetchPartners();
      fetchRequests();
    }
  }, [token]);

  return (
    <PartnershipContext.Provider
      value={{
        loading,
        partners,
        pendingRequests,
        sentRequests,
        searchResults,
        fetchPartners,
        fetchRequests,
        fetchSentRequests,
        searchUsers,
        sendRequest,
        acceptRequest,
        declineRequest,
        removePartner,
        getPartnershipStatus,
        cancelSentRequest,
      }}
    >
      {children}
    </PartnershipContext.Provider>
  );
}
