import React from "react";
import { Breadcrumb } from "antd";
import PropTypes from "prop-types";

export default function Navigation(props) {
  const { breadcrumb } = props;

  return (
    <Breadcrumb className="mb-8">
      {breadcrumb.map((item, idx) => {
        return (
          <Breadcrumb.Item>
            <a
              href={item.link}
              className={`${
                idx === breadcrumb.length - 1 ? "font-medium" : "font-normal"
              }`}
            >
              {item.title}
            </a>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}

Navigation.propTypes = {
  breadcrumb: PropTypes.array,
};
