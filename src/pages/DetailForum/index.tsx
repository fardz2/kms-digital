import { Form, Input } from "antd";
import moment from "moment";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import avatar from "../../assets/icon/user.png";
import { useToast } from "../../components/ui/Toast";
import { useSession } from "../../features/auth/useSession";
import { usePostDetail } from "../../queries/usePostQueries";
import {
  useCommentList,
  useCreateComment,
} from "../../queries/useCommentQueries";

export default function DetailForum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const [form] = Form.useForm();
  const toast = useToast();

  const { data: detailPost, isLoading: postLoading } = usePostDetail(id);
  const { data: comment = [], isLoading: commentLoading } = useCommentList(id);
  const createComment = useCreateComment();

  const isLoading = postLoading || commentLoading;

  const onFinish = (values) => {
    createComment.mutate(
      { user_id: user?.id, post_id: id, content: values.comment },
      {
        onSuccess: () => {
          form.resetFields();
          toast.success("Komentar berhasil dikirim");
        },
        onError: (err) =>
          toast.error(err?.message ?? "Gagal mengirim komentar"),
      }
    );
  };

  return (
    <div className="min-h-screen bg-faint-fog">
      {toast.contextHolder}
      <Navbar isLogin />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-body-sm font-medium text-graphite hover:text-deep-slate transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          Kembali ke forum
        </button>

        {isLoading && (
          <div className="space-y-[17px]">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={2} />
          </div>
        )}

        {!postLoading && detailPost?.title && (
          <article className="bg-white border border-light-ash rounded-default p-[25px]">
            <div className="flex items-start gap-[13px] mb-[17px]">
              <img
                src={avatar}
                alt=""
                className="w-10 h-10 rounded-full bg-polar-mist"
              />
              <div className="flex-1">
                <p className="text-body-sm font-semibold text-deep-slate">
                  {detailPost.nama}
                </p>
                <p className="text-caption text-graphite">
                  <span
                    className={`font-medium ${
                      detailPost.role === "ORANG_TUA"
                        ? "text-primary-600"
                        : "text-deep-slate"
                    }`}
                  >
                    {detailPost.role === "ORANG_TUA"
                      ? "Orang Tua"
                      : "Tenaga Kesehatan"}
                  </span>{" "}
                  ·{" "}
                  <span className="tabular-nums">
                    {moment(detailPost.time).format("DD MMMM YYYY")}
                  </span>
                </p>
              </div>
            </div>
            <h1 className="text-heading font-semibold text-deep-slate mb-[13px]">
              {detailPost.title}
            </h1>
            <p className="text-base text-deep-slate whitespace-pre-wrap">
              {detailPost.content}
            </p>
          </article>
        )}

        <section className="bg-white border border-light-ash rounded-default p-[25px]">
          <h2 className="text-heading-sm font-semibold text-deep-slate mb-[13px]">
            Tulis komentar
          </h2>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="comment"
              rules={[{ required: true, message: "Komentar masih kosong" }]}
              className="!mb-[13px]"
            >
              <Input.TextArea
                rows={4}
                placeholder="Bagikan jawaban atau tanggapan..."
                className="text-base"
              />
            </Form.Item>
            <Button
              variant="primary"
              size="md"
              type="submit"
              leadingIcon={<Send size={16} strokeWidth={1.75} />}
              loading={createComment.isPending}
            >
              Kirim
            </Button>
          </Form>
        </section>

        <section className="space-y-[17px]">
          <h2 className="text-overline text-graphite">
            Komentar ({comment.length})
          </h2>
          {!commentLoading && comment.length === 0 ? (
            <div className="text-center py-[25px] text-body-sm text-graphite bg-white border border-light-ash rounded-default">
              Belum ada komentar
            </div>
          ) : (
            comment.map((item) => (
              <article
                key={item.comment_id || item.time}
                className="bg-white border border-light-ash rounded-default p-[17px]"
              >
                <div className="flex items-start gap-[13px]">
                  <img
                    src={avatar}
                    alt=""
                    className="w-9 h-9 rounded-full bg-polar-mist"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="text-body-sm font-semibold text-deep-slate">
                        {item.nama}
                      </p>
                      <p className="text-caption text-graphite tabular-nums">
                        {moment(item.time).format("DD MMM YYYY HH:mm")}
                      </p>
                    </div>
                    <p className="text-caption text-graphite mt-1">
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
                    </p>
                    <p className="mt-[13px] text-base text-deep-slate whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
