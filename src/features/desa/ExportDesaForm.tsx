import React, { useState } from 'react';
import { DatePicker, Form, Select, message } from 'antd';
import moment from 'moment';
import { Download, Printer } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useExportCsvDesa } from '../../queries/useExportQueries';
import { useSession } from '../auth/useSession';

export default function ExportDesaForm({ posyanduList = [], printableRef }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useSession();
  const [isPrinting, setIsPrinting] = useState(false);

  const exportCsv = useExportCsvDesa();

  const onSubmitCsv = () => {
    form
      .validateFields()
      .then((values) => {
        const idDesa = user?.id_desa;
        if (!idDesa) {
          messageApi.error('Data desa tidak tersedia');
          return;
        }
        exportCsv.mutate(
          {
            desa: idDesa,
            bulan: values.waktu.format('MM'),
            tahun: values.waktu.format('YYYY'),
            id: values.posyandu ?? 'all',
          },
          {
            onSuccess: () => {
              messageApi.success('Data berhasil diunduh');
            },
            onError: (err) => {
              messageApi.error(err?.message ?? 'Data gagal diunduh');
            },
          }
        );
      })
      .catch(() => {});
  };

  const handlePrintPdf = async () => {
    if (!printableRef?.current) {
      messageApi.error('Konten laporan belum siap');
      return;
    }
    try {
      setIsPrinting(true);
      const html2pdfModule = await import('js-html2pdf');
      const html2pdf = html2pdfModule.default ?? html2pdfModule;

      const filename = `Laporan-Desa-${user?.nama_desa ?? user?.desa_name ?? 'KMS'}-${moment().format('YYYY-MM-DD')}.pdf`;
      const opt = {
        margin: [12, 12, 12, 12],
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf(printableRef.current, opt).save();
      messageApi.success('Laporan PDF berhasil dibuat');
    } catch (err) {
      console.error('PDF export error:', err);
      messageApi.error('Gagal membuat laporan PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Card
      title={
        <div>
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
            Ekspor Data
          </p>
          <span className="text-heading font-semibold text-deep-slate">
            Unduh Laporan
          </span>
        </div>
      }
    >
      {contextHolder}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
        <div className="space-y-[13px]">
          <div>
            <p className="text-body-sm font-semibold text-deep-slate">
              Ekspor CSV data pengukuran
            </p>
            <p className="text-caption text-graphite mt-1">
              Pilih bulan dan posyandu untuk mengunduh detail pengukuran balita.
            </p>
          </div>
          <Form form={form} name="export_csv" layout="vertical">
            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">
                  Periode pengukuran
                </span>
              }
              name="waktu"
              rules={[{ required: true, message: 'Pilih bulan dan tahun' }]}
            >
              <DatePicker
                picker="month"
                className="w-full h-[52px] text-base"
                placeholder="Pilih bulan dan tahun"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">
                  Posyandu
                </span>
              }
              name="posyandu"
              initialValue="all"
            >
              <Select
                listHeight={200}
                optionFilterProp="children"
                showSearch
                className="h-[52px]"
                placeholder="Semua Posyandu"
              >
                <Select.Option value="all">Semua Posyandu</Select.Option>
                {posyanduList.map((item) => (
                  <Select.Option
                    key={item.id_posyandu}
                    value={item.id_posyandu}
                  >
                    {item.nama_posyandu}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button
              variant="primary"
              size="md"
              leadingIcon={<Download size={18} strokeWidth={2} />}
              onClick={onSubmitCsv}
              disabled={exportCsv.isPending}
              loading={exportCsv.isPending}
            >
              {exportCsv.isPending ? 'Mengunduh...' : 'Unduh CSV'}
            </Button>
          </Form>
        </div>

        <div className="space-y-[13px] md:border-l md:border-light-ash md:pl-[25px]">
          <div>
            <p className="text-body-sm font-semibold text-deep-slate">
              Cetak laporan PDF
            </p>
            <p className="text-caption text-graphite mt-1">
              Unduh rekap statistik gizi desa dalam format PDF siap cetak.
            </p>
          </div>
          <Button
            variant="default"
            size="md"
            leadingIcon={<Printer size={18} strokeWidth={2} />}
            onClick={handlePrintPdf}
            disabled={isPrinting || !printableRef}
            loading={isPrinting}
          >
            {isPrinting ? 'Menyiapkan...' : 'Unduh PDF'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
