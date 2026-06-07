// Amharic preload/cache for Drive Theory
// Translates questions/options once, stores them in localStorage, and reuses them for TTS.
(function(){
  const CACHE_KEY = 'driveTheoryAmharicCacheV1';
  const STATUS_ID = 'amharicPreloadStatus';
  const BTN_ID = 'amharicPreloadBtn';
  const DELAY = 250;
  let cache = load();
  let running = false;
  const originalTranslate = window.translateToAmharic;
  const originalSetLanguage = window.setLanguage;

  function load(){
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function save(){
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
    catch(e){ console.error('Cannot save Amharic cache', e); }
  }
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
  function allTexts(){
    const set = new Set();
    (window.OFFICIAL_QUESTIONS || []).forEach(q => {
      if(q.q) set.add(String(q.q).trim());
      (q.o || []).forEach(o => { if(o) set.add(String(o).trim()); });
    });
    return Array.from(set).filter(Boolean);
  }
  function counts(){
    const arr = allTexts();
    return {done: arr.filter(t => cache[t]).length, total: arr.length};
  }
  function status(msg){
    const el = document.getElementById(STATUS_ID);
    if(el) el.textContent = msg;
  }
  async function translateRemote(text){
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=he&tl=am&dt=t&q=' + encodeURIComponent(text);
    const r = await fetch(url);
    if(!r.ok) throw new Error('Translate failed: ' + r.status);
    const j = await r.json();
    const am = (j[0] || []).map(x => x[0]).join('').trim();
    if(!am) throw new Error('Empty translation');
    return am;
  }
  async function startAmharicPreload(){
    if(running) return;
    running = true;
    const btn = document.getElementById(BTN_ID);
    if(btn) btn.disabled = true;
    try{
      const arr = allTexts();
      for(let i=0;i<arr.length;i++){
        const t = arr[i];
        if(!cache[t]){
          cache[t] = await translateRemote(t);
          if(i % 10 === 0) save();
          await sleep(DELAY);
        }
        status('מכין אמהרית: ' + (i+1) + ' / ' + arr.length);
      }
      save();
      status('האמהרית מוכנה במכשיר הזה: ' + arr.length + ' טקסטים נשמרו.');
    }catch(e){
      console.error('Amharic preload failed', e);
      save();
      const c = counts();
      status('התרגום נעצר. נשמרו ' + c.done + ' מתוך ' + c.total + '. לחץ שוב להמשך.');
    }finally{
      running = false;
      if(btn) btn.disabled = false;
    }
  }
  window.startAmharicPreload = startAmharicPreload;
  window.translateToAmharic = function(he){
    const text = String(he || '').trim();
    if(!text) return Promise.resolve('');
    if(cache[text]) return Promise.resolve(cache[text]);
    if(typeof originalTranslate === 'function'){
      return originalTranslate(text).then(am => {
        if(am){ cache[text] = am; save(); }
        return am;
      });
    }
    return translateRemote(text).then(am => { cache[text] = am; save(); return am; });
  };
  if(typeof originalSetLanguage === 'function'){
    window.setLanguage = function(lang){
      originalSetLanguage(lang);
      if(lang === 'am'){
        const c = counts();
        if(c.total && c.done < c.total) startAmharicPreload();
      }
    };
  }
  window.addEventListener('load', function(){
    const note = document.getElementById('aboutNote');
    if(!note) return;
    const c = counts();
    const box = document.createElement('div');
    box.style.marginTop = '14px';
    box.innerHTML = '<button id="'+BTN_ID+'" onclick="startAmharicPreload()" style="width:100%;min-height:64px;border:none;border-radius:14px;background:#ffd400;color:#000;font-size:20px;font-weight:900;cursor:pointer;">הכן את כל ההקראה באמהרית</button><div id="'+STATUS_ID+'" style="margin-top:10px;font-size:16px;color:#cdd9ee;">אמהרית מוכנה: '+c.done+' / '+c.total+'</div>';
    note.appendChild(box);
    if(localStorage.getItem('audioLang') === 'am' && c.done < c.total) startAmharicPreload();
  });
})();
