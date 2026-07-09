/* =================================================================
   DASHBOARD — لوحة القيادة v2
   معلومات ضرورية وعملية للأستاذ بلا تشتت
   ─────────────────────────────────────────────────────────────────
   الأقسام:
   1. رأس اليوم — التاريخ + ملخص فوري
   2. بطاقات الأقسام — تلاميذ + معدل + حضور + تقدم الدروس
   3. حضور اليوم — تفصيل فوري
   4. الأداء الأكاديمي — معدلات حسب المادة والقسم
   5. التنبيهات — متأخرون، متغيبون، أداءات معلقة
   6. آخر النقاط المسجلة
   7. الفروض القادمة + الحصص
   8. مخطط بياني — معدلات المواد
================================================================= */

function renderDashboard() {
  const t         = today();
  const thisMonth = t.slice(0, 7);

  /* ── بيانات أساسية ─────────────────────────────────────── */
  const allStudents  = DATA.students;
  const activeStud   = allStudents.filter(s => s.status === 'نشط' || !s.status);
  const todayAtt     = DATA.attendance.filter(a => a.date === t);
  const monthAtt     = DATA.attendance.filter(a => (a.date || '').startsWith(thisMonth));
  const todaySess    = (DATA.sessions || []).filter(s => s.date === t)
                         .sort((a, b) => (a.time || '') > (b.time || '') ? 1 : -1);
  const upcomingSess = (DATA.sessions || []).filter(s => s.date > t)
                         .sort((a, b) => a.date > b.date ? 1 : -1).slice(0, 4);
  const allLessons   = DATA.lessons   || [];
  const allGrades    = DATA.grades    || [];
  const allHomework  = DATA.homework  || [];
  const allPayments  = DATA.payments  || [];
  const allExercises = DATA.exercises || [];

  const lessonsDone  = allLessons.filter(l => l.status === 'done').length;
  const lessonsTotal = allLessons.length;
  const pendingHW    = allHomework.filter(h => !h.completed && h.dueDate && h.dueDate >= t)
                         .sort((a, b) => a.dueDate > b.dueDate ? 1 : -1);
  const unpaidCount  = allPayments.filter(p => p.month === thisMonth &&
                         (p.status === 'unpaid' || p.status === 'late')).length;

  /* ── إحصاء كل قسم ──────────────────────────────────────── */
  const classStats = CLASSES.map(c => {
    const stds      = studentsOf(c.id);
    const grades    = allGrades.filter(g => g.cls === c.id && g.max > 0);
    const avg       = grades.length
      ? grades.reduce((s, g) => s + (g.score / g.max) * 20, 0) / grades.length
      : null;
    const attMonth  = monthAtt.filter(a => a.cls === c.id);
    const attTotal  = attMonth.length;
    const attPresent= attMonth.filter(a => a.status === 'present').length;
    const attRate   = attTotal ? Math.round(attPresent / attTotal * 100) : null;
    const lessons   = allLessons.filter(l => l.cls === c.id);
    const ldone     = lessons.filter(l => l.status === 'done').length;
    const lpct      = lessons.length ? Math.round(ldone / lessons.length * 100) : 0;
    const todayP    = todayAtt.filter(a => a.cls === c.id && a.status === 'present').length;
    const todayA    = todayAtt.filter(a => a.cls === c.id && a.status === 'absent').length;
    const todayL    = todayAtt.filter(a => a.cls === c.id && a.status === 'late').length;
    return { ...c, stds, avg, attRate, lpct, ldone, ltotal: lessons.length, todayP, todayA, todayL };
  });

  /* ── معدلات حسب المادة والقسم ──────────────────────────── */
  const subjectMatrix = SUBJECTS.map(subj => {
    const perClass = CLASSES.map(cls => {
      const g = allGrades.filter(x => x.subj === subj.id && x.cls === cls.id && x.max > 0);
      const avg = g.length ? g.reduce((s, x) => s + (x.score / x.max) * 20, 0) / g.length : null;
      return { cls: cls.id, clsLabel: cls.short, avg };
    });
    return { ...subj, perClass };
  });

  /* ── التنبيهات ──────────────────────────────────────────── */
  const alerts = _dashAlerts(allStudents, allGrades, monthAtt, allPayments, thisMonth, t);

  /* ── آخر النقاط المسجلة ─────────────────────────────────── */
  const recentGrades = allGrades
    .slice().sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1)
    .slice(0, 6);

  /* ── تسمية التاريخ بالعربية ─────────────────────────────── */
  const dateLabel = (() => {
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const d    = new Date();
    const [y, m, dy] = t.split('-');
    return `${days[d.getDay()]} ${parseInt(dy)} ${MONTHS_AR[+m-1]} ${y}`;
  })();

  const sec = document.getElementById('sec-dashboard');
  sec.innerHTML = `

    <!-- ══ رأس اليوم ══ -->
    <div class="panel" style="margin-bottom:12px;padding:14px 16px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-size:11px;color:var(--text-3);font-weight:600;
            text-transform:uppercase;letter-spacing:.5px">اليوم</div>
          <div style="font-size:17px;font-weight:800;margin-top:2px">${dateLabel}</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${_quickChip('التلاميذ النشطون', activeStud.length)}
          ${_quickChip('حصص اليوم', todaySess.length)}
          ${_quickChip('دروس مُدرَّسة', lessonsDone + (lessonsTotal ? ' / ' + lessonsTotal : ''))}
          ${unpaidCount ? _quickChip('أداءات معلقة', unpaidCount, 'var(--danger)') : ''}
          ${alerts.length  ? _quickChip('تنبيهات', alerts.length, 'var(--danger)') : ''}
        </div>
      </div>
    </div>

    <!-- ══ بطاقات الأقسام ══ -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-bottom:12px">
      ${classStats.map(c => `
        <div class="panel" style="padding:14px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:10px;
              background:${c.bg||'var(--bg-2)'};color:${c.color||'var(--accent)'};
              display:flex;align-items:center;justify-content:center;
              font-weight:800;font-size:16px;flex-shrink:0">
              ${c.short}
            </div>
            <div>
              <div style="font-weight:800;font-size:14px">${c.label}</div>
              <div style="font-size:11px;color:var(--text-3)">${c.stds.length} تلميذ</div>
            </div>
          </div>
          <!-- صفوف الإحصاء -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;text-align:center">
              <div style="font-size:18px;font-weight:800;font-family:var(--mono);
                color:${c.avg!=null?(c.avg>=10?'var(--green)':'var(--danger)'):'var(--text-3)'}">
                ${c.avg != null ? c.avg.toFixed(1) : '—'}
              </div>
              <div style="font-size:10px;color:var(--text-3)">معدل النقاط /20</div>
            </div>
            <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;text-align:center">
              <div style="font-size:18px;font-weight:800;font-family:var(--mono);
                color:${c.attRate!=null?(c.attRate>=75?'var(--green)':'var(--danger)'):'var(--text-3)'}">
                ${c.attRate != null ? c.attRate + '%' : '—'}
              </div>
              <div style="font-size:10px;color:var(--text-3)">نسبة الحضور (الشهر)</div>
            </div>
          </div>
          <!-- تقدم الدروس -->
          ${c.ltotal > 0 ? `
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;
                font-size:11px;color:var(--text-3);margin-bottom:4px">
                <span>تقدم الدروس</span>
                <span>${c.ldone} / ${c.ltotal} (${c.lpct}%)</span>
              </div>
              <div style="height:5px;background:var(--bg-2);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${c.lpct}%;
                  background:var(--accent);border-radius:4px;transition:width .4s"></div>
              </div>
            </div>` : ''}
          <!-- حضور اليوم لهذا القسم -->
          ${(c.todayP + c.todayA + c.todayL) > 0 ? `
            <div style="display:flex;gap:6px;font-size:11px">
              <span style="padding:3px 8px;border-radius:6px;
                background:var(--green-light,#dcfce7);color:var(--green)">
                ${c.todayP} حاضر
              </span>
              ${c.todayA > 0 ? `<span style="padding:3px 8px;border-radius:6px;
                background:#fee2e2;color:var(--danger)">
                ${c.todayA} غائب
              </span>` : ''}
              ${c.todayL > 0 ? `<span style="padding:3px 8px;border-radius:6px;
                background:#fef9c3;color:#92400e">
                ${c.todayL} متأخر
              </span>` : ''}
            </div>` : `
            <div style="font-size:11px;color:var(--text-3)">لم يُسجَّل حضور اليوم بعد</div>`}
        </div>`).join('')}
    </div>

    <!-- ══ الأداء الأكاديمي حسب المادة ══ -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">معدلات النقاط حسب المادة</div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="border-bottom:2px solid var(--border)">
              <th style="text-align:right;padding:7px 10px;color:var(--text-3);
                font-size:11px;font-weight:600">المادة</th>
              ${CLASSES.map(c => `
                <th style="text-align:center;padding:7px 10px;color:var(--text-3);
                  font-size:11px;font-weight:600">${c.short}</th>`).join('')}
              <th style="text-align:center;padding:7px 10px;color:var(--text-3);
                font-size:11px;font-weight:600">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${subjectMatrix.map(subj => {
              const allSubjG = allGrades.filter(g => g.subj === subj.id && g.max > 0);
              const globalAvg = allSubjG.length
                ? allSubjG.reduce((s, g) => s + (g.score/g.max)*20, 0) / allSubjG.length
                : null;
              return `
                <tr style="border-bottom:1px solid var(--border)">
                  <td style="padding:9px 10px;font-weight:700">${subj.label}</td>
                  ${subj.perClass.map(p => `
                    <td style="padding:9px 10px;text-align:center;
                      font-family:var(--mono);font-weight:700;
                      color:${p.avg!=null?(p.avg>=10?'var(--green)':'var(--danger)'):'var(--text-3)'}">
                      ${p.avg != null ? p.avg.toFixed(1) : '—'}
                    </td>`).join('')}
                  <td style="padding:9px 10px;text-align:center;
                    font-family:var(--mono);font-weight:800;
                    color:${globalAvg!=null?(globalAvg>=10?'var(--green)':'var(--danger)'):'var(--text-3)'}">
                    ${globalAvg != null ? globalAvg.toFixed(1) : '—'}
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ مخطط معدلات المواد ══ -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">مخطط الأداء العام</div>
      <div class="chart-wrap">
        <canvas id="dash-chart" height="160"
          style="width:100%;max-width:100%"></canvas>
      </div>
    </div>

    <!-- ══ صفان: التنبيهات + حصص اليوم ══ -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-bottom:12px">

      <!-- التنبيهات -->
      <div class="panel">
        <div class="panel-title">
          التنبيهات
          ${alerts.length ? `<span style="font-size:11px;color:var(--danger);font-weight:600">
            (${alerts.length})</span>` : ''}
        </div>
        ${!alerts.length
          ? `<div style="padding:12px 0;font-size:13px;color:var(--text-3);text-align:center">
              لا توجد تنبيهات
             </div>`
          : alerts.slice(0, 8).map(a => `
              <div style="display:flex;align-items:flex-start;gap:10px;
                padding:8px 0;border-bottom:1px solid var(--border)">
                <div style="width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px;
                  background:${a.level==='high'?'var(--danger)':'var(--amber,#f59e0b)'}"></div>
                <div>
                  <div style="font-size:13px;font-weight:600">${esc(a.title)}</div>
                  <div style="font-size:11px;color:var(--text-3)">${esc(a.detail)}</div>
                </div>
              </div>`).join('')}
      </div>

      <!-- حصص اليوم والقادمة -->
      <div class="panel">
        <div class="panel-title">حصص اليوم</div>
        ${!todaySess.length
          ? `<div style="padding:12px 0;font-size:13px;color:var(--text-3);text-align:center">
              لا توجد حصص مسجلة اليوم
             </div>`
          : todaySess.map(s => {
              const sj = subjById(s.subj);
              const cl = clsById(s.cls);
              return `
                <div style="display:flex;align-items:center;gap:10px;
                  padding:8px 0;border-bottom:1px solid var(--border)">
                  <div style="width:36px;height:36px;border-radius:8px;flex-shrink:0;
                    background:${sj.bg||'var(--bg-2)'};color:${sj.color||'var(--accent)'};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:800;font-size:12px">${sj.short}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600">${esc(s.title)}</div>
                    <div style="font-size:11px;color:var(--text-3)">
                      ${cl.short}${s.time ? ' — ' + s.time : ''}
                    </div>
                  </div>
                </div>`;
            }).join('')}
        ${upcomingSess.length ? `
          <div style="margin-top:10px">
            <div style="font-size:11px;font-weight:700;color:var(--text-3);
              text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">
              الحصص القادمة
            </div>
            ${upcomingSess.map(s => {
              const sj = subjById(s.subj);
              const cl = clsById(s.cls);
              return `
                <div style="display:flex;align-items:center;gap:8px;
                  padding:6px 0;border-bottom:1px solid var(--border)">
                  <div style="font-size:11px;font-family:var(--mono);color:var(--text-3);
                    min-width:72px">${fdate(s.date)}</div>
                  <div style="font-size:12px;flex:1;min-width:0">
                    <span style="font-weight:600">${esc(s.title)}</span>
                    <span style="color:var(--text-3)"> · ${cl.short} · ${sj.short}</span>
                  </div>
                </div>`;
            }).join('')}
          </div>` : ''}
      </div>
    </div>

    <!-- ══ صفان: آخر النقاط + الفروض القادمة ══ -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-bottom:12px">

      <!-- آخر النقاط المسجلة -->
      <div class="panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="panel-title" style="margin:0">آخر النقاط المسجلة</div>
          <button class="btn btn-outline" style="font-size:11px"
            onclick="navigate('grades')">كل النقاط</button>
        </div>
        ${!recentGrades.length
          ? `<div style="padding:12px 0;font-size:13px;color:var(--text-3);text-align:center">
              لم تُسجَّل أي نقطة بعد
             </div>`
          : recentGrades.map(g => {
              const st    = allStudents.find(x => x.id === g.sid);
              const pct   = g.max > 0 ? g.score / g.max : 0;
              const scClr = pct >= 0.7 ? 'var(--green)' : pct >= 0.5 ? '#d97706' : 'var(--danger)';
              const scBg  = pct >= 0.7 ? '#dcfce7'      : pct >= 0.5 ? '#fef9c3'  : '#fee2e2';
              return `
                <div style="display:flex;align-items:center;gap:10px;
                  padding:8px 0;border-bottom:1px solid var(--border)">
                  <div style="min-width:46px;height:36px;border-radius:8px;
                    background:${scBg};color:${scClr};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:800;font-size:13px;font-family:var(--mono);flex-shrink:0">
                    ${g.score}<span style="font-size:9px;opacity:.6">/${g.max}</span>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:600">
                      ${esc(st ? st.name : '—')}
                    </div>
                    <div style="font-size:11px;color:var(--text-3)">
                      ${esc(g.title || g.type || 'نقطة')} · ${fdate(g.date)}
                    </div>
                  </div>
                  <div style="font-size:14px;font-weight:800;font-family:var(--mono);
                    color:${pct>=0.5?'var(--green)':'var(--danger)'}">
                    ${(pct*20).toFixed(1)}
                  </div>
                </div>`;
            }).join('')}
      </div>

      <!-- الفروض القادمة + المحتوى -->
      <div class="panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="panel-title" style="margin:0">الفروض القادمة</div>
          <button class="btn btn-outline" style="font-size:11px"
            onclick="navigate('homework')">كل الفروض</button>
        </div>
        ${!pendingHW.length
          ? `<div style="padding:12px 0;font-size:13px;color:var(--text-3);text-align:center">
              لا توجد فروض قادمة
             </div>`
          : pendingHW.slice(0, 6).map(h => {
              const cl = clsById(h.cls);
              const sj = subjById(h.subj);
              const daysLeft = Math.ceil((new Date(h.dueDate) - new Date(t)) / 86400000);
              const urgent   = daysLeft <= 2;
              return `
                <div style="display:flex;align-items:center;gap:10px;
                  padding:8px 0;border-bottom:1px solid var(--border)">
                  <div style="min-width:44px;text-align:center">
                    <div style="font-size:16px;font-weight:800;font-family:var(--mono);
                      color:${urgent?'var(--danger)':'var(--text)'}">
                      ${daysLeft}
                    </div>
                    <div style="font-size:9px;color:var(--text-3)">يوم</div>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:600">${esc(h.title)}</div>
                    <div style="font-size:11px;color:var(--text-3)">
                      ${cl.short} · ${sj.short} · ${fdate(h.dueDate)}
                    </div>
                  </div>
                  ${urgent ? `<div style="width:6px;height:6px;border-radius:50%;
                    background:var(--danger);flex-shrink:0"></div>` : ''}
                </div>`;
            }).join('')}

        <!-- ملخص المحتوى الرقمي -->
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">
          <div style="font-size:11px;font-weight:700;color:var(--text-3);
            text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
            مخزون المحتوى
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            ${[
              ['الدروس',     allLessons.length,   lessonsDone + ' مُدرَّس'],
              ['التمارين',   allExercises.length,  allExercises.filter(e=>e.isFavorite).length + ' مفضل'],
              ['الفروض',     allHomework.length,   allHomework.filter(h=>h.completed).length + ' منجز'],
              ['المصطلحات',  (DATA.glossary||[]).length, ''],
            ].map(([label, count, sub]) => `
              <div style="background:var(--bg-2);border-radius:8px;padding:8px;text-align:center">
                <div style="font-size:18px;font-weight:800;font-family:var(--mono)">${count}</div>
                <div style="font-size:10px;color:var(--text-3)">${label}</div>
                ${sub ? `<div style="font-size:9px;color:var(--text-3)">${sub}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ══ وصول سريع ══ -->
    <div class="panel">
      <div class="panel-title">وصول سريع</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">
        ${[
          ['grades',     'النقاط',      IC.chart, 'var(--accent)',  'var(--accent-light,#e0e7ff)'],
          ['attendance', 'الحضور',      IC.check, 'var(--green)',   'var(--green-light,#dcfce7)'],
          ['lessons',    'الدروس',      IC.book,  'var(--math)',    'var(--math-bg)'],
          ['exercises',  'التمارين',    IC.pen,   'var(--phy)',     'var(--phy-bg)'],
          ['homework',   'الفروض',      IC.clip,  'var(--danger)',  '#fee2e2'],
          ['students',   'التلاميذ',    IC.user,  'var(--svt)',     'var(--svt-bg)'],
          ['glossary',   'المصطلحات',   IC.book2, 'var(--purple,#7c3aed)', '#ede9fe'],
          ['sessions',   'الحصص',       IC.clock, 'var(--text-2)',  'var(--bg-2)'],
        ].map(([key, label, icon, color, bg]) => `
          <button onclick="navigate('${key}')"
            style="display:flex;flex-direction:column;align-items:center;gap:6px;
              padding:14px 8px;background:${bg};border-radius:var(--radius-lg);
              border:1px solid var(--border);cursor:pointer;transition:transform .15s;
              color:${color}"
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'">
            <span style="color:${color}">${icon}</span>
            <span style="font-size:12px;font-weight:700;color:var(--text)">${label}</span>
          </button>`).join('')}
      </div>
    </div>
  `;

  setTimeout(() => drawDashChart(subjectMatrix, classStats), 0);
}

