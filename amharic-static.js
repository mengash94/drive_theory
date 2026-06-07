(function(){
  function dict(){ return window.AMHARIC_TRANSLATIONS || {}; }
  function allTexts(){
    const set = new Set();
    (window.OFFICIAL_QUESTIONS || []).forEach(q=>{
      if(q.q) set.add(String(q.q).trim());
      (q.o || []).forEach(o=>{ if(o) set.add(String(o).trim()); });
      if(q.q && q.o && Number.isInteger(q.c) && q.o[q.c]) set.add(String(q.q + '. התשובה הנכונה: ' + q.o[q.c]).trim());
    });
    (window.SIGNS || []).forEach(s=>{
      if(s.t) set.add(String(s.t).trim());
      if(s.d) set.add(String(s.d).trim());
      if(s.t && s.d) set.add(String(s.t + '. ' + s.d).trim());
    });
    return Array.from(set).filter(Boolean);
  }
  function counts(){
    const texts = allTexts();
    const d = dict();
    return {done:texts.filter(t=>d[t]).length,total:texts.length,staticCount:Object.keys(d).length};
  }
  function showStatus(){
    const el = document.getElementById('amharicStaticStatus');
    if(!el) return;
    const c = counts();
    el.textContent = 'קובץ אמהרית: ' + c.done + ' / ' + c.total;
  }
  window.translateToAmharic = function(he){
    const text = String(he || '').trim();
    const value = dict()[text];
    if(value) return Promise.resolve(value);
    return Promise.reject(new Error('Missing in amharic-data.js'));
  };
  window.addEventListener('load', function(){
    const note = document.getElementById('aboutNote');
    if(!note) return;
    const c = counts();
    const box = document.createElement('div');
    box.style.marginTop = '14px';
    box.innerHTML = '<div id="amharicStaticStatus" style="font-size:16px;color:#cdd9ee;">קובץ אמהרית: '+c.done+' / '+c.total+'</div>';
    note.appendChild(box);
  });
})();
