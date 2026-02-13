// hooks/useShare.ts
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

interface UseShareOptions {
  title?: string;
  description?: string;
  categorySlug?: string;
  articleSlug?: string;
}

export const useShare = ({
  title,
  description = "এই আর্টিকেলটি দেখুন",
  categorySlug,
  articleSlug,
}: UseShareOptions = {}) => {
  const finalUrl = useMemo(() => {
    if (categorySlug && articleSlug) {
      return `${window.location.origin}/articles/${categorySlug}/${articleSlug}`;
    }
    // fallback: current clean URL without query params
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url.toString();
  }, [categorySlug, articleSlug]);

  const handleShare = useCallback(async () => {
    const shareData: ShareData = {
      title: title || "একটি চমৎকার আর্টিকেল",
      text: description,
      url: finalUrl,
    };

    // Native Share (mobile/desktop যেখানে সমর্থন করে)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("শেয়ার করা হয়েছে!");
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Native share ব্যর্থ:", err);
        }
      }
    }

    // Fallback: লিঙ্ক কপি
    try {
      await navigator.clipboard.writeText(finalUrl);
      toast.success("লিঙ্ক কপি করা হয়েছে!");
    } catch (err) {
      console.error("কপি ব্যর্থ:", err);
      toast.error("লিঙ্ক কপি করা যায়নি");
    }
  }, [finalUrl, title, description]);

  return { handleShare };
};
