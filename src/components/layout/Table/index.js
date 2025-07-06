import {
  useFilters,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { SortIcon, SortUpIcon, SortDownIcon } from "./Icons";
import { Button, PageButton } from "./Button";
import { useMemo, useState, useEffect } from "react";
import GlobalFilter from "./GlobalFilter";
import { Col, Modal, message, Form, Input, Select } from "antd";
import FormInputDataExcel from "../../form/FormInputDataExcel";
import FormInputDataAnak from "../../form/FormInputDataAnak";
import ReactSelect from "react-select";
import axios from "axios";

// SelectColumnFilter Component
export function SelectColumnFilter({ column }) {
  const { filterOpt, filterValue, setFilter, preFilteredRows, id, render } =
    column;
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  const opt =
    filterOpt ||
    options.map((option) => ({
      value: option,
      label: option,
    }));

  return (
    <label className="grid grid-cols-12 gap-x-2 items-center mt-4">
      <span className="text-gray-700 text-sm col-span-4">
        {render("Header")}:
      </span>
      <ReactSelect
        className="w-full h-full col-span-10 rounded-md text-sm border-gray-600 shadow focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-70"
        name={id}
        id={id}
        onChange={(e) => {
          console.log("Applying filter for", id, ":", e.value);
          setFilter(e.value === "" ? undefined : Number(e.value));
        }}
        placeholder="All"
        value={{
          value: filterValue !== undefined ? filterValue : "",
          label:
            filterValue !== undefined
              ? filterValue == 1
                ? "Approve"
                : "Belum Diapprove"
              : "All",
        }}
        options={[{ value: "", label: "All" }, ...opt]}
      />
    </label>
  );
}

// Normalize status for filtering
const normalizeStatus = (status) => {
  if (typeof status === "string") {
    return status === "true" || status === "1";
  }
  if (typeof status === "number") {
    return status === 1;
  }
  return !!status; // Convert to boolean for null/undefined/false
};

// FormTambahOrangTua Component
function FormTambahOrangTua({ isOpen, onCancel, fetchOrangTua, user }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password,
        nama: values.nama,
        alamat: values.alamat,
        status: values.status || false,
        id_posyandu: user.user?.id_posyandu,
        id_desa: user.user?.id_desa,
      };

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/auth/orang-tua/register`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token?.value}`,
          },
        }
      );

      messageApi.open({
        type: "success",
        content: "Berhasil menambahkan orang tua",
      });
      fetchOrangTua();
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Error adding parent:", error);
      messageApi.open({
        type: "error",
        content: error.response?.data?.message || "Gagal menambahkan orang tua",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Tambah Orang Tua"
        open={isOpen}
        onCancel={onCancel}
        footer={null}
        width={600}
        confirmLoading={loading}
        zIndex={1001}
      >
        <Form
          form={form}
          name="tambah_orang_tua"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Nama"
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong!" }]}
          >
            <Input placeholder="Masukkan nama" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email masih kosong!" },
              { type: "email", message: "Email belum sesuai!" },
            ]}
          >
            <Input placeholder="user@email.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password masih kosong!" },
              { pattern: "^.{8,}$", message: "Password minimal 8 karakter" },
            ]}
          >
            <Input.Password placeholder="Masukkan password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Silahkan Confirm Password Anda!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password tidak sesuai!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item
            label="Alamat"
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong!" }]}
          >
            <Input placeholder="Masukkan alamat" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status masih kosong!" }]}
          >
            <Select placeholder="Pilih Status">
              <Select.Option value={true}>Approve</Select.Option>
              <Select.Option value={false}>Belum di Approve</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Simpan
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={onCancel}>
              Batal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// FormEditOrangTua Component
