import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { MdDeleteOutline } from "react-icons/md";
import { motion } from "framer-motion";
import { axiosPublic } from "../../../../hooks/axiosPublic";
import Loader from "../../../../components/ui/Loader";

/* ── Types ── */
type Article = {
  _id: string;
  title: string;
  img: { url: string };
  createdAt: string;
};
type Resp = { data: Article[]; pagination?: { total: number; pages: number } };

/* ── API ── */
const PAGE_SIZE = 10;
const fetch = (page: number, search = "") =>
  axiosPublic
    .get<Resp>("/api/article-judaism", {
      params: { page, limit: PAGE_SIZE, search },
    })
    .then((r) => r.data);

const del = (id: string) =>
  axiosPublic.delete(`/api/article-judaism/${id}`).then((r) => r.data);

/* ── Component ── */
const ManageJudaism = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["articles", page, search],
    queryFn: () => fetch(page, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: del,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed"),
  });

  const confirmDel = (id: string, title: string) =>
    Swal.fire({
      title: "Delete?",
      text: `"${title}" gone forever!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes!",
    }).then((r) => r.isConfirmed && remove(id));

  const articles = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const pages = data?.pagination?.pages ?? 1;

  /* smart pagination – array functions */
  const pageNums = () =>
    Array.from({ length: pages }, (_, i) => i + 1)
      .map((n) =>
        n === 1 || n === pages || Math.abs(n - page) <= 1
          ? n
          : n === page - 2 || n === page + 2
          ? "..."
          : null
      )
      .filter((n): n is number | "..." => n !== null);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (isPending) return <Loader />;
  if (isError)
    return <div className="text-center py-12 text-red-600">Failed</div>;

  /* Button type */
  type Btn = {
    label: string | number;
    onClick: () => void;
    disabled: boolean;
    active?: boolean;
  };

  /* Unified pagination array – no null */
  const pagBtns: Btn[] = [
    {
      label: "Prev",
      onClick: () => setPage((p) => p - 1),
      disabled: page === 1,
    },
    ...pageNums().map((n) => ({
      label: n,
      onClick: () => typeof n === "number" && setPage(n),
      disabled: n === "...",
      active: n === page,
    })),
    {
      label: "Next",
      onClick: () => setPage((p) => p + 1),
      disabled: page === pages,
    },
  ];

  refetch();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row gap-3 justify-between"
      >
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Articles judaism</h2>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </motion.header>

      {articles.length === 0 ? (
        <p className="text-center py-12 text-gray-500">No articles</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  {["#", "Img", "Title", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-sm font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.map((a, i) => (
                  <motion.tr
                    key={a._id}
                    layout
                    className="border-t hover:bg-gray-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-5 py-3 text-sm">
                      {(page - 1) * 10 + i + 1}
                    </td>
                    <td className="px-5 py-3">
                      <img
                        src={a.img.url}
                        alt=""
                        className="w-14 h-9 object-cover rounded"
                      />
                    </td>
                    <td className="px-5 py-3 text-sm font-medium max-w-xs truncate">
                      {a.title}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {fmt(a.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => confirmDel(a._id, a.title)}
                        disabled={deleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <MdDeleteOutline />
                        {deleting ? "…" : "Del"}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {articles.map((a, i) => (
              <motion.div
                key={a._id}
                layout
                className="p-4 bg-white dark:bg-slate-800 border rounded-lg flex gap-3"
              >
                <img
                  src={a.img.url}
                  alt=""
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">#{i + 1}</p>
                  <h3 className="font-semibold line-clamp-2">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {fmt(a.createdAt)}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => confirmDel(a._id, a.title)}
                  disabled={deleting}
                  className="self-center px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg"
                >
                  <MdDeleteOutline />
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
              <span>
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of{" "}
                {total}
              </span>
              <div className="flex gap-1">
                {pagBtns.map(({ label, onClick, disabled, active }, i) => (
                  <motion.button
                    key={i}
                    whileHover={disabled ? {} : { scale: 1.05 }}
                    whileTap={disabled ? {} : { scale: 0.95 }}
                    onClick={onClick}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      active
                        ? "bg-emerald-600 text-white"
                        : disabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "bg-white dark:bg-slate-800 border hover:bg-gray-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageJudaism;
