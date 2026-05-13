import { Spin, Empty } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormInputPost from "../../components/form/FormInputPost";
import Navbar from "../../components/layout/Navbar";
import avatar from "../../assets/icon/user.png";
import { readSession } from "../../features/auth/session-storage";

export default function MyPost() {
  // eslint-disable-next-line
  const [user, setUser] = useState(() => readSession());
  const [isLoading, setIsLoading] = useState(true);
  const [dataPost, setDataPost] = useState([]);
  const [isOpenModalInputPost, setIsOpenModalInputPost] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.user?.id) return;
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/api/post/orang-tua/${user.user.id}`
      )
      .then((response) => {
        setIsLoading(false);
        const sortedData = response.data.data.sort((a, b) =>
          b.time.localeCompare(a.time)
        );
        setDataPost(sortedData);
      })
      .catch(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar isLogin />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 font-display text-neutral-900">
              Pertanyaan Saya
            </h1>
            <p className="text-caption text-neutral-500 mt-1">
              Riwayat pertanyaan yang Anda ajukan
            </p>
          </div>
          <button
            onClick={() => setIsOpenModalInputPost(true)}
            className="inline-flex items-center gap-2 px-5 py-3 min-h-tap rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-raised active:scale-[0.98] transition-all duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            + Tulis Pertanyaan
          </button>
        </header>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}

        {!isLoading && dataPost.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-card py-12 text-center">
            <Empty
              description={
                <span className="text-base text-neutral-600">
                  Anda belum mengirim pertanyaan
                </span>
              }
            />
          </div>
        )}

        <div className="space-y-3">
          {dataPost.map((item) => (
            <article
              key={item.post_id}
              className="bg-white border border-neutral-200 rounded-card p-5 hover:border-primary-200 hover:shadow-card transition-all duration-200 ease-out-quart"
            >
              <div className="flex items-start gap-3 mb-2">
                <img
                  src={avatar}
                  alt=""
                  className="w-10 h-10 rounded-full bg-neutral-100"
                />
                <div className="flex-1">
                  <p className="text-caption font-semibold text-neutral-900">
                    {user?.user?.name ?? "Anda"}
                  </p>
                  <p className="text-xs text-neutral-500 tabular-nums">
                    {moment(item.time).format("DD MMMM YYYY")}
                  </p>
                </div>
              </div>
              <h3 className="text-h3 font-display text-neutral-900">
                <Link
                  to={`/orangtua/forum/${item.post_id}`}
                  className="hover:text-primary-700 transition-colors"
                >
                  {item.title}
                </Link>
              </h3>
            </article>
          ))}
        </div>
      </div>

      <FormInputPost
        isOpen={isOpenModalInputPost}
        onCancel={() => {
          setIsOpenModalInputPost(false);
          setRefreshKey((oldKey) => oldKey + 1);
        }}
      />
    </div>
  );
}
