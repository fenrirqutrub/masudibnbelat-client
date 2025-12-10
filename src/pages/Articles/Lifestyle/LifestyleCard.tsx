import { MessageCircle, Eye, Send } from "lucide-react";
import { Link } from "react-router";

interface Lifestyle {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  createdAt: string;
  timeAgo?: string;
  views?: number;
  comments?: number;
}

interface LifestyleCardProps {
  article: Lifestyle;
}

const truncateText = (text: string, maxLength: number = 120): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
};

const TechnologyCard = ({ article }: LifestyleCardProps) => {
  return (
    <Link
      to={`/articles/lifestyle/${article._id}`}
      state={{ article }}
      className="group block"
    >
      <div className=" rounded overflow-hidden transition-all duration-500 border border-black/5 dark:border-white/5 h-full flex flex-col rubik-regular  hover:shadow-lg">
        <div className="relative overflow-hidden h-48">
          <img
            src={article.img.url}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold rubik-bold mb-3 leading-tight line-clamp-2">
            {article.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1 rubik-regular">
            {truncateText(article.description, 150)}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-300 dark:text-gray-700 font-medium mb-4">
              {article.timeAgo || "Just now"}
            </p>
            <span className="text-xs text-gray-300 dark:text-gray-700 font-medium mb-4">
              Read More
            </span>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 mb-4" />

          <div className="flex items-center justify-around">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{article.views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {article.comments || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">
                {(article.views ?? 0) + 10}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TechnologyCard;
