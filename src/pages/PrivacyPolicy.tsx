import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Bell, Mail, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'intro', title: 'مقدمة', icon: Eye },
    { id: 'collect', title: 'المعلومات التي نجمعها', icon: FileText },
    { id: 'security', title: 'أمان البيانات وحمايتها', icon: Lock },
    { id: 'rights', title: 'حقوقك كعضو', icon: Bell },
    { id: 'contact', title: 'تواصل معنا', icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Add a small offset to account for the sticky header
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
    setTimeout(handleScroll, 100); // Initial check
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#6FA65A]/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#1F2F4A]/50 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] mix-blend-screen" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl"
          >
            <Shield className="w-12 h-12 text-[#6FA65A]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter"
          >
            سياسة الخصوصية
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            نحن نلتزم بحماية بياناتك وخصوصيتك بأعلى المعايير الأمنية والمهنية. تعرف على كيفية تعاملنا مع معلوماتك.
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
                <FileText className="w-5 h-5 text-[#6FA65A]" />
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
              id="intro" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6FA65A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 group-hover:bg-[#6FA65A]/10" />
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <Eye className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">مقدمة</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-6 w-full relative z-10">
                <p>
                  نحن في <strong className="text-[#1F2F4A]">Clinical Cases Group | Psycho-Club (CCG)</strong> نولي أهمية قصوى لخصوصيتك وأمان بياناتك. توضح هذه السياسة كيفية جمعنا للمعلومات، واستخدامها، وحمايتها عند استخدامك لمنصتنا.
                </p>
                <div className="p-6 bg-[#1F2F4A]/5 rounded-2xl border-r-4 border-[#1F2F4A] text-[#1F2F4A]">
                  باستخدامك للمنصة، فإنك توافق على ممارسات البيانات الموضحة في هذه السياسة. نحن نلتزم بالمعايير الأخلاقية والمهنية الصارمة في التعامل مع كافة المعلومات، خاصة تلك المتعلقة بالصحة النفسية والتدريب الإكلينيكي.
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="collect" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <FileText className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">المعلومات التي نجمعها</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-8 w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="bg-slate-50 p-8 rounded-[1.5rem] border border-slate-100 hover:border-[#6FA65A]/50 transition-all duration-300 hover:shadow-lg w-full group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                      <span className="w-3 h-3 rounded-full bg-[#6FA65A]" />
                    </div>
                    <h3 className="font-black text-xl text-[#1F2F4A] mb-3">المعلومات الشخصية</h3>
                    <p className="text-sm text-slate-500 leading-loose">الاسم، البريد الإلكتروني، رقم الهاتف، والبيانات المهنية التي تقدمها عند التسجيل للحصول على تجربة مخصصة.</p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[1.5rem] border border-slate-100 hover:border-[#6FA65A]/50 transition-all duration-300 hover:shadow-lg w-full group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                      <span className="w-3 h-3 rounded-full bg-[#6FA65A]" />
                    </div>
                    <h3 className="font-black text-xl text-[#1F2F4A] mb-3">معلومات الدفع</h3>
                    <p className="text-sm text-slate-500 leading-loose">بيانات التحويل عبر وسائل الدفع المعتمدة (فودافون كاش، إنستاباي)، وتأكيد أرقام الهواتف المحوّل منها لضمان دقة المعاملات.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 p-6 bg-rose-50 rounded-2xl border border-rose-100 text-rose-800 w-full">
                  <Shield className="w-8 h-8 shrink-0 text-rose-500" />
                  <p className="text-sm leading-relaxed font-bold">
                    نحن <span className="underline decoration-rose-300 decoration-2 underline-offset-4">لا نجمع</span> أي بيانات طبية حساسة خارج إطار الجلسات الاستشارية الخاصة التي تتم بينك وبين المختصين، وتخضع تلك الجلسات لسرية مهنية وأخلاقية تامة لا يطّلع عليها أي طرف ثالث.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="security" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <Lock className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">أمان البيانات وحمايتها</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-6 w-full relative z-10">
                <p>
                  نطبق تدابير أمنية تقنية وتنظيمية متقدمة لحماية معلوماتك من الوصول غير المصرح به، التغيير، الكشف، أو التدمير. تشمل بروتوكولاتنا الأمنية ما يلي:
                </p>
                <div className="space-y-4 w-full">
                  {[
                    "تشفير البيانات الحساسة أثناء النقل والتخزين بأحدث تقنيات التشفير.",
                    "نظام حماية متقدم لمنع تصوير الشاشة وسرقة المحتوى العلمي بشكل استباقي.",
                    "مراجعة دورية صارمة لممارسات جمع المعلومات ومعالجتها وتخزينها.",
                    "قصر وتقييد الوصول إلى المعلومات الشخصية على الموظفين والإداريين المخولين فقط."
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors w-full border border-transparent hover:border-slate-100">
                      <div className="mt-1 shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#6FA65A]" />
                      </div>
                      <p className="text-sm md:text-base text-[#1F2F4A] font-bold">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="rights" 
              className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group w-full"
            >
              <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  <Bell className="w-7 h-7 text-[#1F2F4A]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A]">حقوقك كعضو</h2>
              </div>
              <div className="text-slate-600 text-base md:text-lg leading-relaxed font-medium space-y-6 w-full relative z-10">
                <p className="mb-2">بصفتك عضواً في منصة CCG، نكفل لك الحقوق الكاملة التالية المتعلقة ببياناتك:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                  <div className="bg-[#1F2F4A] text-white p-6 rounded-2xl text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-500 w-full">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6FA65A] font-black text-xl">1</div>
                    <h4 className="font-black mb-2">الوصول</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">الوصول الكامل إلى معلوماتك الشخصية التي نحتفظ بها عبر لوحة تحكم حسابك.</p>
                  </div>
                  <div className="bg-[#1F2F4A] text-white p-6 rounded-2xl text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-500 w-full delay-100">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6FA65A] font-black text-xl">2</div>
                    <h4 className="font-black mb-2">التصحيح</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">طلب تصحيح أو تحديث أي بيانات غير دقيقة أو قديمة في أي وقت بسهولة.</p>
                  </div>
                  <div className="bg-[#1F2F4A] text-white p-6 rounded-2xl text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-500 w-full delay-200">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6FA65A] font-black text-xl">3</div>
                    <h4 className="font-black mb-2">الحذف</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">طلب تقديم مسح أمني وحذف حسابك وبياناتك من نظامنا وتطبيقاتنا نهائياً.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              id="contact" 
              className="bg-gradient-to-br from-[#1F2F4A] to-[#2a4068] p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl text-center relative overflow-hidden w-full"
            >
              <div className="absolute inset-0 bg-[#6FA65A]/5 opacity-50 blur-3xl pointer-events-none" />
              <div className="relative z-10 w-full">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <Mail className="w-10 h-10 text-[#6FA65A]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">هل لديك أي استفسارات؟</h2>
                <p className="text-slate-300 font-medium mb-10 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                  فريق الدعم الفني لدينا متواجد دائماً للرد على أسئلتك ومخاوفك المتعلقة بالخصوصية وأمان بياناتك. لا تتردد في مراسلتنا في أي وقت.
                </p>
                <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[#152238]/50 p-2 sm:pr-6 rounded-3xl sm:rounded-full border border-white/10 backdrop-blur-md w-full sm:w-auto overflow-hidden">
                  <span className="font-black text-lg md:text-xl tracking-wider text-white px-4 py-2 select-all">psychoclub10@gmail.com</span>
                  <a href="mailto:psychoclub10@gmail.com" className="w-full sm:w-auto px-8 py-4 bg-[#6FA65A] text-white rounded-2xl sm:rounded-[2rem] font-black hover:bg-emerald-600 transition-colors shadow-lg">
                    إرسال بريد
                  </a>
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </div>
  );
}
