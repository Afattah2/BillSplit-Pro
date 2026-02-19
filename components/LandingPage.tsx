import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  Smartphone,
  Users,
  ShieldCheck,
  HelpCircle,
  Mail,
  Zap,
  ArrowRight,
  Calculator,
  ScanLine,
  Menu,
  X,
  ExternalLink,
  Play
} from 'lucide-react';
import GoogleAdsBanner from './GoogleAdsBanner';

// --- Helper Components ---

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{title}</h2>
    {subtitle && <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
    <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
  </div>
);

const VideoModal = ({ isOpen, onClose, videoId }: { isOpen: boolean; onClose: () => void; videoId: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/98 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all"
        >
          مشاهدة على يوتيوب مباشرة <ExternalLink size={16} />
        </a>
        <button
          onClick={onClose}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-lg hover:rotate-90"
          title="إغلاق"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)] border border-white/10">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`}
          title="شرح برنامج الحساب يجمع"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="mt-8 text-center space-y-2">
        <p className="text-white/60 text-sm font-medium">
          إذا استمرت مشكلة "Error 153"، يرجى استخدام زر "مشاهدة على يوتيوب" أعلاه.
        </p>
        <p className="text-white/30 text-[10px]">
          تأكد من عدم وجود إضافات تمنع الإعلانات (AdBlockers) قد تتداخل مع مشغل الفيديو.
        </p>
      </div>
    </div>
  );
};

// --- Content Sections ---

