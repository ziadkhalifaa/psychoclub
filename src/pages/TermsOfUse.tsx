import { motion } from 'framer-motion';
import { Gavel, CheckCircle, AlertTriangle, Book, Scale, HelpCircle, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TermsOfUse() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: 'قبول الشروط', icon: CheckCircle },
    { id: 'ip', title: 'الملكية الفكرية', icon: Book },
    { id: 'obligations', title: 'التزامات المستخدم', icon: Scale },
    { id: 'disclaimer', title: 'إخلاء المسؤولية', icon: HelpCircle },
    { id: 'modifications', title: 'تعديل الشروط', icon: Gavel },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      const current = sections.find(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
        }
        return false;
      });

      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20" dir="rtl">
      {/* Hero Section */}
      <div className="bg-[#1F2F4A] pt-32 pb-20 px-4 relative overflow-hidden flex items-center justify-center min-h-[40vh]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#1F2F4A]/50 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#6FA65A]/10 rounded-full blur-[80px] mix-blend-screen" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl"
          >
            <Gavel className="w-12 h-12 text-[#6FA65A]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter"
          >
            شروط الاستخدام
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            تحكم هذه الشروط والأحكام التزامك بمنصة CCG. يرجى قراءتها لتوفير بيئة علمية وإكلينيكية آمنة ومهنية للجميع.
          </motion.p>
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="mt-8 py-2 px-6 bg-white/5 border border-white/10 rounded-full inline-block text-xs font-black uppercase tracking-widest text-[#6FA65A] backdrop-blur-sm"
          >
            آخر تحديث: مارس 2026
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full">
          
          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-32 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 z-20">
              <h3 className="text-[#1F2F4A] font-black text-lg mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                <Gavel className="w-5 h-5 text-[#6FA65A]" />
                محتويات الوثيقة
              </h3>
              <nav className="space-y-2 relative">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all duration-300 font-bold text-sm select-none ${
                        isActive 
                        ? 'bg-[#1F2F4A] text-white shadow-lg shadow-[#1F2F4A]/20 scale-[1.02] z-10 relative' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#1F2F4A]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#6FA65A]' : 'text-slate-400'}`} />
                      {section.title}
                      {isActive && <ChevronLeft className="w-4 h-4 mr-auto opacity-50" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 flex flex-col gap-8 w-full z-10 relative">
            {/* Mobile Context Menu */}
             <div className="lg:hidden sticky top-20 z-30 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 shadow-lg p-3 flex overflow-x-auto gap-2 custom-scrollbar">
              {sections.map((section) => {
                 const isActive = activeSection === section.id;
                 return (
                   <button
                     key={section.id}
                     onClick={() => scrollToSection(section.id)}
                     className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl font-bold text-xs transition-all flex-shrink-0 select-none ${
                       isActive 
                       ? 'bg-[#1F2F4A] text-white shadow-md' 
                       : 'bg-white text-slate-600 border border-slate-100'
                     }`}
                   >
                     {section.title}
                   </button>
                 );
              })}
            </div>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="acceptance" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6FA65A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 group-hover:bg-[#6FA65A]/10" />
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <CheckCircle className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">قبول الشروط</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-6 w-full relative z-10">
                <p>
                  بمجرد دخولك إلى منصة <strong className="text-[#1F2F4A]">Clinical Cases Group | Psycho-Club (CCG)</strong> واستخدام خدماتها وأدواتها وبرامجها التدريبية، فإنك توافق وتُقر بالتزامك المطلق والقانوني بكافة شروط الاستخدام الموضحة هنا.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 w-full">
                  <ShieldAlert className="w-8 h-8 shrink-0 text-amber-500" />
                  <p className="text-sm md:text-base font-bold leading-relaxed">
                    إذا كنت لا توافق على أي جزء من هذه الشروط، يُرجى التوقف عن استخدام المنصة فوراً وتجنب الوصول إلى محتواها أو مواردها، لما يترتب على ذلك من مسؤوليات.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="ip" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <Book className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">الملكية الفكرية</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-8 w-full relative z-10">
                <p>
                  كافة المحتويات العلمية، المرئية، المكتوبة، الحقائب، البرمجيات، والأدوات الإكلينيكية التفاعلية الموجوة على المنصة هي ملكية حصرية ومسجلة لـ CCG. 
                  نأخذ حقوق الملكية الفكرية بجدية تامة، <strong className="text-rose-600 font-extrabold pb-1 border-b-2 border-rose-200">ولا يُسمح لك قانوناً بما يلي:</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {[
                    "تصوير الشاشة أو تسجيل الدورات والجلسات بشكل مباشر أو غير مباشر.",
                    "إعادة توزيع أو بيع أو نشر المحتوى والمقالات بأي وسيلة.",
                    "تفكيك أو هندسة عكسية أو نسخ الأكواد البرمجية للمنصة.",
                    "استخدام الاسم أو اللوجو للمنصة بدون إذن خطي مسبق ومعتمد."
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 hover:border-rose-300 transition-colors w-full group/card hover:shadow-md">
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-rose-100 shrink-0 group-hover/card:scale-110 transition-transform">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      </div>
                      <p className="text-sm text-rose-800 font-bold leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

             <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="obligations" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <Scale className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">التزامات المستخدم</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-6 w-full relative z-10">
                <p>إنك تقر وتلتزم التزاماً كاملاً بصحة المعلومات التي تزودنا بها وبالسلوكيات التالية أثناء تواجده ومشاركتك:</p>
                <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-8 w-full shadow-inner">
                   <ul className="space-y-6">
                    {[
                      "الشفافية في تقديم معلومات صحيحة ودقيقة عند التسجيل وحجز الجلسات.",
                      "اتخاذ الإجراءات اللازمة للحفاظ على سرية بيانات حسابك وعدم مشاركتها مع زملاء المهنة.",
                      "استخدام المنصة للأغراض التعليمية والمهنية الصرفة وتجنب أي استغلال تجاري غير شرعي.",
                      "عدم التدخل في عمل المنصة برمجياً أو محاولة تجنب أو تعطيل أنظمة الحماية المتطورة.",
                      "الاحترام التام للزملاء والمحاضرين والمعلمين في مساحات المجتمع والالتزام بآداب المهنة."
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 w-full group/list">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 group-hover/list:border-[#6FA65A] transition-colors">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6FA65A]" />
                        </div>
                        <span className="text-sm md:text-base font-bold text-[#1F2F4A] pt-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="disclaimer" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <HelpCircle className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">إخلاء المسؤولية</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-6 w-full relative z-10">
                <p>
                  المحتوى، الدورات، الأدوات، والمقالات المقدمة على المنصة هي <strong className="text-[#1F2F4A]">لأغراض تعليمية وتدريبية إكلينيكية فقط</strong>، مكرسة خصيصاً لتطوير مهارات المتخصصين والعاملين بالصحة النفسية.
                </p>
                <div className="border-r-4 border-[#6FA65A] bg-[#6FA65A]/5 p-6 rounded-2xl w-full">
                  <p className="text-[#1F2F4A] font-bold text-sm md:text-base">
                    بالرغم من مجهوداتنا لضمان الجودة والدقة الإكلينيكية، إلا أننا لا نتحمل المسؤولية القانونية أو الطبية عن أي ممارسات أو أخطاء مهنية قد يرتكبها المستخدم في تدخله العلاجي أو التشخيصي بناءً على منصتنا.
                  </p>
                </div>
                <p>
                  بالنسبة لحجز الجلسات والمشاورات: الآراء والتوجيهات الاستشارية تعبر عن التقييم الكامل للمختص النفسي بكامل أهليته المهنية، ويقتصر دورنا على كربط تقني لتسهيل عملية الحجز والتواصل الآمن.
                </p>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="modifications" 
              className="bg-[#1F2F4A] p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-[#2a4068] shadow-2xl relative overflow-hidden group w-full text-white text-center"
            >
              <div className="absolute inset-0 bg-[#6FA65A]/10 opacity-50 blur-3xl pointer-events-none" />
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-center gap-4 mb-8 w-full">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                    <Gavel className="w-8 h-8 text-[#6FA65A]" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">تعديل الشروط</h2>
                <p className="text-slate-300 font-medium text-base md:text-lg leading-relaxed w-full max-w-3xl mx-auto">
                  نحتفظ بالحق التام والمطلق في تحديث، تعديل، أو تغيير أجزاء من شروط الاستخدام هذه في أي وقت دون شرط الإشعار المسبق. 
                  نوصيك بمراجعة هذه الصفحة بشكل دوري. إن استمرارك في استخدام أي خدمة من المنصة يعتبر <strong className="text-white bg-white/10 px-2 rounded">قبولاً صريحاً</strong> وملزماً للنسخة المحدثة.
                </p>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </div>
  );
}
