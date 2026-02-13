import { Calendar, UserRound, MessageCircle, Eye, Send } from "lucide-react";
import type { BaseArticle } from "../../types/Article.types";
import { formatDate, formatTimeAgo } from "../../utility/Formatters";

// ────────────────────── ARTICLE HEADER COMPONENT ──────────────────────

interface ArticleHeaderProps {
  article: BaseArticle;
  commentsCount: number;
  onShare: () => void;
}

export const ArticleHeader = ({
  article,
  commentsCount,
  onShare,
}: ArticleHeaderProps) => {
  return (
    <>
      {/* Hero Image */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl">
        <img
          src={article.imgUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Title */}
      <div className="mt-4 sm:mt-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg dark:text-white">
          {article.title}
        </h1>
      </div>

      {/* Meta Info */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-[#abc2d3]/80">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="border border-slate-400 dark:border-slate-600 rounded-full p-1.5 sm:p-2">
              <UserRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-medium rubik-bold text-gray-900 dark:text-white">
              Masud ibn Belat
            </span>
          </div>

          <span className="hidden sm:inline font-bold text-gray-400">•</span>

          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {formatDate(article.createdAt, "long")}
            </span>
            <span className="sm:hidden">
              {formatDate(article.createdAt, "short")}
            </span>
          </div>

          <span className="hidden sm:inline font-bold text-gray-400">•</span>

          {/* Time Ago */}
          <span className="text-gray-500 dark:text-gray-600">
            {article.timeAgo ?? formatTimeAgo(article.createdAt)}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Views */}
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{article.views ?? 0}</span>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{commentsCount}</span>
          </div>

          {/* Share */}
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
            aria-label="Share article"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">
              {article.views ? article.views : 0}
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-slate-800 my-6 sm:my-8 w-full" />

      {/* Article Content */}
      <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <div className="p-2 sm:p-3">
          <p className="text-gray-700 dark:text-[#abc2d3] leading-relaxed whitespace-pre-wrap">
            {article.description}
          </p>
        </div>
      </article>

      <div className="border-t border-gray-300 dark:border-slate-800 mt-12 sm:mt-16 mb-6 sm:mb-8 w-full" />
    </>
  );
};
