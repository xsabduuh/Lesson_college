/* =================================================================
   GRADES — نقاط الفروض فقط
================================================================= */

function renderGrades() {
  const cls  = filGrade.cls;
  const subj = filGrade.subj;
  const students = studentsOf(cls);

  // الفروض الخاصة بهذا القسم والمادة
  const homeworks = DATA.homework
    .filter(h => h.cls === cls && h.subj === subj)
    .sort((a, b) => (a.examDate || '').localeCompare(b.examDate || ''));

  // جميع نقاط هذا القسم والمادة
  const allGrades = DATA.grades.filter(g => g.cls === cls && g.subj === subj && g.max > 0);

  // مصفوفة: لكل تلميذ صف، ولكل فرض عمود
  const rows = students.map(s => {
    const cells = homeworks.map(hw => {
      // نبحث عن نقطة تطابق التلميذ والفرض (بالمقارنة بالعنوان والتاريخ)
      const grade = allGrades.find(g =>
        g.sid === s.id &&
        g.title === hw.title &&
        g.date === hw.examDate
      );
      return grade ? { score: grade.score, max: grade.max, id: grade.id } : null;
    });
    const validCells = cells.filter(c => c !== null);
    const avg = validCells.length > 0
      ? validCells.reduce((sum, c) => sum + (c.score / c.max) * 20, 0) / validCells.length
      : null;
    return { student: s, cells, avg };
  });

  const sec = document.getElementById('sec-grades');
  sec.innerHTML = `
    ${classTabsHtml(cls, 'setGradeCls')}
    ${subjPillsHtml(subj, 'setGradeSubj')}

    <h2 style="font-size:16px; font-weight:800; margin-bottom:14px;">نقاط الفروض</h2>

    ${homeworks.length === 0 ? `
      <div class="panel" style="padding:20px; text-align:center; color:var(--text-3);">
        لا توجد فروض بعد. أضف فرضاً من قسم الفروض أولاً.
      </div>
    ` : `
      <!-- جدول النقاط -->
      <div style="overflow-x:auto; margin-bottom:12px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:var(--surface-2);">
              <th style="padding:10px 8px; text-align:right; font-weight:800; color:var(--text-3); border-bottom:2px solid var(--border);">التلميذ</th>
              ${homeworks.map(hw => `
                <th style="padding:10px 8px; text-align:center; font-weight:700; color:var(--accent); border-bottom:2px solid var(--border); white-space:nowrap;">
                  <div>${esc(hw.title)}</div>
                  <div style="font-size:10px; color:var(--text-3);">${fdate(hw.examDate)}</div>
                </th>
              `).join('')}
              <th style="padding:10px 8px; text-align:center; font-weight:800; color:var(--text-3); border-bottom:2px solid var(--border);">المعدل</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, ri) => `
              <tr style="background:${ri % 2 === 0 ? 'transparent' : 'var(--surface-2)'};">
                <td style="padding:8px; border-bottom:1px solid var(--border); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;">
                  ${esc(row.student.name)}
                </td>
                ${row.cells.map((cell, ci) => `
                  <td style="padding:6px; text-align:center; border-bottom:1px solid var(--border);">
                    <input type="number"
                      style="width:52px; padding:4px; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-family:var(--mono); font-size:12px; text-align:center;"
                      min="0" max="20" step="0.5"
                      value="${cell ? cell.score : ''}"
                      onchange="saveGradeCell(this, '${row.student.id}', '${homeworks[ci].title}', '${homeworks[ci].examDate}', '${homeworks[ci].cls}', '${homeworks[ci].subj}', '${cell ? cell.id : ''}')"
                      placeholder="—">
                  </td>
                `).join('')}
                <td style="padding:8px; text-align:center; border-bottom:1px solid var(--border); font-weight:800; font-family:var(--mono);
                  color:${row.avg !== null ? (row.avg >= 10 ? 'var(--green)' : 'var(--danger)') : 'var(--text-3)'};">
                  ${row.avg !== null ? row.avg.toFixed(1) : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- إحصائيات سريعة -->
      <div class="panel" style="margin-bottom:12px;">
        <div class="panel-title">إحصائيات سريعة</div>
        ${homeworks.map((hw, i) => {
          const grades = rows.map(r => r.cells[i]).filter(c => c !== null);
          const avg = grades.length > 0
            ? grades.reduce((sum, c) => sum + (c.score / c.max) * 20, 0) / grades.length
            : null;
          const maxGrade = grades.length > 0 ? Math.max(...grades.map(c => (c.score / c.max) * 20)) : null;
          const minGrade = grades.length > 0 ? Math.min(...grades.map(c => (c.score / c.max) * 20)) : null;
          return `
            <div style="padding:8px 14px; border-bottom:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:13px; font-weight:600;">${esc(hw.title)}</span>
                <div style="display:flex; gap:12px; font-size:12px;">
                  <span>متوسط: <b style="color:${avg !== null && avg >= 10 ? 'var(--green)' : 'var(--danger)'};">${avg !== null ? avg.toFixed(1) : '—'}</b></span>
                  <span>أعلى: <b style="color:var(--green);">${maxGrade !== null ? maxGrade.toFixed(1) : '—'}</b></span>
                  <span>أدنى: <b style="color:var(--danger);">${minGrade !== null ? minGrade.toFixed(1) : '—'}</b></span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

function saveGradeCell(input, sid, title, date, cls, subj, existingId) {
  const score = parseFloat(input.value);
  if (isNaN(score) || score < 0) {
    input.value = '';
    // إذا كان موجوداً سابقاً، نحذفه
    if (existingId) {
      DATA.grades = DATA.grades.filter(g => g.id !== existingId);
      save();
      toast('تم حذف النقطة', 'info');
      renderGrades();
    }
    return;
  }

  const obj = {
    sid,
    cls,
    subj,
    title,
    date,
    score: score,
    max: 20,
    type: 'فرض',
    note: ''
  };

  if (existingId) {
    const idx = DATA.grades.findIndex(g => g.id === existingId);
    if (idx !== -1) {
      DATA.grades[idx] = { ...DATA.grades[idx], ...obj };
    } else {
      DATA.grades.push({ id: uid(), ...obj });
    }
  } else {
    DATA.grades.push({ id: uid(), ...obj });
  }

  save();
  toast('تم حفظ النقطة', 'success');
  renderGrades();
}

function setGradeCls(cls)   { filGrade.cls  = cls; renderGrades(); }
function setGradeSubj(subj) { filGrade.subj = subj; renderGrades(); }