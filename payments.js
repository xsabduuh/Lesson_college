/* =================================================================
   PAYMENTS — الدفع الشهري v2 · متكامل
   ─────────────────────────────────────────────────────────────────
   3 تبويبات:
     1. الشهر الحالي   — نظرة عامة سريعة، تسجيل دفع فردي وجماعي
     2. تاريخ الأداء   — مشبكة 10 أشهر (السنة الدراسية) لكل تلميذ
     3. الإحصاءات المالية — إيرادات، معدل تحصيل، مخطط سنوي
   ─────────────────────────────────────────────────────────────────
   بنية سجل الدفع: { id, sid, cls, month, status, paid, note }
   الحالات: paid | partial | late | unpaid | none
================================================================= */

/* ── تهيئة حالة الفلاتر ─────────────────────────────────────── */
function _payInit() {
  if (!filPay.cls) filPay.cls = CLASSES[0].id;
  if (!filPay.tab) filPay.tab = 'month';
  /* تثبيت الشهر داخل حدود السنة الدراسية */
  const ym = getYearMonths();
  const cur = today().slice(0, 7);
  if (!filPay.month || !ym.includes(filPay.month)) {
    /* استخدم الشهر الحالي إذا كان في النطاق، وإلا آخر شهر متاح */
    filPay.month = ym.includes(cur) ? cur : ym[ym.length - 1];
  }
}

/* ── جلب سجل دفع تلميذ لشهر معين ───────────────────────────── */
function _payRec(sid, month) {
  return DATA.payments.find(p => p.sid === sid && p.month === month) || null;
}

/* ── معلومات الحالة: لون + تسمية ────────────────────────────── */
function _payInfo(status) {
  const map = {
    paid:    { label:'مدفوع',       cls:'paid',    color:'var(--green)',   bg:'var(--green-light)' },
    partial: { label:'جزئي',        cls:'partial',  color:'var(--amber)',   bg:'var(--amber-light)' },
    late:    { label:'متأخر',       cls:'late',     color:'var(--purple)',  bg:'var(--purple-light)' },
    unpaid:  { label:'غير مدفوع',  cls:'unpaid',   color:'var(--danger)',  bg:'var(--danger-light)' },
    none:    { label:'—',           cls:'none',     color:'var(--text-3)', bg:'var(--surface-2)' },
  };
  return map[status] || map.none;
}

/* ── ملخص مالي لقسم في شهر ──────────────────────────────────── */
function _monthSummary(cls, month) {
  const stds     = studentsOf(cls);
  let collected  = 0, pending = 0, nPaid = 0, nPartial = 0, nUnpaid = 0, nLate = 0;
  stds.forEach(s => {
    const fee = s.fee || DATA.settings.defaultFee;
    const rec = _payRec(s.id, month);
    const st  = rec ? rec.status : 'none';
    const amt = Number(rec?.paid || 0);
    if (st === 'paid')    { collected += amt || fee; nPaid++; }
    else if (st === 'partial') { collected += amt; pending += fee - amt; nPartial++; }
    else if (st === 'late')    { nLate++; pending += fee; }
    else                       { nUnpaid++; pending += fee; }
  });
  return { collected, pending, nPaid, nPartial, nUnpaid, nLate, total: stds.length };
}

/* ════════════════════════════════════════════════════════════
   renderPayments — الدالة الرئيسية
   ═══════════════════════════════════════════════════════════ */
function renderPayments() {
  _payInit();
  const sec = document.getElementById('sec-payments');
  sec.innerHTML = `
    <!-- ══ تبويبات رئيسية ══ -->
    <div class="tabs-scroll" style="margin-bottom:14px">
      ${[
        { key:'month',   label:`${IC.money}&nbsp; الشهر الحالي` },
        { key:'history', label:`${IC.calendar}&nbsp; تاريخ الأداء` },
        { key:'stats',   label:`${IC.chart}&nbsp; الإحصاءات المالية` },
      ].map(t => `
        <button class="tab-btn ${filPay.tab === t.key ? 'active' : ''}"
          onclick="setPayTab('${t.key}')">
          ${t.label}
        </button>`).join('')}
    </div>
    <div id="pay-tab-body"></div>
  `;
  _renderPayTab();
}

