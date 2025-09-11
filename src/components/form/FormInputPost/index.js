import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, Row, Col, Input } from "antd";
import { message } from "antd";
import useAuth from "../../../hook/useAuth";

export default function FormInputPost({ isOpen, onCancel }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const user = useAuth();

  // Log for debugging
  console.log("FormInputPost: isOpen:", isOpen, "User:", user);

  // Mutation for creating a new post
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
      messageApi.open({
        type: "success",
        content: "Data berhasil tersimpan",
      });
      form.resetFields();
      onCancel();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => {
      console.error("FormInputPost: Error creating post:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menyimpan data postingan",
      });
      setTimeout(() => {
        onCancel();
      }, 1000);
    },
  });

  const onOK = () => {
    console.log("FormInputPost: Submitting form");
    form
      .validateFields()
      .then((values) => {
        createPostMutation.mutate(values);
      })
      .catch((info) => {
        console.log("FormInputPost: Validation failed:", info);
      });
  };

  return (
    <>
      {contextHolder}
      <Modal
        visible={isOpen} // Changed to visible for Ant Design < v4.17 compatibility
        onCancel={onCancel}
        title="Input Pertanyaan"
        footer={[
          <button
            key="back"
            type="button"
            onClick={onCancel}
            className="batal_btn"
            disabled={createPostMutation.isPending}
          >
            Batal
          </button>,
          <button
            key="submit"
            type="submit"
            onClick={onOK}
            className="simpan_btn"
            disabled={createPostMutation.isPending}
          >
            Simpan
          </button>,
        ]}
      >
        <Row>
          <Col span={24}>
            <Form form={form} name="form_input_post" layout="vertical">
              <Form.Item
                label="Judul"
                name="judul"
                rules={[
                  {
                    required: true,
                    message: "Judul masih kosong!",
                  },
                ]}
              >
                <Input disabled={createPostMutation.isPending} />
              </Form.Item>
              <Form.Item
                label="Pertanyaan"
                name="pertanyaan"
                rules={[
                  {
                    required: true,
                    message: "Pertanyaan masih kosong!",
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  disabled={createPostMutation.isPending}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
