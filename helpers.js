/* =================================================================
   HELPERS – دوال المساعدة العامة
================================================================= */

// ========== التاريخ والوقت (بتوقيت المغرب) ==========

/**
 * ترجع تاريخ اليوم بصيغة YYYY-MM-DD حسب توقيت المغرب
 */
function today() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
}

/**
 * تنسيق تاريخ من صيغة YYYY-MM-DD إلى نص عربي (مثال: 09 يوليوز 2026)
 * إذا كانت fdate موجودة في data.js، يمكنك حذف هذا التعريف والاكتفاء بتعريف data.js الأصلي
 */
function fdate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['يناير','فبراير','مارس','أبريل','ماي','يونيو',
                  'يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];
  const monthName = months[parseInt(m, 10) - 1] || '';
  return `${parseInt(d, 10)} ${monthName} ${y}`;
}

/**
 * ترجع الشهر الحالي بصيغة YYYY-MM
 */
function currentMonth() {
  return today().substring(0, 7);
}

// ========== HTML helpers (الموجودة أصلاً في ملفك) ==========
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