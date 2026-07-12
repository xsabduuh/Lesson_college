/* =================================================================
   STORE.JS — مخزن مركزي للبيانات
   ─────────────────────────────────────────────────────────────────
   - يحتفظ بكل بيانات التطبيق
   - أي تغيير عبر Store.set() يُخبر كل الصفحات تلقائياً
   - الصفحات تسجل نفسها عبر Store.subscribe()
================================================================= */

const Store = {
  data: {
    students: [],
    sessions: [],
    attendance: [],
    grades: [],
    payments: [],
    lessons: [],
    exercises: [],
    homework: [],
    glossary: [],
    settings: {}
  },

  listeners: [],

  /**
   * تحميل البيانات من DATA (الموجودة في data.js)
   */
  init() {
    this.data = { ...DATA };
    this.notify('__init__', this.data);
  },

  /**
   * تغيير قيمة في المخزن
   * @param {string} key - اسم المفتاح (مثلاً 'lessons')
   * @param {*} value - القيمة الجديدة
   */
  set(key, value) {
    this.data[key] = value;
    this.notify(key, value);
  },

  /**
   * تحديث كامل للبيانات (مثلاً بعد loadDataFromCloud)
   */
  setAll(newData) {
    this.data = { ...this.data, ...newData };
    this.notify('__all__', this.data);
  },

  /**
   * جلب قيمة من المخزن
   */
  get(key) {
    return this.data[key];
  },

  /**
   * تسجيل دالة ليتم استدعاؤها عند تغير البيانات
   * @param {function} fn - دالة تستقبل (key, value)
   * @returns {function} دالة لإلغاء الاشتراك
   */
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },

  /**
   * إخبار جميع المستمعين بتغير البيانات
   */
  notify(key, value) {
    this.listeners.forEach(fn => {
      try {
        fn(key, value);
      } catch (e) {
        console.error('خطأ في مستمع Store:', e);
      }
    });
  }
};