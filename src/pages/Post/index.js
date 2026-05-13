import { Spin, Empty, message } from "antd";
import moment from "moment";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageCircle, Plus, ArrowRight } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
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
    <div className="min-h-screen bg-faint-fog">
      {contextHolder}
      <Navbar isLogin />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <header className="flex items-center justify-between gap-[17px] flex-wrap">
          <div>
            <h1 className="text-heading-lg font-bold text-deep-slate">
              Forum Tanya Jawab
            </h1>
            <p className="text-body-sm text-graphite mt-1">
              Tanyakan kepada tenaga kesehatan tentang perkembangan anak Anda.
            </p>
          </div>
          {user?.user?.role === "ORANG_TUA" && (
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={20} strokeWidth={1.75} />}
              onClick={() => setIsOpenModalInputPost(true)}
            >
              Tulis Pertanyaan
            </Button>
          )}
        </header>

        {postsLoading && (
          <div className="flex justify-center py-[50px]">
            <Spin size="large" />
          </div>
        )}

        {!postsLoading && (!posts || posts.length === 0) && (
          <div className="bg-white border border-light-ash rounded-default py-[50px] text-center">
            <Empty
              description={
                <span className="text-body-sm text-graphite">
                  Belum ada pertanyaan
                </span>
              }
            />
          </div>
        )}

        <div className="space-y-[17px]">
          {(posts ?? []).map((item) => (
            <article
              key={item.id}
              className="bg-white border border-light-ash rounded-default p-[25px] transition-colors duration-150 ease-out-quart hover:border-graphite/30"
            >
              <div className="flex items-start gap-[13px] mb-[17px]">
                <img
                  src={avatar}
                  alt=""
                  className="w-10 h-10 rounded-full bg-polar-mist"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-deep-slate">
                    {item.description}
                  </p>
                  <p className="text-caption text-graphite">
                    <span
                      className={`font-medium ${
                        item.role === "ORANG_TUA"
                          ? "text-primary-600"
                          : "text-deep-slate"
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

              <h3 className="text-heading font-semibold text-deep-slate mb-[13px]">
                <Link
                  to={item.href}
                  className="hover:text-primary-600 transition-colors"
                >
                  {item.title}
                </Link>
              </h3>

              <Link
                to={item.href}
                className="inline-flex items-center gap-[6px] text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <MessageCircle size={16} strokeWidth={1.75} />
                Jawab pertanyaan
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>

              {item.jawaban.length > 0 && (
                <div className="mt-[17px] p-[17px] bg-polar-mist rounded-default space-y-[13px]">
                  <p className="text-caption font-semibold uppercase tracking-wider text-deep-slate">
                    Jawaban
                  </p>
                  {item.jawaban.map((j, idx) => (
                    <div
                      key={idx}
                      className="pb-[13px] border-b border-light-ash last:border-0 last:pb-0"
                    >
                      <p className="text-body-sm text-deep-slate">
                        <strong className="font-semibold">{j.nama}</strong>:{" "}
                        {j.content}
                      </p>
                      <p className="text-caption text-graphite mt-1 tabular-nums">
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
