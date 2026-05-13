import { Spin, Empty, message } from "antd";
import moment from "moment";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import FormInputPost from "../../components/form/FormInputPost";
import avatar from "../../assets/icon/user.png";
import useAuth from "../../hook/useAuth";

export default function Post() {
  const [isOpenModalInputPost, setIsOpenModalInputPost] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuth();

  const { data: dataPost, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!user?.user?.id || !user?.user?.role) {
        throw new Error("User ID or role not found");
      }

      const endpoint =
        user.user.role === "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/post/orang-tua/${user.user.id}`
          : user.user.role === "TENAGA_KESEHATAN"
          ? `${process.env.REACT_APP_BASE_URL}/api/post/tenaga-kesehatan/${user.user.id}`
          : null;

      if (!endpoint) throw new Error("Invalid user role");

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const jsonData = await response.json();
      return jsonData.data.sort((a, b) => b.time.localeCompare(a.time));
    },
    onError: (err) =>
      messageApi.error(err.message || "Gagal mengambil data postingan"),
    enabled: !!user?.user?.id && !!user?.user?.role,
  });

  const posts = dataPost?.map((item) => ({
    href: `/tenkes/balita/${item.post_id}`,
    title: item.title,
    nama_posyandu: item.posyandu,
    description: item.nama,
    role: item.role,
    content: moment(item.time).format("DD MMMM YYYY"),
    jawaban: item.jawaban_tenaga_kesehatan || [],
    id: item.post_id,
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      {contextHolder}
      <Navbar isLogin />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 font-display text-neutral-900">
              Forum Tanya Jawab
            </h1>
            <p className="text-caption text-neutral-500 mt-1">
              Tanya tenaga kesehatan tentang perkembangan anak Anda
            </p>
          </div>
          {user?.user?.role === "ORANG_TUA" && (
            <button
              onClick={() => setIsOpenModalInputPost(true)}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-tap rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-raised active:scale-[0.98] transition-all duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
            >
              + Tulis Pertanyaan
            </button>
          )}
        </header>

        {postsLoading && (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}

        {!postsLoading && (!posts || posts.length === 0) && (
          <div className="bg-white border border-neutral-200 rounded-card py-12 text-center">
            <Empty
              description={
                <span className="text-base text-neutral-600">
                  Belum ada pertanyaan
                </span>
              }
            />
          </div>
        )}

        <div className="space-y-3">
          {(posts ?? []).map((item) => (
            <article
              key={item.id}
              className="bg-white border border-neutral-200 rounded-card p-5 transition-all duration-200 ease-out-quart hover:border-primary-200 hover:shadow-card"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={avatar}
                  alt=""
                  className="w-10 h-10 rounded-full bg-neutral-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-neutral-900">
                    {item.description}
                  </p>
                  <p className="text-xs text-neutral-500">
                    <span
                      className={`font-medium ${
                        item.role === "ORANG_TUA"
                          ? "text-primary-700"
                          : "text-accent"
                      }`}
                    >
                      {item.role === "ORANG_TUA"
                        ? "Orang Tua"
                        : "Tenaga Kesehatan"}
                    </span>
                    {item.nama_posyandu ? ` · ${item.nama_posyandu}` : ""} ·{" "}
                    {item.content}
                  </p>
                </div>
              </div>

              <h3 className="text-h3 font-display text-neutral-900 mb-3">
                <Link to={item.href} className="hover:text-primary-700 transition-colors">
                  {item.title}
                </Link>
              </h3>

              <Link
                to={item.href}
                className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary-700 hover:text-primary-800 transition-colors"
              >
                💬 Jawab pertanyaan →
              </Link>

              {item.jawaban.length > 0 && (
                <div className="mt-4 p-4 bg-primary-50 rounded-button space-y-2">
                  <p className="text-caption font-semibold text-neutral-900">
                    Jawaban:
                  </p>
                  {item.jawaban.map((j, idx) => (
                    <div
                      key={idx}
                      className="pb-2 border-b border-primary-100 last:border-0 last:pb-0"
                    >
                      <p className="text-base text-neutral-700">
                        <strong className="font-semibold">{j.nama}</strong>:{" "}
                        {j.content}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 tabular-nums">
                        {moment(j.waktu).format("DD MMM YYYY HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <FormInputPost
        key={isOpenModalInputPost.toString()}
        isOpen={isOpenModalInputPost}
        onCancel={() => setIsOpenModalInputPost(false)}
      />
    </div>
  );
}
