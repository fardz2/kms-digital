import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import Button from "./Button";
import { useToast } from "./Toast";
import {
  readSession,
  writeSession,
} from "../../features/auth/session-storage";
import {
  useProfile,
  useUpdateProfile,
} from "../../queries/useProfileQueries";

export default function ProfileModal({
  open,
  onClose,
  fallbackName,
  variant = "full",
}) {
  const [form] = Form.useForm();
  const toast = useToast();
  const { data: profileData, isLoading } = useProfile(open);
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (!open) return;
    const name = profileData?.user?.name ?? fallbackName ?? "User";
    form.setFieldsValue({ nama: name });
  }, [open, profileData, fallbackName, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        updateProfile.mutate(values, {
          onSuccess: (response) => {
            toast.success("Profil berhasil diperbarui");
            const currentSession = readSession();
            if (currentSession) {
              writeSession({
                ...currentSession,
                user: {
                  ...currentSession.user,
                  name: response.data.user.name,
                },
              });
            }
            form.resetFields();
            onClose();
          },
          onError: (err) =>
            toast.error(err?.message ?? "Gagal memperbarui profil"),
        });
      })
      .catch(() => {});
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const isPending = updateProfile.isPending;
  const namaDisabled = variant === "password-only";

  return (
    <>
      {toast.contextHolder}
      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            {variant === "password-only" ? "Ubah Kata Sandi" : "Profil Pengguna"}
          </span>
        }
        open={open}
        onCancel={handleClose}
        footer={
          <div className="flex gap-[13px] justify-end">
            <Button
              variant="default"
              size="md"
              onClick={handleClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isPending || isLoading}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Nama
              </span>
            }
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input
              disabled={namaDisabled || isLoading}
              className="h-[52px] text-base"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Kata Sandi Baru
              </span>
            }
            name="password"
            rules={[{ min: 8, message: "Minimal 8 karakter" }]}
          >
            <Input.Password
              placeholder="Kosongkan jika tidak diubah"
              className="h-[52px] text-base"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Konfirmasi Kata Sandi
              </span>
            }
            name="password_confirmation"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Kata sandi tidak cocok"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Ulangi kata sandi"
              className="h-[52px] text-base"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
