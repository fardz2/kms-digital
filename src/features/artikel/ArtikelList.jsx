import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useArtikelList } from '../../queries/useArtikelQueries';

export default function ArtikelList() {
  const navigate = useNavigate();
  const { data: artikel, isLoading } = useArtikelList();

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="Artikel Kesehatan" subtitle="Edukasi gizi dan pengasuhan balita" />

      <div className="px-4 py-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Kembali
        </Button>

        {isLoading && <div className="text-neutral-500">Memuat...</div>}

        {!isLoading && (!artikel || artikel.length === 0) && (
          <Card>
            <div className="text-center py-6 text-neutral-500">
              Belum ada artikel
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {(artikel ?? []).map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/artikel/${item.id}`)}
            >
              <div className="text-h3 font-display text-neutral-900 mb-1">
                {item.judul ?? item.title ?? '-'}
              </div>
              {item.created_at && (
                <div className="text-caption text-neutral-500">
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
