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

/* ── مصطلحات مدمجة ────────────────────────────────────────────── */
const BUILTIN_TERMS = [

  /* ══════════ رياضيات ══════════ */
  { word:'دالة عددية',       wordFr:'Fonction numérique',      subj:'math', unit:'الدوال',
    definition:'قاعدة تربط كل عنصر من مجموعة التعريف بعنصر وحيد من مجموعة الوصول.',
    example:'f(x) = 2x + 1 دالة عددية مجموعة تعريفها ℝ' },
  { word:'اشتقاق',           wordFr:'Dérivation',              subj:'math', unit:'الدوال',
    definition:'عملية إيجاد مشتقة دالة، أي معدل تغيرها الفوري عند نقطة معينة.',
    example:"f'(x) = 2 لـ f(x) = 2x+1" },
  { word:'النهاية',          wordFr:'Limite',                  subj:'math', unit:'الدوال',
    definition:'القيمة التي تقترب منها دالة عندما يقترب المتغير من قيمة معينة.',
    example:'lim(x→0) sin(x)/x = 1' },
  { word:'الاستمرارية',      wordFr:'Continuité',              subj:'math', unit:'الدوال',
    definition:'دالة مستمرة عند نقطة إذا كانت نهايتها عندها تساوي قيمتها في تلك النقطة.',
    example:'f مستمرة عند x₀ إذا: lim f(x) = f(x₀)' },
  { word:'المشتقة',          wordFr:'Dérivée',                 subj:'math', unit:'الدوال',
    definition:'معدل التغير الفوري لدالة، ويُرمز لها بـ f\'(x) أو df/dx.',
    example:"f(x)=x² ⟹ f'(x)=2x" },
  { word:'الظلة',            wordFr:'Tangente',                subj:'math', unit:'الدوال',
    definition:'المستقيم الذي يماس منحنى دالة عند نقطة ما، ميله يساوي المشتقة عند تلك النقطة.',
    example:"معادلة الظلة عند x₀: y = f'(x₀)(x−x₀) + f(x₀)" },
  { word:'التكامل',          wordFr:'Intégrale',               subj:'math', unit:'التكامل',
    definition:'العملية العكسية للاشتقاق، وتُستخدم لحساب المساحات والتراكمات.',
    example:'∫2x dx = x² + C' },
  { word:'البدائي',          wordFr:'Primitive',               subj:'math', unit:'التكامل',
    definition:'دالة F تُعدّ بدائيًا لـ f إذا كانت F\'(x) = f(x) على مجال معين.',
    example:'F(x)=x³/3 بدائي لـ f(x)=x²' },
  { word:'متتالية عددية',   wordFr:'Suite numérique',         subj:'math', unit:'المتتاليات',
    definition:'دالة تُعرَّف على ℕ أو جزء منه وتأخذ قيمًا حقيقية.',
    example:'uₙ = 2n+1 : 1, 3, 5, 7, ...' },
  { word:'متتالية حسابية',  wordFr:'Suite arithmétique',      subj:'math', unit:'المتتاليات',
    definition:'متتالية يكون الفرق بين كل حدّين متتاليين ثابتًا يُسمى الأساس r.',
    example:'uₙ = 3+2n أساسها r=2' },
  { word:'متتالية هندسية',  wordFr:'Suite géométrique',       subj:'math', unit:'المتتاليات',
    definition:'متتالية يكون خارج قسمة كل حدّين متتاليين ثابتًا يُسمى الأساس q.',
    example:'uₙ = 3ⁿ أساسها q=3' },
  { word:'الدالة اللوغاريتمية', wordFr:'Fonction logarithmique', subj:'math', unit:'الدوال',
    definition:'الدالة ln هي اللوغاريتم الطبيعي، عكس الدالة الأسية eˣ، مجال تعريفها ]0,+∞[.',
    example:'ln(eˣ) = x و ln(1)=0' },
  { word:'الدالة الأسية',   wordFr:'Fonction exponentielle',  subj:'math', unit:'الدوال',
    definition:'الدالة f(x)=eˣ حيث e≈2.718، مشتقتها هي هي نفسها.',
    example:"(eˣ)' = eˣ" },
  { word:'العدد المركب',    wordFr:'Nombre complexe',         subj:'math', unit:'الأعداد المركبة',
    definition:'عدد من الشكل z = a+ib حيث a الجزء الحقيقي وb الجزء التخيلي وi²=−1.',
    example:'z = 3+4i : |z| = 5' },
  { word:'الاحتمال',        wordFr:'Probabilité',             subj:'math', unit:'الإحصاء والاحتمالات',
    definition:'قياس إمكانية وقوع حدث عشوائي، تتراوح قيمته بين 0 (مستحيل) و1 (مؤكد).',
    example:'P(رقم زوجي في نرد) = 3/6 = 0.5' },
  { word:'المتغير العشوائي', wordFr:'Variable aléatoire',    subj:'math', unit:'الإحصاء والاحتمالات',
    definition:'دالة تُعين لكل نتيجة من فضاء العينة عددًا حقيقيًا.',
    example:'X = عدد الوجوه في رمية نرد' },
  { word:'المعادلة التفاضلية', wordFr:'Équation différentielle', subj:'math', unit:'التكامل',
    definition:'معادلة تربط دالة مجهولة بمشتقاتها، تُستخدم في نمذجة الظواهر المتغيرة.',
    example:"y' = ky ⟹ y = Ce^(kx)" },
  { word:'دراسة تغيرات الدالة', wordFr:'Étude de variations', subj:'math', unit:'الدوال',
    definition:'تحديد المجالات التي تتزايد أو تتناقص فيها الدالة باستخدام إشارة المشتقة.',
    example:"f'(x)>0 ⟹ f تتزايد" },
  { word:'نقطة الانعطاف',   wordFr:"Point d'inflexion",      subj:'math', unit:'الدوال',
    definition:'نقطة يتغير عندها تحدب الدالة من محدب إلى مقعر أو العكس.',
    example:"تحدث عند f''(x)=0 مع تغير الإشارة" },
  { word:'المتجه',           wordFr:'Vecteur',                 subj:'math', unit:'الهندسة',
    definition:'كمية رياضية لها مقدار واتجاه وجهة، يُرمز له بـ \\(\\vec{u}\\).',
    example:'\\(\\vec{AB}\\) متجه من A إلى B' },

  /* ══════════ فيزياء-كيمياء ══════════ */
  { word:'الشغل',            wordFr:'Travail',                 subj:'phy', unit:'الميكانيك',
    definition:'طاقة تنتقل بتطبيق قوة على جسم يتحرك. W = F·d·cos(θ). وحدته الجول (J).',
    example:'رفع جسم كتلته 2kg لارتفاع 3m: W = 2×10×3 = 60 J' },
  { word:'الطاقة الحركية',  wordFr:'Énergie cinétique',       subj:'phy', unit:'الطاقة',
    definition:'طاقة الجسم بسبب حركته. Ec = ½mv². وحدتها الجول (J).',
    example:'Ec = ½×2×(3²) = 9 J' },
  { word:'الطاقة الكامنة',  wordFr:'Énergie potentielle',     subj:'phy', unit:'الطاقة',
    definition:'طاقة الجسم بسبب موضعه. Ep = mgh. وحدتها الجول (J).',
    example:'Ep = 2×10×5 = 100 J' },
  { word:'قانون نيوتن الثاني', wordFr:'Deuxième loi de Newton', subj:'phy', unit:'الميكانيك',
    definition:'مجموع القوى المؤثرة على جسم يساوي حاصل ضرب كتلته في تسارعه: ΣF = ma.',
    example:'F = 5×2 = 10 N لجسم كتلته 5kg وتسارعه 2m/s²' },
  { word:'التذبذب',          wordFr:'Oscillation',             subj:'phy', unit:'التذبذبات',
    definition:'حركة تكرارية لجسم حول وضع توازنه.',
    example:'بندول، نابض-كتلة' },
  { word:'الدور',            wordFr:'Période',                 subj:'phy', unit:'التذبذبات',
    definition:'الزمن اللازم لإتمام دورة كاملة. رمزه T ووحدته الثانية (s).',
    example:'T = 2π√(L/g) للبندول البسيط' },
  { word:'التردد',           wordFr:'Fréquence',               subj:'phy', unit:'التذبذبات',
    definition:'عدد الدورات في الثانية الواحدة. f = 1/T. وحدته الهرتز (Hz).',
    example:'إذا T=0.5s فـ f=2 Hz' },
  { word:'الموجة',           wordFr:'Onde',                    subj:'phy', unit:'الموجات',
    definition:'انتشار اضطراب في وسط ما دون انتقال مادة.',
    example:'موجة صوتية، موجة ضوئية' },
  { word:'طول الموجة',      wordFr:"Longueur d'onde",         subj:'phy', unit:'الموجات',
    definition:'المسافة بين نقطتين متجانستين متتاليتين. λ = v/f. وحدتها المتر (m).',
    example:'λ = 340/440 ≈ 0.77 m للصوت 440Hz' },
  { word:'انكسار الضوء',    wordFr:'Réfraction de la lumière', subj:'phy', unit:'الضوء',
    definition:'تغيير اتجاه الضوء عند انتقاله من وسط شفاف إلى آخر.',
    example:'n₁sinθ₁ = n₂sinθ₂ (قانون ديكارت)' },
  { word:'الأكسدة',         wordFr:'Oxydation',               subj:'phy', unit:'الكيمياء',
    definition:'فقدان إلكترونات من طرف الكيان الكيميائي المُؤكسَد.',
    example:'Fe → Fe²⁺ + 2e⁻' },
  { word:'الاختزال',        wordFr:'Réduction',               subj:'phy', unit:'الكيمياء',
    definition:'اكتساب إلكترونات من طرف الكيان الكيميائي المُختزَل.',
    example:'Cu²⁺ + 2e⁻ → Cu' },
  { word:'المكثفة',         wordFr:'Condensateur',            subj:'phy', unit:'الكهرباء',
    definition:'موصلان متقاطران يخزنان طاقة كهربائية. q = Cu. وحدة سعته الفاراد (F).',
    example:'C = 100μF جهد 5V: q = 5×10⁻⁴ C' },
  { word:'الملف',           wordFr:'Bobine',                  subj:'phy', unit:'الكهرباء',
    definition:'سلك مطوي يُنتج حقلاً مغناطيسياً ويُخزن طاقة مغناطيسية. E = ½Li².',
    example:'uL = L(di/dt)' },
  { word:'النشاط الإشعاعي', wordFr:'Radioactivité',          subj:'phy', unit:'الفيزياء النووية',
    definition:'تحول تلقائي لنواة عنصر غير مستقر إلى نواة أخرى مع انبعاث إشعاعات.',
    example:'انبعاث جسيمات α أو β أو γ' },
  { word:'قانون الانحلال الإشعاعي', wordFr:'Loi de désintégration', subj:'phy', unit:'الفيزياء النووية',
    definition:'عدد الأنوية المتبقية يتناقص وفق: N(t) = N₀ × e^(-λt).',
    example:'نصف عمر الكربون 14: t½ = 5730 سنة' },
  { word:'دارة RC',         wordFr:'Circuit RC',              subj:'phy', unit:'الكهرباء',
    definition:'دارة كهربائية تتضمن مقاومة ومكثفة، تخضع لمعادلة تفاضلية من الرتبة الأولى.',
    example:'τ = RC زمن التشحن' },
  { word:'قانون أوم',       wordFr:"Loi d'Ohm",              subj:'phy', unit:'الكهرباء',
    definition:'الجهد على المقاومة يساوي حاصل ضرب المقاومة في الشدة: U = RI.',
    example:'U = 10×0.5 = 5V' },

  /* ══════════ علوم الحياة والأرض ══════════ */
  { word:'الخلية',           wordFr:'Cellule',                 subj:'svt', unit:'الخلية',
    definition:'الوحدة الأساسية للبناء والوظيفة في الكائنات الحية.',
    example:'خلية نباتية، خلية حيوانية، خلية بكتيرية' },
  { word:'الميتوز',          wordFr:'Mitose',                  subj:'svt', unit:'انقسام الخلية',
    definition:'انقسام خلوي ينتج عنه خليتان بنتيتان مطابقتان للأم في عدد الصبغيات.',
    example:'4 مراحل: طورية، لارخيطية، إصطفافية، نهائية' },
  { word:'الميوز',           wordFr:'Méiose',                  subj:'svt', unit:'انقسام الخلية',
    definition:'انقسامان متتاليان ينتجان 4 خلايا بنصف عدد صبغيات الخلية الأم، يحدث في الأعضاء التناسلية.',
    example:'2n=46 ⟹ n=23 في الأمشاج البشرية' },
  { word:'الصبغي',           wordFr:'Chromosome',              subj:'svt', unit:'الوراثة',
    definition:'بنية خيطية توجد في نواة الخلية تحمل المادة الوراثية DNA.',
    example:'الإنسان: 46 صبغياً (23 زوجاً)' },
  { word:'الجين',            wordFr:'Gène',                    subj:'svt', unit:'الوراثة',
    definition:'قطعة من DNA تحمل المعلومة اللازمة لتركيب بروتين أو تنظيم التعبير الجيني.',
    example:'جين لون العيون، جين فصيلة الدم' },
  { word:'الطليعة الجينية',  wordFr:'Allèle',                 subj:'svt', unit:'الوراثة',
    definition:'شكل بديل لجين يحتل نفس الموضع على صبغيين متماثلين.',
    example:'طليعة الشعر الأحمر وطليعة الشعر الأسود' },
  { word:'النمط الظاهري',   wordFr:'Phénotype',               subj:'svt', unit:'الوراثة',
    definition:'مجموع الصفات الظاهرة والمقيسة لكائن حي، نتيجة تفاعل الجينوم مع البيئة.',
    example:'لون العيون، طول الجسم' },
  { word:'النمط الجيني',    wordFr:'Génotype',                subj:'svt', unit:'الوراثة',
    definition:'مجموع المعلومات الجينية الكاملة لكائن حي، أي مجموع أليلاته.',
    example:'AA، Aa، aa' },
  { word:'الطفرة',           wordFr:'Mutation',                subj:'svt', unit:'الوراثة',
    definition:'تغيير دائم في تسلسل قواعد الـ DNA يمكن أن يؤثر على التعبير الجيني.',
    example:'طفرة في جين الهيموغلوبين ⟹ فقر الدم المنجلي' },
  { word:'البروتين',         wordFr:'Protéine',                subj:'svt', unit:'الجزيئات الحيوية',
    definition:'جزيء حيوي مصنوع من سلسلة أحماض أمينية، يؤدي وظائف متنوعة في الخلية.',
    example:'الهيموغلوبين، الإنزيمات، الأجسام المضادة' },
  { word:'التنفس الخلوي',   wordFr:'Respiration cellulaire',  subj:'svt', unit:'الطاقة',
    definition:'تفاعل كيميائي تُؤكسد فيه الخلية الجلوكوز لإنتاج الطاقة (ATP) والماء وثاني أكسيد الكربون.',
    example:'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP' },
  { word:'التركيب الضوئي',  wordFr:'Photosynthèse',           subj:'svt', unit:'الطاقة',
    definition:'عملية تحويل الطاقة الضوئية إلى طاقة كيميائية في الخلايا النباتية.',
    example:'6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂' },
  { word:'الجهاز المناعي',  wordFr:'Système immunitaire',     subj:'svt', unit:'المناعة',
    definition:'مجموع الخلايا والأعضاء التي تدافع عن الجسم ضد مسببات الأمراض.',
    example:'الكريات البيضاء، الأجسام المضادة، الطحال' },
  { word:'الاستجابة المناعية', wordFr:'Réponse immunitaire',  subj:'svt', unit:'المناعة',
    definition:'ردود فعل الجهاز المناعي لمواجهة الأجسام الغريبة. نوعان: فطري ومكتسب.',
    example:'تكوين أجسام مضادة عند التطعيم' },
  { word:'الجهاز العصبي',   wordFr:'Système nerveux',        subj:'svt', unit:'التنسيق الوظيفي',
    definition:'شبكة من الأعصاب والخلايا العصبية تنقل المعلومات وتنسق وظائف الجسم.',
    example:'دماغ، نخاع شوكي، أعصاب محيطية' },
  { word:'السيالة العصبية', wordFr:'Influx nerveux',          subj:'svt', unit:'التنسيق الوظيفي',
    definition:'إشارة كهربائية تنتشر على طول الخلية العصبية لنقل المعلومة.',
    example:'سرعة السيالة: 0.5 إلى 100 m/s' },
  { word:'الهرمون',          wordFr:'Hormone',                 subj:'svt', unit:'التنسيق الوظيفي',
    definition:'جزيء كيميائي تُفرزه غدة إلى الدم لتنظيم وظائف الأعضاء البعيدة.',
    example:'الأنسولين، الأدرينالين، الإستروجين' },
  { word:'النظام البيئي',   wordFr:'Écosystème',              subj:'svt', unit:'البيئة',
    definition:'مجتمع من الكائنات الحية يتفاعل فيما بينه ومع بيئته اللاحيوية.',
    example:'غابة، بحيرة، مرجان، صحراء' },
  { word:'التطور',           wordFr:'Évolution',               subj:'svt', unit:'التطور',
    definition:'تغير تدريجي في خصائص مجموعات الكائنات الحية عبر الأجيال.',
    example:'نظرية داروين: الانتقاء الطبيعي' },
  { word:'الصفائح التكتونية', wordFr:'Plaques tectoniques',  subj:'svt', unit:'الجيولوجيا',
    definition:'قطع صلبة من قشرة الأرض تتحرك ببطء مسببةً الزلازل والبراكين وطي الجبال.',
    example:'الصفيحة الأوروأسيوية، الصفيحة الأمريكية' },
];

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

    <!-- ══ 3. زر استيراد المصطلحات المدمجة ══ -->
    ${total === 0 ? `
      <div class="highlight-box" style="background:var(--accent-light);
        border-right:4px solid var(--accent);border-radius:var(--radius-lg);
        padding:14px 16px;margin-bottom:14px;
        display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--accent);margin-bottom:3px">
            ${IC.book}&nbsp; مصطلحات جاهزة
          </div>
          <div style="font-size:12px;color:var(--text-2)">
            ${BUILTIN_TERMS.length} مصطلح شامل للرياضيات والفيزياء وعلوم الحياة
          </div>
        </div>
        <button class="btn btn-accent btn-sm" onclick="importBuiltinTerms()">
          استيراد الكل
        </button>
      </div>` : `
      <div style="display:flex;align-items:center;justify-content:space-between;
        margin-bottom:12px">
        <div class="section-header" style="margin:0">
          <h2>${q ? `نتائج "${esc(q)}"` : subj ? bySub.find(s=>s.id===subj)?.label+'' : 'كل المصطلحات'}</h2>
          <span class="count-badge">${items.length}</span>
        </div>
        ${DATA.glossary.length < BUILTIN_TERMS.length ? `
          <button class="btn btn-outline" style="font-size:11px"
            onclick="importBuiltinTerms()">
            ${IC.plus}&nbsp; استيراد الجاهزة
          </button>` : ''}
      </div>`}

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
   بطاقة مصطلح
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
        margin-bottom:${t.wordFr ? '2px' : '8px'}">
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

      <!-- التعريف -->
      <div class="term-def" style="font-size:13px;color:var(--text-2);
        line-height:1.7;margin-bottom:8px">
        ${esc(t.definition)}
      </div>

      <!-- المثال -->
      ${t.example ? `
        <div style="background:var(--surface-2);border-radius:8px;
          padding:8px 10px;margin-bottom:8px;
          border-right:2px solid var(--border-2)">
          <div style="font-size:10px;font-weight:800;color:var(--text-3);
            letter-spacing:.4px;margin-bottom:3px">مثال</div>
          <div style="font-size:12px;color:var(--text-2);
            font-family:var(--mono);direction:ltr;text-align:right">
            ${esc(t.example)}
          </div>
        </div>` : ''}

      <!-- الوسوم -->
      <div class="term-tags" style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge badge-${s.cls}" style="font-size:10px">
          ${s.short}
        </span>
        ${t.unit ? `
          <span class="badge badge-gray" style="font-size:10px">
            ${esc(t.unit)}
          </span>` : ''}
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   نموذج إضافة / تعديل
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
      <label>المصطلح بالفرنسية</label>
      <input class="field" id="tf-wordfr" value="${esc(x.wordFr || '')}"
        placeholder="مثال: Fonction numérique"
        style="direction:ltr;text-align:right">
    </div>

    <!-- التعريف -->
    <div class="field-row">
      <label>التعريف <span class="req">*</span></label>
      <textarea class="field" id="tf-def"
        style="min-height:90px"
        placeholder="اكتب شرحاً واضحاً ومختصراً...">${esc(x.definition || '')}</textarea>
    </div>

    <!-- مثال -->
    <div class="field-row">
      <label>مثال تطبيقي</label>
      <input class="field" id="tf-example" value="${esc(x.example || '')}"
        placeholder="مثال اختياري">
    </div>

    <!-- المادة والوحدة -->
    <div class="field-grid-2">
      <div class="field-row">
        <label>المادة</label>
        <select class="field" id="tf-subj">${subjOpts}</select>
      </div>
      <div class="field-row">
        <label>الوحدة / الفصل</label>
        <input class="field" id="tf-unit" value="${esc(x.unit || '')}"
          placeholder="مثال: الدوال">
      </div>
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
  const id  = document.getElementById('tf-id').value;
  const word = document.getElementById('tf-word').value.trim();
  const def  = document.getElementById('tf-def').value.trim();

  if (!word || !def) {
    toast('أدخل المصطلح والتعريف', 'error');
    return;
  }

  const obj = {
    word,
    wordFr:     document.getElementById('tf-wordfr').value.trim(),
    definition: def,
    example:    document.getElementById('tf-example').value.trim(),
    subj:       document.getElementById('tf-subj').value,
    unit:       document.getElementById('tf-unit').value.trim(),
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
   استيراد المصطلحات المدمجة
   ═══════════════════════════════════════════════════════════ */
function importBuiltinTerms() {
  const existing = new Set(DATA.glossary.map(t => t.word.trim().toLowerCase()));
  const toAdd    = BUILTIN_TERMS.filter(
    t => !existing.has(t.word.trim().toLowerCase())
  );

  if (toAdd.length === 0) {
    toast('كل المصطلحات موجودة بالفعل');
    return;
  }

  toAdd.forEach(t => DATA.glossary.push({ id: uid(), ...t }));
  save();
  toast(`تم استيراد ${toAdd.length} مصطلح`, 'success');
  renderGlossary();
}

/* ════════════════════════════════════════════════════════════
   دوال الفلاتر
   ═══════════════════════════════════════════════════════════ */
function setGlossSubj(subj) { _glossInit(); filGloss.subj = subj; renderGlossary(); }
function setGlossQ(q)       { _glossInit(); filGloss.q    = q;    renderGlossary(); }
function setGlossSort(s)    { _glossInit(); filGloss.sort = s;     renderGlossary(); }
