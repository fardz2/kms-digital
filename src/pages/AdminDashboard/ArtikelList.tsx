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
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { formatDate2 } from "../../utils/Format";
import { isThisMonth, isWithinDays } from "../../utils/isThisMonth";
import { artikelApi } from "../../api/artikel.api";
import { qk } from "../../queries/keys";
import { useSession } from "../../features/auth/useSession";

export default function ArtikelList() {
  const toast = useToast();
  const confirm = useConfirmDialog();
  const [isOpenModalUpdateDataArtikel, setIsOpenModalUpdateDataArtikel] = useState(false);
  const [dataArtikel, setDataArtikel] = useState(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();

  const { data: dataSource, isLoading: artikelLoading } = useQuery({
    queryKey: qk.artikel.list,
    queryFn: async () => {
      const res = await artikelApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const deleteArtikelMutation = useMutation({
    mutationFn: (id) => artikelApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.artikel.list });
      const previous = queryClient.getQueryData(qk.artikel.list);
      queryClient.setQueryData(qk.artikel.list, (old) =>
        Array.isArray(old)
          ? old.filter((item) => (item.id ?? item.artikel_id) !== id)
          : old
      );
      return { previous };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(qk.artikel.list, ctx.previous);
      }
      toast.error(err?.message ?? "Data gagal dihapus");
    },
    onSuccess: () => {
      toast.success("Artikel berhasil dihapus");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.artikel.all });
    },
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
            data-tour-id="admin-artikel-edit-button"
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
            data-tour-id="admin-artikel-delete-button"
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => {
              confirm({
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
        dataTourId="admin-artikel-header"
        action={
          <Link to="/admin/dashboard/artikel/baru">
            <Button
              data-tour-id="admin-artikel-new-button"
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
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]" data-tour-id="admin-artikel-table">
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
              onClick={() => queryClient.invalidateQueries({ queryKey: qk.artikel.all })}
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
        fetch={() => queryClient.invalidateQueries({ queryKey: qk.artikel.all })}
        data={dataArtikel}
      />
    </div>
  );
}
