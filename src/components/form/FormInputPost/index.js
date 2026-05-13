import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, Input, message } from "antd";
import useAuth from "../../../hook/useAuth";

export default function FormInputPost({ isOpen, onCancel }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const user = useAuth();

  const createPostMutation = useMutation({
    mutationFn: async (values) => {
      if (!user?.token?.value || !user?.user?.id) {
        throw new Error("User authentication data missing");
      }
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token.value}`,
          },
          body: JSON.stringify({
            user_id: user.user.id,
            title: values.judul,
            content: values.pertanyaan,
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal menyimpan data postingan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Data berhasil tersimpan");
      form.resetFields();
      onCancel();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => messageApi.error(err.message || "Gagal menyimpan"),
  });

  const onOK = () => {
    form
      .validateFields()
      .then((values) => createPostMutation.mutate(values))
      .catch(() => {});
  };

  const saving = createPostMutation.isPending;

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        onCancel={onCancel}
        title={
          <span className="text-h3 font-display text-neutral-900">
            Tulis Pertanyaan
          </span>
        }
        footer={
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60"
            >
              Batal
            </button>
            <button
              onClick={onOK}
              disabled={saving}
              className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        }
        bodyStyle={{ padding: "1.25rem", fontFamily: "Inter, sans-serif" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-caption text-neutral-700">Judul</span>}
            name="judul"
            rules={[{ required: true, message: "Judul masih kosong" }]}
          >
            <Input disabled={saving} className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Pertanyaan</span>}
            name="pertanyaan"
            rules={[{ required: true, message: "Pertanyaan masih kosong" }]}
          >
            <Input.TextArea rows={4} disabled={saving} className="text-base" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
