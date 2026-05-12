import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useArtikelDetail } from '../../queries/useArtikelQueries';

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: artikel, isLoading } = useArtikelDetail(id);

  const title = artikel?.judul ?? artikel?.title ?? 'Artikel';
  const content = artikel?.content ?? artikel?.isi ?? '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title={isLoading ? 'Memuat...' : title}
        subtitle={
          artikel?.created_at ? moment(artikel.created_at).format('DD MMMM YYYY') : undefined
        }
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          ← Kembali
        </Button>

        {isLoading ? (
          <div>Memuat artikel...</div>
        ) : (
          <div
            style={{
              background: 'var(--color-bg)',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              fontSize: 'var(--text-base)',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
}
