"use client";

import { useContext, useEffect, useState, useMemo } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  PlusCircle,
  X,
  Search,
  Users,
  TrendingUp,
  Mail,
  Bell,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import Loader from "@/components/Loader";
import RightPanel from "@/components/RightPanel";
import TrendingNewsCard from "@/components/TrendingNewsCard";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./feed.module.css";

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

// Determine article category based on content (same logic as Trends page)
const determineCategory = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("ai") ||
    lowerText.includes("artificial intelligence") ||
    lowerText.includes("machine learning") ||
    lowerText.includes("chatgpt") ||
    lowerText.includes("openai") ||
    lowerText.includes("generative ai")
  ) return "AI";
  if (
    lowerText.includes("world") ||
    lowerText.includes("global") ||
    lowerText.includes("international") ||
    lowerText.includes("europe") ||
    lowerText.includes("asia") ||
    lowerText.includes("china")
  ) return "World";
  if (
    lowerText.includes("green") ||
    lowerText.includes("sustainable") ||
    lowerText.includes("clean energy") ||
    lowerText.includes("climate") ||
    lowerText.includes("solar") ||
    lowerText.includes("renewable") ||
    lowerText.includes("environment")
  ) return "Green";
  if (
    lowerText.includes("government") ||
    lowerText.includes("policy") ||
    lowerText.includes("regulation") ||
    lowerText.includes("law") ||
    lowerText.includes("federal") ||
    lowerText.includes("congress") ||
    lowerText.includes("legislation")
  ) return "Government";
  if (
    lowerText.includes("funding") ||
    lowerText.includes("venture") ||
    lowerText.includes("investment") ||
    lowerText.includes("startup funding") ||
    lowerText.includes("series a") ||
    lowerText.includes("seed round")
  ) return "Funding";
  return "General";
};

// Curated fallback business news (same as Trends page)
const getCuratedFeedNews = (): NewsArticle[] => [
  {
    title: "AI Startups Raised Record $50B in Q1 2024",
    description:
      "Artificial intelligence companies continue to dominate venture capital funding, with a 40% increase from last year. Generative AI leads the pack with major investments in OpenAI, Anthropic, and other innovators.",
    content: "",
    url: "https://techcrunch.com/2024/03/ai-startup-funding-q1-2024/",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=AI+Startups",
    publishedAt: new Date().toISOString(),
    source: { name: "TechCrunch" },
    category: "AI",
  },
  {
    title: "European Green Tech Startups Attract Record Investments",
    description:
      "Sustainability-focused startups across Europe raised €5.6B in Q1 2024, with energy storage and carbon capture technologies leading the way.",
    content: "",
    url: "https://sifted.eu/green-tech-funding",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Green+Tech",
    publishedAt: new Date().toISOString(),
    source: { name: "Sifted" },
    category: "Green",
  },
  {
    title: "Global Startup Ecosystem Report: Top Cities for Entrepreneurs",
    description:
      "Silicon Valley remains #1, but emerging hubs in Southeast Asia and Latin America are showing rapid growth in startup activity and funding.",
    content: "",
    url: "https://startupgenome.com/report",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Startup+Ecosystem",
    publishedAt: new Date().toISOString(),
    source: { name: "Startup Genome" },
    category: "World",
  },
  {
    title: "Government Announces $100M Fund for AI Research",
    description:
      "New federal initiative aims to support AI research and development, with focus on ethical AI and practical business applications for startups.",
    content: "",
    url: "https://www.whitehouse.gov/ai-fund",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Government+Funding",
    publishedAt: new Date().toISOString(),
    source: { name: "Associated Press" },
    category: "Government",
  },
  {
    title: "Venture Capital Trends: What Investors Are Looking For",
    description:
      "VCs prioritize startups with clear path to profitability, strong unit economics, and practical AI integration across business operations.",
    content: "",
    url: "https://www.cbinsights.com/vc-trends",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=VC+Trends",
    publishedAt: new Date().toISOString(),
    source: { name: "CB Insights" },
    category: "Funding",
  },
  {
    title: "The Rise of Climate Tech: Solutions for a Sustainable Future",
    description:
      "From carbon capture to sustainable agriculture, climate tech startups are solving real-world problems while building profitable businesses.",
    content: "",
    url: "https://www.forbes.com/climate-tech",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Climate+Tech",
    publishedAt: new Date().toISOString(),
    source: { name: "Forbes" },
    category: "Green",
  },
  {
    title: "Seed Funding Trends: What's Hot in Early-Stage Investing",
    description:
      "Analysis of emerging sectors attracting seed investors and tips for founders seeking their first round of funding.",
    content: "",
    url: "https://www.crunchbase.com/seed-trends",
    image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Seed+Funding",
    publishedAt: new Date().toISOString(),
    source: { name: "Crunchbase" },
    category: "Funding",
  },
];

