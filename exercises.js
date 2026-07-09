/* =================================================================
   EXERCISES (التمارين) – نسخة متوافقة تماماً
================================================================= */
// التأكد من وجود متغير الفلترة
if (typeof filExer === 'undefined') {
  var filExer = { cls: '1ere', subj: 'math' };
}

const LEVEL_COLORS = {
  'سهل': 'badge-green',
  'متوسط': 'badge-amber',
  'صعب': 'badge-red',
  'تحدٍّ': 'badge-purple'
};

function renderExercises(){
  var cls = filExer.cls;
  var subj = filExer.subj;
  var items = DATA.exercises.filter(function(e){ return e.cls === cls && e.subj === subj; }).slice().reverse();
  var s = subjById(subj);
  var byLevel = {
    'سهل': items.filter(function(e){ return e.level === 'سهل'; }),
    'متوسط': items.filter(function(e){ return e.level === 'متوسط'; }),
    'صعب': items.filter(function(e){ return e.level === 'صعب'; }),
    'تحدٍّ': items.filter(function(e){ return e.level === 'تحدٍّ'; }),
    'أخرى': items.filter(function(e){ return ['سهل','متوسط','صعب','تحدٍّ'].indexOf(e.level) === -1; })
  };
  var sec = document.getElementById('sec-exercises');
  if (!sec) return;
  var num = 0;
  sec.innerHTML = 
    classTabsHtml(cls, "setExerCls") +
    subjPillsHtml(subj, "setExerSubj") +
    '<div class="section-header"><h2>' + (IC.pen || IC.edit) + ' تمارين ' + s.label + '</h2><span class="count-badge">' + items.length + '</span></div>' +
    (items.length === 0 ? '<div class="panel">' + emptyHtml('لا توجد تمارين','أضف تمريناً') + '</div>' :
    Object.entries(byLevel).filter(function(entry){ return entry[1].length > 0; }).map(function(entry){
      var level = entry[0], exs = entry[1];
      return '<div style="margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
          '<span class="badge ' + (LEVEL_COLORS[level] || 'badge-gray') + '" style="font-size:12px;padding:4px 12px;">' + level + '</span>' +
          '<span class="count-badge">' + exs.length + '</span>' +
        '</div>' +
        exs.map(function(e){
          num++;
          return exerciseCardHtml(e, s, num);
        }).join('') +
      '</div>';
    }).join(''));
}

function exerciseCardHtml(e, s, num){
  var questionFileLink = '';
  if (e.questionFileData) {
    questionFileLink = '<div onclick="event.stopPropagation();downloadExerciseFile(\'' + e.id + '\',\'question\')" style="margin-top:8px;display:flex;align-items:center;gap:6px;background:var(--surface-2);padding:6px 10px;border-radius:8px;cursor:pointer;">' +
      '<span style="display:flex;color:var(--accent);">' + (IC.file || '📎') + '</span>' +
      '<span style="font-size:11px;color:var(--accent);font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(e.questionFileName || 'ملف السؤال') + '</span>' +
      '<span style="display:flex;color:var(--accent);">' + (IC.download || '↓') + '</span>' +
    '</div>';
  }
  var solutionFileLink = '';
  if (e.solutionFileData) {
    solutionFileLink = '<div onclick="event.stopPropagation();downloadExerciseFile(\'' + e.id + '\',\'solution\')" style="margin-top:6px;display:flex;align-items:center;gap:6px;background:var(--surface-2);padding:6px 10px;border-radius:8px;cursor:pointer;">' +
      '<span style="display:flex;color:var(--green);">' + (IC.file || '📎') + '</span>' +
      '<span style="font-size:11px;color:var(--green);font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(e.solutionFileName || 'ملف الحل') + '</span>' +
      '<span style="display:flex;color:var(--green);">' + (IC.download || '↓') + '</span>' +
    '</div>';
  }

  return '<div class="ex-card" data-id="' + e.id + '">' +
    '<div class="ex-card-head">' +
      '<div class="ex-num">' + num + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
          '<span style="font-size:14px;font-weight:700;flex:1;">' + esc(e.title) + '</span>' +
          (e.level ? '<span class="badge ' + (LEVEL_COLORS[e.level] || 'badge-gray') + '" style="font-size:11px;">' + esc(e.level) + '</span>' : '') +
        '</div>' +
        '<div style="font-size:12px;color:var(--text-3);margin-bottom:8px;">' + fdate(e.date) + '</div>' +
        (e.content ? '<div style="font-size:13px;color:var(--text-2);margin-bottom:8px;line-height:1.6;">' + esc(e.content) + '</div>' : '') +
        questionFileLink +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">' +
          (e.solution || e.solutionFileData ? '<button class="btn btn-outline btn-sm" onclick="toggleSolution(\'' + e.id + '\')" id="sol-btn-' + e.id + '">' + (IC.eye || '👁') + ' إظهار الحل</button>' : '') +
          '<div class="admin-actions">' +
            '<button class="btn-icon accent" onclick="openExerciseForm(\'' + e.id + '\')">' + (IC.edit || '✎') + '</button>' +
            '<button class="btn-icon danger"  onclick="deleteExercise(\'' + e.id + '\')">' + (IC.trash || '🗑') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    ((e.solution || e.solutionFileData) ? 
      '<div class="ex-solution" id="sol-' + e.id + '">' +
        '<div style="font-size:11px;font-weight:800;color:var(--green);margin-bottom:6px;">الحل</div>' +
        (e.solution ? '<div style="font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:8px;">' + esc(e.solution) + '</div>' : '') +
        solutionFileLink +
      '</div>' : '') +
  '</div>';
}