const Navbar = ({ onStartApp }: { onStartApp?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = id === 'home' ? document.body : document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const ctaButton = (className: string, children: React.ReactNode) =>
    onStartApp ? (
      <button type="button" onClick={onStartApp} className={className}>
        {children}
      </button>
    ) : (
      <a href="https://yegma3.com/" className={className}>
        {children}
      </a>
    );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between min-h-[120px] items-center py-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="Logo" className="w-36 h-36 object-contain rounded-2xl transform hover:scale-105 transition-transform drop-shadow-md" />
            <span className="text-2xl font-black text-slate-900 tracking-tighter">الحساب <span className="text-blue-600">يجمع</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-reverse space-x-8 font-bold text-slate-700">
            <a href="#benefits" onClick={(e) => handleScroll(e, 'benefits')} className="hover:text-blue-600 transition-colors">ليه تستخدمنا؟</a>
            <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-blue-600 transition-colors">إزاي بيشتغل؟</a>
            <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-blue-600 transition-colors">الأسئلة الشائعة</a>
            <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-blue-600 transition-colors">عن البرنامج</a>
            {ctaButton('bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2', <>جرب دلوقتي <ScanLine className="w-5 h-5" /></>)}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2 bg-slate-100 rounded-lg">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 font-bold shadow-2xl">
          <a href="#benefits" onClick={(e) => handleScroll(e, 'benefits')} className="block text-slate-700 py-3 border-b border-gray-50 text-right text-lg">ليه تستخدمنا؟</a>
          <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="block text-slate-700 py-3 border-b border-gray-50 text-right text-lg">إزاي بيشتغل؟</a>
          <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="block text-slate-700 py-3 border-b border-gray-50 text-right text-lg">الأسئلة الشائعة</a>
          <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="block text-slate-700 py-3 border-b border-gray-50 text-right text-lg">عن البرنامج</a>
          {ctaButton('w-full bg-blue-600 text-white px-6 py-4 rounded-2xl flex justify-center items-center gap-2 mt-6 text-xl shadow-lg shadow-blue-300', <>جرب دلوقتي <ScanLine className="w-5 h-5" /></>)}
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onOpenVideo, onStartApp }: { onOpenVideo: () => void; onStartApp?: () => void }) => (
  <header id="home" className="relative py-20 lg:py-32 overflow-hidden bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-right">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-blue-100">
            <Zap className="w-4 h-4 fill-current" />
            مدعوم بأحدث موديلات الذكاء الاصطناعي
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.15]">
            انسى خناقة <span className="text-blue-600">الفاتورة</span>.. <br />
            الحساب يجمع بذكاء!
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
            أول تطبيق ويب مصري بيحل معضلة تقسيم الحساب في المطاعم. صور الفاتورة، والذكاء الاصطناعي هيقرأ الأصناف، الضريبة، والخدمة ويوزعهم بالعدل بينكم في ثواني.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {onStartApp ? (
              <button type="button" onClick={onStartApp} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl text-center">
                ابدأ تقسيم الفاتورة <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <a href="https://yegma3.com/" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl text-center">
                ابدأ تقسيم الفاتورة <ArrowRight className="w-5 h-5 rotate-180" />
              </a>
            )}
            <button
              onClick={onOpenVideo}
              className="bg-white border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-3 group"
            >
              شوف فيديو الشرح <Play className="w-5 h-5 group-hover:fill-blue-600 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
          <div className="mt-12 flex items-center gap-6 grayscale opacity-60">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">+50,000</span>
              <span className="text-sm font-medium">فاتورة اتقسمت</span>
            </div>
            <div className="w-px h-10 bg-slate-300"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">100%</span>
              <span className="text-sm font-medium">دقة بالذكاء الاصطناعي</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600 blur-[120px] opacity-10 rounded-full"></div>
          <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 transform rotate-2">
            <img
              src="https://i.postimg.cc/J0B2Jmyk/Whats-App-Image-2026-02-09-at-8-15-30-PM.jpg"
              alt="تطبيق الحساب يجمع"
              className="rounded-[2rem] w-full aspect-square object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-4">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">تم التقسيم بنجاح</p>
                <p className="text-lg font-black text-slate-900">باقي 150.50 ج.م</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const ProblemSolution = () => (
  <section className="py-24 bg-white scroll-mt-24" id="benefits">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle title="ليه عملنا 'الحساب يجمع'؟" subtitle="لأننا عارفين إن لحظة وصول الفاتورة بتبقى أصعب لحظة في الخروجة." />

      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="bg-red-50 p-8 rounded-3xl border-r-8 border-red-500">
            <h3 className="text-2xl font-black text-red-900 mb-4 flex items-center gap-3">
              <X className="w-6 h-6" /> المعاناة اللي كلنا عارفينها
            </h3>
            <p className="text-red-800 leading-relaxed text-lg">
              تخيل إنك خارج مع 10 من أصحابك، الفاتورة تيجي ورقة طويلة عريضة فيها 30 صنف. تبدأ الرحلة: "مين طلب الشيش؟"، "لا ده كان بتاعي بس من غير البطاطس"، "طيب والخدمة والضريبة هنقسمهم إزاي؟".
              في الآخر تلاقي واحد دفع زيادة 100 جنيه، وواحد نسي يدفع أصلاً، وصاحب العزومة يلبس في الباقي.
            </p>
          </div>

          <div className="bg-green-50 p-8 rounded-3xl border-r-8 border-green-500">
            <h3 className="text-2xl font-black text-green-900 mb-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" /> الحل الذكي والسريع
            </h3>
            <p className="text-green-800 leading-relaxed text-lg">
              برنامجنا بيشيل عنك الهم ده كله. بضغطة زرار واحدة، الكاميرا بتمسح الفاتورة، والذكاء الاصطناعي بيفهم كل سطر. بيطلع لك الأصناف جاهزة، تختار كل واحد أكل إيه، وهو لوحده بيحسب "نسبة وتناسب" من الضريبة والخدمة لكل شخص حسب إجمالي طلبه. عدل، دقة، وسرعة.
            </p>
          </div>
        </div>
        <div className="relative">
          <img src="https://picsum.photos/seed/friends/600/600" alt="Friends having dinner" className="rounded-3xl shadow-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white p-8 rounded-full shadow-2xl animate-pulse">
            <Calculator className="w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-24 bg-slate-900 text-white overflow-hidden relative scroll-mt-24" id="how-it-works">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 blur-[150px] opacity-20 -mr-48 -mt-48"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-black mb-6">إزاي التقسيم بيخلص في 3 خطوات؟</h2>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">أحدث تقنيات الذكاء الاصطناعي بتخلي الموضوع أبسط مما تتخيل</p>
      </div>

      <div className="grid md:grid-cols-3 gap-12 text-center">
        <div className="bg-slate-800/50 p-10 rounded-[3rem] border border-slate-700 hover:border-blue-500 transition-all group">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform group-hover:rotate-12 transition-transform">
            <Camera className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-4">1. صور الفاتورة</h3>
          <p className="text-slate-400 leading-relaxed">
            افتح الموقع وصور الفاتورة موبايلك في إضاءة كويسة. متقلقش من الخط الصليل أو الورقة المتكرمشة، الذكاء الاصطناعي بيشوف اللي مابتشوفوش.
          </p>
        </div>

        <div className="bg-slate-800/50 p-10 rounded-[3rem] border border-slate-700 hover:border-blue-500 transition-all group">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform group-hover:rotate-12 transition-transform">
            <Zap className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-4">2. سيب المعالجة علينا</h3>
          <p className="text-slate-400 leading-relaxed">
            أحدث موديلات الذكاء الاصطناعي بتحلل الصورة، بتعرف الفرق بين اسم الوجبة وسعرها، وبتطلع لك بند "الخدمة" و "الضريبة" بشكل منفصل وتلقائي.
          </p>
        </div>

        <div className="bg-slate-800/50 p-10 rounded-[3rem] border border-slate-700 hover:border-blue-500 transition-all group">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform group-hover:rotate-12 transition-transform">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-4">3. وزع وابعت</h3>
          <p className="text-slate-400 leading-relaxed">
            ضيف أسماء أصحابك، واختار لكل واحد الصنف اللي أكله. السيستم هيحسب نصيب كل واحد من المصاريف الإضافية ويبعت لك ملخص للواتساب.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const MiniBlog = () => (
  <section className="py-24 bg-gray-50 scroll-mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle title="ليه التنظيم مهم في الخروجات؟" />

      <div className="grid lg:grid-cols-3 gap-8">
        <article className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-blue-600 font-black text-4xl mb-6 opacity-20">01</div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">راحة البال والحفاظ على الصداقة</h3>
          <p className="text-slate-600 leading-relaxed">
            مفيش حاجة بتبوظ الخروجة الحلوة قد المناهدة في الحساب. لما كل واحد يدفع اللي عليه بالظبط وبالقرش، مفيش حد بيحس إنه "اتدبس" أو إن فيه حد "استغله". "الحساب يجمع" بيحافظ على الود بينكم وبيخلي الخروجة تنتهي بضحكة مش بحسبة معقدة.
          </p>
        </article>

        <article className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-blue-600 font-black text-4xl mb-6 opacity-20">02</div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">العدالة في حساب الضريبة والخدمة</h3>
          <p className="text-slate-600 leading-relaxed">
            أكبر غلط بيحصل هو تقسيم الضريبة والخدمة بالتساوي. ده مش عدل! اللي طلب مية معدنية بـ 10 جنيه مش مفروض يشيل نفس نسبة الضريبة اللي شالها اللي طلب ستيك بـ 500 جنيه. سيستم الذكاء الاصطناعي بيوزع الإضافات دي بنسبة مئوية من طلب كل فرد.
          </p>
        </article>

        <article className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-blue-600 font-black text-4xl mb-6 opacity-20">03</div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">وعي مالي أفضل ومصاريف محسوبة</h3>
          <p className="text-slate-600 leading-relaxed">
            لما بتشوف حسابك مفصل، بتقدر تعرف ميزانيتك رايحة فين. البرنامج مش بس بيقسم، ده بيديك رؤية واضحة لأسعار المطاعم وتطورها. استخدامك للأدوات الذكية بيخليك مدير ناجح لمصاريفك الشخصية حتى في أوقات الترفيه والخروجات.
          </p>
        </article>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const faqs = [
    { q: "كيف يضمن البرنامج دقة قراءة الأسعار؟", a: "البرنامج بيعتمد على أحدث موديلات الذكاء الاصطناعي، والموديل ده مش بس بيقرأ النص، ده بيفهم علاقة السعر بالصنف مكانياً. يعني لو السعر بعيد شوية عن اسم الوجبة، الموديل بيقدر يربطهم ببعض بدقة 99%." },
    { q: "هل يمكن تقسيم الفاتورة بين أكثر من 10 أشخاص؟", a: "أكيد! البرنامج ملوش حدود في عدد الأشخاص. طالما الأصناف واضحة في الفاتورة، تقدر تضيف أصحابك كلهم وتوزع الأصناف على كل واحد فيهم، والبرنامج هيجمع نصيب كل فرد لوحده." },
    { q: "كيف يتعامل البرنامج مع فواتير المشويات والأصناف العربية؟", a: "دي ميزتنا الكبيرة! إحنا مدربين الموديل إنه يفهم المصطلحات المصرية الأصيلة. يعني كلمة 'صينية'، 'مخلي'، 'طاجن'، أو 'كوارع' بيتم التعرف عليها كأصناف أكل مش ككلمات عادية، وده بيمنع الغلطات اللي كانت بتحصل في الموديلات القديمة." },
    { q: "هل يحسب البرنامج قيمة الضريبة المضافة تلقائياً؟", a: "أيوة طبعاً. البرنامج بيقرأ بند 'الضريبة' و 'الخدمة' من آخر الفاتورة، وبيوزع قيمتهم بنسبة وتناسب على كل صنف. يعني لو طلبت صنف غالي، هتشيل نسبته العادلة من الضريبة، وده قمة العدل في التقسيم." },
    { q: "ماذا أفعل إذا كانت صورة الفاتورة غير واضحة؟", a: "لو الصورة مهزوزة أو الإضاءة ضعيفة جداً، الذكاء الاصطناعي ممكن يتلخبط. الأفضل إنك تصور الفاتورة في إضاءة كويسة وتخلي الموبايل موازي للورقة. البرنامج فيه خاصية بتنبهك لو جودة الصورة مش كفاية لإخراج نتائج دقيقة." },
    { q: "هل التطبيق مجاني بالكامل؟", a: "برنامج 'الحساب يجمع' مجاني تماماً للمستخدمين. إحنا بنعتمد على الإعلانات البسيطة عشان نقدر نغطي تكاليف تشغيل خوادم الذكاء الاصطناعي القوية، عشان نفضل نقدم لك الخدمة دي من غير ما تدفع مليم." },
    { q: "كيف يتم حساب نسبة الخدمة (Service) لكل فرد؟", a: "الخدمة بتتحسب كنسبة مئوية من إجمالي طلباتك. البرنامج بيجمع أسعار أصنافك ويضيف عليها 'نصيبك' من خدمة المطعم اللي مكتوبة في الفاتورة، وبكده مفيش حد بيشيل خدمة حاجة مأكلهاش." },
    { q: "هل يدعم البرنامج العملات غير الجنيه المصري؟", a: "حالياً التركيز الأساسي على الجنيه المصري وفواتير المطاعم في مصر، لكن التقنية اللي بنستخدمها تقدر تتعرف على أي عملة تانية طالما مكتوبة بوضوح في الفاتورة." },
    { q: "كيف يمكنني مشاركة الحساب النهائي مع أصدقائي؟", a: "بعد ما البرنامج يخلص تقسيم، بيطلع لك ملخص شيك جداً فيه اسم كل واحد وجنبه الحساب بتاعه. تقدر تاخد الملخص ده 'Copy' وتبعته على جروب الواتساب بتاعكم بضغطة واحدة." },
    { q: "هل يعمل البرنامج على هواتف أيفون وأندرويد؟", a: "البرنامج مصمم كـ Web App (PWA)، يعني بيشتغل من المتصفح مباشرة على أي موبايل أيفون أو أندرويد ومن غير ما يحتاج مساحة تحميل، وكمان تقدر تضيفه لشاشتك الرئيسية كأنه تطبيق عادي." }
  ];

  return (
    <section className="py-24 bg-white scroll-mt-24" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="أسئلة بتيجي في بالك" />
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg text-slate-900 group-open:bg-blue-600 group-open:text-white transition-all">
                <span>{faq.q}</span>
                <HelpCircle className="w-5 h-5 opacity-50 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-6 bg-white text-slate-600 leading-relaxed border-t border-slate-100 text-right">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutUs = () => (
  <section className="py-24 bg-blue-600 text-white scroll-mt-24" id="about">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-right">
          <h2 className="text-4xl font-black mb-8 italic">من نحن؟ القصة وراء "الحساب يجمع"</h2>
          <div className="space-y-6 text-lg leading-relaxed opacity-90">
            <p>
              إحنا مجموعة شباب مصريين، بنحب الخروج والأكل مع بعض، بس كنا بنكره اللحظة اللي الفاتورة بتنزل فيها. كل مرة كان بيبقى فيه خناقة "مين أكل إيه؟" و "مين هيدفع الباقي؟".
            </p>
            <p>
              قررنا نستخدم خبرتنا في البرمجة والذكاء الاصطناعي عشان نحل المشكلة دي لكل المصريين. هدفنا مش بس إننا نعمل أبلكيشن، هدفنا إننا نسهل حياة الناس ونمنع أي إحراج مالي ممكن يحصل بين الأصدقاء.
            </p>
            <p>
              استخدمنا أحدث تقنيات الذكاء الاصطناعي المتطورة عشان نضمن إن البرنامج يقدر يقرأ أي فاتورة مصرية، سواء كانت من مطعم فخم في الشيخ زايد أو محل مشويات أصيل في السيدة زينب. رؤيتنا إن "الحساب يجمع" يبقى رفيق كل شلة في كل خروجة.
            </p>
          </div>
          <div className="mt-10 flex items-center justify-end gap-4">
            <div className="bg-white/20 p-4 rounded-2xl flex items-center gap-3">
              <Mail className="w-6 h-6" />
              <span className="font-bold">contact@yegma3.com</span>
            </div>
          </div>
        </div>
        <div className="bg-white/10 p-12 rounded-[4rem] backdrop-blur-lg border border-white/20 text-right">
          <h3 className="text-2xl font-black mb-6">رؤيتنا في كلمات:</h3>
          <ul className="space-y-6">
            <li className="flex items-start justify-end gap-4">
              <p>دعم كامل للمصطلحات المصرية في فواتير المطاعم.</p>
              <div className="bg-white text-blue-600 p-1 rounded-full mt-1 shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
            </li>
            <li className="flex items-start justify-end gap-4">
              <p>خصوصية 100%.. بياناتك وصورك مش بتتخزن عندنا.</p>
              <div className="bg-white text-blue-600 p-1 rounded-full mt-1 shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
            </li>
            <li className="flex items-start justify-end gap-4">
              <p>مجاني وهيفضل مجاني لخدمة كل الناس.</p>
              <div className="bg-white text-blue-600 p-1 rounded-full mt-1 shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = id === 'home' ? document.body : document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-24 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16 text-right">
          <div className="col-span-2">
            <div className="flex items-center justify-end gap-6 mb-8 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-3xl font-black text-white tracking-tighter">الحساب <span className="text-blue-600">يجمع</span></span>
              <img src="/logo.png" alt="Logo" className="w-36 h-36 object-contain rounded-2xl drop-shadow-lg" />
            </div>
            <p className="max-w-md leading-relaxed mr-auto text-lg">
              أول منصة مصرية ذكية لتقسيم فواتير المطاعم باستخدام أحدث تقنيات الذكاء الاصطناعي. إحنا هنا عشان نخلي خروجاتكم أمتع وأحساباتكم أسهل.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-xl">روابط سريعة</h4>
            <ul className="space-y-4">
              <li><a href="#" onClick={(e) => handleScroll(e, 'home')} className="hover:text-blue-500 transition-colors">الرئيسية</a></li>
              <li><a href="#benefits" onClick={(e) => handleScroll(e, 'benefits')} className="hover:text-blue-500 transition-colors">ليه تستخدمنا؟</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-blue-500 transition-colors">إزاي بيشتغل؟</a></li>
              <li><a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-blue-500 transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-blue-500 transition-colors">من نحن</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-xl">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center justify-end gap-3">contact@yegma3.com <Mail className="w-4 h-4" /></li>
              <li className="flex items-center justify-end gap-3">متاح كـ Web App <Smartphone className="w-4 h-4" /></li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-sm text-right">
          <h4 className="text-white font-bold mb-4 flex items-center justify-end gap-2 text-lg">
            سياسة الخصوصية وشروط الاستخدام <ShieldCheck className="w-5 h-5 text-blue-500" />
          </h4>
          <div className="grid md:grid-cols-2 gap-8 text-xs leading-relaxed opacity-70">
            <p>
              نحن نولي أهمية قصوى لخصوصية بياناتك. يعتمد البرنامج على أحدث تقنيات الذكاء الاصطناعي لمعالجة وتحليل صور الفواتير. نحن لا نقوم بتخزين أي صور ترفعها على خوادمنا الخاصة. تتم عملية المعالجة لحظياً ويتم حذف البيانات فور انتهاء التحليل.
            </p>
            <p>
              نستخدم ملفات تعريف الارتباط Cookies لتحسين الأداء وعرض إعلانات ملائمة. يتم عرض إعلانات عبر طرف ثالث مثل جوجل أدسنس، وقد تستخدم هذه الأطراف معلومات عن زياراتك لتقديم إعلانات تهمك. باستخدامك للموقع فأنت توافق على هذه السياسة بالكامل.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900 text-center text-xs opacity-50">
          © {new Date().getFullYear()} الحساب يجمع. جميع الحقوق محفوظة لشباب مصر المبدعين.
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const goToApp = () => navigate('/app');

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <Navbar onStartApp={goToApp} />
      <Hero onOpenVideo={() => setIsVideoOpen(true)} onStartApp={goToApp} />
      <ProblemSolution />
      <HowItWorks />
      <MiniBlog />
      <FAQ />
      <AboutUs />
      <Footer />

      <GoogleAdsBanner adFormat="auto" className="no-print" />

      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoId="ptCCekKYxI8" />

      <div className="md:hidden fixed left-6 right-6 z-50 bottom-[72px] sm:bottom-[112px]">
        <button type="button" onClick={goToApp} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-2xl shadow-blue-500 flex items-center justify-center gap-3 active:scale-95 transition-transform">
          <Camera className="w-6 h-6" /> صور الفاتورة وابدأ
        </button>
      </div>
    </div>
  );
}
