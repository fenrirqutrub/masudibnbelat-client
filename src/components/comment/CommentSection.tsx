import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { useComments } from "../../hooks/Usecomments";
import { MAX_COMMENT_LENGTH } from "../../utility/constants";

// ────────────────────── COMMENT SECTION COMPONENT ──────────────────────

interface CommentSectionProps {
  articleId: string | undefined;
}

export const CommentSection = ({ articleId }: CommentSectionProps) => {
  const {
    comments,
    loadingComments,
    commentText,
    setCommentText,
    addComment,
    handleKeyDown,
    commentInputRef,
    isPosting,
  } = useComments(articleId);

  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Comments ({comments.length})
      </h2>

      {/* Add Comment Form */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          <textarea
            ref={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts... (Press Ctrl+Enter to post)"
            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-slate-800 rounded-lg bg-transparent text-gray-800 dark:text-[#abc2d3] placeholder-gray-500 dark:placeholder-gray-600 outline-none resize-none focus:border-gray-500 dark:focus:border-slate-600 transition-colors text-sm sm:text-base"
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={isPosting}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {commentText.length}/{MAX_COMMENT_LENGTH}
            </div>
            <button
              onClick={addComment}
              disabled={isPosting || !commentText.trim()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 bg-black text-white hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:border disabled:border-black dark:disabled:border-white dark:disabled:text-white dark:text-[#0C0D12]"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Posting...</span>
                </>
              ) : (
                <>
                  <span>Post</span>
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comment List */}
      {loadingComments ? (
        <LoadingComments />
      ) : (
        <AnimatePresence mode="popLayout">
          {comments.length === 0 ? (
            <EmptyComments />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {comments.map((comment, idx) => (
                <CommentItem key={comment._id} comment={comment} index={idx} />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
};

// ────────────────────── SUB-COMPONENTS ──────────────────────

const LoadingComments = () => (
  <div className="flex items-center justify-center py-8 sm:py-12">
    <div className="text-center">
      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400 mx-auto mb-2" />
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Loading comments...
      </p>
    </div>
  </div>
);

const EmptyComments = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-slate-900/30 rounded-lg"
  >
    <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">
      No comments yet. Be the first to share your thoughts!
    </p>
  </motion.div>
);
