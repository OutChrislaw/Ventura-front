"use client";

import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Search,
  X,
  Send,
  Users,
  LogOut,
  TrendingUp,
  Trash2,
  Mail,
  MailOpen,
  Lightbulb,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import "./messages.css";

export default function MessagesPage() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    searchUsers,
    deleteConversation,
    deleteMessage,
  } = useContext(MessageContext);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [showDeleteOptions, setShowDeleteOptions] = useState<{
    id: number;
    isMine: boolean;
  } | null>(null);
  const [showPermanentConfirm, setShowPermanentConfirm] = useState<
    number | null
  >(null);
  const [deleteType, setDeleteType] = useState<"for_everyone" | "for_me">(
    "for_me",
  );
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const totalPendingRequests = pendingRequests.length;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check URL parameters for preselected user
  useEffect(() => {
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userRole = searchParams.get("userRole");

    if (userId && userName && !selectedUser) {
      setSelectedUser({
        id: parseInt(userId),
        name: decodeURIComponent(userName),
        role: userRole,
      });
      router.replace("/messages");
    }
  }, [searchParams, selectedUser, router]);

  // Initial fetch
  useEffect(() => {
    const loadConversations = async () => {
      setInitialLoading(true);
      await fetchConversations();
      setInitialLoading(false);
    };
    loadConversations();
  }, []);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedUser || sending) return;
    setSending(true);
    await sendMessage(selectedUser.id, inputMessage);
    setInputMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, searchUsers]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => handleSearch(), 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, handleSearch]);

  const startNewChat = (otherUser: any) => {
    setSelectedUser(otherUser);
    setSearchQuery("");
    setSearchResults([]);
    setTimeout(() => fetchConversations(), 500);
  };

  const handleDeleteConversation = async (convId: number) => {
    await deleteConversation(convId);
    setShowDeleteConfirm(null);
    setSelectedUser(null);
    await fetchConversations();
  };

  const handleDeleteClick = (messageId: number, isMine: boolean) => {
    setShowDeleteOptions({ id: messageId, isMine });
    setDeleteType("for_me");
  };

  const handleDeleteOptionContinue = () => {
    if (deleteType === "for_everyone") {
      setShowPermanentConfirm(showDeleteOptions?.id || null);
      setShowDeleteOptions(null);
    } else {
      handleDeleteMessage(
        showDeleteOptions!.id,
        showDeleteOptions!.isMine,
        "for_me",
      );
      setShowDeleteOptions(null);
    }
  };

  const handleDeleteMessage = async (
    messageId: number,
    isMine: boolean,
    type: "for_everyone" | "for_me",
  ) => {
    setDeleting(true);
    const result = await deleteMessage(messageId, type);
    if (result.success && selectedUser) {
      await fetchMessages(selectedUser.id);
    }
    setShowPermanentConfirm(null);
    setDeleting(false);
  };

  const getConversationPartner = (conv: any) => {
    return conv.user_one?.id === user?.id ? conv.user_two : conv.user_one;
  };

  const getPartnerRole = (conv: any) => {
    const partner = getConversationPartner(conv);
    return partner?.role;
  };

  const getUnreadCount = (conv: any) => {
    return (conv.messages || []).filter(
      (msg: any) => msg.receiver_id === user?.id && !msg.is_read,
    ).length;
  };

  const hasUnreadMessages = (conv: any) => getUnreadCount(conv) > 0;

  const getVisibleMessages = (messages: any[]) => {
    return (messages || []).filter((msg: any) => {
      if (msg.sender_id === user?.id) return !msg.deleted_by_sender;
      else return !msg.deleted_by_receiver;
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "unread") return hasUnreadMessages(conv);
    const partnerRole = getPartnerRole(conv);
    return partnerRole === selectedCategory;
  });

  if (!user) return null;

  const getCategoryCount = (category: string) => {
    if (category === "all") return conversations.length;
    if (category === "unread")
      return conversations.filter((conv) => hasUnreadMessages(conv)).length;
    if (category === "innovator")
      return conversations.filter(
        (conv) => getPartnerRole(conv) === "innovator",
      ).length;
    if (category === "investor")
      return conversations.filter((conv) => getPartnerRole(conv) === "investor")
        .length;
    return 0;
  };

  const filterBoxes = [
    {
      id: "all",
      label: "All Messages",
      icon: <Mail size={20} />,
      count: getCategoryCount("all"),
    },
    {
      id: "unread",
      label: "Unread",
      icon: <MailOpen size={20} />,
      count: getCategoryCount("unread"),
    },
    {
      id: "innovator",
      label: "Innovators",
      icon: <Lightbulb size={20} />,
      count: getCategoryCount("innovator"),
    },
    {
      id: "investor",
      label: "Investors",
      icon: <Briefcase size={20} />,
      count: getCategoryCount("investor"),
    },
  ];

  const isLoading = initialLoading || loading;

  return (
    <ProtectedRoute>
      <div className="app">
        {/* BLACK SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">
            <Link href="/feed" className="logoLink">
              <img src="/newhite.png" alt="VENTURA" className="logoImage" />
            </Link>
          </div>

          <nav className="sidebarNav">
            <Link href="/feed" className="navItem">
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link href="/partners" className="navItem">
              <Users size={18} />
              <span>Partners</span>
              {totalPendingRequests > 0 && (
                <span className="navBadge">{totalPendingRequests}</span>
              )}
            </Link>
            <Link href="/messages" className="navItem active">
              <MessageSquare size={18} />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="navBadge">{unreadCount}</span>
              )}
            </Link>
            <Link href="/trends" className="navItem">
              <TrendingUp size={18} />
              <span>Trends</span>
            </Link>
            <Link href="/settings" className="navItem">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            {user.is_admin && (
              <Link href="/admin" className="navItem">
                <LayoutDashboard size={18} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <div className="sidebarFooter">
            <div className="userInfo">
              <div className="userAvatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="userDetails">
                <span className="sidebarUserName">{user.name}</span>
                <span className="userRole">
                  {user.role === "innovator" ? "Innovator" : "Investor"}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="logoutBtn">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* WHITE MAIN CONTENT */}
        <main className="mainContent">
          {/* Header with Search */}
          <div className="headerRow">
            <div className="searchWrapper">
              <Search size={18} className="searchIcon" />
              <input
                type="text"
                className="searchInput"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="searchClear"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 4 Filter Boxes */}
          <div className="filterBoxes">
            {filterBoxes.map((box) => (
              <button
                key={box.id}
                className={`filterBox ${selectedCategory === box.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(box.id)}
              >
                <div className="filterBoxIcon">{box.icon}</div>
                <div className="filterBoxInfo">
                  <span className="filterBoxLabel">{box.label}</span>
                  <span className="filterBoxCount">{box.count}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Search Results with Centered Loading */}
          {searchQuery && (
            <div className="searchResultsSection">
              {searching ? (
                <div className="centerLoader">
                  <div className="spinner"></div>
                  <p>Searching users...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="centerMsg">
                  <Search size={48} />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="userList">
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="userCard"
                      onClick={() => startNewChat(u)}
                    >
                      <div className="userAvatarSmall">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="userInfo">
                        <div className="userName">{u.name}</div>
                        <div className="userRole">
                          {u.role === "innovator" ? "Innovator" : "Investor"}
                        </div>
                      </div>
                      <button className="messageBtn">Message</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Two Column Layout - Conversations + Chat */}
          {!searchQuery && (
            <div className="twoColumnLayout">
              {/* Left Column - Conversations List with Centered Loading */}
              <div className="conversationsColumn">
                <div className="conversationsHeader">
                  <h3>Messages</h3>
                </div>
                <div className="conversationsList">
                  {isLoading ? (
                    <div className="centerLoader">
                      <div className="spinner"></div>
                      <p>Loading conversations...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="centerMsg">
                      <MessageSquare size={48} />
                      <p>No conversations found</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const partner = getConversationPartner(conv);
                      const unread = getUnreadCount(conv);
                      const visibleMessages = getVisibleMessages(
                        conv.messages || [],
                      );
                      const lastMessage =
                        visibleMessages[visibleMessages.length - 1];

                      return (
                        <div
                          key={conv.id}
                          className={`conversationItem ${selectedUser?.id === partner?.id ? "active" : ""}`}
                          onClick={() => setSelectedUser(partner)}
                        >
                          <div className="conversationAvatar">
                            {partner?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="conversationInfo">
                            <div className="conversationName">
                              {partner?.name}
                            </div>
                            <div className="conversationPreview">
                              {lastMessage?.sender_id === user.id
                                ? "You: "
                                : ""}
                              {lastMessage?.message?.substring(0, 40) ||
                                "No messages yet"}
                            </div>
                          </div>
                          <div className="conversationMeta">
                            {unread > 0 && (
                              <span className="unreadBadge">{unread}</span>
                            )}
                            {lastMessage?.created_at && (
                              <span className="conversationTime">
                                {new Date(
                                  lastMessage.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                            <button
                              className="deleteConvBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(conv.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column - Chat Window with Centered Loading */}
              <div className="chatColumn">
                {selectedUser ? (
                  <>
                    <div className="chatHeader">
                      <div className="chatUserInfo">
                        <div className="chatAvatar">
                          {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="chatName">{selectedUser.name}</div>
                          <div className="chatRole">
                            {selectedUser.role === "innovator"
                              ? "Innovator"
                              : "Investor"}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/profile/${selectedUser.id}`}
                        className="profileBtn"
                      >
                        <User size={16} /> Profile
                      </Link>
                    </div>

                    <div className="chatMessages">
                      {loading && messages.length === 0 ? (
                        <div className="centerLoader">
                          <div className="spinner"></div>
                          <p>Loading messages...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="centerMsg">
                          <MessageSquare size={48} />
                          <p>No messages yet</p>
                          <p className="emptySubtext">
                            Send a message to start the conversation
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMine = msg.sender_id === user.id;
                          return (
                            <div
                              key={msg.id}
                              className={`messageWrapper ${isMine ? "mine" : "theirs"}`}
                            >
                              <div
                                className={`messageBubble ${isMine ? "mine" : "theirs"}`}
                              >
                                <p>{msg.message}</p>
                                <span className="messageTime">
                                  {new Date(msg.created_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                  {isMine && msg.is_read && (
                                    <span className="readReceipt"> ✓✓</span>
                                  )}
                                </span>
                              </div>
                              <button
                                className="deleteMsgBtn"
                                onClick={() =>
                                  handleDeleteClick(msg.id, isMine)
                                }
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="chatInput">
                      <textarea
                        rows={1}
                        placeholder="Type a message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !inputMessage.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="centerMsg">
                    <p className="emptySubtext">
                      Choose someone to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* All modals remain the same */}
      {showDeleteOptions !== null && showDeleteOptions.isMine && (
        <div
          className="modalOverlay"
          onClick={() => setShowDeleteOptions(null)}
        >
          <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Delete Message</h3>
              <button onClick={() => setShowDeleteOptions(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modalBody">
              <p className="deleteOptionsTitle">
                How do you want to delete this message?
              </p>
              <label className="deleteOption">
                <input
                  type="radio"
                  name="deleteType"
                  value="for_me"
                  checked={deleteType === "for_me"}
                  onChange={() => setDeleteType("for_me")}
                />
                <div>
                  <strong>Delete for me only</strong>
                  <span>Remove this message from your view only.</span>
                </div>
              </label>
              <label className="deleteOption">
                <input
                  type="radio"
                  name="deleteType"
                  value="for_everyone"
                  checked={deleteType === "for_everyone"}
                  onChange={() => setDeleteType("for_everyone")}
                />
                <div>
                  <strong>Delete for everyone</strong>
                  <span>
                    Permanently remove this message for all participants.
                  </span>
                </div>
              </label>
            </div>
            <div className="modalFooter">
              <button
                className="cancelBtn"
                onClick={() => setShowDeleteOptions(null)}
              >
                Cancel
              </button>
              <button
                className="deleteBtn"
                onClick={handleDeleteOptionContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteOptions !== null && !showDeleteOptions.isMine && (
        <div
          className="modalOverlay"
          onClick={() => setShowDeleteOptions(null)}
        >
          <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Delete Message</h3>
              <button onClick={() => setShowDeleteOptions(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modalBody">
              <p>Hide this message from your view only?</p>
              <p className="modalWarning">
                The other person will still be able to see it.
              </p>
            </div>
            <div className="modalFooter">
              <button
                className="cancelBtn"
                onClick={() => setShowDeleteOptions(null)}
              >
                Cancel
              </button>
              <button
                className="deleteBtn"
                onClick={() => {
                  handleDeleteMessage(
                    showDeleteOptions.id,
                    showDeleteOptions.isMine,
                    "for_me",
                  );
                  setShowDeleteOptions(null);
                }}
              >
                Yes, Hide
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermanentConfirm !== null && (
        <div
          className="modalOverlay"
          onClick={() => setShowPermanentConfirm(null)}
        >
          <div
            className="modalContainer warningModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <h3>⚠️ Permanent Deletion</h3>
              <button onClick={() => setShowPermanentConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modalBody">
              <p className="warningText">Are you absolutely sure?</p>
              <p>
                This will permanently delete this message for{" "}
                <strong>EVERYONE</strong>.
              </p>
              <p className="modalWarning">This action cannot be undone.</p>
            </div>
            <div className="modalFooter">
              <button
                className="cancelBtn"
                onClick={() => setShowPermanentConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="permanentDeleteBtn"
                onClick={() =>
                  handleDeleteMessage(
                    showPermanentConfirm,
                    true,
                    "for_everyone",
                  )
                }
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div
          className="modalOverlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Hide Conversation</h3>
              <button onClick={() => setShowDeleteConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modalBody">
              <p>Are you sure you want to hide this conversation?</p>
              <p className="modalWarning">
                This will remove it from your view only.
              </p>
            </div>
            <div className="modalFooter">
              <button
                className="cancelBtn"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="deleteBtn"
                onClick={() => handleDeleteConversation(showDeleteConfirm)}
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
