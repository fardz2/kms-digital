import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { SkeletonText } from '../../components/ui/Skeleton';
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
          leadingIcon={<ArrowLeft size={16} strokeWidth={1.75} />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Kembali
        </Button>

        {isLoading ? (
          <div className="bg-white p-[25px] rounded-default border border-light-ash">
            <SkeletonText lines={6} />
          </div>
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
