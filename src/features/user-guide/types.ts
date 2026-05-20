export type GuideRoleId =
  | 'ADMIN'
  | 'DESA'
  | 'KADER_POSYANDU'
  | 'TENAGA_KESEHATAN'
  | 'ORANG_TUA';

export type GuideStep = {
  id: string;
  label: string;
  action: string;
  result: string;
  targetSelector?: string;
};

export type GuideSection = {
  id: string;
  title: string;
  route: string;
  screenshotFile: string;
  purpose?: string;
  screenshotHint?: string;
  steps: GuideStep[];
  expectedResult: string;
  tips: string[];
};

export type GuideRole = {
  id: GuideRoleId;
  title: string;
  summary: string;
  accentColor?: string;
  sections: GuideSection[];
};
