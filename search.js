/* =================================================================
   SEARCH (البحث)
================================================================= */
let searchQ='';
function renderSearch(){
  const sec=document.getElementById('sec-search');
  sec.innerHTML=`
    <div class="search-bar">
      ${IC.search}
      <input id="global-search" placeholder="ابحث في التلاميذ، الدروس، التمارين..." autofocus
        oninput="doSearch(this.value)" value="${esc(searchQ)}">
      ${searchQ?`<button onclick="doSearch('')" style="color:var(--text-3)">✕</button>`:''}
    </div>
    <div id="search-results">${searchQ?buildSearchResults(searchQ):`<div class="empty"><h4>ابدأ الكتابة للبحث</h4><p>يبحث في التلاميذ، الدروس، التمارين، الفروض، المصطلحات</p></div>`}</div>
  `;
  setTimeout(()=>document.getElementById('global-search')?.focus(),100);
}
function doSearch(q){
  searchQ=q;
  const res=document.getElementById('search-results');
  if(!res)return;
  if(!q){res.innerHTML=`<div class="empty"><h4>ابدأ الكتابة للبحث</h4><p>يبحث في جميع محتويات التطبيق</p></div>`;return;}
  res.innerHTML=buildSearchResults(q);
}
function buildSearchResults(q){
  if(!q)return'';
  const ql=q.toLowerCase();
  const results=[];
  DATA.students.forEach(s=>{
    if(s.name.toLowerCase().includes(ql)||(s.phone||'').includes(ql))
      results.push({type:'تلميذ',title:s.name,sub:s.phone||clsById(s.cls).label,nav:`navigate('student-detail','${s.id}')`});
  });
  DATA.lessons.forEach(l=>{
    if(l.title.toLowerCase().includes(ql)||(l.summary||'').toLowerCase().includes(ql)||(l.content||'').toLowerCase().includes(ql))
      results.push({type:'درس',title:l.title,sub:subjById(l.subj).label,nav:`navigate('lessons')`});
  });
  DATA.exercises.forEach(e=>{
    if(e.title.toLowerCase().includes(ql)||(e.content||'').toLowerCase().includes(ql))
      results.push({type:'تمرين',title:e.title,sub:subjById(e.subj).label+' · '+(e.level||''),nav:`navigate('exercises')`});
  });
  DATA.homework.forEach(h=>{
    if(h.title.toLowerCase().includes(ql)||(h.content||'').toLowerCase().includes(ql))
      results.push({type:'فرض',title:h.title,sub:fdate(h.dueDate||''),nav:`navigate('homework')`});
  });
  DATA.glossary.forEach(t=>{
    if(t.word.toLowerCase().includes(ql)||(t.definition||'').toLowerCase().includes(ql))
      results.push({type:'مصطلح',title:t.word,sub:t.definition?t.definition.slice(0,50):'',nav:`navigate('glossary')`});
  });
  DATA.sessions.forEach(x=>{
    if(x.title.toLowerCase().includes(ql)||(x.lesson||'').toLowerCase().includes(ql))
      results.push({type:'حصة',title:x.title,sub:fdate(x.date),nav:`navigate('sessions')`});
  });
  if(results.length===0)
    return `<div class="empty"><h4>لا توجد نتائج</h4><p>جرب كلمة بحث أخرى</p></div>`;
  return `<div style="font-size:12px;color:var(--text-3);margin-bottom:8px;font-weight:700">${results.length} نتيجة</div>
    <div class="panel">
      ${results.slice(0,30).map(r=>`
        <div class="search-result-item" onclick="${r.nav}">
          <span class="search-result-type">${r.type}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">${esc(r.title)}</div>
            <div style="font-size:11px;color:var(--text-3)">${esc(r.sub)}</div>
          </div>
          <span style="color:var(--text-3)">${IC.chev}</span>
        </div>`).join('')}
    </div>`;
}