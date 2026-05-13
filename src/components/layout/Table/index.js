import {
  useFilters,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { SortIcon, SortUpIcon, SortDownIcon } from "./Icons";
import { Button, PageButton } from "./Button";
import { useMemo, useState, useCallback } from "react";
import GlobalFilter from "./GlobalFilter";
import { Col, Modal, message, Form, Input, Select } from "antd";
import FormInputDataExcel from "../../form/FormInputDataExcel";
import FormInputDataAnak from "../../form/FormInputDataAnak";
import ReactSelect from "react-select";
import moment from "moment";
import useAuth from "../../../hook/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
// Centralized fetch error handler
const handleFetchError = async (response, defaultMessage) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || defaultMessage);
  }
  return response;
};

// SelectColumnFilter Component
export function SelectColumnFilter({ column }) {
  const { filterOpt, filterValue, setFilter, preFilteredRows, id, render } =
    column;
  const options = useMemo(() => {
    const opts = new Set(preFilteredRows.map((row) => row.values[id]));
    return [...opts].map((opt) => ({ value: opt, label: opt }));
  }, [id, preFilteredRows]);

  const opt = filterOpt || [{ value: "", label: "All" }, ...options];

  return (
    <label className="grid grid-cols-12 gap-x-2 items-center mt-4">
      <span className="text-gray-700 text-sm col-span-4">
        {render("Header")}:
      </span>
      <ReactSelect
        className="w-full h-full col-span-10 rounded-md text-sm border-gray-600 shadow focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-70"
        name={id}
        id={id}
        onChange={(e) =>
          setFilter(e.value === "" ? undefined : Number(e.value))
        }
        placeholder="All"
        value={{
          value: filterValue ?? "",
          label:
            filterValue !== undefined
              ? filterValue
                ? "Approve"
                : "Belum Diapprove"
              : "All",
        }}
        options={opt}
      />
    </label>
  );
}

// Normalize status for filtering
const normalizeStatus = (status) =>
  typeof status === "string"
    ? status === "true" || status === "1"
    : typeof status === "number"
    ? status === 1
    : !!status;

