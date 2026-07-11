/* =================================================================
   GLOSSARY — المصطلحات v2 · احترافي
   ─────────────────────────────────────────────────────────────────
   1. إحصاءات سريعة (إجمالي + توزيع بالمواد)
   2. شريط بحث فوري
   3. تصفية بالمادة + الفصيل
   4. فرز: أبجدي / حديث / بالوحدة
   5. بطاقات منسقة (عربي + فرنسي + مثال + وحدة)
   6. نموذج إضافة/تعديل متكامل
   7. مصطلحات مدمجة جاهزة للاستيراد (رياضيات / فيزياء / علوم)
================================================================= */
 
/* ── تهيئة حالة الفلاتر ────────────────────────────────────────── */
function _glossInit() {
  if (filGloss.subj  === undefined) filGloss.subj  = '';
  if (filGloss.q     === undefined) filGloss.q     = '';
  if (filGloss.sort  === undefined) filGloss.sort  = 'newest';
}

/* ════════════════════════════════════════════════════════════
   renderGlossary — الدالة الرئيسية
   ═══════════════════════════════════════════════════════════ */
function renderGlossary() {
  _glossInit();
  const { subj, q, sort } = filGloss;

  /* ── تصفية البيانات ── */
  let items = DATA.glossary.slice();

  if (subj) items = items.filter(t => t.subj === subj);

  if (q.trim()) {
    const kw = q.trim().toLowerCase();
    items = items.filter(t =>
      (t.word       || '').toLowerCase().includes(kw) ||
      (t.wordFr     || '').toLowerCase().includes(kw) ||
      (t.definition || '').toLowerCase().includes(kw) ||
      (t.unit       || '').toLowerCase().includes(kw)
    );
  }

  /* ── فرز ── */
  if (sort === 'alpha') {
    items.sort((a, b) => (a.word || '').localeCompare(b.word || '', 'ar'));
  } else if (sort === 'subj') {
    items.sort((a, b) => (a.subj||'').localeCompare(b.subj||''));
  } else {
    items = items.reverse(); // newest
  }

  /* ── إحصاءات إجمالية ── */
  const total   = DATA.glossary.length;
  const bySub   = SUBJECTS.map(s => ({
    ...s,
    count: DATA.glossary.filter(t => t.subj === s.id).length
  }));

  /* ── الأقسام للعرض المجمّع بالوحدة ── */
  let grouped = {};
  if (sort === 'subj' || (!subj && !q)) {
    items.forEach(t => {
      const key = t.unit || '—';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });
  }
  const useGroups = Object.keys(grouped).length > 1;

  const sec = document.getElementById('sec-glossary');
  sec.innerHTML = `

    <!-- ══ 1. الإحصاءات ══ -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      <!-- الإجمالي -->
      <button onclick="setGlossSubj('')" style="
        background:${!subj ? 'var(--accent)' : 'var(--accent-light)'};
        border:none;border-radius:14px;padding:12px 6px;
        text-align:center;cursor:pointer;transition:all .2s;
        box-shadow:${!subj ? '0 4px 14px rgba(0,0,0,.18)' : 'none'};
      ">
        <div style="font-size:24px;font-weight:800;font-family:var(--mono);
          color:${!subj ? '#fff' : 'var(--accent)'};line-height:1.1">${total}</div>
        <div style="font-size:10px;font-weight:700;margin-top:4px;
          color:${!subj ? 'rgba(255,255,255,.8)' : 'var(--accent)'}">الكل</div>
      </button>
      <!-- المواد -->
      ${bySub.map(s => `
        <button onclick="setGlossSubj('${s.id}')" style="
          background:${subj===s.id ? s.color : s.bg};
          border:none;border-radius:14px;padding:12px 6px;
          text-align:center;cursor:pointer;transition:all .2s;
          box-shadow:${subj===s.id ? '0 4px 14px rgba(0,0,0,.18)' : 'none'};
        ">
          <div style="font-size:24px;font-weight:800;font-family:var(--mono);
            color:${subj===s.id ? '#fff' : s.color};line-height:1.1">${s.count}</div>
          <div style="font-size:10px;font-weight:700;margin-top:4px;
            color:${subj===s.id ? 'rgba(255,255,255,.8)' : s.color}">${s.short}</div>
        </button>`).join('')}
    </div>

    <!-- ══ 2. شريط البحث والفرز ══ -->
    <div class="panel" style="padding:10px 12px;margin-bottom:12px">
      <div style="display:flex;gap:8px;align-items:center">
        <div class="search-bar" style="flex:1;margin-bottom:0">
          ${IC.search}
          <input type="search" class="field" id="gloss-search"
            placeholder="ابحث في المصطلحات..."
            value="${esc(q)}"
            oninput="setGlossQ(this.value)"
            style="border:none;background:none;outline:none;
              font-size:13px;width:100%;color:var(--text)">
        </div>
        <select class="field" style="width:auto;padding:8px 10px;font-size:12px"
          onchange="setGlossSort(this.value)">
          <option value="newest"  ${sort==='newest' ?'selected':''}>الأحدث</option>
          <option value="alpha"   ${sort==='alpha'  ?'selected':''}>أ-ب</option>
          <option value="subj"    ${sort==='subj'   ?'selected':''}>بالمادة</option>
        </select>
      </div>
    </div> 

    <!-- ══ 4. قائمة المصطلحات ══ -->
    ${items.length === 0
      ? `<div class="panel">${emptyHtml(
          q ? 'لا توجد نتائج' : 'لا توجد مصطلحات',
          q ? 'جرّب كلمة أخرى' : 'اضغط + لإضافة مصطلح'
        )}</div>`
      : useGroups
        ? Object.entries(grouped).map(([unit, terms]) => `
            <div style="margin-bottom:6px">
              <div class="divider-label">${esc(unit)}</div>
              ${terms.map(t => _glossCard(t)).join('')}
            </div>`).join('')
        : items.map(t => _glossCard(t)).join('')
    }
  `;
}

