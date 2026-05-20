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
};

export type GuideSection = {
  id: string;
  title: string;
  route: string;
  screenshotFile: string;
  steps: GuideStep[];
  expectedResult: string;
  tips: string[];
};

export type GuideRole = {
  id: GuideRoleId;
  title: string;
  summary: string;
  sections: GuideSection[];
};
