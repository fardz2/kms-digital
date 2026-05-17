// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ArrowLeft, BookOpen } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useArtikelList } from '../../queries/useArtikelQueries';

export default function ArtikelList() {
  const navigate = useNavigate();
  const { data: artikel, isLoading } = useArtikelList();

  return (
    <div className="min-h-screen bg-faint-fog">
      <PageHeader
        title="Artikel Kesehatan"
        subtitle="Edukasi gizi dan pengasuhan balita"
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px]">
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<ArrowLeft size={16} strokeWidth={1.75} />}
          onClick={() => navigate(-1)}
          className="mb-[17px]"
        >
          Kembali
        </Button>

        {isLoading && (
          <div className="text-body-sm text-graphite">Memuat artikel...</div>
        )}

        {!isLoading && (!artikel || artikel.length === 0) && (
          <Card>
            <div className="flex flex-col items-center gap-[13px] py-[25px] text-graphite">
              <BookOpen size={32} strokeWidth={1.75} />
              <span className="text-body-sm">Belum ada artikel</span>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-[13px]">
          {(artikel ?? []).map((item) => (
            <Card key={item.id} onClick={() => navigate(`/artikel/${item.id}`)}>
              <div className="text-heading font-semibold text-deep-slate mb-1">
                {item.judul ?? item.title ?? '-'}
              </div>
              {item.created_at && (
                <div className="text-caption text-graphite">
                  {moment(item.created_at).format('DD MMMM YYYY')}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
