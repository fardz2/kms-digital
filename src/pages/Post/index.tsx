import { Empty } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageCircle, Plus, ArrowRight } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import FormInputPost from "../../components/form/FormInputPost";
import avatar from "../../assets/icon/user.png";
import { useSession } from "../../features/auth/useSession";
import { usePostList } from "../../queries/usePostQueries";

export default function Post() {
  const [isOpenModalInputPost, setIsOpenModalInputPost] = useState(false);
  const { user, role } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'saya' ? 'saya' : 'semua';

  const { data: dataPost, isLoading: postsLoading } = usePostList();

  const isOrangTua = role === "ORANG_TUA";
  const detailBase = isOrangTua ? "/orangtua/forum" : "/tenkes/balita";

  const posts = (dataPost ?? []).map((item) => ({
    href: `${detailBase}/${item.post_id}`,
    title: item.title,
    nama_posyandu: item.posyandu,
    description: item.nama,
    role: item.role,
    content: dayjs(item.time).format("DD MMMM YYYY"),
    jawaban: item.jawaban_tenaga_kesehatan || [],
    id: item.post_id,
    user_id: item.user_id ?? item.id_user,
  }));

  const filteredPosts =
    isOrangTua && tab === 'saya' && user?.id
      ? posts.filter((p) => String(p.user_id ?? '') === String(user.id))
      : posts;

  return (
    <div className="min-h-screen bg-faint-fog">
      <Navbar isLogin />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <header className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[13px]">
              Forum
            </p>
            <h1 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
              Tanya Jawab
            </h1>
            <p className="text-body-lg text-graphite mt-[13px] max-w-[560px]">
              Tanyakan kepada tenaga kesehatan tentang perkembangan anak Anda.
            </p>
          </div>
          {isOrangTua && (
            <Button
              variant="primary"
              size="lg"
              leadingIcon={<Plus size={20} strokeWidth={2} />}
              onClick={() => setIsOpenModalInputPost(true)}
            >
              Tulis Pertanyaan
            </Button>
          )}
        </header>

        {isOrangTua && (
          <div className="flex gap-[8px] border-b border-light-ash">
            {[
              { key: 'semua', label: 'Semua' },
              { key: 'saya', label: 'Punya Saya' },
            ].map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    setSearchParams(t.key === 'semua' ? {} : { tab: t.key })
                  }
                  className={`px-[17px] py-[13px] text-body-sm font-semibold transition-colors border-b-2 -mb-px ${
                    active
                      ? 'text-primary-600 border-primary-500'
                      : 'text-graphite border-transparent hover:text-deep-slate'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {postsLoading && (
          <div className="flex flex-col gap-[13px]">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        )}

        {!postsLoading && filteredPosts.length === 0 && (
          <div className="bg-white border border-light-ash rounded-default py-[50px] px-[25px] text-center space-y-[17px]">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-body-sm text-graphite">
                  {tab === 'saya'
                    ? 'Anda belum pernah menulis pertanyaan'
                    : 'Belum ada pertanyaan di forum'}
                </span>
              }
            />
            {isOrangTua && (
              <Button
                variant="primary"
                size="md"
                leadingIcon={<Plus size={18} strokeWidth={2} />}
                onClick={() => setIsOpenModalInputPost(true)}
              >
                Tulis Pertanyaan Pertama
              </Button>
            )}
          </div>
        )}

        <div className="space-y-[17px]">
          {filteredPosts.map((item) => (
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
                  {item.jawaban.map((j, idx) => {
                    const ts = j.waktu ?? j.time ?? j.created_at ?? j.tanggal;
                    const valid = ts && dayjs(ts).isValid();
                    const stableKey =
                      j.comment_id ?? j.id ?? `${item.id}-${ts ?? idx}`;
                    return (
                      <div
                        key={stableKey}
                        className="pb-[13px] border-b border-light-ash last:border-0 last:pb-0"
                      >
                        <p className="text-body-sm text-deep-slate">
                          <strong className="font-semibold">{j.nama}</strong>:{" "}
                          {j.content}
                        </p>
                        {valid && (
                          <p className="text-caption text-graphite mt-1 tabular-nums">
                            {dayjs(ts).format("DD MMM YYYY HH:mm")}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
