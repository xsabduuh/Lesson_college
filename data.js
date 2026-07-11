/* =================================================================
   HELPERS – دوال المساعدة العامة
================================================================= */

// ========== التاريخ والوقت (بتوقيت المغرب) ==========

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

const MONTHS = ['يناير','فبراير','مارس','أبريل','ماي','يونيو',
                'يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];

function fdate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const monthName = MONTHS[parseInt(m, 10) - 1] || '';
  return `${parseInt(d, 10)} ${monthName} ${y}`;
}

function currentMonth() {
  return today().substring(0, 7);
}

// ========== دوال تعريفية موحدة ==========

function uid() {
  return '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========== HTML helpers ==========

function adminBtns(editFn, delFn) {
  if (!DATA.settings.adminMode) return '';
  return `<div class="admin-actions">
    <button class="btn-icon accent" onclick="${editFn}">${IC.edit}</button>
    <button class="btn-icon danger"  onclick="${delFn}">${IC.trash}</button>
  </div>`;
}

function classTabsHtml(active, fn, showAll = false) {
  const allBtn = showAll
    ? `<button class="class-tab ${active === 'all' ? 'active' : ''}" onclick="${fn}('all')">الكل</button>`
    : '';
  return `<div class="class-tabs">
    ${allBtn}
    ${CLASSES.map(c => `<button class="class-tab ${active === c.id ? 'act-' + c.id : ''}" onclick="${fn}('${c.id}')">${c.label}</button>`).join('')}
  </div>`;
}

function subjPillsHtml(active, fn, all = false) {
  const allBtn = all
    ? `<button class="subj-pill ${active === '' ? '' : ''}" onclick="${fn}('')">الكل</button>`
    : '';
  return `<div class="subj-row">
    ${allBtn}
    ${SUBJECTS.map(s => `<button class="subj-pill ${active === s.id ? s.cls : ''}" onclick="${fn}('${s.id}')">${s.label}</button>`).join('')}
  </div>`;
}

function classColor(cls) {
  const found = CLASSES.find(c => c.id === cls);
  return found?.color || 'var(--c1)';
}

function classBg(cls) {
  const found = CLASSES.find(c => c.id === cls);
  return found?.bg || 'var(--c1-bg)';
}

function classBadge(cls) {
  const found = CLASSES.find(c => c.id === cls);
  return found?.badge || 'badge-c1';
}

function emptyHtml(title, sub) {
  return `<div class="empty">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12" opacity=".4"/></svg>
    <h4>${title}</h4><p>${sub}</p>
  </div>`;
}