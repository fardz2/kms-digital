export const STATUS = {
  NORMAL: 'normal',
  KURANG: 'kurang',
  STUNTING: 'stunting',
  OBESITAS: 'obesitas',
  UNKNOWN: 'unknown',
};

export function classifyZScore(z) {
  if (z == null || !Number.isFinite(z)) return STATUS.UNKNOWN;
  if (z <= -3) return STATUS.STUNTING;
  if (z < -2) return STATUS.KURANG;
  if (z > 2) return STATUS.OBESITAS;
  return STATUS.NORMAL;
}

const SEVERITY = {
  [STATUS.STUNTING]: 4,
  [STATUS.OBESITAS]: 3,
  [STATUS.KURANG]: 2,
  [STATUS.NORMAL]: 1,
  [STATUS.UNKNOWN]: 0,
};

export function overallStatus({ zScoreBB, zScoreTB, zScoreLK, zScoreGizi }) {
  const candidates = [zScoreBB, zScoreTB, zScoreLK, zScoreGizi]
    .map(classifyZScore)
    .filter((s) => s !== STATUS.UNKNOWN);

  if (candidates.length === 0) return STATUS.UNKNOWN;

  return candidates.reduce((worst, current) =>
    SEVERITY[current] > SEVERITY[worst] ? current : worst
  );
}

export const STATUS_LABEL = {
  [STATUS.NORMAL]: 'Normal',
  [STATUS.KURANG]: 'Kurang',
  [STATUS.STUNTING]: 'Stunting',
  [STATUS.OBESITAS]: 'Obesitas',
  [STATUS.UNKNOWN]: '-',
};
