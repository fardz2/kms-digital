import { Form, Input, Spin, message } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
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
    <div className="min-h-screen bg-neutral-50">
      {contextHolder}
      <Navbar isLogin />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-caption text-neutral-600 hover:text-primary-700 font-medium transition-colors"
        >
          ← Kembali ke forum
        </button>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}

        {!isLoading && detailPost?.title && (
          <article className="bg-white border border-neutral-200 rounded-card p-6 shadow-card">
            <div className="flex items-start gap-3 mb-4">
              <img
                src={avatar}
                alt=""
                className="w-10 h-10 rounded-full bg-neutral-100"
              />
              <div className="flex-1">
                <p className="text-caption font-semibold text-neutral-900">
                  {detailPost.nama}
                </p>
                <p className="text-xs text-neutral-500">
                  <span
                    className={`font-medium ${
                      detailPost.role === "ORANG_TUA"
                        ? "text-primary-700"
                        : "text-accent"
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
            <h1 className="text-h2 font-display text-neutral-900 mb-3">
              {detailPost.title}
            </h1>
            <p className="text-base text-neutral-700 whitespace-pre-wrap">
              {detailPost.content}
            </p>
          </article>
        )}

        <section className="bg-white border border-neutral-200 rounded-card p-5">
          <h2 className="text-h3 font-display text-neutral-900 mb-3">
            Tulis komentar
          </h2>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="comment"
              rules={[{ required: true, message: "Komentar masih kosong" }]}
              className="!mb-3"
            >
              <Input.TextArea
                rows={3}
                placeholder="Bagikan jawaban atau tanggapan..."
                className="text-base"
              />
            </Form.Item>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
            >
              Kirim
            </button>
          </Form>
        </section>

        <section className="space-y-3">
          <h2 className="text-overline text-neutral-600">
            Komentar ({comment.length})
          </h2>
          {comment.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 bg-white border border-neutral-200 rounded-card">
              Belum ada komentar
            </div>
          ) : (
            comment.map((item) => (
              <article
                key={item.comment_id || item.time}
                className="bg-white border border-neutral-200 rounded-card p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={avatar}
                    alt=""
                    className="w-9 h-9 rounded-full bg-neutral-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="text-caption font-semibold text-neutral-900">
                        {item.nama}
                      </p>
                      <p className="text-xs text-neutral-500 tabular-nums">
                        {moment(item.time).format("DD MMM YYYY HH:mm")}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
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
                    </p>
                    <p className="mt-2 text-base text-neutral-700 whitespace-pre-wrap">
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
