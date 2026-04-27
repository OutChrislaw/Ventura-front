"use client";

import { useContext, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
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
  PlusCircle,
  Users,
  Lightbulb,
  Briefcase,
  MailOpen,
  Trash2,
} from "lucide-react";
import "./messages.css";

function AppNav() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const router = useRouter();

  return (
    <header className="messages-nav">
      <div className="messages-nav-inner">
        <Link href="/feed" className="messages-brand">
          VENTURA
        </Link>
        <div className="messages-nav-links">
          <Link href="/feed" className="messages-nav-link">
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/partners" className="messages-nav-link">
            <Users size={18} />
            <span>Partners</span>
          </Link>
          <Link href="/messages" className="messages-nav-link active">
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="nav-unread-badge">{unreadCount}</span>
            )}
          </Link>
          <Link href="/settings" className="messages-nav-link">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user?.is_admin && (
            <Link href="/admin" className="messages-nav-link">
              <User size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>
        <div className="messages-nav-right">
          <div
            className="messages-avatar-btn"
            onClick={() => router.push(`/profile/${user?.id}`)}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              (user?.name?.charAt(0)?.toUpperCase() ?? "U")
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

type CategoryType = "all" | "unread" | "innovator" | "investor";

export default function MessagesPage() {
  const { user } = useContext(AuthContext);
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
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );

  // Delete message states
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check URL parameters for preselected user from post message button
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

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedUser) return;
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

  const handleSearch = async () => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const startNewChat = (otherUser: any) => {
    setSelectedUser(otherUser);
    setShowNewChat(false);
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

  const hasUnreadMessages = (conv: any) => {
    return getUnreadCount(conv) > 0;
  };

  // Helper to get visible messages for preview
  const getVisibleMessages = (messages: any[]) => {
    return (messages || []).filter((msg: any) => {
      if (msg.sender_id === user?.id) {
        return !msg.deleted_by_sender;
      } else {
        return !msg.deleted_by_receiver;
      }
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "unread") return hasUnreadMessages(conv);
    const partnerRole = getPartnerRole(conv);
    return partnerRole === selectedCategory;
  });

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="messages-page">
        <AppNav />
        <div className="messages-two-col">
          {/* LEFT COLUMN */}
          <div className="messages-left">
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 0) {
                      handleSearch();
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results (when searching) */}
            {searchQuery && (
              <div className="search-results">
                {searching ? (
                  <div className="search-loading">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="search-empty">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="search-result-item"
                      onClick={() => startNewChat(u)}
                    >
                      <div className="search-result-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-name">{u.name}</div>
                        <div className="search-result-role">
                          {u.role === "innovator" ? "Innovator" : "Investor"}
                        </div>
                      </div>
                      <button className="search-result-btn">Message</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Filter Logos */}
            {!searchQuery && (
              <div className="filter-logos-section">
                <div className="filter-logos-grid">
                  <button
                    className={`filter-logo ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    <Users size={20} />
                    <span>All</span>
                  </button>
                  <button
                    className={`filter-logo ${selectedCategory === "unread" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("unread")}
                  >
                    <MailOpen size={20} />
                    <span>Unread</span>
                  </button>
                  <button
                    className={`filter-logo ${selectedCategory === "innovator" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("innovator")}
                  >
                    <Lightbulb size={20} />
                    <span>Innovators</span>
                  </button>
                  <button
                    className={`filter-logo ${selectedCategory === "investor" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("investor")}
                  >
                    <Briefcase size={20} />
                    <span>Investors</span>
                  </button>
                </div>
              </div>
            )}

            {/* Conversation List */}
            {!searchQuery && (
              <div className="conversation-list">
                <div className="conv-list-header">
                  <h3>Messages</h3>
                </div>
                <div className="conv-items">
                  {loading && filteredConversations.length === 0 ? (
                    <Loader text="Loading conversations..." />
                  ) : filteredConversations.length === 0 ? (
                    <div className="conv-empty-state">
                      <p>No conversations</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const partner = getConversationPartner(conv);
                      const unread = getUnreadCount(conv);

                      // Get only visible messages for preview
                      const visibleMessages = getVisibleMessages(
                        conv.messages || [],
                      );
                      const lastMessage =
                        visibleMessages[visibleMessages.length - 1];

                      return (
                        <div
                          key={conv.id}
                          className={`conv-row ${selectedUser?.id === partner?.id ? "active" : ""}`}
                          onClick={() => setSelectedUser(partner)}
                        >
                          <div className="conv-avatar">
                            {partner?.name?.charAt(0)?.toUpperCase() || "U"}
                            {unread > 0 && <span className="conv-unread-dot" />}
                          </div>
                          <div className="conv-details">
                            <div className="conv-name">{partner?.name}</div>
                            <div className="conv-preview">
                              {lastMessage?.sender_id === user.id
                                ? "You: "
                                : ""}
                              {lastMessage?.message?.substring(0, 35) ||
                                "No messages yet"}
                            </div>
                          </div>
                          <div className="conv-right">
                            {unread > 0 && (
                              <span className="conv-unread-badge">
                                {unread}
                              </span>
                            )}
                            {lastMessage?.created_at && (
                              <div className="conv-time">
                                {new Date(
                                  lastMessage.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                            <button
                              className="conv-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(conv.id);
                              }}
                              title="Hide conversation"
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
            )}
          </div>

          {/* RIGHT COLUMN - Chat Window */}
          {selectedUser ? (
            <div className="messages-right">
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="chat-name">{selectedUser.name}</div>
                    <div className="chat-role">
                      {selectedUser.role === "innovator"
                        ? "Innovator"
                        : "Investor"}
                    </div>
                  </div>
                </div>
                <div className="chat-actions">
                  <Link
                    href={`/profile/${selectedUser.id}`}
                    className="chat-profile-btn"
                  >
                    <User size={16} /> Profile
                  </Link>
                </div>
              </div>

              <div className="chat-messages">
                {loading && messages.length === 0 ? (
                  <Loader text="Loading messages..." />
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-message-wrapper ${isMine ? "mine" : "theirs"}`}
                      >
                        <div
                          className={`chat-bubble ${isMine ? "mine" : "theirs"}`}
                        >
                          <div className="chat-bubble-text">{msg.message}</div>
                          <div className="chat-bubble-time">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isMine && msg.is_read && (
                              <span className="chat-read">✓✓ Read</span>
                            )}
                          </div>
                        </div>
                        <button
                          className="chat-delete-btn"
                          onClick={() => handleDeleteClick(msg.id, isMine)}
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <textarea
                  rows={1}
                  placeholder="Message..."
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
            </div>
          ) : (
            <div className="messages-right-empty">
              <p>No conversation selected</p>
            </div>
          )}
        </div>

        {/* Delete Options Modal - For Sender (own message) */}
        {showDeleteOptions !== null && showDeleteOptions.isMine && (
          <div
            className="modal-overlay"
            onClick={() => setShowDeleteOptions(null)}
          >
            <div
              className="modal-container delete-options-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Delete Message</h3>
                <button onClick={() => setShowDeleteOptions(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p className="delete-options-title">
                  How do you want to delete this message?
                </p>
                <label className="delete-option">
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
                <label className="delete-option">
                  <input
                    type="radio"
                    name="deleteType"
                    value="for_me"
                    checked={deleteType === "for_me"}
                    onChange={() => setDeleteType("for_me")}
                  />
                  <div>
                    <strong>Delete for me only</strong>
                    <span>
                      Remove this message from your view only. Others will still
                      see it.
                    </span>
                  </div>
                </label>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowDeleteOptions(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-delete"
                  onClick={handleDeleteOptionContinue}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Options Modal - For Receiver (other's message) */}
        {showDeleteOptions !== null && !showDeleteOptions.isMine && (
          <div
            className="modal-overlay"
            onClick={() => setShowDeleteOptions(null)}
          >
            <div
              className="modal-container delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Delete Message</h3>
                <button onClick={() => setShowDeleteOptions(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Hide this message from your view only?</p>
                <p className="modal-warning">
                  The other person will still be able to see it.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowDeleteOptions(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-delete"
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

        {/* Permanent Deletion Confirmation Modal (Second step) */}
        {showPermanentConfirm !== null && (
          <div
            className="modal-overlay"
            onClick={() => setShowPermanentConfirm(null)}
          >
            <div
              className="modal-container delete-modal warning-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>⚠️ Permanent Deletion</h3>
                <button onClick={() => setShowPermanentConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p className="warning-text">Are you absolutely sure?</p>
                <p>
                  This will permanently delete this message for{" "}
                  <strong>EVERYONE</strong>.
                </p>
                <p className="modal-warning">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowPermanentConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-delete-permanent"
                  onClick={() => {
                    handleDeleteMessage(
                      showPermanentConfirm,
                      true,
                      "for_everyone",
                    );
                  }}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hide Conversation Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div
            className="modal-overlay"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className="modal-container delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Hide Conversation</h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to hide this conversation?</p>
                <p className="modal-warning">
                  This will remove it from your view only. The other person will
                  still be able to see it.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-delete"
                  onClick={() => handleDeleteConversation(showDeleteConfirm)}
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>New Message</h3>
                <button onClick={() => setShowNewChat(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch();
                  }}
                  autoFocus
                />
              </div>
              <div className="modal-results">
                {searching ? (
                  <div className="modal-loading">Searching...</div>
                ) : searchResults.length === 0 && searchQuery ? (
                  <div className="modal-empty">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="modal-user"
                      onClick={() => startNewChat(u)}
                    >
                      <div className="modal-user-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="modal-user-info">
                        <div className="modal-user-name">{u.name}</div>
                        <div className="modal-user-role">
                          {u.role === "innovator" ? "Innovator" : "Investor"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
