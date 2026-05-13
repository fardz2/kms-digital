import { useQueries } from '@tanstack/react-query';
import moment from 'moment';
import { desaApi } from '../../api/desa.api';
import { posyanduApi } from '../../api/posyandu.api';
import { kaderApi } from '../../api/kader.api';
import { nakesApi } from '../../api/nakes.api';
import { ortuApi } from '../../api/ortu.api';
import { artikelApi } from '../../api/artikel.api';
import { qk } from '../../queries/keys';

const STALE = 2 * 60 * 1000;

function activityFromDesa(items = []) {
  return items.map((d) => ({
    id: `desa-${d.id}`,
    type: 'desa',
    title: `Desa '${d.name ?? d.nama}' ditambahkan`,
    subtitle: null,
    timestamp: d.created_at,
    href: '/admin/dashboard/desa',
  }));
}
function activityFromPosyandu(items = []) {
  return items.map((p) => ({
    id: `posyandu-${p.id}`,
    type: 'posyandu',
    title: `Posyandu '${p.nama}' ditambahkan`,
    subtitle: p.desa?.name ? `di Desa ${p.desa.name}` : null,
    timestamp: p.created_at,
    href: '/admin/dashboard/posyandu',
  }));
}
function activityFromKader(items = []) {
  return items.map((k) => ({
    id: `kader-${k.id}`,
    type: 'kader',
    title: `Kader ${k.nama} bergabung`,
    subtitle: k.posyandu?.nama ? `Posyandu ${k.posyandu.nama}` : null,
    timestamp: k.created_at,
    href: '/admin/dashboard/kader-posyandu',
  }));
}
function activityFromNakes(items = []) {
  return items.map((n) => ({
    id: `nakes-${n.id}`,
    type: 'nakes',
    title: `Tenaga Kesehatan ${n.nama} bergabung`,
    subtitle: n.desa?.name ? `Desa ${n.desa.name}` : null,
    timestamp: n.created_at,
    href: '/admin/dashboard/tenaga-kesehatan',
  }));
}
function activityFromOrtu(items = []) {
  return items.map((o) => ({
    id: `ortu-${o.id}`,
    type: 'ortu',
    title: `Orang Tua ${o.nama} mendaftar`,
    subtitle: null,
    timestamp: o.created_at,
    href: '/admin/dashboard',
  }));
}
function activityFromArtikel(items = []) {
  return items.map((a) => ({
    id: `artikel-${a.id}`,
    type: 'artikel',
    title: `Artikel '${a.judul}' diterbitkan`,
    subtitle: a.penulis ? `oleh ${a.penulis}` : null,
    timestamp: a.created_at ?? a.updated_at,
    href: '/admin/dashboard/artikel',
  }));
}

function mergeActivity(results, days = 7, limit = 10) {
  const [desa, posyandu, kader, nakes, ortu, artikel] = results;

  return [
    ...activityFromDesa(desa.data ?? []),
    ...activityFromPosyandu(posyandu.data ?? []),
    ...activityFromKader(kader.data ?? []),
    ...activityFromNakes(nakes.data ?? []),
    ...activityFromOrtu(ortu.data ?? []),
    ...activityFromArtikel(artikel.data ?? []),
  ]
    .filter((x) => {
      if (!x.timestamp) return false;
      const m = moment(x.timestamp);
      return m.isValid() && moment().diff(m, 'days') <= days;
    })
    .sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf())
    .slice(0, limit);
}

export function useAdminDashboardData() {
  return useQueries({
    queries: [
      { queryKey: qk.admin.list('desa'),     queryFn: () => desaApi.list(),     staleTime: STALE },
      { queryKey: qk.admin.list('posyandu'), queryFn: () => posyanduApi.list(), staleTime: STALE },
      { queryKey: qk.admin.list('kader'),    queryFn: () => kaderApi.list(),    staleTime: STALE },
      { queryKey: qk.admin.list('nakes'),    queryFn: () => nakesApi.list(),    staleTime: STALE },
      { queryKey: qk.admin.list('ortu'),     queryFn: () => ortuApi.list(),     staleTime: STALE },
      { queryKey: qk.admin.list('artikel'),  queryFn: () => artikelApi.list(),  staleTime: STALE },
    ],
    combine: (results) => ({
      isLoading: results.every((r) => r.isLoading),
      hasPartialError: results.some((r) => r.isError),
      stats: {
        desa:     results[0].data?.length ?? null,
        posyandu: results[1].data?.length ?? null,
        kader:    results[2].data?.length ?? null,
        nakes:    results[3].data?.length ?? null,
        ortu:     results[4].data?.length ?? null,
        artikel:  results[5].data?.length ?? null,
      },
      activity: mergeActivity(results),
    }),
  });
}
