/* script.js - Cold Cloud (dynamic templates + export) */
const ADMIN_PASSWORD = "cc2025"; // << CHANGE THIS in your repo to a strong password

/* auth */
function requireAuth(redirectTo){
  try {
    if(localStorage.getItem('cc_auth')==='1'){ if(redirectTo) location.href=redirectTo; return true; }
    const pw = prompt('Enter owner password:');
    if(pw === ADMIN_PASSWORD){
      localStorage.setItem('cc_auth','1');
      if(redirectTo) location.href = redirectTo;
      return true;
    }
    alert('Access denied.'); return false;
  } catch(e){ console.error(e); return false; }
}

/* localStorage helpers */
function saveRecord(key, data){
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  data._created = new Date().toISOString();
  arr.unshift(data);
  localStorage.setItem(key, JSON.stringify(arr));
  return arr;
}
function loadRecords(key){ return JSON.parse(localStorage.getItem(key) || '[]'); }
function deleteRecord(key, idx){
  const arr = loadRecords(key); arr.splice(idx,1); localStorage.setItem(key, JSON.stringify(arr)); return arr;
}

/* populate saved list */
function populateSavedList(storageKey, selectId, previewFunc){
  const sel = document.getElementById(selectId);
  if(!sel) return;
  const arr = loadRecords(storageKey);
  sel.innerHTML = `<option value="">-- Choose saved --</option>`;
  arr.forEach((r,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${new Date(r._created).toLocaleString()} - ${r.client || r.no || 'Record'}`;
    sel.appendChild(opt);
  });
  sel.onchange = function(){
    if(this.value==='') return;
    const idx = parseInt(this.value,10);
    const rec = arr[idx];
    if(window[previewFunc]) window[previewFunc](rec);
  }
}

/* print preview: open popup containing element.innerHTML and call print */
function printElement(id){
  const el = document.getElementById(id);
  if(!el){ alert('Preview not found'); return; }
  const html = `<html><head><title>Print - Cold Cloud</title><link rel="stylesheet" href="style.css"></head><body>${el.outerHTML}</body></html>`;
  const w = window.open('','_blank');
  w.document.write(html); w.document.close();
  setTimeout(()=> w.print(), 600);
}

/* export element to PDF using html2canvas + jsPDF */
async function exportElementToPDF(elementId, filename='document.pdf'){
  if(!window.html2canvas || !window.jspdf){ alert('Libraries not loaded'); return; }
  const el = document.getElementById(elementId);
  if(!el){ alert('Element not found'); return; }
  const canvas = await html2canvas(el, {scale:2, useCORS:true, backgroundColor: null});
  const img = canvas.toDataURL('image/png');
  const pdf = new jspdf.jsPDF('p','mm','a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(img);
  const pdfHeight = (imgProps.height * pdfWidth)/imgProps.width;
  pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

/* small util to format currency */
function toCurrency(n){ return Number(n||0).toFixed(2); }