/* ═══════════════════════════════════════════════════════════════
   حساب التنبيهات
═══════════════════════════════════════════════════════════════ */
function _dashAlerts(students, grades, monthAtt, payments, thisMonth, today) {
  const alerts = [];

  /* تلاميذ بمعدل ضعيف (< 10) */
  students.forEach(st => {
    const sg = grades.filter(g => g.sid === st.id && g.max > 0);
    if (!sg.length) return;
    const avg = sg.reduce((s, g) => s + (g.score / g.max) * 20, 0) / sg.length;
    if (avg < 10) {
      alerts.push({
        level: 'high',
        title: `معدل ضعيف — ${st.name}`,
        detail: `المعدل: ${avg.toFixed(1)}/20 · ${clsById(st.cls).short}`
      });
    }
  });

  /* تلاميذ غائبون 3 مرات فأكثر هذا الشهر */
  const absByStd = {};
  monthAtt.filter(a => a.status === 'absent').forEach(a => {
    absByStd[a.sid] = (absByStd[a.sid] || 0) + 1;
  });
  Object.entries(absByStd).forEach(([sid, cnt]) => {
    if (cnt >= 3) {
      const st = students.find(x => x.id === sid);
      if (st) alerts.push({
        level: 'high',
        title: `غيابات متكررة — ${st.name}`,
        detail: `${cnt} غياب هذا الشهر · ${clsById(st.cls).short}`
      });
    }
  });

  /* أداءات غير مدفوعة هذا الشهر */
  const unpaid = payments.filter(p => p.month === thisMonth &&
    (p.status === 'unpaid' || p.status === 'late'));
  if (unpaid.length) {
    alerts.push({
      level: 'medium',
      title: `أداءات غير مسوّاة`,
      detail: `${unpaid.length} تلميذ لم يؤدِّ واجب الشهر الحالي`
    });
  }

  /* فروض فات تاريخها ولم تُصحَّح */
  const overdue = (DATA.homework || []).filter(h =>
    !h.completed && h.dueDate && h.dueDate < today);
  if (overdue.length) {
    alerts.push({
      level: 'medium',
      title: `فروض متأخرة التصحيح`,
      detail: `${overdue.length} فرض فات تاريخه ولم يُعلَّم كمنجز`
    });
  }

  return alerts;
}

