/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router";
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Eye,
  Send,
  Share2,
  UserRound,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosPublic } from "../../../hooks/axiosPublic";
import { motion, AnimatePresence } from "framer-motion";

// ────────────────────── TYPES ──────────────────────
interface Technology {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  createdAt: string;
  updatedAt?: string;
  timeAgo?: string;

  views?: number;

  comments?: number;
}

interface Comment {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ────────────────────── HELPER ──────────────────────
const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const { label, seconds } of intervals) {
    const count = Math.floor(diffInSeconds / seconds);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
};

// ────────────────────── MAIN COMPONENT ──────────────────────
const MotivationCardDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateArticle = location.state?.article as Technology | undefined;

  const [article, setArticle] = useState<Technology | null>(
    stateArticle ?? null
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(!stateArticle);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ── INCREMENT VIEW ─────────────────────────────────────
  const incrementView = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axiosPublic.post<ApiResponse<{ views: number }>>(
        `/api/article-motivation/${id}/view`
      );
      if (data.success) {
        setArticle((prev) =>
          prev ? { ...prev, views: data.data.views } : prev
        );
      }
    } catch {
      // view count is not critical
    }
  }, [id]);

  // ── FETCH ARTICLE ─────────────────────────────────────
  useEffect(() => {
    if (stateArticle) {
      setArticle(stateArticle);
      setLoading(false);
      incrementView();
      window.scrollTo({
        top: 100,
        left: 100,
        behavior: "smooth",
      });
      return;
    }

    const fetchArticle = async () => {
      if (!id) return setError("Invalid article ID");

      try {
        setLoading(true);
        const res = await axiosPublic.get<ApiResponse<Technology>>(
          `/api/article-motivation/${id}`
        );

        if (res.data.success && res.data.data) {
          setArticle(res.data.data);
          incrementView();
        } else {
          setError(res.data.message ?? "Article not found");
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? "Failed to load article";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, stateArticle, incrementView]);

  // ── FETCH COMMENTS ────────────────────────────────────
  useEffect(() => {
    if (!article?._id) return;

    const fetchComments = async () => {
      try {
        const res = await axiosPublic.get<ApiResponse<Comment[]>>(
          `/api/article-motivation/${article._id}/comments`
        );
        if (res.data.success) {
          setComments(res.data.data ?? []);
        }
      } catch {
        console.error("Failed to load comments");
      }
    };

    fetchComments();
  }, [article?._id]);

  // ── ADD COMMENT ───────────────────────────────────────
  const addComment = async () => {
    if (!id || !commentText.trim()) return;
    setCommenting(true);
    try {
      const res = await axiosPublic.post<ApiResponse<Comment>>(
        `/api/article-motivation/${id}/comments`,
        { text: commentText.trim() }
      );
      if (res.data.success) {
        setComments((prev) => [res.data.data, ...prev]);
        setCommentText("");
        toast.success("Comment added!");
        commentInputRef.current?.focus();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to post comment");
    } finally {
      setCommenting(false);
    }
  };

  // ── SHARE ─────────────────────────────────────────────
  const handleShare = async () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");

    if (!id) return;
    try {
      await axiosPublic.post(`/api/article-motivation/${id}/share`);
    } catch {
      // optional endpoint
    }
  };

  // ── RENDER STATES ─────────────────────────────────────
  if (loading) return <p>loading</p>;
  if (error || !article)
    return <ErrorState message={error ?? "Article not found"} />;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50 dark:bg-[#0D0E14]">
      <div className="max-w-5xl mx-auto mt-20">
        {/* Back Button */}
        <Link
          to="/articles/technology"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Articles
        </Link>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-xl">
          <img
            src={article.img.url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg">
            {article.title}
          </h1>
        </div>

        {/* Meta Info */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-[#abc2d3]/80">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="border border-slate-400 rounded-full p-2">
                <UserRound className="w-5 h-5" />
              </div>
              <span className="font-medium">Masud ibn Belat</span>
            </div>
            <span className="hidden sm:inline font-bold">•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <span className="hidden sm:inline font-bold">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {article.timeAgo ?? formatTimeAgo(article.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">{comments.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">{article.views ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="mt-8 prose prose-lg dark:prose-invert max-w-none">
          <div className="p-6 sm:p-8">
            <p className="text-gray-700 dark:text-[#abc2d3] leading-relaxed whitespace-pre-wrap">
              {article.description}
            </p>
          </div>
        </article>

        <div className="mt-6 flex items-center justify-center gap-6 p-4 border-y border-gray-200 dark:border-slate-900">
          <button
            onClick={() => commentInputRef.current?.focus()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comments ({comments.length})
          </h2>

          {/* Add Comment */}
          <div className="p-5 mb-6">
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 border border-gray-300 dark:border-slate-900 rounded-lg bg-transparent text-gray-800 dark:text-[#abc2d3] placeholder-gray-500 outline-none resize-none"
              rows={3}
            />
            <button
              onClick={addComment}
              disabled={commenting || !commentText.trim()}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-[#0D0E14] disabled:border disabled:border-red-500 disabled:cursor-not-allowed disabled:text-red-400 font-medium rounded-md transition-colors"
            >
              {commenting ? "Posting..." : "Post Comment"}
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Comment List */}
          <AnimatePresence>
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, idx) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <UserRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comment.author}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(comment.createdAt)}
                        </p>
                        <p className="mt-2 text-gray-700 dark:text-[#abc2d3]">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

// ────────────────────── LOADING & ERROR ──────────────────────

const ErrorState = ({ message }: { message: string }) => (
  <div className="py-16 px-4 text-center min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
    <div className="max-w-md mx-auto">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
          Oops!
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">{message}</p>
        <Link
          to="/articles/technology"
          className="inline-block px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Back to Articles
        </Link>
      </div>
    </div>
  </div>
);

export default MotivationCardDetails;
