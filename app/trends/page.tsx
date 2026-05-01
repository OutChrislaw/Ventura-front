"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Home,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  TrendingUp,
  LayoutDashboard,
  Newspaper,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  Zap,
  Globe,
  BarChart3,
  Briefcase,
} from "lucide-react";
import "./trends.css";

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string; url: string };
  category?: string;
}

export default function TrendsPage() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const totalPendingRequests = pendingRequests.length;

  // Determine article category based on content
  const determineCategory = (text: string): string => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("ai") ||
      lowerText.includes("artificial intelligence") ||
      lowerText.includes("machine learning") ||
      lowerText.includes("chatgpt") ||
      lowerText.includes("openai") ||
      lowerText.includes("generative ai")
    ) {
      return "AI";
    }

    if (
      lowerText.includes("world") ||
      lowerText.includes("global") ||
      lowerText.includes("international") ||
      lowerText.includes("europe") ||
      lowerText.includes("asia") ||
      lowerText.includes("china") ||
      lowerText.includes("european") ||
      lowerText.includes("africa") ||
      lowerText.includes("latin america")
    ) {
      return "World";
    }

    if (
      lowerText.includes("green") ||
      lowerText.includes("sustainable") ||
      lowerText.includes("clean energy") ||
      lowerText.includes("eco") ||
      lowerText.includes("climate") ||
      lowerText.includes("solar") ||
      lowerText.includes("renewable") ||
      lowerText.includes("environment")
    ) {
      return "Green";
    }

    if (
      lowerText.includes("government") ||
      lowerText.includes("policy") ||
      lowerText.includes("regulation") ||
      lowerText.includes("law") ||
      lowerText.includes("federal") ||
      lowerText.includes("state") ||
      lowerText.includes("congress") ||
      lowerText.includes("senate") ||
      lowerText.includes("legislation")
    ) {
      return "Government";
    }

    if (
      lowerText.includes("funding") ||
      lowerText.includes("venture") ||
      lowerText.includes("investment") ||
      lowerText.includes("startup funding") ||
      lowerText.includes("series a") ||
      lowerText.includes("seed round")
    ) {
      return "Funding";
    }

    return "General";
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI":
        return <Zap size={14} />;
      case "World":
        return <Globe size={14} />;
      case "Green":
        return <Globe size={14} />;
      case "Government":
        return <BarChart3 size={14} />;
      case "Funding":
        return <Briefcase size={14} />;
      default:
        return <Newspaper size={14} />;
    }
  };

  // Curated business news (fallback content)
  const getCuratedBusinessNews = (): NewsArticle[] => {
    return [
      {
        title: "AI Startups Raised Record $50B in Q1 2024",
        description:
          "Artificial intelligence companies continue to dominate venture capital funding, with a 40% increase from last year. Generative AI leads the pack with major investments in OpenAI, Anthropic, and other innovators.",
        content: "",
        url: "https://techcrunch.com/2024/03/ai-startup-funding-q1-2024/",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=AI+Startups",
        publishedAt: new Date().toISOString(),
        source: { name: "TechCrunch", url: "#" },
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
        source: { name: "Sifted", url: "#" },
        category: "Green",
      },
      {
        title: "Global Startup Ecosystem Report: Top Cities for Entrepreneurs",
        description:
          "Silicon Valley remains #1, but emerging hubs in Southeast Asia and Latin America are showing rapid growth in startup activity and funding.",
        content: "",
        url: "https://startupgenome.com/report",
        image:
          "https://placehold.co/600x400/1a1a1a/ffffff?text=Startup+Ecosystem",
        publishedAt: new Date().toISOString(),
        source: { name: "Startup Genome", url: "#" },
        category: "World",
      },
      {
        title: "Government Announces $100M Fund for AI Research",
        description:
          "New federal initiative aims to support AI research and development, with focus on ethical AI and practical business applications for startups.",
        content: "",
        url: "https://www.whitehouse.gov/ai-fund",
        image:
          "https://placehold.co/600x400/1a1a1a/ffffff?text=Government+Funding",
        publishedAt: new Date().toISOString(),
        source: { name: "Associated Press", url: "#" },
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
        source: { name: "CB Insights", url: "#" },
        category: "Funding",
      },
      {
        title: "How to Bootstrap Your Startup to $10M Revenue",
        description:
          "Success stories from founders who built profitable businesses without venture capital, and practical lessons for aspiring entrepreneurs.",
        content: "",
        url: "https://www.entrepreneur.com/bootstraping",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Bootstrap",
        publishedAt: new Date().toISOString(),
        source: { name: "Entrepreneur", url: "#" },
        category: "General",
      },
      {
        title: "The Rise of Climate Tech: Solutions for a Sustainable Future",
        description:
          "From carbon capture to sustainable agriculture, climate tech startups are solving real-world problems while building profitable businesses.",
        content: "",
        url: "https://www.forbes.com/climate-tech",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Climate+Tech",
        publishedAt: new Date().toISOString(),
        source: { name: "Forbes", url: "#" },
        category: "Green",
      },
      {
        title: "Government Small Business Grant Programs for 2024",
        description:
          "Complete guide to federal and state grant programs available for small businesses and startups looking for non-dilutive funding.",
        content: "",
        url: "https://www.sba.gov/grants",
        image:
          "https://placehold.co/600x400/1a1a1a/ffffff?text=Business+Grants",
        publishedAt: new Date().toISOString(),
        source: { name: "SBA", url: "#" },
        category: "Government",
      },
      {
        title: "Asian Tech Startups: The Next Silicon Valley?",
        description:
          "Singapore, Bangalore, and Tokyo emerge as major tech hubs, attracting global talent and record-breaking venture capital investments.",
        content: "",
        url: "https://www.bloomberg.com/asia-tech",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Asia+Tech",
        publishedAt: new Date().toISOString(),
        source: { name: "Bloomberg", url: "#" },
        category: "World",
      },
      {
        title: "AI Tools Every Small Business Should Use in 2024",
        description:
          "Practical AI applications for marketing, customer service, inventory management, and financial planning for small business owners.",
        content: "",
        url: "https://www.inc.com/ai-tools",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=AI+Tools",
        publishedAt: new Date().toISOString(),
        source: { name: "Inc. Magazine", url: "#" },
        category: "AI",
      },
      {
        title: "Seed Funding Trends: What's Hot in Early-Stage Investing",
        description:
          "Analysis of emerging sectors attracting seed investors and tips for founders seeking their first round of funding.",
        content: "",
        url: "https://www.crunchbase.com/seed-trends",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Seed+Funding",
        publishedAt: new Date().toISOString(),
        source: { name: "Crunchbase", url: "#" },
        category: "Funding",
      },
      {
        title: "Green Business Practices That Boost Profitability",
        description:
          "Case studies showing how sustainable practices actually reduce costs and increase customer loyalty for businesses of all sizes.",
        content: "",
        url: "https://www.greenbiz.com/profitability",
        image: "https://placehold.co/600x400/1a1a1a/ffffff?text=Green+Business",
        publishedAt: new Date().toISOString(),
        source: { name: "GreenBiz", url: "#" },
        category: "Green",
      },
    ];
  };

  // Fetch news from MarketAux API
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const MARKETAUX_API_KEY = "zTUT2mLNqkZNneoAeRTKA2nfFz4NsTQ0ewJx4bnp";

      // Business-focused search queries
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

      // MarketAux API call
      const url = `https://api.marketaux.com/v1/news/all?search=${encodeURIComponent(randomQuery)}&language=en&limit=30&api_token=${MARKETAUX_API_KEY}`;

      console.log("Fetching business news from MarketAux...");
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Filter out stock/crypto related content
        const excludeKeywords = [
          "stock",
          "crypto",
          "bitcoin",
          "ethereum",
          "trading",
          "nasdaq",
          "nyse",
          "sell",
          "buy",
          "price target",
          "analyst",
          "dividend",
          "robotaxi",
          "fsd",
          "tesla stock",
          "tsla",
          "bearish",
          "bullish",
        ];

        const filteredData = data.data.filter((article: any) => {
          const content = (
            article.title +
            " " +
            (article.description || "")
          ).toLowerCase();
          return !excludeKeywords.some((keyword) =>
            content.includes(keyword.toLowerCase()),
          );
        });

        if (filteredData.length > 0) {
          const formattedArticles: NewsArticle[] = filteredData
            .slice(0, 20)
            .map((article: any) => ({
              title: article.title || "Business News",
              description:
                article.description ||
                article.snippet ||
                "No description available",
              content: article.description || article.snippet || "",
              url: article.url || "#",
              image:
                article.image_url ||
                "https://placehold.co/600x400/1a1a1a/ffffff?text=VENTURA+Business+News",
              publishedAt: article.published_at || new Date().toISOString(),
              source: {
                name: article.source || "Business News",
                url: article.url || "#",
              },
              category: determineCategory(
                article.title +
                  " " +
                  (article.description || article.snippet || ""),
              ),
            }));

          setArticles(formattedArticles);
          setError(null);
        } else {
          setArticles(getCuratedBusinessNews());
          setError("Showing curated business news and startup stories.");
        }
      } else {
        setArticles(getCuratedBusinessNews());
        setError("Showing curated business news. Live updates coming soon.");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setArticles(getCuratedBusinessNews());
      setError(
        "Showing curated business news. Connect to live feed for updates.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh news
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
  };

  // Filter articles by category
  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const categories = [
    "all",
    "AI",
    "World",
    "Green",
    "Government",
    "Funding",
    "General",
  ];

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="trendsApp">
        {/* Sidebar */}
        <aside className="trendsSidebar">
          <div className="trendsLogo">
            <Link href="/feed" className="settings-logoLink">
              <img
                src="/newhite.png"
                alt="VENTURA"
                className="settings-logoImage"
              />
            </Link>
          </div>

          <nav className="trendsSidebarNav">
            <Link href="/feed" className="trendsNavItem">
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link href="/partners" className="trendsNavItem">
              <Users size={18} />
              <span>Partners</span>
              {totalPendingRequests > 0 && (
                <span className="trendsNavBadge">{totalPendingRequests}</span>
              )}
            </Link>
            <Link href="/messages" className="trendsNavItem">
              <MessageSquare size={18} />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="trendsNavBadge">{unreadCount}</span>
              )}
            </Link>
            <Link href="/trends" className="trendsNavItem active">
              <TrendingUp size={18} />
              <span>Trends</span>
            </Link>
            <Link href="/settings" className="trendsNavItem">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            {user.is_admin && (
              <Link href="/admin" className="trendsNavItem">
                <LayoutDashboard size={18} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <div className="trendsSidebarFooter">
            <div className="trendsUserInfo">
              <div className="trendsUserAvatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="trendsUserDetails">
                <span className="trendsUserName">{user.name}</span>
                <span className="trendsUserRole">
                  {user.role === "innovator" ? "Innovator" : "Investor"}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="trendsLogoutBtn">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="trendsMainContent">
          <div className="trendsHeaderRow">
            <div>
              <h1>Business Trends</h1>
              <p>Stay updated with the latest startup and investment news</p>
            </div>
            <button
              onClick={handleRefresh}
              className="trendsRefreshBtn"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 size={16} className="trendsSpin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Refresh News
                </>
              )}
            </button>
          </div>

          {/* Category Filters */}
          <div className="trendsFiltersRow">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`trendsFilterBtn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all"
                  ? "All"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* News List */}
          <div className="trendsNewsContainer">
            {loading ? (
              <div className="trendsCenterLoader">
                <div className="trendsSpinner"></div>
                <p>Loading latest business news...</p>
                <p className="trendsLoadingSubtext">
                  Fetching startup and investment trends
                </p>
              </div>
            ) : error ? (
              <div className="trendsErrorState">
                <AlertCircle size={48} />
                <p>{error}</p>
                <button onClick={fetchNews} className="trendsRetryBtn">
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="trendsEmptyState">
                <Newspaper size={48} />
                <p>
                  No articles found in{" "}
                  {selectedCategory === "all"
                    ? "any category"
                    : selectedCategory}
                  .
                </p>
              </div>
            ) : (
              <>
                {refreshing && (
                  <div className="trendsRefreshOverlay">
                    <div className="trendsRefreshLoader">
                      <Loader2 size={32} className="trendsSpin" />
                      <p>Updating news...</p>
                    </div>
                  </div>
                )}
                <div className="trendsNewsGrid">
                  {filteredArticles.map((article, index) => (
                    <div key={index} className="trendsNewsCard">
                      <div className="trendsNewsImage">
                        <img
                          src={article.image}
                          alt={article.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600x400/1a1a1a/ffffff?text=VENTURA+Business+News";
                          }}
                        />
                        <span className="trendsNewsCategory">
                          {getCategoryIcon(article.category || "General")}
                          {article.category}
                        </span>
                      </div>
                      <div className="trendsNewsContent">
                        <h3 className="trendsNewsTitle">{article.title}</h3>
                        <p className="trendsNewsDescription">
                          {article.description.length > 150
                            ? article.description.substring(0, 150) + "..."
                            : article.description}
                        </p>
                        <div className="trendsNewsMeta">
                          <span className="trendsNewsSource">
                            {article.source.name}
                          </span>
                          <span className="trendsNewsDate">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="trendsNewsLink"
                          >
                            Read more <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