// FormTambahOrangTua Component
function FormTambahOrangTua({ isOpen, onCancel, user }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const addOrangTuaMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        email: values.email,
        password: values.password,
        nama: values.nama,
        alamat: values.alamat,
        status: values.status || false,
        id_posyandu: user.user?.id_posyandu,
        id_desa: user.user?.id_desa,
      };
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/orang-tua/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token?.value}`,
          },
          body: JSON.stringify(payload),
        }
      );
      await handleFetchError(response, "Gagal menambahkan orang tua");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Berhasil menambahkan orang tua");
      queryClient.invalidateQueries(["orangTua"]);
      form.resetFields();
      onCancel();
    },
    onError: (error) =>
      messageApi.error(error.message || "Gagal menambahkan orang tua"),
  });

  return (
    <>
      {contextHolder}
      <Modal
        title="Tambah Orang Tua"
        open={isOpen}
        onCancel={onCancel}
        footer={null}
        width={600}
        confirmLoading={addOrangTuaMutation.isLoading}
        zIndex={1001}
      >
        <Form
          form={form}
          name="tambah_orang_tua"
          onFinish={addOrangTuaMutation.mutate}
          onFinishFailed={(errorInfo) => console.log("Form Failed:", errorInfo)}
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
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Password tidak sesuai!"));
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
            <Button
              type="primary"
              htmlType="submit"
              loading={addOrangTuaMutation.isLoading}
            >
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
function FormEditOrangTua({ isOpen, onCancel, user, selectedUser }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

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

  const editOrangTuaMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        email: values.email,
        password: values.password || undefined,
        nama: values.nama,
        alamat: values.alamat,
        status: values.status,
      };
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token?.value}`,
          },
          body: JSON.stringify(payload),
        }
      );
      await handleFetchError(response, "Gagal memperbarui orang tua");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Berhasil memperbarui orang tua");
      queryClient.invalidateQueries(["orangTua"]);
      onCancel();
    },
    onError: (error) =>
      messageApi.error(error.message || "Gagal memperbarui orang tua"),
  });

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Orang Tua"
        open={isOpen}
        onCancel={onCancel}
        footer={null}
        width={600}
        confirmLoading={editOrangTuaMutation.isLoading}
        zIndex={1001}
      >
        <Form
          form={form}
          name="edit_orang_tua"
          onFinish={editOrangTuaMutation.mutate}
          onFinishFailed={(errorInfo) => console.log("Form Failed:", errorInfo)}
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
              { pattern: "^.{8,}$", message: "Password minimal 8 karakter" },
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
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Password tidak sesuai!"));
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
            <Button
              type="primary"
              htmlType="submit"
              loading={editOrangTuaMutation.isLoading}
            >
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
    state: { globalFilter, pageIndex, pageSize },
    preGlobalFilteredRows,
    setGlobalFilter,
    setAllFilters,
  } = useTable(
    { columns, data, initialState },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    TableHooks
  );

  const [modalState, setModalState] = useState({
    inputExcel: false,
    inputDataAnak: false,
    orangTua: false,
    tambahOrangTua: false,
    editOrangTua: false,
    anakBelumApprove: false,
    delete: false,
  });
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuth();
  const queryClient = useQueryClient();

  const toggleModal = useCallback(
    (modal, value) => {
      setModalState((prev) => ({ ...prev, [modal]: value }));
      if (!value) setAllFilters([]);
    },
    [setAllFilters]
  );

  // Fetch Orang Tua data
  const { data: orangTuaData = [], isLoading: orangTuaLoading } = useQuery({
    queryKey: ["orangTua", user.token?.value],
    queryFn: async () => {
      if (!user.token?.value) throw new Error("Silakan login terlebih dahulu");
      const response = await fetch(
        `${
          process.env.REACT_APP_BASE_URL
        }/api/posyandu/orang-tua/list?_=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${user.token?.value}` },
        }
      );
      await handleFetchError(response, "Gagal mengambil data orang tua");
      const data = await response.json();
      return data.data.map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      }));
    },
    enabled: modalState.orangTua && !!user.token?.value,
    onError: (error) =>
      messageApi.error(error.message || "Gagal mengambil data orang tua"),
  });

  // Fetch Unapproved Children data
  const {
    data: anakBelumApproveData = [],
    isLoading: anakBelumApproveLoading,
  } = useQuery({
    queryKey: ["anakBelumApprove", user.token?.value],
    queryFn: async () => {
      if (!user.token?.value) throw new Error("Silakan login terlebih dahulu");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/belum-approve`,
        {
          headers: { Authorization: `Bearer ${user.token?.value}` },
        }
      );
      await handleFetchError(
        response,
        "Gagal mengambil data anak belum approve"
      );
      const data = await response.json();
      return data.data.sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    enabled: modalState.anakBelumApprove && !!user.token?.value,
    onError: (error) =>
      messageApi.error(
        error.message || "Gagal mengambil data anak belum approve"
      ),
  });

  // Export Data Anak
  const exportDataAnakMutation = useMutation({
    mutationFn: async () => {
      if (!user.token?.value) throw new Error("Silakan login terlebih dahulu");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/export-data-anak-csv`,
        {
          headers: { Authorization: `Bearer ${user.token?.value}` },
        }
      );
      await handleFetchError(response, "Gagal mengunduh data anak");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-anak.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      messageApi.success("Berhasil mengunduh data anak");
    },
    onError: (error) =>
      messageApi.error(error.message || "Gagal mengunduh data anak"),
  });

  // Delete Orang Tua
  const deleteOrangTuaMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token?.value}` },
        }
      );
      await handleFetchError(response, "Gagal menghapus Orang Tua");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Orang Tua berhasil dihapus");
      queryClient.invalidateQueries(["orangTua"]);
      toggleModal("delete", false);
      setUserToDelete(null);
    },
    onError: (error) => {
      messageApi.error(error.message || "Gagal menghapus Orang Tua");
      toggleModal("delete", false);
      setUserToDelete(null);
    },
  });

  // Approve Anak
  const approveAnakMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/belum-approve/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      await handleFetchError(response, "Gagal menyetujui anak");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Anak berhasil disetujui");
      queryClient.invalidateQueries(["anakBelumApprove"]);
    },
    onError: (error) =>
      messageApi.error(error.message || "Gagal menyetujui anak"),
  });

  // Delete Anak
  const deleteAnakMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      await handleFetchError(response, "Gagal menghapus data anak");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Data berhasil dihapus");
      queryClient.invalidateQueries(["anakBelumApprove"]);
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      messageApi.error(error.message || "Gagal menghapus data anak");
      setTimeout(() => window.location.reload(), 1000);
    },
  });

  const handleEditOrangTua = useCallback(
    (record) => {
      setSelectedUser(record);
      toggleModal("editOrangTua", true);
    },
    [toggleModal]
  );

  const showDeleteConfirm = useCallback(
    (id) => {
      setUserToDelete(id);
      toggleModal("delete", true);
    },
    [toggleModal]
  );

  const handleApproveAnak = useCallback(
    (id) =>
      Modal.confirm({
        title: "Apakah anda yakin ingin menyetujui anak ini?",
        okText: "Ya",
        cancelText: "Tidak",
        onOk: () => approveAnakMutation.mutate(id),
      }),
    [approveAnakMutation]
  );

  const orangTuaColumns = useMemo(
    () => [
      { Header: "No", accessor: "no", disableFilters: true },
      { Header: "Nama", accessor: "nama" },
      { Header: "Alamat", accessor: "alamat" },
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
    [handleEditOrangTua, showDeleteConfirm]
  );

  const anakBelumApproveColumns = useMemo(
    () => [
      { Header: "No", accessor: "no", disableFilters: true },
      { Header: "Nama Anak", accessor: "nama" },
      { Header: "Tanggal Lahir", accessor: "tanggal_lahir" },
      {
        Header: "Umur",
        accessor: "umur",
        Cell: ({ row }) => (
          <span>{`${moment().diff(
            moment(row.original.tanggal_lahir),
            "month"
          )} Bulan`}</span>
        ),
      },
      {
        Header: "Jenis Kelamin",
        accessor: "gender",
        Cell: ({ value }) => (
          <span>{value === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</span>
        ),
      },
      { Header: "Alamat", accessor: "alamat" },
      { Header: "Nama Orang Tua", accessor: "nama_ortu" },
      {
        Header: "Aksi",
        accessor: "aksi",
        disableFilters: true,
        Cell: ({ row }) => (
          <div>
            <Button
              type="primary"
              size="small"
              onClick={() => handleApproveAnak(row.original.id)}
              style={{ marginRight: 8 }}
            >
              Approve
            </Button>
            <Button
              type="dashed"
              danger
              size="small"
              onClick={() =>
                Modal.confirm({
                  title: "Apakah anda yakin?",
                  content: "Data yang dihapus tidak dapat dikembalikan",
                  okText: "Ya",
                  cancelText: "Tidak",
                  onOk: () => deleteAnakMutation.mutate(row.original.id),
                })
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [handleApproveAnak, deleteAnakMutation]
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 my-4">
          <button
            onClick={() => toggleModal("anakBelumApprove", true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold transition-colors"
          >
            Lihat Anak Belum Approve
          </button>
          <button
            onClick={() => exportDataAnakMutation.mutate()}
            disabled={exportDataAnakMutation.isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60 transition-colors"
          >
            {exportDataAnakMutation.isLoading
              ? "Mengunduh..."
              : "Unduh Data Anak"}
          </button>
          <button
            onClick={() => toggleModal("orangTua", true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold transition-colors"
          >
            Lihat Orang Tua
          </button>
        </div>
      )}
      <div className="mt-4 overflow-x-auto">
        <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
          <table
            {...getTableProps()}
            className="w-full divide-y divide-neutral-200"
          >
            <thead className="bg-primary-300 text-white">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers
                    .filter((col) => col.show !== false)
                    .map((column) => (
                      <th
                        scope="col"
                        className="group px-4 py-3 text-left text-overline text-white"
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {column.render("Header")}
                          <span>
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <SortDownIcon className="w-4 h-4 text-white/80" />
                              ) : (
                                <SortUpIcon className="w-4 h-4 text-white/80" />
                              )
                            ) : (
                              <SortIcon className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100" />
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
              className="bg-white divide-y divide-neutral-100"
            >
              {data?.length === 0 && (
                <tr>
                  <td className="text-center py-8 text-neutral-500" colSpan={columns.length}>
                    Tidak ada data
                  </td>
                    </tr>
                  )}
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="hover:bg-primary-50/40 transition-colors"
                      >
                        {row.cells.map((cell) => {
                          if (cell.column.show === false) return null;
                          if (cell.column.id === "no") {
                            return (
                              <td
                                className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700 tabular-nums"
                                key={i}
                              >
                                {pageIndex * pageSize + i + 1}
                              </td>
                            );
                          }
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700"
                              role="cell"
                            >
                              {cell.column.Cell?.name === "defaultRenderer" ? (
                                <span>
                                  {cell.render("Cell")} {cell.column?.postFix}
                                </span>
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
      <div className="py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-x-4 items-baseline">
          <span className="text-sm text-neutral-600">
            Halaman <span className="font-semibold">{pageIndex + 1}</span> dari{" "}
            <span className="font-semibold">{pageOptions.length}</span>
          </span>
          <label>
            <span className="sr-only">Item per halaman</span>
            <select
              className="rounded-button border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  Tampilkan {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <nav
          className="relative z-0 inline-flex -space-x-px rounded-button overflow-hidden"
          aria-label="Pagination"
        >
          <PageButton
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">First</span>«
          </PageButton>
          <PageButton
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Previous</span>‹
          </PageButton>
          {Array.from({ length: pageCount }, (_, index) => (
            <PageButton
              key={index}
              onClick={() => gotoPage(index)}
              className={
                pageIndex === index
                  ? "bg-primary text-white hover:bg-primary-600"
                  : ""
              }
            >
              {index + 1}
            </PageButton>
          ))}
          <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
            <span className="sr-only">Next</span>›
          </PageButton>
          <PageButton
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Last</span>»
          </PageButton>
        </nav>
      </div>
      <Col sm="12" className="d-flex">
        <FormInputDataExcel
          isOpen={modalState.inputExcel}
          onCancel={() => toggleModal("inputExcel", false)}
          fetch={() =>
            queryClient.invalidateQueries(["orangTua", "anakBelumApprove"])
          }
        />
      </Col>
      <Col sm="12" className="d-flex">
        <FormInputDataAnak
          isOpen={modalState.inputDataAnak}
          onCancel={() => toggleModal("inputDataAnak", false)}
          kader={true}
          fetch={() => queryClient.invalidateQueries(["anakBelumApprove"])}
        />
      </Col>
      <Modal
        title="Daftar Orang Tua"
        open={modalState.orangTua}
        onCancel={() => toggleModal("orangTua", false)}
        footer={[
          <Button key="cancel" onClick={() => toggleModal("orangTua", false)}>
            Tutup
          </Button>,
        ]}
        width={800}
        confirmLoading={orangTuaLoading}
      >
        <div className="mb-4">
          <Button
            type="primary"
            onClick={() => toggleModal("tambahOrangTua", true)}
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
        title="Daftar Anak Belum Approve"
        open={modalState.anakBelumApprove}
        onCancel={() => toggleModal("anakBelumApprove", false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => toggleModal("anakBelumApprove", false)}
          >
            Tutup
          </Button>,
        ]}
        width={1000}
        confirmLoading={anakBelumApproveLoading}
      >
        <div className="mb-4">
          <Button
            type="primary"
            onClick={() => toggleModal("inputDataAnak", true)}
          >
            Tambah Anak
          </Button>
        </div>
        <Table
          columns={anakBelumApproveColumns}
          data={anakBelumApproveData}
          initialState={{ pageIndex: 0, pageSize: 5 }}
          noSearch={true}
          ButtonCus={false}
        />
      </Modal>
      <Modal
        title="Konfirmasi Hapus"
        open={modalState.delete}
        onOk={() => userToDelete && deleteOrangTuaMutation.mutate(userToDelete)}
        onCancel={() => {
          toggleModal("delete", false);
          setUserToDelete(null);
        }}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p>Apakah Anda yakin ingin menghapus data ini?</p>
      </Modal>
      <FormTambahOrangTua
        isOpen={modalState.tambahOrangTua}
        onCancel={() => toggleModal("tambahOrangTua", false)}
        user={user}
      />
      <FormEditOrangTua
        isOpen={modalState.editOrangTua}
        onCancel={() => {
          toggleModal("editOrangTua", false);
          setSelectedUser(null);
        }}
        user={user}
        selectedUser={selectedUser}
      />
    </>
  );
}

export default Table;