function _renderPayTab() {
  const body = document.getElementById('pay-tab-body');
  if (!body) return;
  switch (filPay.tab) {
    case 'month':   body.innerHTML = _monthViewHtml();   break;
    case 'history': body.innerHTML = _historyViewHtml(); break;
    case 'stats':   body.innerHTML = _statsViewHtml();   break;
  }
}

/* ════════════════════════════════════════════════════════════
   تبويب 1 — نظرة شهرية سريعة
   ═══════════════════════════════════════════════════════════ */
function _monthViewHtml() {
  const { cls, month } = filPay;
  const [y, m]   = month.split('-').map(Number);
  const stds     = studentsOf(cls);
  const allMonths = getYearMonths();
  const isFirst  = allMonths[0] === month;
  const isLast   = allMonths[allMonths.length - 1] === month;
  const sm       = _monthSummary(cls, month);
  const pct      = sm.total > 0 ? Math.round((sm.nPaid + sm.nPartial * 0.5) / sm.total * 100) : 0;
  const pctColor = pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--danger)';
  const monthName = MONTHS_AR[m - 1];

  return `
    <!-- فلتر الفصيل -->
    ${classTabsHtml(cls, 'setPayCls')}

    <!-- شريط التنقل بين الأشهر -->
    <div class="panel" style="padding:10px 14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <button class="btn btn-outline btn-sm" style="padding:8px 12px;
          ${isFirst ? 'opacity:.4;pointer-events:none' : ''}"
          onclick="shiftPayMonth(-1)" ${isFirst ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="text-align:center;flex:1">
          <div style="font-size:16px;font-weight:800;color:var(--text)">
            ${monthName} ${y}
          </div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px">
            ${sm.nPaid} مدفوع · ${sm.nPartial} جزئي · ${sm.nUnpaid + sm.nLate} غير مدفوع
          </div>
        </div>
        <button class="btn btn-outline btn-sm" style="padding:8px 12px;
          ${isLast ? 'opacity:.4;pointer-events:none' : ''}"
          onclick="shiftPayMonth(1)" ${isLast ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- إحصاءات الشهر -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div class="stat-card" style="border-top:3px solid var(--green);gap:2px">
        <div class="s-label">المحصَّل</div>
        <div class="s-val" style="color:var(--green);font-size:22px">${sm.collected.toLocaleString()}</div>
        <div class="s-sub">درهم مغربي</div>
      </div>
      <div class="stat-card" style="border-top:3px solid var(--danger);gap:2px">
        <div class="s-label">المتبقي</div>
        <div class="s-val" style="color:var(--danger);font-size:22px">${sm.pending.toLocaleString()}</div>
        <div class="s-sub">درهم مغربي</div>
      </div>
    </div>

    <!-- شريط التحصيل -->
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;
        font-size:11px;font-weight:700;margin-bottom:5px">
        <span style="color:var(--text-3)">نسبة التحصيل</span>
        <span style="color:${pctColor}">${pct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%;background:${pctColor}"></div>
      </div>
    </div>

    <!-- إجراءات جماعية -->
    ${stds.length > 0 ? `
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="btn btn-green btn-sm" style="flex:1;gap:5px"
        onclick="markAllPaid('${cls}','${month}')">
        ${IC.check}&nbsp; تحصيل الكل
      </button>
      <button class="btn btn-outline btn-sm" style="flex:1"
        onclick="resetMonthPayments('${cls}','${month}')">
        إعادة تعيين
      </button>
    </div>` : ''}

    <!-- قائمة التلاميذ -->
    ${stds.length === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ','أضف تلاميذ أولاً في قسم التلاميذ')}</div>`
      : `<div class="panel" style="padding:0;overflow:hidden">
          ${stds.map((s, i) => {
            const fee = s.fee || DATA.settings.defaultFee;
            const rec = _payRec(s.id, month);
            const st  = rec ? rec.status : 'none';
            const info = _payInfo(st);
            const amt  = Number(rec?.paid || 0);
            return `
              <div style="
                padding:12px 14px;
                border-bottom:${i < stds.length-1 ? '1px solid var(--border)' : 'none'};
                display:flex;align-items:center;gap:10px;
                background:${st==='paid' ? 'rgba(23,138,111,.04)' : st==='unpaid' ? 'rgba(220,53,69,.04)' : 'transparent'};
              ">
                <!-- الحرف الأول -->
                <div style="width:38px;height:38px;border-radius:50%;flex-shrink:0;
                  display:flex;align-items:center;justify-content:center;
                  font-size:15px;font-weight:800;
                  background:${classBg(s.cls)};color:${classColor(s.cls)}">
                  ${s.name.charAt(0)}
                </div>

                <!-- الاسم والمبلغ -->
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:700;color:var(--text);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${esc(s.name)}
                  </div>
                  <div style="font-size:11px;color:var(--text-3);margin-top:2px">
                    ${st === 'partial' && amt ? `${amt} / ${fee} د.م` : `${fee} د.م/شهر`}
                  </div>
                </div>

                <!-- الشارة + زر التسجيل -->
                <div style="display:flex;align-items:center;gap:7px;flex-shrink:0">
                  <span style="
                    font-size:11px;font-weight:800;padding:4px 9px;border-radius:8px;
                    background:${info.bg};color:${info.color};white-space:nowrap">
                    ${info.label}
                  </span>
                  <button class="btn btn-outline btn-sm" style="padding:7px 10px"
                    onclick="openPaymentForm('${s.id}','${month}')">
                    ${IC.edit}
                  </button>
                </div>
              </div>`;
          }).join('')}
        </div>`}

    <!-- الغير مدفوعون -->
    ${sm.nUnpaid + sm.nLate > 0 ? `
    <div style="margin-top:12px;padding:12px 14px;border-radius:12px;
      background:var(--danger-light);border-right:3px solid var(--danger)">
      <div style="font-size:12px;font-weight:800;color:var(--danger);margin-bottom:5px">
        لم يُؤدُّوا (${sm.nUnpaid + sm.nLate})
      </div>
      <div style="font-size:13px;color:var(--text-2);line-height:1.8">
        ${stds.filter(s => {
          const st = (_payRec(s.id, month) || {}).status;
          return !st || st === 'unpaid' || st === 'none' || st === 'late';
        }).map(s => esc(s.name)).join(' · ') || '—'}
      </div>
    </div>` : ''}
  `;
}

/* ════════════════════════════════════════════════════════════
   تبويب 2 — تاريخ الأداء السنوي
   ═══════════════════════════════════════════════════════════ */
function _historyViewHtml() {
  const { cls } = filPay;
  const stds    = studentsOf(cls);
  const months  = getYearMonths();
  const [startY] = months[0].split('-').map(Number);

  return `
    <!-- فلتر الفصيل -->
    ${classTabsHtml(cls, 'setPayCls')}

    <!-- رأس: السنة الدراسية -->
    <div class="panel" style="padding:12px 14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">
            السنة الدراسية ${startY} - ${startY + 1}
          </div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px">
            ${months.length} شهراً · اضغط على الشهر لتسجيل الأداء
          </div>
        </div>
        <!-- مفتاح الألوان -->
        <div style="display:flex;flex-direction:column;gap:4px">
          ${[
            { cls:'paid',    label:'مدفوع' },
            { cls:'partial', label:'جزئي' },
            { cls:'late',    label:'متأخر' },
          ].map(k => `
            <div style="display:flex;align-items:center;gap:5px">
              <div class="pay-month-card ${k.cls}" style="width:14px;height:14px;
                padding:0;border-radius:4px;cursor:default"></div>
              <span style="font-size:10px;color:var(--text-3);font-weight:600">${k.label}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- رأس الأعمدة: أسماء الأشهر -->
    ${stds.length === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ','أضف تلاميذ أولاً في قسم التلاميذ')}</div>`
      : stds.map(s => {
          const fee  = s.fee || DATA.settings.defaultFee;
          const recs = months.map(mo => ({ mo, rec: _payRec(s.id, mo) }));
          const nPaid   = recs.filter(r => r.rec?.status === 'paid').length;
          const nPartial = recs.filter(r => r.rec?.status === 'partial').length;
          const totalCollected = recs.reduce((acc, r) => acc + Number(r.rec?.paid || 0), 0);
          const pct = months.length > 0
            ? Math.round((nPaid + nPartial * 0.5) / months.length * 100) : 0;
          const pctColor = pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--danger)';
          return `
            <div class="panel" style="padding:0;overflow:hidden;margin-bottom:10px">
              <!-- رأس بطاقة التلميذ -->
              <div style="display:flex;align-items:center;gap:10px;
                padding:12px 14px;border-bottom:1px solid var(--border);
                background:var(--surface-2)">
                <div style="width:36px;height:36px;border-radius:50%;flex-shrink:0;
                  display:flex;align-items:center;justify-content:center;
                  font-size:14px;font-weight:800;
                  background:${classBg(s.cls)};color:${classColor(s.cls)}">
                  ${s.name.charAt(0)}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:800;color:var(--text);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${esc(s.name)}
                  </div>
                  <div style="font-size:11px;color:var(--text-3);margin-top:1px">
                    ${fee} د.م/شهر · محصَّل: ${totalCollected.toLocaleString()} د.م
                  </div>
                </div>
                <div style="font-size:13px;font-weight:800;
                  font-family:var(--mono);color:${pctColor}">
                  ${pct}%
                </div>
              </div>
              <!-- شريط التقدم -->
              <div class="progress-bar" style="height:4px;border-radius:0">
                <div class="progress-fill" style="width:${pct}%;height:100%;
                  border-radius:0;background:${pctColor}"></div>
              </div>
              <!-- مشبكة الأشهر -->
              <div class="pay-month-grid">
                ${months.map(mo => {
                  const rec  = _payRec(s.id, mo);
                  const st   = rec ? rec.status : 'none';
                  const info = _payInfo(st);
                  const [my, mm] = mo.split('-').map(Number);
                  const mName    = MONTHS_AR[mm - 1];
                  const isCurrent = mo === today().slice(0, 7);
                  return `
                    <button class="pay-month-card ${st}"
                      onclick="openPaymentForm('${s.id}','${mo}')"
                      style="${isCurrent ? 'outline:2px solid var(--accent);outline-offset:2px;' : ''}">
                      <div style="font-size:10px;margin-bottom:2px;opacity:.7">${mName}</div>
                      <div style="font-size:9px;font-weight:800">
                        ${st === 'paid' ? '✓' : st === 'partial' ? (rec?.paid || '~') + 'د' : st === 'late' ? '⚠' : st === 'unpaid' ? '✗' : '—'}
                      </div>
                    </button>`;
                }).join('')}
              </div>
            </div>`;
        }).join('')}
  `;
}

/* ════════════════════════════════════════════════════════════
   تبويب 3 — الإحصاءات المالية السنوية
   ═══════════════════════════════════════════════════════════ */
function _statsViewHtml() {
  const { cls }  = filPay;
  const stds     = studentsOf(cls);
  const months   = getYearMonths();
  const [startY] = months[0].split('-').map(Number);
  const curMonth = today().slice(0, 7);

  /* الأشهر الماضية + الشهر الحالي فقط */
  const pastMonths = months.filter(m => m <= curMonth);

  /* إجماليات السنة */
  let totalCollected = 0, totalPending = 0, totalExpected = 0;
  stds.forEach(s => {
    const fee = s.fee || DATA.settings.defaultFee;
    pastMonths.forEach(mo => {
      const rec = _payRec(s.id, mo);
      const st  = rec ? rec.status : 'none';
      totalExpected += fee;
      if (st === 'paid') {
        totalCollected += Number(rec.paid || fee);
      } else if (st === 'partial') {
        totalCollected += Number(rec.paid || 0);
        totalPending   += fee - Number(rec.paid || 0);
      } else {
        totalPending += fee;
      }
    });
  });

  const collectionRate = totalExpected > 0
    ? Math.round(totalCollected / totalExpected * 100) : 0;
  const rateColor = collectionRate >= 75 ? 'var(--green)'
    : collectionRate >= 40 ? 'var(--amber)' : 'var(--danger)';

  /* إحصاءات شهرية للمخطط */
  const monthlyData = pastMonths.map(mo => {
    let col = 0;
    stds.forEach(s => {
      const rec = _payRec(s.id, mo);
      const st  = rec ? rec.status : 'none';
      const fee = s.fee || DATA.settings.defaultFee;
      if (st === 'paid')    col += Number(rec.paid || fee);
      else if (st === 'partial') col += Number(rec.paid || 0);
    });
    const [, mm] = mo.split('-').map(Number);
    return { label: MONTHS_AR[mm - 1], col };
  });
  const maxCol = Math.max(...monthlyData.map(d => d.col), 1);

  /* إحصاءات كل تلميذ */
  const studentRows = stds.map(s => {
    const fee = s.fee || DATA.settings.defaultFee;
    let col = 0, pending = 0, nPaid = 0, nPartial = 0;
    pastMonths.forEach(mo => {
      const rec = _payRec(s.id, mo);
      const st  = rec ? rec.status : 'none';
      if (st === 'paid')    { col += Number(rec.paid || fee); nPaid++; }
      else if (st === 'partial') { col += Number(rec.paid || 0); pending += fee - Number(rec.paid || 0); nPartial++; }
      else                       { pending += fee; }
    });
    const pct = pastMonths.length > 0
      ? Math.round((nPaid + nPartial * 0.5) / pastMonths.length * 100) : 0;
    return { ...s, fee, col, pending, nPaid, nPartial, pct };
  }).sort((a, b) => b.pct - a.pct);

  return `
    <!-- فلتر الفصيل -->
    ${classTabsHtml(cls, 'setPayCls')}

    <!-- بطاقات الإجمالي -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      <div class="stat-card" style="border-top:3px solid var(--green);gap:2px;padding:12px 10px">
        <div class="s-label">المحصَّل</div>
        <div class="s-val" style="color:var(--green);font-size:18px">${totalCollected.toLocaleString()}</div>
        <div class="s-sub">درهم</div>
      </div>
      <div class="stat-card" style="border-top:3px solid var(--danger);gap:2px;padding:12px 10px">
        <div class="s-label">المتبقي</div>
        <div class="s-val" style="color:var(--danger);font-size:18px">${totalPending.toLocaleString()}</div>
        <div class="s-sub">درهم</div>
      </div>
      <div class="stat-card" style="border-top:3px solid ${rateColor};gap:2px;padding:12px 10px">
        <div class="s-label">التحصيل</div>
        <div class="s-val" style="color:${rateColor};font-size:18px">${collectionRate}%</div>
        <div class="s-sub">${pastMonths.length} شهراً</div>
      </div>
    </div>

    <!-- مخطط التحصيل الشهري -->
    ${monthlyData.length > 0 ? `
    <div class="panel" style="padding:14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:800;color:var(--text-3);
        text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">
        التحصيل الشهري — ${startY}/${startY + 1}
      </div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:80px">
        ${monthlyData.map(d => {
          const h   = maxCol > 0 ? Math.max(Math.round((d.col / maxCol) * 70), d.col > 0 ? 4 : 0) : 0;
          const isCur = pastMonths[pastMonths.length - 1] === months.find((_, i) => MONTHS_AR[parseInt(months[i].split('-')[1]) - 1] === d.label);
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="font-size:9px;font-weight:700;color:var(--text-3);
                font-family:var(--mono);opacity:${d.col > 0 ? 1 : 0}">
                ${d.col > 999 ? Math.round(d.col/1000)+'k' : d.col}
              </div>
              <div style="
                width:100%;height:${h}px;min-height:${d.col > 0 ? 4 : 0}px;
                border-radius:5px 5px 0 0;
                background:${d.col > 0 ? 'var(--accent)' : 'var(--border)'};
                opacity:${d.col > 0 ? 1 : 0.4};
                transition:height .4s ease;
                align-self:flex-end;
              "></div>
              <div style="font-size:8px;color:var(--text-3);font-weight:700;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">
                ${d.label.slice(0, 3)}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- جدول التلاميذ -->
    ${stds.length === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ','أضف تلاميذ أولاً في قسم التلاميذ')}</div>`
      : `
      <div style="font-size:11px;font-weight:800;color:var(--text-3);
        text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
        تفصيل التلاميذ (${pastMonths.length} شهر مدروس)
      </div>
      <div class="panel" style="padding:0;overflow:hidden">
        <!-- رأس -->
        <div style="display:flex;align-items:center;gap:8px;
          padding:9px 14px;background:var(--surface-2);
          border-bottom:1px solid var(--border)">
          <div style="flex:1;font-size:11px;font-weight:800;color:var(--text-3)">التلميذ</div>
          <div style="width:52px;text-align:right;font-size:10px;font-weight:800;color:var(--green)">محصَّل</div>
          <div style="width:52px;text-align:right;font-size:10px;font-weight:800;color:var(--danger)">متبقي</div>
          <div style="width:46px;text-align:center;font-size:10px;font-weight:800;color:var(--text-3)">نسبة</div>
        </div>
        <!-- صفوف -->
        ${studentRows.map((s, i) => {
          const pctColor = s.pct >= 75 ? 'var(--green)' : s.pct >= 40 ? 'var(--amber)' : 'var(--danger)';
          return `
            <div style="padding:10px 14px;
              border-bottom:${i < studentRows.length-1 ? '1px solid var(--border)' : 'none'}">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <div style="flex:1;font-size:13px;font-weight:700;color:var(--text);
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${esc(s.name)}
                </div>
                <div style="width:52px;text-align:right;font-size:12px;
                  font-weight:800;font-family:var(--mono);color:var(--green)">
                  ${s.col.toLocaleString()}
                </div>
                <div style="width:52px;text-align:right;font-size:12px;
                  font-weight:800;font-family:var(--mono);color:var(--danger)">
                  ${s.pending > 0 ? s.pending.toLocaleString() : '—'}
                </div>
                <div style="width:46px;text-align:center;font-size:12px;
                  font-weight:800;font-family:var(--mono);color:#fff;
                  background:${pctColor};padding:3px 0;border-radius:8px">
                  ${s.pct}%
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${s.pct}%;background:${pctColor}"></div>
              </div>
            </div>`;
        }).join('')}
      </div>`}
  `;
}

/* ════════════════════════════════════════════════════════════
   نموذج تسجيل الدفع
   ═══════════════════════════════════════════════════════════ */
function openPaymentForm(sid, month) {
  _payInit();
  const s   = DATA.students.find(st => st.id === sid);
  if (!s) return;
  const fee = s.fee || DATA.settings.defaultFee;
  const rec = _payRec(sid, month) || {};
  const [y, m] = month.split('-').map(Number);
  const monthName = `${MONTHS_AR[m - 1]} ${y}`;

  const statuses = [
    { val:'paid',    label:'مدفوع كاملاً' },
    { val:'partial', label:'مدفوع جزئياً' },
    { val:'late',    label:'متأخر' },
    { val:'unpaid',  label:'غير مدفوع' },
  ];

  showSheet(`أداء ${monthName}`, `
    <!-- معلومات التلميذ -->
    <div style="display:flex;align-items:center;gap:12px;
      padding:12px 14px;background:var(--surface-2);border-radius:10px;
      margin-bottom:16px">
      <div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;font-weight:800;
        background:${classBg(s.cls)};color:${classColor(s.cls)}">
        ${s.name.charAt(0)}
      </div>
      <div>
        <div style="font-size:14px;font-weight:800;color:var(--text)">${esc(s.name)}</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:2px">
          ${monthName} · الواجب: ${fee} د.م
        </div>
      </div>
    </div>

    <!-- حالة الأداء -->
    <div class="field-row">
      <label>حالة الأداء <span style="color:var(--danger)">*</span></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px"
        id="pay-status-grid">
        ${statuses.map(st => {
          const info  = _payInfo(st.val);
          const isSel = (rec.status || 'paid') === st.val;
          return `
            <button onclick="selectPayStatus('${st.val}')"
              data-status="${st.val}"
              style="
                padding:10px 8px;border-radius:10px;
                border:2px solid ${isSel ? info.color : 'var(--border)'};
                background:${isSel ? info.bg : 'var(--surface)'};
                color:${isSel ? info.color : 'var(--text-3)'};
                font-size:13px;font-weight:700;
                transition:all .15s;cursor:pointer;
              ">
              ${st.label}
            </button>`;
        }).join('')}
      </div>
    </div>
    <input type="hidden" id="xp-status" value="${rec.status || 'paid'}">

    <!-- المبلغ المدفوع -->
    <div class="field-row">
      <label>المبلغ المدفوع (درهم)</label>
      <input class="field" type="number" id="xp-amount"
        placeholder="مثال: ${fee}" min="0" max="9999"
        value="${rec.paid || ''}">
    </div>

    <!-- ملاحظات -->
    <div class="field-row">
      <label>ملاحظات</label>
      <input class="field" id="xp-note"
        placeholder="تاريخ الدفع، طريقة الدفع..."
        value="${esc(rec.note || '')}">
    </div>

    <input type="hidden" id="xp-sid"   value="${sid}">
    <input type="hidden" id="xp-month" value="${month}">
    <input type="hidden" id="xp-fee"   value="${fee}">
    <input type="hidden" id="xp-recid" value="${rec.id || ''}">
  `, [
    { label:'إلغاء',          cls:'btn-outline', fn:'closeSheet()' },
    { label:'حفظ الأداء',    cls:'btn-accent',  fn:'savePayment()' },
  ]);
}

/* اختيار حالة الأداء (تفاعلي) */
function selectPayStatus(val) {
  document.getElementById('xp-status').value = val;
  const btns = document.querySelectorAll('#pay-status-grid button');
  const statusMap = {
    paid:    { color:'var(--green)',   bg:'var(--green-light)' },
    partial: { color:'var(--amber)',   bg:'var(--amber-light)' },
    late:    { color:'var(--purple)',  bg:'var(--purple-light)' },
    unpaid:  { color:'var(--danger)',  bg:'var(--danger-light)' },
  };
  btns.forEach(btn => {
    const st   = btn.dataset.status;
    const info = statusMap[st] || { color:'var(--text-3)', bg:'var(--surface)' };
    const sel  = st === val;
    btn.style.border     = `2px solid ${sel ? info.color : 'var(--border)'}`;
    btn.style.background = sel ? info.bg : 'var(--surface)';
    btn.style.color      = sel ? info.color : 'var(--text-3)';
  });
  /* إذا مدفوع كاملاً، ملء المبلغ تلقائياً */
  if (val === 'paid') {
    const amtEl = document.getElementById('xp-amount');
    if (amtEl && !amtEl.value) {
      amtEl.value = document.getElementById('xp-fee').value;
    }
  }
}

/* ── حفظ الدفع ────────────────────────────────────────────── */
function savePayment() {
  const sid    = document.getElementById('xp-sid').value;
  const month  = document.getElementById('xp-month').value;
  const status = document.getElementById('xp-status').value || 'paid';
  const paid   = document.getElementById('xp-amount').value.trim();
  const note   = document.getElementById('xp-note').value.trim();
  const recId  = document.getElementById('xp-recid').value;
  const fee    = Number(document.getElementById('xp-fee').value);
  const s      = DATA.students.find(st => st.id === sid);

  /* تحقق من صحة المبلغ حسب الحالة */
  let paidAmt = 0;
  if (status === 'paid') {
    paidAmt = fee;                                            // مدفوع كاملاً = الرسم الكامل
  } else if (status === 'partial') {
    paidAmt = Math.min(Math.max(Number(paid) || 0, 0), fee); // [0 .. fee]
    if (!paidAmt) { toast('أدخل المبلغ المدفوع جزئياً', 'error'); return; }
  } else {
    paidAmt = 0;                                             // متأخر / غير مدفوع
  }

  const obj = {
    sid,
    cls:   s ? s.cls : '',
    month,
    status,
    paid:  paidAmt,
    note,
  };

  if (recId) {
    const idx = DATA.payments.findIndex(p => p.id === recId);
    if (idx !== -1) Object.assign(DATA.payments[idx], obj);
    toast('تم تحديث الأداء', 'success');
  } else {
    DATA.payments.push({ id: uid(), ...obj });
    toast('تم تسجيل الأداء', 'success');
  }

  save();
  closeSheet();
  renderPayments();
}

/* ════════════════════════════════════════════════════════════
   إجراءات جماعية
   ═══════════════════════════════════════════════════════════ */

/* تحصيل جميع تلاميذ القسم لشهر واحد */
function markAllPaid(cls, month) {
  const stds = studentsOf(cls);
  if (!stds.length) return;
  stds.forEach(s => {
    const fee = s.fee || DATA.settings.defaultFee;
    const idx = DATA.payments.findIndex(p => p.sid === s.id && p.month === month);
    const obj = { sid: s.id, cls, month, status: 'paid', paid: fee, note: '' };
    if (idx !== -1) Object.assign(DATA.payments[idx], obj);
    else DATA.payments.push({ id: uid(), ...obj });
  });
  save();
  toast(`تم تحصيل ${stds.length} تلميذ ✓`, 'success');
  renderPayments();
}

/* إعادة تعيين شهر كامل (حذف السجلات) */
function resetMonthPayments(cls, month) {
  const count = DATA.payments.filter(p => p.cls === cls && p.month === month).length;
  if (!count) { toast('لا توجد سجلات لإعادة تعيينها'); return; }
  if (!confirm(`هل تريد إعادة تعيين سجلات ${count} تلميذ لهذا الشهر؟`)) return;
  DATA.payments = DATA.payments.filter(p => !(p.cls === cls && p.month === month));
  save();
  toast('تمت إعادة تعيين الشهر');
  renderPayments();
}

/* ════════════════════════════════════════════════════════════
   دوال التحكم
   ═══════════════════════════════════════════════════════════ */
function setPayTab(tab) {
  _payInit();
  filPay.tab = tab;
  renderPayments();
}

/* setPayCls — متوافق مع router.js */
function setPayCls(cls) {
  _payInit();
  filPay.cls = cls;
  renderPayments();
}

/* التنقل بين أشهر السنة الدراسية */
function shiftPayMonth(delta) {
  _payInit();
  const months = getYearMonths();
  const idx    = months.indexOf(filPay.month);
  const next   = idx + delta;
  if (next >= 0 && next < months.length) {
    filPay.month = months[next];
    renderPayments();
  }
}

/* openPaymentSheet — توافق مع router.js القديم */
function openPaymentSheet() {
  toast('اختر تلميذاً لتسجيل الأداء', 'info');
}
