/* =================================================================
   DASHBOARD — لوحة القيادة v3
   بسيط · عملي · سريع
   ─────────────────────────────────────────────────────────────────
   الأقسام:
   1. بطاقة تاريخ اليوم
   2. بطاقات مربعة — التلاميذ / الحضور / الدروس / نسبة الحضور
   3. حصص اليوم والقادمة
   4. جدول معدلات المواد حسب الفصيل
   5. اختصارات الصفحات
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
                         .sort((a, b) => a.date > b.date ? 1 : -1).slice(0, 5);
  const allLessons   = DATA.lessons || [];
  const allGrades    = DATA.grades  || [];

  const lessonsDone  = allLessons.filter(l => l.status === 'done').length;
  const lessonsTotal = allLessons.length;

  /* الحاضرون اليوم */
  const todayPresent = todayAtt.filter(a => a.status === 'present').length;
  const todayTotal   = todayAtt.length;

  /* نسبة الحضور الشهري */
  const monthTotal   = monthAtt.length;
  const monthPresent = monthAtt.filter(a => a.status === 'present').length;
  const monthRate    = monthTotal > 0 ? Math.round(monthPresent / monthTotal * 100) : null;

  /* ── إحصاء كل قسم ──────────────────────────────────────── */
  const classStats = CLASSES.map(c => {
    const stds       = studentsOf(c.id);
    const attMonth   = monthAtt.filter(a => a.cls === c.id);
    const attTotal   = attMonth.length;
    const attPresent = attMonth.filter(a => a.status === 'present').length;
    const attRate    = attTotal ? Math.round(attPresent / attTotal * 100) : null;
    const lessons    = allLessons.filter(l => l.cls === c.id);
    const ldone      = lessons.filter(l => l.status === 'done').length;
    const lpct       = lessons.length ? Math.round(ldone / lessons.length * 100) : 0;
    const todayP     = todayAtt.filter(a => a.cls === c.id && a.status === 'present').length;
    const todayA     = todayAtt.filter(a => a.cls === c.id && a.status === 'absent').length;
    const todayL     = todayAtt.filter(a => a.cls === c.id && a.status === 'late').length;
    return { ...c, stds, attRate, lpct, ldone, ltotal: lessons.length, todayP, todayA, todayL };
  });

  /* ── معدلات المواد حسب الفصيل (جدول الإحصائيات) ──────── */
  const subjectMatrix = SUBJECTS.map(subj => {
    const perClass = CLASSES.map(cls => {
      const g   = allGrades.filter(x => x.subj === subj.id && x.cls === cls.id && x.max > 0);
      const avg = g.length
        ? g.reduce((s, x) => s + (x.score / x.max) * 20, 0) / g.length
        : null;
      return { cls: cls.id, clsLabel: cls.short, avg };
    });
    const all   = allGrades.filter(x => x.subj === subj.id && x.max > 0);
    const total = all.length
      ? all.reduce((s, x) => s + (x.score / x.max) * 20, 0) / all.length
      : null;
    return { ...subj, perClass, total };
  });

  /* ── تاريخ اليوم بالعربية ───────────────────────────────── */
  const dateLabel = (() => {
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const d    = new Date();
    const [y, m, dy] = t.split('-');
    return `${days[d.getDay()]} ${parseInt(dy)} ${MONTHS_AR[+m - 1]} ${y}`;
  })();

  /* ── اختصارات الصفحات ──────────────────────────────────── */
  const shortcuts = [
    {
      key: 'students', label: 'التلاميذ', color: 'var(--accent)', bg: 'var(--accent-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
               <circle cx="9" cy="7" r="4"/>
               <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
               <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
             </svg>`
    },
    {
      key: 'attendance', label: 'الحضور', color: 'var(--green)', bg: 'var(--green-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <path d="M9 11l3 3L22 4"/>
               <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
             </svg>`
    },
    {
      key: 'sessions', label: 'التخطيط', color: 'var(--amber)', bg: 'var(--amber-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
               <line x1="16" y1="2" x2="16" y2="6"/>
               <line x1="8" y1="2" x2="8" y2="6"/>
               <line x1="3" y1="10" x2="21" y2="10"/>
             </svg>`
    },
    {
      key: 'lessons', label: 'الدروس', color: 'var(--purple)', bg: 'var(--purple-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
               <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
             </svg>`
    },
    {
      key: 'exercises', label: 'التمارين', color: 'var(--accent)', bg: 'var(--accent-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <polyline points="9 11 12 14 22 4"/>
               <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
             </svg>`
    },
    {
      key: 'homework', label: 'الفروض', color: 'var(--danger)', bg: 'var(--danger-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
               <polyline points="14 2 14 8 20 8"/>
               <line x1="16" y1="13" x2="8" y2="13"/>
               <line x1="16" y1="17" x2="8" y2="17"/>
             </svg>`
    },
    {
      key: 'glossary', label: 'المصطلحات', color: 'var(--green)', bg: 'var(--green-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
               <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
             </svg>`
    },
    {
      key: 'reports', label: 'التقارير', color: 'var(--amber)', bg: 'var(--amber-light)',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
               <line x1="18" y1="20" x2="18" y2="10"/>
               <line x1="12" y1="20" x2="12" y2="4"/>
               <line x1="6" y1="20" x2="6" y2="14"/>
             </svg>`
    },
  ];

  /* ══════════════════════ HTML ══════════════════════════════ */
  const sec = document.getElementById('sec-dashboard');
  sec.innerHTML = `

    <!-- ══ 1. بطاقة تاريخ اليوم ══ -->
    <div style="
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 16px rgba(59,79,192,.28);
    ">
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.65);font-weight:700;
          letter-spacing:.8px;text-transform:uppercase;margin-bottom:5px">
          اليوم
        </div>
        <div style="font-size:19px;font-weight:800;color:#fff;line-height:1.2">
          ${dateLabel}
        </div>
      </div>
      <div style="
        background:rgba(255,255,255,.18);
        border-radius:12px;
        padding:10px 16px;
        text-align:center;
        min-width:64px;
      ">
        <div style="font-size:28px;font-weight:800;color:#fff;font-family:var(--mono);line-height:1">
          ${todaySess.length}
        </div>
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-top:3px;font-weight:600">
          حصص اليوم
        </div>
      </div>
    </div>

    <!-- ══ 2. البطاقات المربعة (2×2) ══ -->
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px">

      <!-- التلاميذ النشطون -->
      <div class="panel" style="padding:18px 14px;text-align:center;cursor:default"
        onclick="navigate('students')">
        <div style="
          width:46px;height:46px;border-radius:14px;
          background:var(--accent-light);color:var(--accent);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 10px;
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style="font-size:32px;font-weight:800;font-family:var(--mono);
          color:var(--text);line-height:1">
          ${activeStud.length}
        </div>
        <div style="font-size:12px;color:var(--text-3);margin-top:5px;font-weight:500">
          إجمالي التلاميذ
        </div>
        <div style="margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
          ${CLASSES.map(c => {
            const n = studentsOf(c.id).length;
            return `<span style="font-size:11px;padding:3px 9px;border-radius:20px;
              background:${c.bg};color:${c.color};font-weight:700">
              ${c.short}&nbsp;${n}
            </span>`;
          }).join('')}
        </div>
      </div>

      <!-- الحضور اليوم -->
      <div class="panel" style="padding:18px 14px;text-align:center;cursor:default"
        onclick="navigate('attendance')">
        <div style="
          width:46px;height:46px;border-radius:14px;
          background:var(--green-light);color:var(--green);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 10px;
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div style="font-size:32px;font-weight:800;font-family:var(--mono);
          color:var(--text);line-height:1">
          ${todayTotal > 0 ? todayPresent : '—'}
        </div>
        <div style="font-size:12px;color:var(--text-3);margin-top:5px;font-weight:500">
          حاضر اليوم${todayTotal > 0 ? ' / ' + todayTotal : ''}
        </div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px">
          ${classStats.map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;
              font-size:11px;padding:3px 8px;border-radius:8px;background:var(--surface-2)">
              <span style="color:${c.color};font-weight:700">${c.short}</span>
              <span style="color:var(--text);font-weight:600">
                ${c.todayP}✓
                ${c.todayA > 0 ? `<span style="color:var(--danger);margin-right:4px">${c.todayA}✗</span>` : ''}
                ${c.todayL > 0 ? `<span style="color:var(--amber)">${c.todayL}⏱</span>` : ''}
              </span>
            </div>`).join('')}
        </div>
      </div>

      <!-- الدروس المُدرَّسة -->
      <div class="panel" style="padding:18px 14px;text-align:center;cursor:default"
        onclick="navigate('lessons')">
        <div style="
          width:46px;height:46px;border-radius:14px;
          background:var(--purple-light);color:var(--purple);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 10px;
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div style="font-size:32px;font-weight:800;font-family:var(--mono);
          color:var(--text);line-height:1">
          ${lessonsDone}
        </div>
        <div style="font-size:12px;color:var(--text-3);margin-top:5px;font-weight:500">
          درس مُدرَّس${lessonsTotal ? ' / ' + lessonsTotal : ''}
        </div>
        ${lessonsTotal > 0 ? `
          <div style="margin-top:12px">
            <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${Math.round(lessonsDone/lessonsTotal*100)}%;
                background:var(--purple);border-radius:4px;transition:width .4s ease">
              </div>
            </div>
            <div style="font-size:10px;color:var(--text-3);margin-top:5px;font-weight:600">
              ${Math.round(lessonsDone/lessonsTotal*100)}% من البرنامج
            </div>
          </div>` : `
          <div style="font-size:11px;color:var(--text-3);margin-top:10px">
            لا توجد دروس بعد
          </div>`}
      </div>

      <!-- نسبة الحضور الشهري -->
      <div class="panel" style="padding:18px 14px;text-align:center;cursor:default">
        <div style="
          width:46px;height:46px;border-radius:14px;
          background:var(--amber-light);color:var(--amber);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 10px;
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div style="font-size:32px;font-weight:800;font-family:var(--mono);
          color:${monthRate!=null?(monthRate>=75?'var(--green)':'var(--danger)'):'var(--text)'};
          line-height:1">
          ${monthRate != null ? monthRate + '%' : '—'}
        </div>
        <div style="font-size:12px;color:var(--text-3);margin-top:5px;font-weight:500">
          نسبة الحضور الشهري
        </div>
        <div style="margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
          ${classStats.map(c => `
            <span style="font-size:11px;padding:3px 9px;border-radius:20px;font-weight:700;
              background:${c.attRate!=null&&c.attRate>=75?'var(--green-light)':'var(--danger-light)'};
              color:${c.attRate!=null&&c.attRate>=75?'var(--green)':'var(--danger)'}">
              ${c.short}&nbsp;${c.attRate != null ? c.attRate + '%' : '—'}
            </span>`).join('')}
        </div>
      </div>
    </div>

    <!-- ══ 3. حصص اليوم والقادمة ══ -->
    <div class="panel" style="margin-bottom:12px; padding:12px 14px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="panel-title" style="margin:0">حصص اليوم</div>
          ${todaySess.length ? `
            <span style="font-size:11px; padding:2px 9px; border-radius:20px;
              background:var(--accent-light); color:var(--accent); font-weight:700">
              ${todaySess.length}
            </span>` : ''}
        </div>
        <button class="btn btn-outline" style="font-size:11px" onclick="navigate('sessions')">
          كل الحصص
        </button>
      </div>

      ${!todaySess.length
        ? `<div style="padding:14px 0; font-size:13px; color:var(--text-3); text-align:center;">
            لا توجد حصص مسجلة اليوم
          </div>`
        : `
          <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; scrollbar-width:thin;">
            ${todaySess.map(s => {
              const sj = subjById(s.subj);
              const cl = clsById(s.cls);
              return `
                <div style="
                  background:var(--surface-2);
                  border-radius:12px;
                  padding:12px;
                  min-width:150px;
                  display:flex;
                  flex-direction:column;
                  gap:8px;
                  border:1px solid var(--border);
                  flex-shrink:0;
                ">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="
                      width:34px; height:34px; border-radius:10px;
                      background:${sj.bg || 'var(--accent-light)'};
                      color:${sj.color || 'var(--accent)'};
                      display:flex; align-items:center; justify-content:center;
                      font-size:15px; font-weight:800;
                    ">${sj.short.charAt(0)}</div>
                    <div style="font-size:14px; font-weight:800; font-family:var(--mono); color:var(--accent);">
                      ${s.time || '—'}
                    </div>
                  </div>
                  <div style="font-size:13px; font-weight:700; color:var(--text); line-height:1.3;
                    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${esc(s.title)}
                  </div>
                  <div style="font-size:10px; color:var(--text-3); display:flex; gap:6px;">
                    <span>${cl.short}</span>
                    <span>·</span>
                    <span>${sj.short}</span>
                  </div>
                </div>`;
            }).join('')}
          </div>
        `}

      ${upcomingSess.length ? `
        <div style="margin-top:12px; padding-top:8px; border-top:1px solid var(--border);">
          <div style="font-size:11px; font-weight:700; color:var(--text-3);
            letter-spacing:.5px; margin-bottom:8px;">
            الحصص القادمة
          </div>
          ${upcomingSess.map(s => {
            const sj = subjById(s.subj);
            const cl = clsById(s.cls);
            return `
              <div style="display:flex; align-items:center; gap:8px;
                padding:6px 0; border-bottom:1px solid var(--border);">
                <div style="font-size:11px; font-family:var(--mono); color:var(--text-3);
                  min-width:72px; flex-shrink:0;">${fdate(s.date)}</div>
                <div style="font-size:12px; flex:1; min-width:0;
                  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  <span style="font-weight:600">${esc(s.title)}</span>
                  <span style="color:var(--text-3)"> · ${cl.short} · ${sj.short}</span>
                </div>
              </div>`;
          }).join('')}
        </div>` : ''}
    </div>

    <!-- ══ 4. جدول إحصائيات المواد ══ -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">معدلات المواد حسب الفصيل</div>
      <div style="overflow-x:auto;margin:0 -2px">
        <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:220px">
          <thead>
            <tr>
              <th style="text-align:right;padding:8px 6px;color:var(--text-3);
                font-weight:600;font-size:11px;border-bottom:2px solid var(--border)">
                المادة
              </th>
              ${CLASSES.map(c => `
                <th style="text-align:center;padding:8px 6px;
                  color:${c.color};font-weight:700;font-size:11px;
                  border-bottom:2px solid var(--border)">
                  ${c.short}
                </th>`).join('')}
              <th style="text-align:center;padding:8px 6px;color:var(--text-3);
                font-weight:600;font-size:11px;border-bottom:2px solid var(--border)">
                المجموع
              </th>
            </tr>
          </thead>
          <tbody>
            ${subjectMatrix.map((subj, i) => `
              <tr style="background:${i % 2 === 0 ? 'transparent' : 'var(--surface-2)'}">
                <td style="padding:10px 6px;border-bottom:1px solid var(--border)">
                  <span style="display:inline-block;padding:3px 9px;border-radius:8px;
                    background:${subj.bg};color:${subj.color};
                    font-size:11px;font-weight:700">
                    ${subj.short}
                  </span>
                </td>
                ${subj.perClass.map(p => `
                  <td style="text-align:center;padding:10px 6px;
                    font-family:var(--mono);font-weight:700;font-size:14px;
                    border-bottom:1px solid var(--border);
                    color:${p.avg != null ? (p.avg >= 10 ? 'var(--green)' : 'var(--danger)') : 'var(--text-3)'}">
                    ${p.avg != null ? p.avg.toFixed(1) : '—'}
                  </td>`).join('')}
                <td style="text-align:center;padding:10px 6px;
                  font-family:var(--mono);font-weight:800;font-size:14px;
                  border-bottom:1px solid var(--border);
                  color:${subj.total != null ? (subj.total >= 10 ? 'var(--green)' : 'var(--danger)') : 'var(--text-3)'}">
                  ${subj.total != null ? subj.total.toFixed(1) : '—'}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ 5. اختصارات الصفحات ══ -->
    <div style="margin-bottom:6px">
      <div style="font-size:11px;font-weight:700;color:var(--text-3);
        letter-spacing:.6px;margin-bottom:10px">الصفحات</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${shortcuts.map(s => `
          <button onclick="navigate('${s.key}')"
            style="
              background:var(--surface);
              border:1px solid var(--border);
              border-radius:var(--radius-lg);
              padding:14px 6px 12px;
              display:flex;flex-direction:column;align-items:center;gap:7px;
              cursor:pointer;
              transition:background .15s, transform .1s, box-shadow .15s;
              color:var(--text);
              box-shadow:var(--shadow);
            "
            onmousedown="this.style.transform='scale(.96)'"
            onmouseup="this.style.transform=''"
            onmouseleave="this.style.transform=''">
            <span style="color:${s.color};
              width:40px;height:40px;border-radius:12px;
              background:${s.bg};
              display:flex;align-items:center;justify-content:center">
              ${s.icon}
            </span>
            <span style="font-size:11px;font-weight:600;color:var(--text-2)">
              ${s.label}
            </span>
          </button>`).join('')}
      </div>
    </div>
  `;
}
