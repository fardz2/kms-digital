import { Col, List, Row, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import FormInputPost from "../../components/form/FormInputPost";
import Navbar from "../../components/layout/Navbar";
import Navigation from "../../components/layout/Navigation";
import footerImage from "../../assets/img/powered_by_telkom.svg";
import { readSession } from "../../features/auth/session-storage";

import avatar from "../../assets/icon/user.png";


export default function MyPost() {
  // eslint-disable-next-line
  const [user, setUser] = useState(() => readSession());
  const [isLoading, setIsLoading] = useState(true);
  const [dataPost, setDataPost] = useState([]);
  const [isOpenModalInputPost, setIsOpenModalInputPost] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
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
      .catch((err) => {
        setIsLoading(false);
      });
    // eslint-disable-next-line
  }, [refreshKey]);

  const data =
    !isLoading &&
    dataPost.map((item) => ({
      href: `/forum/detail/${item.post_id}`,
      title: item.title,
      avatar: avatar,
      description: user.user.name,
      content: moment(item.time).format("DD MMMM YYYY"),
    }));

  return (
    <>
      <Navbar isLogin />
      <Row justify="start">
        {/* <Col span={24}>
          <Navigation
            breadcrumb={[
              {
                title: "Dashboard",
                link: "/dashboard",
              },
              {
                title: "My Post",
                link: "",
              },
            ]}
          />
        </Col> */}
        <Col>
          <Spin size="large" spinning={isLoading} />
        </Col>
        <Col span={23}>
          {!isLoading && (
            <>
              <button
                style={{ marginTop: "50px" }}
                onClick={() => setIsOpenModalInputPost(true)}
                type="button"
                className="simpan_btn"
              >
                Posting pertanyaan
              </button>
              <List
                itemLayout="vertical"
                size="large"
                pagination={{
                  pageSize: 3,
                }}
                dataSource={data}
                renderItem={(item) => (
                  <div className="flex bg-gray-50 shadow-lg rounded-lg w-100 my-5" style={{ padding: "10px", margin: "30px", borderRadius: "20px" }}>
                    <div className="flex items-start px-4 py-6">

                      <div className="">
                        <div className="flex items-center justify-center">
                          <h2 className="text-lg font-semibold text-gray-900 mt-1">
                            <a href={item.href}>{item.title}</a>
                          </h2>
                        </div>
                        <p className="text-gray-800">
                          {item.description} (
                          <span style={{ color: "blue" }}>
                            {user.user.role === "ORANG_TUA"
                              ? "orang tua"
                              : "tenaga kesehatan"}
                          </span>
                          )
                        </p>
                        <p className="mt-3 text-gray-700 text-sm">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              />
              <FormInputPost
                isOpen={isOpenModalInputPost}
                onCancel={() => setIsOpenModalInputPost(false)}
                fetch={() => setRefreshKey((oldKey) => oldKey + 1)}
              />
            </>
          )}
        </Col>
      </Row>
    </>
  );
}
