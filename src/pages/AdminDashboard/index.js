import { message } from "antd";

const DashboardAdmin = () => {
  const [contextHolder] = message.useMessage();
  return <>{contextHolder}</>;
};

export default DashboardAdmin;
