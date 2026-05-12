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
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader title="Artikel Kesehatan" subtitle="Edukasi gizi dan pengasuhan balita" />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          ← Kembali
        </Button>

        {isLoading && <div>Memuat...</div>}

        {!isLoading && (!artikel || artikel.length === 0) && (
          <Card>
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-muted)',
                padding: 'var(--space-lg)',
              }}
            >
              Belum ada artikel
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {(artikel ?? []).map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/artikel/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                {item.judul ?? item.title ?? '-'}
              </div>
              {item.created_at && (
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-muted)',
                  }}
                >
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
