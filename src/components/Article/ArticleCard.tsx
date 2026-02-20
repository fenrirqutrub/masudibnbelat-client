import { Link } from "react-router";
import { Eye, MessageCircle, Send, Clock } from "lucide-react";
import type { BaseArticle } from "../../types/Article.types";
import { stripHtml, truncateText } from "../../utility/Formatters";

// ────────────────────── HELPERS ──────────────────────

const calcReadTime = (text: string): number =>
  Math.max(1, Math.ceil(text.split(/\s+/).length / 200));

/**
 * Strips HTML and also replaces math delimiters with a readable placeholder
 * so the card preview doesn't show raw LaTeX or broken KaTeX markup.
 */
function stripHtmlAndMath(html: string): string {
  // Replace display math $$...$$ or \[...\] with [math]
  let result = html
    .replace(/\$\$[\s\S]*?\$\$/g, "[math]")
    .replace(/\\\[[\s\S]*?\\\]/g, "[math]")
    // Replace inline math $...$ or \(...\)
    .replace(/\$[^$\n]+\$/g, "[math]")
    .replace(/\\\([\s\S]*?\\\)/g, "[math]")
    // Remove ce-math elements entirely
    .replace(
      /<[^>]*class="[^"]*ce-math[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/g,
      "[math]",
    );
  return stripHtml(result);
}

// ────────────────────── COMPONENT ──────────────────────

export interface ArticleCardProps {
  article: BaseArticle;
  categoryPath: string;
}

export const ArticleCard = ({ article, categoryPath }: ArticleCardProps) => {
  const plainDesc = stripHtmlAndMath(article.description);
  const readTime = calcReadTime(plainDesc);

  const handleShare = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/articles/${categoryPath}/${article.slug}`;

    if (navigator.share) {
      navigator
        .share({ title: article.title, url, text: plainDesc.slice(0, 100) })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  return (
    <Link
      to={`/articles/${categoryPath}/${article.slug}`}
      state={{ article }}
      className="group block h-full"
    >
      <div
        className={`
          h-full flex flex-col rounded-xl overflow-hidden
          border border-black/5 dark:border-white/5 bg-bgPrimary
          transition-all duration-500
          hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40
          active:scale-[0.99]
        `}
      >
        {/* Image */}
        <div className="relative overflow-hidden h-40 sm:h-48 flex-shrink-0">
          <img
            src={article.imgUrl}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div
            className={`
              absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-500
            `}
          />

          {/* Category badge */}
          {article.category &&
            typeof article.category === "object" &&
            "name" in article.category && (
              <span
                className="
                  absolute top-3 left-3 z-10
                  px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide
                  bg-emerald-600/90 text-white
                "
              >
                {(article.category as { name: string }).name}
              </span>
            )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
          <h3
            className="
              text-lg sm:text-xl font-bold leading-tight mb-2 sm:mb-3
              text-gray-900 dark:text-gray-100
              group-hover:text-emerald-600 dark:group-hover:text-emerald-400
              transition-colors line-clamp-2
            "
          >
            {article.title}
          </h3>

          <p className="text-sm text-textGray leading-relaxed mb-3 sm:mb-4 line-clamp-3 flex-1">
            {truncateText(plainDesc, 150)}
          </p>

          {/* Meta row: read time + "Read More" */}
          <div className="flex items-center justify-between text-xs text-textGray mb-3 sm:mb-4 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{readTime} min read</span>
            </div>
            <span className="text-textPrimary font-medium">Read More →</span>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 mb-3 sm:mb-4" />

          {/* Stats row */}
          <div className="flex items-center justify-around text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>{article.views ?? 0}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span>{article.comments ?? 0}</span>
            </div>

            <button
              onClick={handleShare}
              onTouchEnd={handleShare}
              className="
                flex items-center gap-1.5 text-gray-500 dark:text-gray-400
                hover:text-emerald-600 dark:hover:text-emerald-400
                transition-colors
                touch-manipulation
                min-h-[36px] min-w-[36px] justify-center
              "
              aria-label="Share article"
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>{article.views ? article.views : 0}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
