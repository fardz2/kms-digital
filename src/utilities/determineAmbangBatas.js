export const determineAmbangBatas = (beratBadan, antropologiData) => {
  if (beratBadan === null) {
    return null;
  }

  if (beratBadan >= parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1pos);
    const zScorePlusOneSD =
      (beratBadan - parseFloat(antropologiData.median)) /
      (referenceSD - parseFloat(antropologiData.median));

    return zScorePlusOneSD;
  } else if (beratBadan < parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1neg);
    const zScoreMinusOneSD =
      (beratBadan - parseFloat(antropologiData.median)) /
      (parseFloat(antropologiData.median) - referenceSD);

    return zScoreMinusOneSD;
  }
};

export const determineAmbangBatasTinggiBadan = (
  tinggiBadan,
  antropologiData
) => {
  if (tinggiBadan === null) {
    return null;
  }

  if (tinggiBadan >= parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1pos);
    const zScorePlusOneSD =
      (tinggiBadan - parseFloat(antropologiData.median)) /
      (referenceSD - parseFloat(antropologiData.median));

    return zScorePlusOneSD;
  } else if (tinggiBadan < parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1neg);
    const zScoreMinusOneSD =
      (tinggiBadan - parseFloat(antropologiData.median)) /
      (parseFloat(antropologiData.median) - referenceSD);

    return zScoreMinusOneSD;
  }
};

export const determineAmbangBatasLingkarKepala = (
  lingkarKepala,
  antropologiData
) => {
  if (lingkarKepala === null) {
    return null;
  }

  if (lingkarKepala >= parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1pos);
    const zScorePlusOneSD =
      (lingkarKepala - parseFloat(antropologiData.median)) /
      (referenceSD - parseFloat(antropologiData.median));

    return zScorePlusOneSD;
  } else if (lingkarKepala < parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1neg);
    const zScoreMinusOneSD =
      (lingkarKepala - parseFloat(antropologiData.median)) /
      (parseFloat(antropologiData.median) - referenceSD);
    return zScoreMinusOneSD;
  }
};

export const determineAmbangBatasPBBB = (
  TinggiBadan,
  BeratBadan,
  antropologiData
) => {
  if (BeratBadan === null) {
    return null;
  }

  if (BeratBadan >= parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1pos);
    const zScorePlusOneSD =
      (BeratBadan - parseFloat(antropologiData.median)) /
      (referenceSD - parseFloat(antropologiData.median));

    return zScorePlusOneSD;
  } else if (BeratBadan < parseFloat(antropologiData.median)) {
    const referenceSD = parseFloat(antropologiData.SD1neg);
    const zScoreMinusOneSD =
      (BeratBadan - parseFloat(antropologiData.median)) /
      (parseFloat(antropologiData.median) - referenceSD);
    return zScoreMinusOneSD;
  }
};