/* ════════════════════════════════════════════════════════════
   بطاقة مصطلح (نسخة مبسطة: عربي + فرنسي + مادة فقط)
   ═══════════════════════════════════════════════════════════ */
function _glossCard(t) {
  const s = subjById(t.subj);
  return `
    <div class="term-card" style="
      border-right:3px solid ${s.color || 'var(--accent)'};
      transition:box-shadow .15s;
    ">
      <!-- رأس البطاقة -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;
        margin-bottom:8px">
        <div style="flex:1;min-width:0">
          <div class="term-word" style="font-size:16px;font-weight:800;
            color:var(--text);line-height:1.3">
            ${esc(t.word)}
          </div>
          ${t.wordFr ? `
            <div style="font-size:12px;color:var(--accent);font-style:italic;
              margin-top:1px;font-weight:600">
              ${esc(t.wordFr)}
            </div>` : ''}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;margin-right:8px">
          <button class="btn-icon accent" onclick="openGlossaryForm('${t.id}')"
            aria-label="تعديل">${IC.edit}</button>
          <button class="btn-icon danger"  onclick="deleteGlossary('${t.id}')"
            aria-label="حذف">${IC.trash}</button>
        </div>
      </div>

      <!-- الوسوم: المادة فقط -->
      <div class="term-tags" style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge badge-${s.cls}" style="font-size:10px">
          ${s.short}
        </span>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   نموذج إضافة / تعديل (من دون تعريف، مثال، وفصل)
   ═══════════════════════════════════════════════════════════ */
function openGlossaryForm(id) {
  _glossInit();
  const t = id ? DATA.glossary.find(x => x.id === id) : {};
  if (id && !t) return;

  const x        = t || {};
  const defSubj  = filGloss.subj || SUBJECTS[0]?.id || 'math';
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${(x.subj || defSubj) === s.id ? 'selected' : ''}>
      ${s.label}
    </option>`
  ).join('');

  showSheet(id ? 'تعديل مصطلح' : 'إضافة مصطلح جديد', `

    <!-- المصطلح بالعربية -->
    <div class="field-row">
      <label>المصطلح بالعربية <span class="req">*</span></label>
      <input class="field" id="tf-word" value="${esc(x.word || '')}"
        placeholder="مثال: دالة عددية" autofocus>
    </div>

    <!-- المصطلح بالفرنسية -->
    <div class="field-row">
      <label>المصطلح بالفرنسية <span class="req">*</span></label>
      <input class="field" id="tf-wordfr" value="${esc(x.wordFr || '')}"
        placeholder="مثال: Fonction numérique"
        style="direction:ltr;text-align:right">
    </div>

    <!-- المادة -->
    <div class="field-row">
      <label>المادة <span class="req">*</span></label>
      <select class="field" id="tf-subj">${subjOpts}</select>
    </div>

    <input type="hidden" id="tf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء',  cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',    cls: 'btn-accent',  fn: 'saveGlossary()' },
  ]);
}

/* ════════════════════════════════════════════════════════════
   حفظ / حذف
   ═══════════════════════════════════════════════════════════ */
function saveGlossary() {
  const id     = document.getElementById('tf-id').value;
  const word   = document.getElementById('tf-word').value.trim();
  const wordFr = document.getElementById('tf-wordfr').value.trim();
  const subj   = document.getElementById('tf-subj').value;

  if (!word || !wordFr || !subj) {
    toast('يجب ملء المصطلح بالعربية والفرنسية والمادة', 'error');
    return;
  }

  const obj = {
    word,
    wordFr,
    definition: '',
    example: '',
    subj,
    unit: '',
  };

  if (id) {
    const idx = DATA.glossary.findIndex(x => x.id === id);
    if (idx !== -1) Object.assign(DATA.glossary[idx], obj);
    toast('تم تحديث المصطلح', 'success');
  } else {
    DATA.glossary.push({ id: uid(), ...obj });
    toast('تمت إضافة المصطلح', 'success');
  }

  save();
  closeSheet();
  renderGlossary();
}

function deleteGlossary(id) {
  if (!confirm('هل تريد حذف هذا المصطلح نهائياً؟')) return;
  DATA.glossary = DATA.glossary.filter(t => t.id !== id);
  save();
  toast('تم حذف المصطلح');
  renderGlossary();
}

/* ════════════════════════════════════════════════════════════
   دوال الفلاتر
   ═══════════════════════════════════════════════════════════ */
function setGlossSubj(subj) { _glossInit(); filGloss.subj = subj; renderGlossary(); }
function setGlossQ(q)       { _glossInit(); filGloss.q    = q;    renderGlossary(); }
function setGlossSort(s)    { _glossInit(); filGloss.sort = s;     renderGlossary(); }