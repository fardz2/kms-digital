// @ts-nocheck
import { Modal } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  RotateCcw,
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import FormUpdateDataArtikel from "../../components/form/FormUpdateDataArtikel";
import { useToast } from "../../components/ui/Toast";
import { formatDate2 } from "../../utilities/Format";
import { isThisMonth, isWithinDays } from "../../utilities/isThisMonth";
import { artikelApi } from "../../api/artikel.api";
import { useSession } from "../../features/auth/useSession";

export default function ArtikelList() {
  const toast = useToast();
  const [isOpenModalUpdateDataArtikel, setIsOpenModalUpdateDataArtikel] = useState(false);
  const [dataArtikel, setDataArtikel] = useState(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();

  const { data: dataSource, isLoading: artikelLoading } = useQuery({
    queryKey: ["artikel"],
    queryFn: async () => {
      const res = await artikelApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const deleteArtikelMutation = useMutation({
    mutationFn: (id) => artikelApi.remove(id),
    onSuccess: () => {
      toast.success("Artikel berhasil dihapus");
      queryClient.invalidateQueries(["artikel"]);
    },
    onError: (err) => toast.error(err?.message ?? "Data gagal dihapus"),
  });

  const isBusy = deleteArtikelMutation.isPending;

  const rows = dataSource ?? [];
  const stats = [
    { label: "Total Artikel", value: rows.length },
    {
      label: "Minggu Ini",
      value: rows.filter((a) => isWithinDays(a.created_at ?? a.updated_at, 7)).length,
      accent: "primary",
    },
    {
      label: "Bulan Ini",
      value: rows.filter((a) => isThisMonth(a.created_at ?? a.updated_at)).length,
      accent: "primary",
    },
  ];

  const columns = [
    { accessorKey: "judul", header: "Judul Berita", enableSorting: true },
    {
      id: "tanggal",
      header: "Tanggal Upload",
      accessorFn: (row) => row.updated_at,
      cell: ({ getValue }) => (
        <span className="text-graphite">{formatDate2(getValue())}</span>
      ),
      enableSorting: true,
    },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => {
              setDataArtikel(row.original);
              setIsOpenModalUpdateDataArtikel(true);
            }}
            disabled={isBusy}
          >
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => {
              Modal.confirm({
                title: "Hapus artikel?",
                icon: <AlertTriangle size={20} className="text-danger" />,
                content: "Data yang dihapus tidak dapat dikembalikan.",
                okText: "Ya, hapus",
                cancelText: "Batal",
                okButtonProps: { danger: true },
                onOk: () => deleteArtikelMutation.mutate(row.original.id),
              });
            }}
            disabled={isBusy}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Konten Edukasi"
        title="Kelola Artikel"
        subtitle="Daftar artikel terbit untuk orang tua dan kader."
        action={
          <Link to="/admin/dashboard/artikel/baru">
            <Button
              variant="primary"
              size="lg"
              leadingIcon={<Plus size={20} strokeWidth={2} />}
              disabled={isBusy}
            >
              Tulis Artikel
            </Button>
          </Link>
        }
        stats={<InlineStatBar items={stats} loading={artikelLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[17px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
          <DataTable
            columns={columns}
            data={dataSource || []}
            loading={artikelLoading || isBusy}
            searchPlaceholder="Cari artikel..."
            emptyText="Belum ada artikel"
          />
          <div className="flex justify-center mt-[17px] pt-[17px] border-t border-light-ash">
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<RotateCcw size={16} strokeWidth={1.75} />}
              onClick={() => queryClient.invalidateQueries(["artikel"])}
              disabled={isBusy}
            >
              Muat ulang
            </Button>
          </div>
        </div>
      </div>

      <FormUpdateDataArtikel
        isOpen={isOpenModalUpdateDataArtikel}
        onCancel={() => setIsOpenModalUpdateDataArtikel(false)}
        fetch={() => queryClient.invalidateQueries(["artikel"])}
        data={dataArtikel}
      />
    </div>
  );
}
