/* =================================================================
   HTML HELPERS
================================================================= */
function classTabsHtml(active,fn){
  return `<div class="class-tabs">
    ${CLASSES.map(c=>`<button class="class-tab ${active===c.id?'act-'+c.id:''}" onclick="${fn}('${c.id}')">${c.label}</button>`).join('')}
  </div>`;
}
function subjPillsHtml(active,fn,all=false){
  const allBtn=all?`<button class="subj-pill ${active===''?'math':''}" onclick="${fn}('')">الكل</button>`:'';
  return `<div class="subj-row">
    ${allBtn}
    ${SUBJECTS.map(s=>`<button class="subj-pill ${active===s.id?s.cls:''}" onclick="${fn}('${s.id}')">${s.label}</button>`).join('')}
  </div>`;
}
function classColor(cls){ return cls==='1ere'?'var(--c1)':'var(--c2)'; }
function classBg(cls){    return cls==='1ere'?'var(--c1-bg)':'var(--c2-bg)'; }
function classBadge(cls){ return cls==='1ere'?'badge-c1':'badge-c2'; }
function emptyHtml(title,sub){
  return `<div class="empty">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12" opacity=".4"/></svg>
    <h4>${title}</h4><p>${sub}</p>
  </div>`;
}
function adminBtns(editFn,delFn){
  return `<div class="admin-actions">
    <button class="btn-icon accent" onclick="${editFn}">${IC.edit}</button>
    <button class="btn-icon danger"  onclick="${delFn}">${IC.trash}</button>
  </div>`;
}