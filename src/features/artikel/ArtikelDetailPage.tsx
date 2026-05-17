// @ts-nocheck
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useArtikelDetail } from '../../queries/useArtikelQueries';
import { sanitizeHtml } from '../../utilities/sanitize';

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: artikel, isLoading } = useArtikelDetail(id);

  const title = artikel?.judul ?? artikel?.title ?? 'Artikel';
  const content = artikel?.content ?? artikel?.isi ?? '';

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title={isLoading ? 'Memuat...' : title}
        subtitle={
          artikel?.created_at ? moment(artikel.created_at).format('DD MMMM YYYY') : undefined
        }
      />

      <div className="px-4 py-6 max-w-reading mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Kembali
        </Button>

        {isLoading ? (
          <div className="text-neutral-500">Memuat artikel...</div>
        ) : (
          <div
            className="bg-white p-[25px] rounded-default border border-light-ash text-base text-deep-slate leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        )}
      </div>
    </div>
  );
}
