/* =================================================================
   custom-drag.js
   سحب وإفلات مخصص بدون مكتبات خارجية — يعتمد على Pointer Events
   يعمل بشكل موحّد على: iOS Safari، Chrome iOS، Android، Desktop
   الفكرة: اضغط مطوّلاً على المقبض (.grip) → العنصر يرتفع بسلاسة → اسحب
================================================================= */

function makeDraggableList(container, itemSelector, handleSelector, onReorder) {
  let dragEl      = null;   // العنصر الذي يُسحب حالياً
  let pointerId   = null;
  let startY      = 0;      // موضع الإصبع عند بدء السحب الفعلي
  let translateY  = 0;      // الإزاحة الحالية
  let holdTimer   = null;
  let dragging    = false;
  let startIndex  = -1;

  const HOLD_DELAY = 120;        // ملي ثانية قبل بدء السحب (يمنع تعارض مع السكرول)
  const MOVE_CANCEL_PX = 8;      // إن تحرك الإصبع أكثر من هذا قبل انتهاء المهلة، نلغي السحب

  function items() {
    return Array.from(container.children).filter(el => el.matches(itemSelector));
  }

  function onPointerDown(e) {
    const handle = e.target.closest(handleSelector);
    if (!handle || !container.contains(handle)) return;
    const item = e.target.closest(itemSelector);
    if (!item) return;

    pointerId = e.pointerId;
    startY = e.clientY;
    dragEl = item;
    startIndex = items().indexOf(dragEl);

    // إلغاء أي مؤقت سابق
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => beginDrag(handle), HOLD_DELAY);

    // نسجّل مستمعات مؤقتة لإلغاء العملية إن تحرك الإصبع كثيراً قبل انتهاء المهلة (يعني نية تمرير الصفحة)
    const cancelIfMoved = (ev) => {
      if (dragging) return;
      if (Math.abs(ev.clientY - startY) > MOVE_CANCEL_PX) {
        clearTimeout(holdTimer);
      }
    };
    container.addEventListener('pointermove', cancelIfMoved, { passive: true });
    const cleanup = () => container.removeEventListener('pointermove', cancelIfMoved);
    handle.addEventListener('pointerup', cleanup, { once: true });
    handle.addEventListener('pointercancel', cleanup, { once: true });

    try { handle.setPointerCapture(pointerId); } catch (err) {}
  }

  function beginDrag(handle) {
    if (!dragEl) return;
    dragging = true;
    translateY = 0;
    dragEl.classList.add('dragging-item');
    dragEl.style.position = 'relative';
    dragEl.style.zIndex = '999';
    if (navigator.vibrate) navigator.vibrate(6);
  }

  function onPointerMove(e) {
    if (e.pointerId !== pointerId || !dragEl || !dragging) return;
    e.preventDefault();

    translateY = e.clientY - startY;
    dragEl.style.transform = `translateY(${translateY}px)`;

    const dragRect = dragEl.getBoundingClientRect();
    const dragMid = dragRect.top + dragRect.height / 2;

    const list = items();
    const dragIndex = list.indexOf(dragEl);

    for (const sib of list) {
      if (sib === dragEl) continue;
      const sibRect = sib.getBoundingClientRect();
      const sibMid = sibRect.top + sibRect.height / 2;
      const sibIndex = list.indexOf(sib);

      if (dragIndex < sibIndex && dragMid > sibMid) {
        container.insertBefore(sib, dragEl);
        startY += sibRect.height;
        translateY -= sibRect.height;
        dragEl.style.transform = `translateY(${translateY}px)`;
        break;
      }
      if (dragIndex > sibIndex && dragMid < sibMid) {
        container.insertBefore(dragEl, sib);
        startY -= sibRect.height;
        translateY += sibRect.height;
        dragEl.style.transform = `translateY(${translateY}px)`;
        break;
      }
    }
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointerId) return;
    clearTimeout(holdTimer);

    if (dragEl) {
      dragEl.classList.remove('dragging-item');
      dragEl.style.position = '';
      dragEl.style.zIndex = '';
      dragEl.style.transform = '';
    }

    if (dragging && dragEl) {
      const newIndex = items().indexOf(dragEl);
      if (newIndex !== startIndex) {
        onReorder(startIndex, newIndex, dragEl);
      }
    }

    dragging = false;
    dragEl = null;
    pointerId = null;
    startIndex = -1;
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove, { passive: false });
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);

  // دالة لتفكيك المستمعات عند إعادة البناء (مثل destroy() في SortableJS)
  return {
    destroy() {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
    }
  };
}


/* =================================================================
   أمثلة الدمج — انسخ هذي الدوال بدلاً من initLessonsDrag/initSectionsDrag
   الموجودة حالياً في lessons.js
================================================================= */

function initLessonsDrag() {
  const list = document.getElementById('lessons-list');
  if (!list) return;
  if (window.lessonsSortable) window.lessonsSortable.destroy();

  window.lessonsSortable = makeDraggableList(
    list,
    '.panel[data-id]',
    '.grip',
    (oldIndex, newIndex, el) => {
      const id = el.getAttribute('data-id');
      const movedLesson = DATA.lessons.find(l => l.id === id);
      if (!movedLesson) return;
      const remaining = DATA.lessons.filter(l => l.id !== id);
      remaining.splice(newIndex, 0, movedLesson);
      DATA.lessons = remaining;
      save();
    }
  );
}

function initSectionsDrag(lessonId) {
  const list = document.getElementById('sections-list');
  if (!list) return;
  if (window.sectionsSortable) window.sectionsSortable.destroy();

  window.sectionsSortable = makeDraggableList(
    list,
    '.section-row',
    '.grip',
    (oldIndex, newIndex) => {
      const l = DATA.lessons.find(x => x.id === lessonId);
      if (l && l.sections) {
        const moved = l.sections.splice(oldIndex, 1)[0];
        l.sections.splice(newIndex, 0, moved);
        save();
        viewLesson(lessonId); // إعادة الرسم لتحديث data-index
      }
    }
  );
}
