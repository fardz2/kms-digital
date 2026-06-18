const fs = require('fs');
const file = fs.readFileSync('anak.json', 'utf8');
const json = JSON.parse(file);
const arr = Array.isArray(json) ? json : json.data;

const totals = {
  normal: 0,
  kurang: 0,
  stunting: 0,
  obesitas: 0
};

arr.forEach(d => {
  if(d.gizi) {
    totals.normal += d.gizi.normal || 0;
    totals.kurang += d.gizi.kurang || 0;
    totals.stunting += d.gizi.stunting || 0;
    totals.obesitas += d.gizi.obesitas || 0;
  }
});

console.log("Total anak:", arr.length);
console.log("Rekap Gizi:", totals);
