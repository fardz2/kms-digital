import { Divider, Form, Input, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import avatar from "../../assets/icon/user.png";
import "./forum-style.css";
import footerImage from "../../assets/img/powered_by_telkom.svg";
import { message } from "antd";
import { readSession } from "../../features/auth/session-storage";

export default function DetailForum() {
  const convertToGoodString = (str) => {
    const words = str.split("_");
    const capitalizedWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1).toLowerCase();
      return firstLetter + restOfWord;
    });
    return capitalizedWords.join(" ");
  };

  let { id } = useParams();
  const [user, setUser] = useState(() => readSession());
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [detailPost, setDetailPost] = useState({});
  const [comment, setComment] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/post/${id}`)
      .then((response) => {
        setIsLoading(false);
        setDetailPost(response.data.data);
      })
      .catch((err) => {
        setIsLoading(false);
      });
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
      .catch((err) => {
        setIsLoading(false);
      });
  }, [refreshKey]);

  const onFinish = (values) => {
    const data = {
      user_id: user.user.id,
      post_id: id,
      content: values.comment,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/comment`, data)
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
        form.resetFields();
        message.success("Komentar berhasil dikirim!");
      })
      .catch((err) => {
        console.log(err);
        message.error("Gagal mengirim komentar. Silakan coba lagi.");
      });
  };

  const onFinishFailed = (values) => {
    console.log(values);
  };

  return (
    <>
      <Navbar isLogin />
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-center">
          <Spin size="large" spinning={isLoading} />
        </div>
        {!isLoading && (
          <div className="flex justify-center mt-8 sm:mt-10">
            <div className="w-full max-w-[90%] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px] bg-[#FCDEDE] shadow-lg rounded-3xl p-4 sm:p-6 mt-6">
              <div className="flex items-start px-4 py-6">
                <div className="w-full card-form-question text-base sm:text-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold text-gray-900 text-xl sm:text-2xl md:text-3xl">
                      {detailPost.title} -{" "}
                      {moment(detailPost.time).format("DD MMMM YYYY")}
                    </h2>
                  </div>
                  <p className="text-gray-800 text-sm sm:text-base">
                    {detailPost.nama} -
                    <span className="text-red-600">
                      {detailPost.role === "ORANG_TUA"
                        ? " orang tua"
                        : " tenaga kesehatan"}
                    </span>
                  </p>
                  <p className="mt-3 text-gray-700 text-sm sm:text-base">
                    {detailPost.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="w-full max-w-[90%] sm:max-w-[800px] md:max-w-[1000px] p-4 sm:p-6">
            <Form
              form={form}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="horizontal"
            >
              <div className="w-full max-w-[90%] sm:max-w-[800px] md:max-w-[1000px] bg-transparent border-2 border-[#FCDEDE] shadow-lg rounded-3xl p-4 sm:p-6">
                <div className="w-full">
                  <Form.Item
                    label="Comment"
                    name="comment"
                    rules={[
                      { required: true, message: "comment masih kosong!" },
                    ]}
                    labelCol={{ className: "text-xl sm:text-2xl" }}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                  <Form.Item>
                    <button type="submit" className="button_kirim">
                      Kirim
                    </button>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </div>

        <Divider />

        <div className="flex justify-center">
          <div className="w-full max-w-[90%] sm:max-w-[800px] md:max-w-[1000px]">
            {comment.map((item) => (
              <div
                key={item.comment_id || item.time} // Use a unique key, assuming item has a unique identifier
                className="w-full bg-[#FCDEDE] shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:my-6"
              >
                <div className="flex items-start">
                  <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-sm sm:text-base font-medium text-gray-700">
                        {item.nama}
                      </h2>
                      <small className="text-xs sm:text-sm text-gray-700">
                        {moment(item.time).format("DD MMMM YYYY")}
                      </small>
                    </div>
                    <p className="text-gray-800 text-sm sm:text-base">
                      <span className="text-blue-600">
                        {item.role === "ORANG_TUA"
                          ? "orang tua"
                          : "tenaga kesehatan"}
                      </span>
                    </p>
                    <Divider />
                    <p className="mt-3 text-gray-700 text-sm sm:text-base">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uncomment if footer is needed */}
        {/* <div className="flex justify-center w-full bg-[#FFB4B4] mt-12 sm:mt-16 lg:mt-24 py-4">
          <img src={footerImage} alt="Powered by Telkom" className="h-8 sm:h-10" />
        </div> */}
      </div>
    </>
  );
}
