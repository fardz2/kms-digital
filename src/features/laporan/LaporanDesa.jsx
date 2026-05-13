import React from 'react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import { useSession } from '../auth/useSession';

function sumCategory(cat) {
  if (!cat || typeof cat !== 'object') return 0;
  return Object.values(cat).reduce((acc, v) => acc + Number(v || 0), 0);
}

function aggregateDesa(statistik) {
  if (!Array.isArray(statistik) || statistik.length === 0) {
    return {
      totalBalita: 0,
      perPosyandu: [],
      distribusiBB: {},
      distribusiTB: {},
      distribusiLK: {},
    };
  }

  const perPosyandu = statistik.map((p) => ({
    id: p.id_posyandu,
    nama: p.nama_posyandu,
    total: sumCategory(p.berat_badan),
  }));
  const totalBalita = perPosyandu.reduce((acc, x) => acc + x.total, 0);

  const reduceCategory = (key) => {
    const acc = {};
    statistik.forEach((p) => {
      const cat = p[key] ?? {};
      Object.entries(cat).forEach(([k, v]) => {
        acc[k] = (acc[k] ?? 0) + Number(v || 0);
      });
    });
    return acc;
  };

  return {
    totalBalita,
    perPosyandu,
    distribusiBB: reduceCategory('berat_badan'),
    distribusiTB: reduceCategory('tinggi_badan'),
    distribusiLK: reduceCategory('lingkar_kepala'),
  };
}

const LABEL_MAP = {
  normal: 'Normal',
  kurus: 'Kurus',
  sangat_kurus: 'Sangat Kurus',
  gemuk: 'Gemuk',
  tinggi: 'Tinggi',
  pendek: 'Pendek',
  sangat_pendek: 'Sangat Pendek',
  makrosefali: 'Makrosefali',
  mikrosefali: 'Mikrosefali',
};

function Distribusi({ distribusi, total }) {
  const entries = Object.entries(distribusi);
  if (entries.length === 0 || total === 0) {
    return <div className="text-neutral-500">Belum ada data</div>;
  }
  return (
    <div className="flex flex-col gap-3">
      {entries.map(([k, v]) => (
        <ProgressBar
          key={k}
          value={Number(v) || 0}
          max={total || 1}
          label={LABEL_MAP[k] ?? k}
        />
      ))}
    </div>
  );
}

export default function LaporanDesa() {
  const { user } = useSession();
  const idDesa = user?.id_desa ?? user?.desa_id;
  const { data, isLoading } = useStatistikGiziDesa(idDesa);

  const agg = aggregateDesa(data);

  if (!idDesa) {
    return (
      <Card>
        <div className="text-center text-neutral-500">
          Data desa tidak tersedia
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="text-neutral-500">Memuat laporan...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        <StatCard label="Total Balita" value={agg.totalBalita} icon="👶" />
        <StatCard
          label="Posyandu Aktif"
          value={agg.perPosyandu.length}
          icon="🏥"
          accent="accent"
        />
      </div>

      <Card title="Rekap per Posyandu">
        {agg.perPosyandu.length === 0 ? (
          <div className="text-neutral-500">Belum ada data</div>
        ) : (
          <div className="flex flex-col gap-4">
            {agg.perPosyandu.map((p) => (
              <ProgressBar
                key={p.id}
                value={p.total}
                max={agg.totalBalita || 1}
                label={p.nama}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="Sebaran Berat Badan (total desa)">
        <Distribusi distribusi={agg.distribusiBB} total={agg.totalBalita} />
      </Card>

      <Card title="Sebaran Tinggi Badan (total desa)">
        <Distribusi distribusi={agg.distribusiTB} total={agg.totalBalita} />
      </Card>

      <Card title="Sebaran Lingkar Kepala (total desa)">
        <Distribusi distribusi={agg.distribusiLK} total={agg.totalBalita} />
      </Card>
    </div>
  );
}
