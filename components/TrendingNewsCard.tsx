"use client";
import { TrendingUp, ExternalLink } from "lucide-react";
import styles from "./TrendingNewsCard.module.css";

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

interface Props {
  article: NewsArticle;
}

export default function TrendingNewsCard({ article }: Props) {
  const category = article.category || "General";

  const getLabelClass = () => {
    switch (category) {
      case "AI": return styles.newsLabelAi;
      case "World": return styles.newsLabelWorld;
      case "Green": return styles.newsLabelGreen;
      case "Government": return styles.newsLabelGovernment;
      case "Funding": return styles.newsLabelFunding;
      default: return styles.newsLabelTrending;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60 / 60);
    if (diff < 1) return "just now";
    if (diff < 24) return `${diff}h ago`;
    if (diff < 48) return "yesterday";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const truncatedDescription =
    article.description?.length > 250
      ? article.description.substring(0, 250) + "..."
      : article.description || "No description available.";

  return (
    <article className={styles.newsCard}>
      {/* Top bar: label + source */}
      <div className={styles.newsTopBar}>
        <span className={`${styles.newsLabel} ${getLabelClass()}`}>
          <TrendingUp size={13} />
          Trending News
        </span>
        <span className={styles.newsSource}>{article.source.name}</span>
      </div>

      {/* Headline (title) — first */}
      <h3 className={styles.newsHeadline}>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>

      {/* Image — second */}
      <div className={styles.thumbnail}>
        <img
          src={
            article.image ||
            "https://placehold.co/600x400/1a1a1a/ffffff?text=VENTURA+News"
          }
          alt={article.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/600x400/1a1a1a/ffffff?text=VENTURA+News";
          }}
        />
      </div>

      {/* Description — third */}
      <p className={styles.newsDescription}>{truncatedDescription}</p>

      {/* Footer */}
      <div className={styles.newsFooter}>
        <span className={styles.newsDate}>
          {formatDate(article.publishedAt)}
        </span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.readMoreBtn}
        >
          Read more <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}
