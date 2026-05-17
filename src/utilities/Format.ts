export const formatDate = (date) => {
  const tanggalLahir = new Date(date);

  const formattedDate = tanggalLahir.toLocaleDateString("id-ID",{ day: "2-digit"})
  + "/" + tanggalLahir.toLocaleDateString("id-ID",{ month: "2-digit"})
  + "/" + tanggalLahir.toLocaleDateString("id-ID",{ year: "numeric"});
  // +" " + tanggalLahir.toLocaleTimeString();
  return formattedDate;
};

export const formatDate2 = (date) => {
  const tanggalLahir = new Date(date);

  const formattedDate = tanggalLahir.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formattedDate;
};

export  function limitWords(text, limit) {
  var words = text.trim().split(" ");
  var limitedText = words.slice(0, limit).join(" ");
  
  if (words.length > limit) {
    limitedText += "...";
  }
  
  return limitedText;
}
