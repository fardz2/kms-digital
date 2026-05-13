import { Form, Input, Spin, message } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import avatar from "../../assets/icon/user.png";
import { readSession } from "../../features/auth/session-storage";

export default function DetailForum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useState(() => readSession());
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [detailPost, setDetailPost] = useState({});
  const [comment, setComment] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/post/${id}`)
      .then((response) => {
        setIsLoading(false);
        setDetailPost(response.data.data);
      })
      .catch(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/comment/${id}`)
      .then((response) => {
        setIsLoading(false);
        const sortedData = response.data.data.sort((a, b) =>
          b.time.localeCompare(a.time)
        );
        setComment(sortedData);
      })
      .catch(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const onFinish = (values) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/comment`, {
        user_id: user.user.id,
        post_id: id,
        content: values.comment,
      })
      .then(() => {
        setRefreshKey((k) => k + 1);
        form.resetFields();
        messageApi.success("Komentar berhasil dikirim");
      })
      .catch(() => messageApi.error("Gagal mengirim komentar"));
  };

  return (
    <div className="min-h-screen bg-faint-fog">
      {contextHolder}
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
          <div className="flex justify-center py-[50px]">
            <Spin size="large" />
          </div>
        )}

        {!isLoading && detailPost?.title && (
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
            >
              Kirim
            </Button>
          </Form>
        </section>

        <section className="space-y-[17px]">
          <h2 className="text-overline text-graphite">
            Komentar ({comment.length})
          </h2>
          {comment.length === 0 ? (
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