/* ── رقاقة معلومة سريعة ─────────────────────────────────────── */
function _quickChip(label, value, color) {
  return `
    <div style="background:var(--bg-2);border-radius:8px;padding:6px 12px;text-align:center;
      border:1px solid var(--border)">
      <div style="font-size:16px;font-weight:800;font-family:var(--mono);
        color:${color || 'var(--text)'}">
        ${value}
      </div>
      <div style="font-size:10px;color:var(--text-3)">${label}</div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   المخطط البياني — معدلات المواد بالأقسام
═══════════════════════════════════════════════════════════════ */
function drawDashChart(subjectMatrix, classStats) {
  const canvas = document.getElementById('dash-chart');
  if (!canvas) return;

  /* إذا استُدعيت بدون بيانات، أعد حسابها */
  if (!subjectMatrix) {
    const allGrades = DATA.grades || [];
    subjectMatrix = SUBJECTS.map(subj => ({
      ...subj,
      perClass: CLASSES.map(cls => {
        const g   = allGrades.filter(x => x.subj===subj.id && x.cls===cls.id && x.max>0);
        const avg = g.length ? g.reduce((s,x)=>s+(x.score/x.max)*20,0)/g.length : null;
        return { cls: cls.id, clsLabel: cls.short, avg };
      })
    }));
  }

  const ctx    = canvas.getContext('2d');
  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.offsetWidth  || 300;
  const H      = 160;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  /* ألوان الأقسام */
  const clsColors = [
    getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#3B4FC0',
    getComputedStyle(document.documentElement).getPropertyValue('--c2').trim() || '#178A6F',
  ];

  const padL  = 36, padR = 12, padT = 10, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const nSubj  = SUBJECTS.length;
  const nCls   = CLASSES.length;
  const groupW = chartW / nSubj;
  const gap    = 3; // مسافة بين الأعمدة داخل المجموعة
  const barW   = Math.min(Math.floor((groupW * 0.7 - gap * (nCls - 1)) / nCls), 28);

  /* خلفية */
  ctx.fillStyle = 'transparent';
  ctx.clearRect(0, 0, W, H);

  /* خطوط أفقية */
  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--border').trim() || '#e5e7eb';
  ctx.strokeStyle = gridColor;
  ctx.lineWidth   = 1;
  [0, 5, 10, 15, 20].forEach(v => {
    const y = padT + chartH - (v / 20) * chartH;
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    /* تسمية المحور */
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-3').trim() || '#9ca3af';
    ctx.setLineDash([]);
    ctx.fillStyle   = textColor;
    ctx.font        = `${10 * dpr / dpr}px system-ui`;
    ctx.textAlign   = 'right';
    ctx.fillText(v, padL - 4, y + 3);
  });

  /* خط 10 (النجاح) */
  const y10 = padT + chartH - (10 / 20) * chartH;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padL, y10);
  ctx.lineTo(padL + chartW, y10);
  ctx.stroke();
  ctx.setLineDash([]);

  /* الأعمدة + تسميات المواد */
  const textColor2 = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-2').trim() || '#374151';

  subjectMatrix.forEach((subj, si) => {
    const gX = padL + si * groupW + groupW / 2;

    subj.perClass.forEach((p, ci) => {
      if (p.avg == null) return;
      const bH  = (p.avg / 20) * chartH;
      const bX  = gX - (nCls * barW / 2) + ci * barW + ci * 3;
      const bY  = padT + chartH - bH;

      ctx.fillStyle = clsColors[ci] || '#3B4FC0';
      ctx.globalAlpha = 0.85;
      const radius = 3;
      ctx.beginPath();
      ctx.moveTo(bX + radius, bY);
      ctx.lineTo(bX + barW - radius, bY);
      ctx.quadraticCurveTo(bX + barW, bY, bX + barW, bY + radius);
      ctx.lineTo(bX + barW, bY + bH);
      ctx.lineTo(bX, bY + bH);
      ctx.lineTo(bX, bY + radius);
      ctx.quadraticCurveTo(bX, bY, bX + radius, bY);
      ctx.fill();
      ctx.globalAlpha = 1;

      /* قيمة فوق العمود */
      ctx.fillStyle  = textColor2;
      ctx.font       = `bold 9px system-ui`;
      ctx.textAlign  = 'center';
      ctx.fillText(p.avg.toFixed(1), bX + barW / 2, bY - 3);
    });

    /* اسم المادة */
    ctx.fillStyle  = textColor2;
    ctx.font       = `11px system-ui`;
    ctx.textAlign  = 'center';
    ctx.fillText(subj.short, gX, H - padB + 16);
  });

  /* مفتاح الألوان */
  CLASSES.forEach((c, ci) => {
    const lx = padL + ci * 80;
    const ly = H - padB + 30;
    ctx.fillStyle = clsColors[ci] || '#3B4FC0';
    ctx.fillRect(lx, ly, 10, 10);
    ctx.fillStyle = textColor2;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(c.short, lx + 46, ly + 9);
  });
}
