import { Form, Modal, Input } from "antd";
import Button from "../../ui/Button";
import { useToast } from "../../ui/Toast";
import { useSession } from "../../../features/auth/useSession";
import { useCreatePost } from "../../../queries/usePostQueries";

export default function FormInputPost({ isOpen, onCancel }) {
  const [form] = Form.useForm();
  const toast = useToast();
  const { user } = useSession();
  const createPost = useCreatePost();

  const onOK = () => {
    form
      .validateFields()
      .then((values) => {
        createPost.mutate(
          {
            user_id: user?.id,
            title: values.judul,
            content: values.pertanyaan,
          },
          {
            onSuccess: () => {
              toast.success("Data berhasil tersimpan");
              form.resetFields();
              onCancel();
            },
            onError: (err) => toast.error(err?.message ?? "Gagal menyimpan"),
          }
        );
      })
      .catch(() => {});
  };

  const saving = createPost.isPending;

  return (
    <>
      {toast.contextHolder}
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
