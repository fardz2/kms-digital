import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "../../components/layout/Navbar";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import { formatDate2, limitWords } from "../../utilities/Format";
import { Spin } from "antd";
import useAuth from "../../hook/useAuth";

const BackgroundComponent = () => {
  return (
    <div
      className="absolute top-20 left-0 w-full h-[30vh] -z-10 bg-no-repeat bg-center bg-cover rounded-b-3xl shadow-lg"
      style={{ backgroundImage: `url(${bg_dashboard})` }}
    />
  );
};

export default function Artikel() {
  const user = useAuth();
  const [article, setArticles] = useState(null);
  // Fetch artikel data using useQuery
  const { data: articles, isLoading: artikelLoading } = useQuery({
    queryKey: ["artikel"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/artikel`,
        {
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data artikel");
      const data = await response.json();
      setArticles(data.data);
      return data.data;
    },
    onError: (err) => {
      console.error("Error fetching articles:", err);
    },
    enabled: !!user?.token?.value,
  });

  // Fetch kategori data using useQuery
  const { data: dataKategori, isLoading: kategoriLoading } = useQuery({
    queryKey: ["kategori"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/kategori`,
        {
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const data = await response.json();

      return data.data;
    },
    onError: (err) => {
      console.error("Error fetching categories:", err);
    },
    enabled: !!user?.token?.value,
  });

  return (
    <>
      <Navbar isLogin />
      <BackgroundComponent />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {artikelLoading || kategoriLoading ? (
          <div className="flex justify-center">
            <Spin size="large" spinning={artikelLoading || kategoriLoading} />
          </div>
        ) : article ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                {article.judul}
              </h1>
              <p className="text-gray-500 mb-4">
                {article.penulis} / {formatDate2(article.updated_at)}
              </p>
              <img
                src={`${process.env.REACT_APP_BASE_URL}/public/img/${article.image}`}
                alt={article.judul}
                className="w-full h-auto rounded-lg mb-4"
              />
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
            <div className="w-full lg:w-1/3">
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-red-500 mr-2"></div>
                  <h2 className="text-lg font-semibold">Berita Lainnya</h2>
                </div>
                {dataKategori?.map((kategori) => {
                  const relatedArticles = (articles || []).filter(
                    (item) => item.kategori === kategori.name
                  );
                  return (
                    <div key={kategori.id} className="mb-6">
                      {relatedArticles.map((article, index) => (
                        <div key={index} className="mb-4">
                          <h4 className="text-base font-medium">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setArticles(article);
                              }}
                              className="text-gray-800 hover:text-red-500"
                            >
                              {article.judul}
                            </a>
                          </h4>
                          <div
                            className="text-sm text-gray-500"
                            dangerouslySetInnerHTML={{
                              __html: limitWords(article.content, 15),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No articles available.</p>
        )}
      </div>
    </>
  );
}