export default function FeedPage() {
  const { posts, loading, fetchPosts, createPost, updatePost, deletePost } =
    useContext(PostContext);
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalPendingRequests = pendingRequests.length;
  const [hasFetched, setHasFetched] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  // Fetch trending news from MarketAux API (same as Trends page)
  useEffect(() => {
    const fetchFeedNews = async () => {
      try {
        const MARKETAUX_API_KEY = "zTUT2mLNqkZNneoAeRTKA2nfFz4NsTQ0ewJx4bnp";
        const businessQueries = [
          "startup business entrepreneurship",
          "venture capital funding",
          "technology innovation company",
          "small business growth",
          "entrepreneur success story",
          "business strategy leadership",
        ];
        const randomQuery =
          businessQueries[Math.floor(Math.random() * businessQueries.length)];
        const url = `https://api.marketaux.com/v1/news/all?search=${encodeURIComponent(randomQuery)}&language=en&limit=30&api_token=${MARKETAUX_API_KEY}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const excludeKeywords = [
              "stock", "crypto", "bitcoin", "ethereum", "trading",
              "nasdaq", "nyse", "sell", "buy", "price target",
              "analyst", "dividend", "bearish", "bullish",
            ];
            const filteredData = data.data.filter((article: any) => {
              const content = (
                article.title + " " + (article.description || "")
              ).toLowerCase();
              return !excludeKeywords.some((keyword) =>
                content.includes(keyword.toLowerCase()),
              );
            });

            if (filteredData.length > 0) {
              const formatted: NewsArticle[] = filteredData
                .slice(0, 20)
                .map((article: any) => ({
                  title: article.title || "Business News",
                  description:
                    article.description || article.snippet || "No description available",
                  content: article.description || article.snippet || "",
                  url: article.url || "#",
                  image:
                    article.image_url ||
                    "https://placehold.co/600x400/1a1a1a/ffffff?text=VENTURA+Business+News",
                  publishedAt: article.published_at || new Date().toISOString(),
                  source: { name: article.source || "Business News" },
                  category: determineCategory(
                    article.title + " " + (article.description || article.snippet || ""),
                  ),
                }));
              setNewsArticles(formatted);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching feed news:", err);
      }
      // Fallback: use curated news
      setNewsArticles(getCuratedFeedNews());
    };

    fetchFeedNews();
  }, []);

  useEffect(() => {
    fetchPosts().finally(() => setHasFetched(true));
  }, []);

  const handleCreate = async (data: {
    title: string;
    body: string;
    status: string;
  }) => {
    await createPost(data);
    setShowPostForm(false);
    setShowMobileModal(false);
  };

  const handleCancelForm = () => {
    setShowPostForm(false);
  };

  const handleUpdate = async (
    id: number,
    data: { title: string; body: string; status: string },
  ) => {
    await updatePost(id, data);
  };

  const handleDelete = async (id: number) => {
    await deletePost(id);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Get filtered posts
  const getFilteredPosts = () => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.user?.name?.toLowerCase().includes(q),
      );
    }

    if (activeFilter !== "all") {
      result = result.filter((post) => post.status === activeFilter);
    }

    if (roleFilter !== "all") {
      result = result.filter((post) => post.user?.role === roleFilter);
    }

    return result;
  };

  const filteredPosts = getFilteredPosts();

  // Get counts for filters
  const getFilterCount = (status: string | null) => {
    let base = posts;
    if (roleFilter !== "all") {
      base = base.filter((p) => p.user?.role === roleFilter);
    }
    if (status === null) return base.length;
    return base.filter((post) => post.status === status).length;
  };

  const getRoleCount = (role: string) => {
    let base = posts;
    if (activeFilter !== "all") {
      base = base.filter((p) => p.status === activeFilter);
    }
    if (role === "all") return base.length;
    return base.filter((post) => post.user?.role === role).length;
  };

  if (!user) return null;

  return (
    <div className={styles.app}>
      {/* BLACK SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/feed" className="settings-logoLink">
            <img
              src="/newhite.png"
              alt="VENTURA"
              className="settings-logoImage"
            />
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/feed" className={`${styles.navItem} ${styles.active}`}>
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/partners" className={styles.navItem}>
            <Users size={18} />
            <span>Partners</span>
            {totalPendingRequests > 0 && (
              <span className={styles.navBadge}>{totalPendingRequests}</span>
            )}
          </Link>
          <Link href="/messages" className={styles.navItem}>
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className={styles.navBadge}>{unreadCount}</span>
            )}
          </Link>
          <Link href="/trends" className={styles.navItem}>
            <TrendingUp size={18} />
            <span>Trends</span>
          </Link>
          <Link href="/settings" className={styles.navItem}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user.is_admin && (
            <Link href="/admin" className={styles.navItem}>
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>
                {user.role === "innovator" ? "Innovator" : "Investor"}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* WHITE MAIN CONTENT */}
      <main className={styles.mainContent}>
        <div className={styles.mainInner}>
        {/* Header with Search and Avatar on same line */}
        <div className={styles.headerRow}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search posts by title, content, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className={styles.headerRight}>
            <Link href={`/profile/${user.id}`} className={styles.headerAvatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </Link>
          </div>
        </div>

        {/* Create Post Section */}
        <div className={styles.createPostSection}>
          {!showPostForm ? (
            <div className={styles.createPostHeader}>
              <div className={styles.createPostAvatar}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <button
                className={styles.createPostTrigger}
                onClick={() => setShowPostForm(true)}
              >
                What's on your mind, {user.name?.split(" ")[0]}?
              </button>
            </div>
          ) : (
            <div className={styles.createPostFormWrapper}>
              <div className={styles.createPostFormHeader}>
                <h4>Create Post</h4>
                <button
                  className={styles.cancelPostBtn}
                  onClick={handleCancelForm}
                >
                  Cancel
                </button>
              </div>
              <PostForm onSubmit={handleCreate} onClose={handleCancelForm} />
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className={styles.filtersRow}>
          {/* Filter by People */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>FILTER BY PEOPLE</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${roleFilter === "all" ? styles.active : ""}`}
                onClick={() => setRoleFilter("all")}
              >
                Everyone{" "}
                <span className={styles.filterCount}>
                  {getRoleCount("all")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === "innovator" ? styles.active : ""}`}
                onClick={() => setRoleFilter("innovator")}
              >
                Innovators{" "}
                <span className={styles.filterCount}>
                  {getRoleCount("innovator")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === "investor" ? styles.active : ""}`}
                onClick={() => setRoleFilter("investor")}
              >
                Investors{" "}
                <span className={styles.filterCount}>
                  {getRoleCount("investor")}
                </span>
              </button>
            </div>
          </div>

          {/* Filter by Post Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>FILTER BY POST TYPE</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${activeFilter === "all" ? styles.active : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Posts{" "}
                <span className={styles.filterCount}>
                  {getFilterCount(null)}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "sharing_idea" ? styles.active : ""}`}
                onClick={() => setActiveFilter("sharing_idea")}
              >
                Ideas{" "}
                <span className={styles.filterCount}>
                  {getFilterCount("sharing_idea")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "open_to_collaborate" ? styles.active : ""}`}
                onClick={() => setActiveFilter("open_to_collaborate")}
              >
                Collab{" "}
                <span className={styles.filterCount}>
                  {getFilterCount("open_to_collaborate")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "seeking_investment" ? styles.active : ""}`}
                onClick={() => setActiveFilter("seeking_investment")}
              >
                Invest{" "}
                <span className={styles.filterCount}>
                  {getFilterCount("seeking_investment")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className={styles.postsContainer}>
          {!hasFetched || loading ? (
            <>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonCardHeader}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                </div>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonBlock} />
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonActionBtn} />
                  <div className={styles.skeletonActionBtn} />
                </div>
              </div>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonCardHeader}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                </div>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonBlock} />
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonActionBtn} />
                  <div className={styles.skeletonActionBtn} />
                </div>
              </div>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonCardHeader}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                </div>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonBlock} />
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonActionBtn} />
                  <div className={styles.skeletonActionBtn} />
                </div>
              </div>
            </>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No posts found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.clearSearchBtn}
                >
                  Clear search
                </button>
              )}
              {!searchQuery &&
                activeFilter === "all" &&
                roleFilter === "all" && (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className={styles.createFirstBtn}
                  >
                    Create your first post
                  </button>
                )}
            </div>
          ) : (
            <>
              {filteredPosts.map((post, index) => {
                // Insert a news card after every 3 regular posts
                const showNews = (index + 1) % 3 === 0;
                // Cycle through unique articles using a running counter
                const newsIndex = Math.floor(index / 3) % Math.max(newsArticles.length, 1);
                return (
                  <div key={`group-${post.id}`} className={styles.postWithNewsGroup}>
                    <PostCard
                      post={post}
                      currentUserId={user.id}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                    {showNews && newsArticles.length > 0 && (
                      <TrendingNewsCard article={newsArticles[newsIndex]} />
                    )}
                  </div>
                );
              })}
              {/* If there are posts but not enough to trigger news insertion, add one at the end */}
              {filteredPosts.length > 0 && filteredPosts.length < 3 && newsArticles.length > 0 && (
                <TrendingNewsCard article={newsArticles[0]} />
              )}
            </>
          )}
        </div>
        </div>
      </main>

      {/* RIGHT PARTNERS SIDEBAR */}
      <RightPanel />

      {/* Mobile Create Post Modal */}
      {showMobileModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowMobileModal(false)}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Create Post</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowMobileModal(false)}
              >
                ×
              </button>
            </div>
            <PostForm
              onSubmit={handleCreate}
              onClose={() => setShowMobileModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
