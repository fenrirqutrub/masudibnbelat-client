import Marquee from "react-fast-marquee";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";
import { Quote as QuoteIcon } from "lucide-react";
import Loader from "../ui/Loader";

interface Quote {
  _id: string;
  content: string;
  author?: string;
  uniqueId: string;
}

const fetchQuotes = async (): Promise<Quote[]> => {
  const res = await axiosPublic.get("/api/quotes");
  return res.data.data ?? [];
};

const Quotes = () => {
  const {
    data: quotes = [],
    isLoading,
    isError,
  } = useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: fetchQuotes,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="py-12 bg-[#E9EBED] dark:bg-[#0C0D12]">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p className="text-lg">
              Failed to load quotes. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <div className="py-12 bg-[#E9EBED] dark:bg-[#0C0D12]">
        <div className="container mx-auto px-4">
          <div className="text-center text-[#0C0D12]/60 dark:text-[#E9EBED]/60">
            <QuoteIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No quotes available yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-[#E9EBED] dark:bg-[#0C0D12] overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0C0D12] dark:text-[#E9EBED] mb-2">
          Quotes Today
        </h2>
        <p className="text-[#0C0D12]/60 dark:text-[#E9EBED]/60 text-lg">
          That will make your day
        </p>
      </div>

      <Marquee
        speed={40}
        gradient={false}
        pauseOnHover={false}
        pauseOnClick={true}
        direction="left"
        className="py-4"
      >
        {quotes.map((quote) => (
          <div
            key={quote.uniqueId || quote._id}
            className="mx-4 sm:mx-6 md:mx-8 inline-block"
          >
            {/* Paper Card with Lines */}
            <div
              className="paper-card relative w-72 sm:w-80 md:w-96 min-h-[200px] p-6 pb-12
                rounded-lg shadow-lg hover:shadow-xl 
                transition-all duration-300
                cursor-grab active:cursor-grabbing select-none
                overflow-hidden
                bg-white dark:bg-[#1a1b23]"
            >
              {/* Horizontal Lines - Light Mode */}
              <div
                className="absolute inset-0 pointer-events-none dark:hidden"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    transparent,
                    transparent 19px,
                    rgba(12, 13, 18, 0.08) 19px,
                    rgba(12, 13, 18, 0.08) 20px
                  )`,
                }}
              />

              {/* Horizontal Lines - Dark Mode */}
              <div
                className="absolute inset-0 pointer-events-none hidden dark:block"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    transparent,
                    transparent 19px,
                    rgba(233, 235, 237, 0.06) 19px,
                    rgba(233, 235, 237, 0.06) 20px
                  )`,
                }}
              />

              {/* Red Margin Line */}
              <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-red-400/60 dark:bg-red-400/40" />

              {/* Quote Content */}
              <div className="relative z-10 pl-6">
                <p
                  className="text-base sm:text-lg whitespace-pre-wrap break-words text-[#0C0D12] dark:text-[#E9EBED]"
                  style={{ lineHeight: "20px" }}
                >
                  "{quote.content}"
                </p>

                {/* Author */}
                {quote.author && quote.author !== "Anonymous" && (
                  <p
                    className="mt-4 text-right text-sm sm:text-base font-medium text-[#0C0D12]/70 dark:text-[#E9EBED]/70"
                    style={{ lineHeight: "20px" }}
                  >
                    — {quote.author}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Quotes;