function toggleSolution(id){
  var sol = document.getElementById('sol-' + id);
  var btn = document.getElementById('sol-btn-' + id);
  if (!sol) return;
  var showing = sol.classList.toggle('show');
  if (btn) btn.innerHTML = showing ? (IC.eyeOff || '👁‍🗨') + ' إخفاء الحل' : (IC.eye || '👁') + ' إظهار الحل';
}

function setExerCls(cls){ filExer.cls = cls; renderExercises(); }
function setExerSubj(subj){ filExer.subj = subj; renderExercises(); }

function openExerciseForm(id){
  var e = id ? DATA.exercises.find(function(x){ return x.id === id; }) : {};
  var cls = e.cls || filExer.cls;
  var subj = e.subj || filExer.subj;
  var clsOpts = CLASSES.map(function(c){ return '<option value="' + c.id + '" ' + (cls === c.id ? 'selected' : '') + '>' + c.label + '</option>'; }).join('');
  var subjOpts = SUBJECTS.map(function(s){ return '<option value="' + s.id + '" ' + (subj === s.id ? 'selected' : '') + '>' + s.label + '</option>'; }).join('');
  var levOpts = ['','سهل','متوسط','صعب','تحدٍّ'].map(function(l){ return '<option value="' + l + '" ' + ((e.level || '') === l ? 'selected' : '') + '>' + (l || 'غير محدد') + '</option>'; }).join('');

  showSheet(id ? 'تعديل تمرين' : 'إضافة تمرين جديد',
    '<div class="field-grid-2">' +
      '<div class="field-row"><label>القسم</label><select class="field" id="ef-cls">' + clsOpts + '</select></div>' +
      '<div class="field-row"><label>المادة</label><select class="field" id="ef-subj">' + subjOpts + '</select></div>' +
    '</div>' +
    '<div class="field-row"><label>عنوان التمرين <span class="req">*</span></label>' +
      '<input class="field" id="ef-title" placeholder="عنوان التمرين" value="' + esc(e.title || '') + '"></div>' +
    '<div class="field-grid-2">' +
      '<div class="field-row"><label>المستوى</label><select class="field" id="ef-level">' + levOpts + '</select></div>' +
      '<div class="field-row"><label>التاريخ</label><input class="field" type="date" id="ef-date" value="' + (e.date || today()) + '"></div>' +
    '</div>' +
    '<div class="field-row"><label>نص التمرين</label>' +
      '<textarea class="field" id="ef-content" style="min-height:100px" placeholder="نص التمرين...">' + esc(e.content || '') + '</textarea></div>' +
    '<div class="field-row">' +
      '<label>ملف السؤال (صورة أو PDF)</label>' +
      '<input type="file" id="ef-question-file" accept="image/*,.pdf" style="display:block;margin-top:4px;">' +
      (id && e.questionFileName ? '<div style="font-size:11px;color:var(--text-3);margin-top:4px;">الملف الحالي: ' + esc(e.questionFileName) + '</div>' : '') +
    '</div>' +
    '<div class="field-row"><label>الحل (اختياري)</label>' +
      '<textarea class="field" id="ef-solution" style="min-height:80px" placeholder="الحل المقترح...">' + esc(e.solution || '') + '</textarea></div>' +
    '<div class="field-row">' +
      '<label>ملف الحل (صورة أو PDF)</label>' +
      '<input type="file" id="ef-solution-file" accept="image/*,.pdf" style="display:block;margin-top:4px;">' +
      (id && e.solutionFileName ? '<div style="font-size:11px;color:var(--text-3);margin-top:4px;">الملف الحالي: ' + esc(e.solutionFileName) + '</div>' : '') +
    '</div>' +
    '<input type="hidden" id="ef-id" value="' + (id || '') + '">',
    [
      {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
      {label:'حفظ',cls:'btn-accent',fn:'saveExercise()'}
    ]
  );
}

function saveExercise(){
  var id = document.getElementById('ef-id').value;
  var title = document.getElementById('ef-title').value.trim();
  if (!title) { toast('أدخل عنوان التمرين','error'); return; }

  var questionFile = document.getElementById('ef-question-file').files[0];
  var solutionFile = document.getElementById('ef-solution-file').files[0];
  var existing = id ? DATA.exercises.find(function(x){ return x.id === id; }) : null;

  var obj = {
    cls: document.getElementById('ef-cls').value,
    subj: document.getElementById('ef-subj').value,
    title: title,
    level: document.getElementById('ef-level').value,
    date: document.getElementById('ef-date').value,
    content: document.getElementById('ef-content').value.trim(),
    solution: document.getElementById('ef-solution').value.trim()
  };

  if (existing) {
    if (!questionFile) {
      obj.questionFileData = existing.questionFileData;
      obj.questionFileName = existing.questionFileName;
      obj.questionFileType = existing.questionFileType;
    }
    if (!solutionFile) {
      obj.solutionFileData = existing.solutionFileData;
      obj.solutionFileName = existing.solutionFileName;
      obj.solutionFileType = existing.solutionFileType;
    }
  }

  function finalize(){
    if (id) {
      var existingObj = DATA.exercises.find(function(x){ return x.id === id; });
      Object.assign(existingObj, obj);
    } else {
      DATA.exercises.push({id: uid(), obj});
    }
    save(); closeSheet(); toast('تم الحفظ','success'); renderExercises();
  }

  var readersToWait = 0;
  if (questionFile) {
    readersToWait++;
    var reader = new FileReader();
    reader.onload = function(e){
      obj.questionFileData = e.target.result;
      obj.questionFileName = questionFile.name;
      obj.questionFileType = questionFile.type;
      if (--readersToWait === 0) finalize();
    };
    reader.readAsDataURL(questionFile);
  }
  if (solutionFile) {
    readersToWait++;
    var reader2 = new FileReader();
    reader2.onload = function(e){
      obj.solutionFileData = e.target.result;
      obj.solutionFileName = solutionFile.name;
      obj.solutionFileType = solutionFile.type;
      if (--readersToWait === 0) finalize();
    };
    reader2.readAsDataURL(solutionFile);
  }

  if (readersToWait === 0) finalize();
}

function deleteExercise(id){
  if (!confirm('حذف هذا التمرين؟')) return;
  DATA.exercises = DATA.exercises.filter(function(e){ return e.id !== id; });
  save(); toast('تم الحذف'); renderExercises();
}

/* دالة تحميل ملف التمرين – فريدة وغير متعارضة */
function downloadExerciseFile(exerciseId, type) {
  var ex = DATA.exercises.find(function(e){ return e.id === exerciseId; });
  if (!ex) return;
  var data = type === 'question' ? ex.questionFileData : ex.solutionFileData;
  var name = type === 'question' ? ex.questionFileName : ex.solutionFileName;
  var mime = type === 'question' ? ex.questionFileType : ex.solutionFileType;
  if (!data) return;

  if (mime && mime.indexOf('image/') === 0) {
    var win = window.open('', '_blank');
    if (win) {
      win.document.write('<img src="' + data + '" style="max-width:100%;height:auto;">');
      win.document.title = name || 'صورة';
    } else {
      downloadExerciseFallback(data, name, mime);
    }
  } else {
    downloadExerciseFallback(data, name, mime);
  }
}

function downloadExerciseFallback(data, fileName, mime) {
  var a = document.createElement('a');
  a.href = data;
  var name = fileName || 'file';
  if (name.indexOf('.') === -1) {
    var ext = mime ? mime.split('/').pop() : 'bin';
    name += '.' + ext;
  }
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
