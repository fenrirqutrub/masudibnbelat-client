import { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  UserRound,
  MessageCircle,
  Eye,
  Send,
  Share2,
  AlertCircle,
} from "lucide-react";
import { axiosPublic } from "../../hooks/axiosPublic";

// ── Types ──
type Article = {
  _id: string;
  title: string;
  description: string;
  img: { url: string };
  createdAt: string;

  views: number;

  comments?: number;
};

type Comment = {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
};

// ── Helper ──
const ago = (date: string): string => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  const units = [
    { label: "y", sec: 31536e3 },
    { label: "mo", sec: 2592e3 },
    { label: "d", sec: 86400 },
    { label: "h", sec: 3600 },
    { label: "m", sec: 60 },
  ];
  for (const { label, sec } of units) {
    if (diff >= sec) return `${Math.floor(diff / sec)}${label} ago`;
  }
  return "just now";
};

// ── Main Component ──
export default function KobitaCardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 100, left: 100, behavior: "smooth" });
  }, []);

  // Fetch Article
  const {
    data: article,
    isPending,
    isError,
    error,
  } = useQuery<Article>({
    queryKey: ["article", id],
    queryFn: async () => {
      const { data } = await axiosPublic.get<{
        success: boolean;
        data: Article;
        message?: string;
      }>(`/api/article-kobita/${id}`);
      if (!data.success) throw new Error(data.message || "Not found");
      return data.data;
    },
    retry: 1,
    enabled: !!id,
  });

  // Fetch Comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await axiosPublic.get<{
        success: boolean;
        data: Comment[];
      }>(`/api/article-kobita/${id}/comments`);
      return data.success ? data.data : [];
    },
    enabled: !!article,
  });

  // Increment view
  useEffect(() => {
    if (id && article) {
      void axiosPublic.post(`/api/article-kobita/${id}/view`).catch(() => {});
    }
  }, [id, article]);

  // Comment Mutation
  const { mutate: addComment, isPending: commenting } = useMutation({
    mutationFn: (text: string) =>
      axiosPublic.post<{ success: boolean; data: Comment }>(
        `/api/article-kobita/${id}/comments`,
        { text }
      ),
    onSuccess: (res) => {
      qc.setQueryData<Comment[]>(["comments", id], (old = []) => [
        res.data.data,
        ...old,
      ]);
      if (textareaRef.current) textareaRef.current.value = "";
      toast.success("Comment added!");
    },
    onError: () => toast.error("Failed to add comment"),
  });

  // Share
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
      if (id)
        void axiosPublic
          .post(`/api/article-kobita/${id}/share`)
          .catch(() => {});
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Error State
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0D0E14] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Article Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error instanceof Error
              ? error.message
              : "This article doesn't exist"}
          </p>
          <button
            onClick={() => navigate("/articles/lifestyle")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  if (isPending || !article) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0E14] py-8 px-4">
      <div className="max-w-5xl mx-auto mt-20">
        <Link
          to="/articles/lifestyle"
          className="inline-flex items-center gap-2 text-emerald-600 hover:underline mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Articles
        </Link>

        <img
          src={article.img.url}
          alt={article.title}
          className="w-full h-96 object-cover rounded-xl shadow-2xl"
        />

        <h1 className="mt-8 text-4xl font-bold text-gray-900 dark:text-white">
          {article.title}
        </h1>

        <div className="mt-6 flex flex-wrap justify-between items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 border rounded-full">
                <UserRound className="w-5 h-5" />
              </div>
              <span className="font-medium">Masud ibn Belat</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <span>•</span>
            <span className="text-emerald-600 font-medium">
              {ago(article.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-5 h-5" />
              {comments.length}
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-5 h-5" />
              {article.views}
            </div>
          </div>
        </div>

        <article className="mt-10 prose prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
          {article.description}
        </article>

        <div className="flex justify-center gap-6 py-6 border-y border-gray-200 dark:border-slate-800 my-10">
          <button
            onClick={() => textareaRef.current?.focus()}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <MessageCircle className="w-5 h-5" /> Comment
          </button>
          <button
            onClick={share}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            Comments ({comments.length})
          </h2>
          <textarea
            ref={textareaRef}
            placeholder="Write your comment..."
            rows={3}
            className="w-full p-4 border border-gray-300 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-800"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                const text = e.currentTarget.value.trim();
                if (text) addComment(text);
              }
            }}
          />
          <button
            onClick={() => {
              const text = textareaRef.current?.value.trim();
              if (text) addComment(text);
            }}
            disabled={commenting}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {commenting ? "Posting..." : "Post Comment"}{" "}
            <Send className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4 mt-8">
                {comments.map((c) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-lg flex gap-4 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                      <UserRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {c.author}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ago(c.createdAt)}
                      </p>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {c.text}
                      </p>
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
}

// Loading Component
const Loading = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#0D0E14] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600"></div>
  </div>
);
