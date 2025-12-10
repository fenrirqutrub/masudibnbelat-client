import { MessageCircle, Eye } from "lucide-react";
import { Link } from "react-router";

interface Technology {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  createdAt: string;
  timeAgo?: string;

  views?: number;
  comments?: number;
}

interface TechnologyCardProps {
  article: Technology;
}

const truncateText = (text: string, maxLength: number = 120): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
};

const JudaismCard = ({ article }: TechnologyCardProps) => {
  return (
    <Link
      to={`/religion/judaism/${article._id}`}
      state={{ article }}
      className="group block"
    >
      <div className="bg-white dark:bg-[#0D0E14] rounded overflow-hidden transition-all duration-500 border border-gray-200 dark:border-slate-800 h-full flex flex-col">
        <div className="relative overflow-hidden h-48">
          <img
            src={article.img.url}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {article.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
            {truncateText(article.description, 150)}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4">
              {article.timeAgo || "Just now"}
            </p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4">
              Read More
            </span>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 mb-4" />

          <div className="flex items-center justify-around">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {article.comments || 0}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{article.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JudaismCard;
