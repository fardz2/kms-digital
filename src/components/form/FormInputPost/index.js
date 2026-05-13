import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, Input, message } from "antd";
import Button from "../../ui/Button";
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
          <span className="text-heading font-semibold text-deep-slate">
            Tulis Pertanyaan
          </span>
        }
        footer={
          <div className="flex gap-[13px] justify-end">
            <Button
              variant="default"
              size="md"
              onClick={onCancel}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onOK}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Judul</span>}
            name="judul"
            rules={[{ required: true, message: "Judul masih kosong" }]}
          >
            <Input
              disabled={saving}
              className="h-[52px] text-base"
              placeholder="Tulis judul pertanyaan"
            />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Pertanyaan</span>}
            name="pertanyaan"
            rules={[{ required: true, message: "Pertanyaan masih kosong" }]}
          >
            <Input.TextArea
              rows={5}
              disabled={saving}
              className="text-base"
              placeholder="Tuliskan pertanyaan Anda secara lengkap"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