function FormEditOrangTua({
  isOpen,
  onCancel,
  fetchOrangTua,
  user,
  selectedUser,
}) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser && isOpen) {
      form.setFieldsValue({
        nama: selectedUser.nama,
        email: selectedUser.email,
        alamat: selectedUser.alamat,
        status: normalizeStatus(selectedUser.status),
      });
    }
  }, [selectedUser, isOpen, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password || undefined,
        nama: values.nama,
        alamat: values.alamat,
        status: values.status,
      };

      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${selectedUser.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token?.value}`,
          },
        }
      );

      messageApi.open({
        type: "success",
        content: "Berhasil memperbarui orang tua",
      });
      fetchOrangTua();
      onCancel();
    } catch (error) {
      console.error("Error updating parent:", error);
      messageApi.open({
        type: "error",
        content: error.response?.data?.message || "Gagal memperbarui orang tua",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Orang Tua"
        open={isOpen}
        onCancel={onCancel}
        footer={null}
        width={600}
        confirmLoading={loading}
        zIndex={1001}
      >
        <Form
          form={form}
          name="edit_orang_tua"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Nama"
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong!" }]}
          >
            <Input placeholder="Masukkan nama" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email masih kosong!" },
              { type: "email", message: "Email belum sesuai!" },
            ]}
          >
            <Input placeholder="user@email.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                pattern: "^.{8,}$",
                message: "Password minimal 8 karakter",
              },
            ]}
          >
            <Input.Password placeholder="Masukkan password (kosongkan jika tidak diubah)" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password tidak sesuai!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item
            label="Alamat"
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong!" }]}
          >
            <Input placeholder="Masukkan alamat" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status masih kosong!" }]}
          >
            <Select placeholder="Pilih Status">
              <Select.Option value={true}>Approve</Select.Option>
              <Select.Option value={false}>Belum di Approve</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Simpan
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={onCancel}>
              Batal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// Table Component
function Table({
  columns,
  data,
  initialState = { pageIndex: 0, pageSize: 5 },
  TableHooks = false,
  noSearch = false,
  ButtonCus = false,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    setAllFilters,
  } = useTable(
    {
      columns,
      data,
      initialState,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    TableHooks
  );

  const { globalFilter, pageIndex, pageSize } = state;
  const [isOpenModalInputExcel, setIsOpenModalInputExcel] = useState(false);
  const [isOpenModalInputDataAnak, setIsOpenModalInputDataAnak] =
    useState(false);
  const [isOpenModalOrangTua, setIsOpenModalOrangTua] = useState(false);
  const [isOpenModalTambahOrangTua, setIsOpenModalTambahOrangTua] =
    useState(false);
  const [isOpenModalEditOrangTua, setIsOpenModalEditOrangTua] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // Modal visibility state for delete
  const [userToDelete, setUserToDelete] = useState(null); // User to delete
  const [selectedUser, setSelectedUser] = useState(null);
  const [orangTuaData, setOrangTuaData] = useState([]);
  const [orangTuaLoading, setOrangTuaLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [exportLoading, setExportLoading] = useState(false);

  let login_data;
  if (typeof window !== "undefined") {
    login_data = JSON.parse(localStorage.getItem("login_data")) || {};
  }
  const [user, setUser] = useState(login_data);

  const fetchOrangTua = async () => {
    if (!user.token?.value) {
      messageApi.open({
        type: "error",
        content: "Silakan login terlebih dahulu",
      });
      setOrangTuaLoading(false);
      setIsOpenModalOrangTua(false);
      return;
    }

    setOrangTuaLoading(true);
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_BASE_URL
        }/api/posyandu/orang-tua/list?_=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${user.token?.value}`,
          },
        }
      );
      const normalizedData = response.data.data.map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      }));
      setOrangTuaData(normalizedData);
    } catch (err) {
      messageApi.open({
        type: "error",
        content:
          err.response?.data?.message || "Gagal mengambil data orang tua",
      });
      setOrangTuaData([]);
    } finally {
      setOrangTuaLoading(false);
    }
  };

  const handleExportDataAnak = async () => {
    if (!user.token?.value) {
      messageApi.open({
        type: "error",
        content: "Silakan login terlebih dahulu",
      });
      return;
    }

    setExportLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/export-data-anak-csv`,
        {
          headers: {
            Authorization: `Bearer ${user.token?.value}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-anak.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      messageApi.open({
        type: "success",
        content: "Berhasil mengunduh data anak",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      messageApi.open({
        type: "error",
        content: error.response?.data?.message || "Gagal mengunduh data anak",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleEditOrangTua = (record) => {
    setSelectedUser(record);
    setIsOpenModalEditOrangTua(true);
  };

  // Function to show delete confirmation modal
  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      axios
        .delete(
          `${process.env.REACT_APP_BASE_URL}/api/auth/users/${userToDelete}`,
          {
            headers: { Authorization: `Bearer ${user.token?.value}` },
          }
        )
        .then((response) => {
          messageApi.open({
            type: "success",
            content: "Orang Tua berhasil dihapus",
          });
          fetchOrangTua();
          setIsDeleteModalVisible(false);
          setUserToDelete(null);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: err.response?.data?.message || "Gagal menghapus Orang Tua",
          });
          setIsDeleteModalVisible(false);
          setUserToDelete(null);
        });
    }
  };

  // Function to cancel delete
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    if (isOpenModalOrangTua) {
      fetchOrangTua();
      setAllFilters([]);
    }
  }, [isOpenModalOrangTua, refreshKey, user.token?.value, setAllFilters]);

  const orangTuaColumns = useMemo(
    () => [
      {
        Header: "No",
        accessor: "no",
        disableFilters: true,
      },
      {
        Header: "Nama",
        accessor: "nama",
      },
      {
        Header: "Alamat",
        accessor: "alamat",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) =>
          normalizeStatus(value) ? "Approve" : "Belum Diapprove",
        Filter: SelectColumnFilter,
        filter: "equals",
        filterOpt: [
          { value: "", label: "All" },
          { value: true, label: "Approve" },
          { value: false, label: "Belum Diapprove" },
        ],
        onFilter: (value, record) => normalizeStatus(record.status) === value,
      },
      {
        Header: "Aksi",
        accessor: "action",
        disableFilters: true,
        Cell: ({ row }) => (
          <div>
            <Button
              type="default"
              size="small"
              onClick={() => handleEditOrangTua(row.original)}
              style={{ marginRight: 8 }}
            >
              Edit
            </Button>
            <Button
              type="dashed"
              danger
              size="small"
              onClick={() => showDeleteConfirm(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    console.log("Table Debug:", {
      dataLength: data.length,
      pageSize,
      pageCount,
      pageIndex,
      pageOptions,
      canPreviousPage,
      canNextPage,
    });
  }, [
    data.length,
    pageSize,
    pageCount,
    pageIndex,
    pageOptions,
    canPreviousPage,
    canNextPage,
  ]);

  return (
    <>
      {contextHolder}
      <div className="sm:flex flex-col sm:gap-x-10">
        {!noSearch && (
          <div className="flex items-center justify-between max-w-full">
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 justify-between">
          {headerGroups.map((headerGroup) =>
            headerGroup.headers.map((column) =>
              column.Filter ? (
                <div className="mt-2 sm:mt-0" key={column.id}>
                  {column.render("Filter")}
                </div>
              ) : null
            )
          )}
        </div>
      </div>
      {ButtonCus && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-4">
          <button
            className="button2"
            onClick={() => setIsOpenModalInputDataAnak(true)}
          >
            Tambah Anak
          </button>
          <button
            className="button2"
            onClick={handleExportDataAnak}
            disabled={exportLoading}
          >
            {exportLoading ? "Mengunduh..." : "Unduh Data Anak"}
          </button>
          <button
            className="button2"
            onClick={() => setIsOpenModalOrangTua(true)}
          >
            Lihat Orang Tua
          </button>
        </div>
      )}
      <div className="mt-4 flex flex-col">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-full">
              <table
                {...getTableProps()}
                className="w-full divide-y divide-gray-200 border"
              >
                <thead style={{ background: "#ffb4b4", color: "white" }}>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers
                        .filter((col) => col.show !== false)
                        .map((column) => (
                          <th
                            scope="col"
                            className="group px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                          >
                            <div className="flex items-center justify-between">
                              {column.render("Header")}
                              <span>
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <SortDownIcon className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <SortUpIcon className="w-4 h-4 text-gray-400" />
                                  )
                                ) : (
                                  <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                )}
                              </span>
                            </div>
                          </th>
                        ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="bg-white divide-y divide-gray-200"
                >
                  {data?.length === 0 && (
                    <tr>
                      <td className="text-center py-4" colSpan={columns.length}>
                        Tidak ada data
                      </td>
                    </tr>
                  )}
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className={i % 2 === 0 ? "bg-gray-100" : ""}
                      >
                        {row.cells.map((cell) => {
                          if (cell.column.show === false) {
                            return null;
                          }
                          if (cell.column.id === "no") {
                            return (
                              <td
                                className="px-6 py-4 whitespace-nowrap"
                                key={i}
                              >
                                <div className="text-sm text-gray-900">
                                  {state.pageIndex * state.pageSize + i + 1}
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-4 py-2 whitespace-nowrap"
                              role="cell"
                            >
                              {cell.column.Cell?.name === "defaultRenderer" ? (
                                <div className="text-sm text-gray-700">
                                  {cell.render("Cell")} {cell.column?.postFix}
                                </div>
                              ) : (
                                cell.render("Cell")
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="py-3 flex items-center justify-end">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            icon={false}
          >
            Previous
          </Button>
          <Button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            icon={false}
          >
            Next
          </Button>
        </div>
        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex gap-x-2 items-baseline">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
              <span className="font-medium">{pageOptions.length}</span>
            </span>
            <label>
              <span className="sr-only">Items Per Page</span>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                }}
              >
                {[5, 10, 20].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <PageButton
                className="rounded-l-md"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">First</span>
                <span>«</span>
              </PageButton>
              <PageButton
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Previous</span>
                <span>‹</span>
              </PageButton>
              {Array.from({ length: pageCount }, (_, index) => (
                <PageButton
                  key={index}
                  onClick={() => gotoPage(index)}
                  className={`${
                    pageIndex === index
                      ? "bg-indigo-600 text-black"
                      : "bg-white text-gray-300"
                  }`}
                >
                  {index + 1}
                </PageButton>
              ))}
              <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
                <span className="sr-only">Next</span>
                <span>›</span>
              </PageButton>
              <PageButton
                className="rounded-r-md"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                <span className="sr-only">Last</span>
                <span>»</span>
              </PageButton>
            </nav>
          </div>
        </div>
      </div>
      <Col sm="12" className="d-flex">
        <FormInputDataExcel
          isOpen={isOpenModalInputExcel}
          onCancel={() => setIsOpenModalInputExcel(false)}
          fetch={() => setRefreshKey((oldKey) => oldKey + 1)}
        />
      </Col>
      <Col sm="12" className="d-flex">
        <FormInputDataAnak
          isOpen={isOpenModalInputDataAnak}
          onCancel={() => setIsOpenModalInputDataAnak(false)}
          fetch={() => setRefreshKey((oldKey) => oldKey + 1)}
        />
      </Col>
      <Modal
        title="Daftar Orang Tua"
        open={isOpenModalOrangTua}
        onCancel={() => {
          setIsOpenModalOrangTua(false);
          setAllFilters([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenModalOrangTua(false);
              setAllFilters([]);
            }}
          >
            Tutup
          </Button>,
        ]}
        width={800}
        confirmLoading={orangTuaLoading}
      >
        <div className="mb-4">
          <Button
            type="primary"
            onClick={() => setIsOpenModalTambahOrangTua(true)}
          >
            Tambah Orang Tua
          </Button>
        </div>
        <Table
          columns={orangTuaColumns}
          data={orangTuaData}
          initialState={{ pageIndex: 0, pageSize: 5 }}
          noSearch={true}
          ButtonCus={false}
        />
      </Modal>
      <Modal
        title="Konfirmasi Hapus"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p>Apakah Anda yakin ingin menghapus Orang Tua ini?</p>
      </Modal>
      <FormTambahOrangTua
        isOpen={isOpenModalTambahOrangTua}
        onCancel={() => setIsOpenModalTambahOrangTua(false)}
        fetchOrangTua={fetchOrangTua}
        user={user}
      />
      <FormEditOrangTua
        isOpen={isOpenModalEditOrangTua}
        onCancel={() => {
          setIsOpenModalEditOrangTua(false);
          setSelectedUser(null);
        }}
        fetchOrangTua={fetchOrangTua}
        user={user}
        selectedUser={selectedUser}
      />
    </>
  );
}

export default Table;
