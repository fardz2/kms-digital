export const formatDate2 = (date) => {
  const tanggalLahir = new Date(date);

  const formattedDate = tanggalLahir.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formattedDate;
};
