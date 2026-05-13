import { Spin, Empty } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import FormInputPost from "../../components/form/FormInputPost";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import avatar from "../../assets/icon/user.png";
import { readSession } from "../../features/auth/session-storage";

export default function MyPost() {
  const [user] = useState(() => readSession());
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
    <div className="min-h-screen bg-faint-fog">
      <Navbar isLogin />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <header className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[13px]">
              Riwayat
            </p>
            <h1 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
              Pertanyaan Saya
            </h1>
            <p className="text-body-lg text-graphite mt-[13px]">
              Riwayat pertanyaan yang Anda ajukan.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={() => setIsOpenModalInputPost(true)}
          >
            Tulis Pertanyaan
          </Button>
        </header>

        {isLoading && (
          <div className="flex justify-center py-[50px]">
            <Spin size="large" />
          </div>
        )}

        {!isLoading && dataPost.length === 0 && (
          <div className="bg-white border border-light-ash rounded-default py-[50px] text-center">
            <Empty
              description={
                <span className="text-body-sm text-graphite">
                  Anda belum mengirim pertanyaan
                </span>
              }
            />
          </div>
        )}

        <div className="space-y-[17px]">
          {dataPost.map((item) => (
            <article
              key={item.post_id}
              className="bg-white border border-light-ash rounded-default p-[25px] hover:border-graphite/30 transition-colors duration-150 ease-out-quart"
            >
              <div className="flex items-start gap-[13px] mb-[13px]">
                <img
                  src={avatar}
                  alt=""
                  className="w-10 h-10 rounded-full bg-polar-mist"
                />
                <div className="flex-1">
                  <p className="text-body-sm font-semibold text-deep-slate">
                    {user?.user?.name ?? "Anda"}
                  </p>
                  <p className="text-caption text-graphite tabular-nums">
                    {moment(item.time).format("DD MMMM YYYY")}
                  </p>
                </div>
              </div>
              <h3 className="text-heading font-semibold text-deep-slate">
                <Link
                  to={`/orangtua/forum/${item.post_id}`}
                  className="hover:text-primary-600 transition-colors"
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
