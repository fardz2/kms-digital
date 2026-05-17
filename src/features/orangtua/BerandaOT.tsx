import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Plus, ChevronRight, MessageCircle, Newspaper } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useAnakList } from '../../queries/useAnakQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

function QuickLink({ Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[17px] w-full p-[21px] bg-white border border-light-ash rounded-default text-left hover:border-graphite/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
    >
      <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-polar-mist text-primary-600 shrink-0">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-body-sm font-semibold text-deep-slate">{title}</span>
        <span className="block text-caption text-graphite mt-1">{desc}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.75} className="text-graphite shrink-0" />
    </button>
  );
}

export default function BerandaOT() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: anakList, isLoading, refetch } = useAnakList();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-faint-fog">
      <Navbar isLogin />
      <PageHeader
        title={`Halo, ${user?.name ?? 'Orang Tua'}`}
        eyebrow="Orang Tua"
        subtitle="Pantau pertumbuhan anak Anda."
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[50px]">
        <section className="space-y-[21px]">
          <div className="flex justify-between items-center gap-[13px] flex-wrap">
            <div>
              <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
                Data Anak
              </p>
              <h2 className="text-heading-lg font-bold text-deep-slate leading-[1.15] tracking-tight m-0">
                Anak Saya
              </h2>
            </div>
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={20} strokeWidth={2} />}
              onClick={() => setFormOpen(true)}
            >
              Tambah Anak
            </Button>
          </div>

          {isLoading && (
            <div className="text-body-sm text-graphite">Memuat data anak...</div>
          )}

          {!isLoading && (!anakList || anakList.length === 0) && (
            <Card>
              <div className="text-center py-[33px] space-y-[13px]">
                <p className="text-body-sm text-graphite">
                  Belum ada data anak. Tambah anak pertama Anda untuk mulai mencatat pertumbuhan.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  leadingIcon={<Plus size={18} strokeWidth={2} />}
                  onClick={() => setFormOpen(true)}
                >
                  Tambah Anak Pertama
                </Button>
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-[13px]">
            {(anakList ?? []).map((anak) => {
              const umurBulan = anak.tanggal_lahir
                ? moment().diff(moment(anak.tanggal_lahir), 'month')
                : null;
              return (
                <Card
                  key={anak.id}
                  onClick={() => navigate(`/orangtua/balita/${anak.id}`)}
                >
                  <div className="flex justify-between items-center gap-[13px]">
                    <div className="min-w-0">
                      <div className="text-heading-sm font-semibold text-deep-slate truncate">
                        {anak.nama}
                      </div>
                      <div className="text-caption text-graphite mt-1">
                        {umurBulan != null ? `${umurBulan} bulan � ` : ''}
                        {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>
                    <ChevronRight size={18} strokeWidth={1.75} className="text-graphite shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-[21px]">
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-graphite">
            Lainnya
          </p>
          <div className="flex flex-col gap-[8px]">
            <QuickLink
              Icon={MessageCircle}
              title="Forum Tanya Jawab"
              desc="Tanya tenaga kesehatan tentang anak Anda"
              onClick={() => navigate('/orangtua/forum')}
            />
            <QuickLink
              Icon={Newspaper}
              title="Artikel Kesehatan"
              desc="Baca artikel edukasi gizi dan tumbuh kembang"
              onClick={() => navigate('/artikel')}
            />
          </div>
        </section>
      </div>

      <FormInputDataAnak
        isOpen={formOpen}
        onCancel={() => {
          setFormOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
