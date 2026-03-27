import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlayCircle, FileText, Lock, CheckCircle, Clock, BookOpen, User, Star, Phone, MessageCircle, ArrowLeft, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function CourseView() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [payerPhone, setPayerPhone] = useState('');

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => fetch(`/api/courses/${slug}`).then(res => res.json())
  });

  const { data: myPurchases } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: () => fetch('/api/purchases/my').then(res => res.ok ? res.json() : []),
    enabled: !!user
  });

  if (isLoading) return <div className="p-24 text-center">جاري التحميل...</div>;
  if (!course) return <div className="p-24 text-center">لم يتم العثور على الدورة</div>;

  const coursePurchase = myPurchases?.find((p: any) => p.itemId === course.id && p.type === 'COURSE');
  const hasPurchased = user?.role === 'ADMIN' || coursePurchase?.status === 'APPROVED';
  const isPending = coursePurchase?.status === 'PENDING';

  const handleManualCheckout = async () => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }
    if (!paymentMethod || !payerPhone.trim()) {
      alert("يرجى اختيار طريقة دفع وإدخال رقم الهاتف");
      return;
    }

    setPaymentStatus('loading');
    try {
      const res = await fetch('/api/checkout/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: course.id, 
          type: 'COURSE', 
          paymentMethod, 
          payerPhone 
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentStatus('success');
        queryClient.invalidateQueries({ queryKey: ['myPurchases'] });
      } else {
        setPaymentStatus('error');
        alert(data.error || "حدث خطأ أثناء إعداد الدفع");
      }
    } catch (err) {
      setPaymentStatus('error');
      alert("حدث خطأ");
    }
  };

  const handleFreeCheckout = async () => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }
    setPaymentStatus('loading');
    try {
      const res = await fetch('/api/checkout/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: course.id, type: 'COURSE' })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentStatus('success');
        queryClient.invalidateQueries({ queryKey: ['myPurchases'] });
        alert("تمت إضافة الدورة بنجاح!");
      } else {
        setPaymentStatus('error');
        alert(data.error || "حدث خطأ أثناء إضافة الدورة");
      }
    } catch (err) {
      setPaymentStatus('error');
      alert("حدث خطأ");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1F2F4A] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden relative shadow-2xl mt-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/40 via-transparent to-transparent mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#6FA65A10_0%,transparent_40%)]" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 p-6 md:p-20 relative z-10 items-center">
          <div className="space-y-6 md:space-y-8 text-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <span className="bg-[#6FA65A] px-3 py-1 md:px-4 md:py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">{course.category}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#6FA65A]" /> {course.level}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#6FA65A]" /> {course.duration}</span>
            </motion.div>

            <h1 className="text-2xl md:text-6xl font-black leading-tight tracking-tighter">{course.title}</h1>
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-xl font-medium">{course.description}</p>

            <div className="flex items-center gap-4 md:gap-5 pt-6 border-t border-white/5">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-white/5 backdrop-blur-md p-1 border border-white/10 group overflow-hidden">
                {course.instructor.photo || course.instructor.user.avatar ? (
                  <img src={course.instructor.photo || course.instructor.user.avatar} alt={course.instructor.user.name} className="w-full h-full object-cover rounded-xl md:rounded-[1.8rem] transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6FA65A] font-black text-xl">
                    {course.instructor.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] text-[#6FA65A] font-black uppercase tracking-widest mb-1">المحاضر المعتمد</p>
                <div className="font-black text-lg md:text-xl">{course.instructor.user.name}</div>
                <div className="text-slate-500 text-[10px] md:text-xs font-bold">{course.instructor.title}</div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-[#6FA65A]/10 blur-3xl rounded-full" />
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5 aspect-video group">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
              {hasPurchased ? (
                <div className="absolute inset-0 bg-[#1F2F4A]/40 flex items-center justify-center backdrop-blur-sm transition-all group-hover:bg-[#1F2F4A]/60 opacity-0 group-hover:opacity-100">
                  <Link to={`/courses/${course.slug}/learn`} className="bg-white text-[#1F2F4A] px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl flex items-center gap-3">
                    <PlayCircle className="w-6 h-6" />
                    ابدأ التعلم الآن
                  </Link>
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#1F2F4A]/60 flex items-center justify-center backdrop-blur-md transition-all group-hover:bg-[#1F2F4A]/40">
                  <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] text-center shadow-2xl max-w-sm w-full mx-6 border border-white">
                    <div className="text-3xl font-black text-[#1F2F4A] mb-4 tracking-tighter">
                      {course.isFree ? (
                        <span className="text-[#6FA65A]">مجاناً بالكامل</span>
                      ) : (
                        <span className="text-[#6FA65A]">{course.discount || course.price} <span className="text-sm font-black uppercase">ج.م</span></span>
                      )}
                    </div>

                    {course.isFree ? (
                      <button onClick={handleFreeCheckout} disabled={paymentStatus === 'loading'} className="w-full bg-[#1F2F4A] text-white py-5 rounded-[2rem] font-black hover:bg-[#6FA65A] transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95 disabled:opacity-50">
                        {paymentStatus === 'loading' ? 'جاري الإضافة...' : 'امتلك الدورة الآن'}
                      </button>
                    ) : paymentStatus === 'success' || isPending ? (
                      <div className="space-y-4">
                        <div className="p-6 bg-emerald-50 text-emerald-900 rounded-[2rem] text-xs font-bold border border-emerald-100 italic text-right">
                          " تم استلام طلبك بنجاح! طلبك الآن قيد المراجعة من قبل الإدارة لتفعيل الدورة لك. "
                        </div>
                        <div className="py-3 px-6 bg-slate-50 rounded-2xl text-[10px] text-[#1F2F4A] font-black uppercase tracking-widest border border-slate-100">
                           حالة الطلب: قيد المراجعة 🕒
                        </div>
                      </div>
                    ) : !showPaymentOptions ? (
                      <button onClick={() => setShowPaymentOptions(true)} className="w-full bg-[#1F2F4A] text-white py-5 rounded-[2rem] font-black hover:bg-[#6FA65A] transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95">
                        احصل على الدورة
                      </button>
                    ) : !paymentMethod ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">اختر طريقة الدفع</p>
                        
                        <button onClick={() => setPaymentMethod('VODAFONE_CASH')} className="w-full flex items-center justify-between bg-rose-50 hover:bg-rose-100 text-rose-700 p-4 rounded-2xl transition-all border border-rose-100 group/pay">
                          <span className="font-black text-xs">فودافون كاش</span>
                          <img src="/images/logos/vodafone-cash.png" alt="Vodafone Cash" className="h-6 object-contain" />
                        </button>

                        <button onClick={() => setPaymentMethod('INSTAPAY')} className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-2xl transition-all border border-indigo-100 group/pay">
                          <span className="font-black text-xs">إنستاباي</span>
                          <img src="/images/logos/instapay.png" alt="InstaPay" className="h-6 object-contain" />
                        </button>

                        <button onClick={() => setShowPaymentOptions(false)} className="w-full text-slate-400 text-[10px] font-bold py-2">إلغاء</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-2xl border ${paymentMethod === 'VODAFONE_CASH' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                          <p className="text-[10px] font-black mb-1 opacity-60">حول المبلغ إلى:</p>
                          <p className="font-black text-lg tracking-wider" dir="ltr">{paymentMethod === 'VODAFONE_CASH' ? '01031611290' : 'mustafasaleh97@instapay'}</p>
                        </div>

                        <div className="space-y-2 text-right">
                          <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest flex items-center gap-1 justify-end">
                            رقم الموبايل المحوّل منه <Phone className="w-3 h-3" />
                          </label>
                          <input 
                            type="tel" 
                            value={payerPhone}
                            onChange={e => setPayerPhone(e.target.value)}
                            placeholder="01xxxxxxxxx"
                            dir="ltr"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold focus:ring-2 focus:ring-[#6FA65A]/50 focus:border-[#6FA65A] outline-none"
                          />
                        </div>

                        <button 
                          onClick={handleManualCheckout} 
                          disabled={paymentStatus === 'loading' || !payerPhone.trim()}
                          className="w-full bg-[#6FA65A] text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
                        >
                          {paymentStatus === 'loading' ? 'جاري التأكيد...' : 'تأكيد إرسال المبلغ'}
                        </button>

                        <button onClick={() => { setPaymentMethod(null); setPayerPhone(''); }} className="text-slate-400 text-[10px] font-bold">← تغيير الطريقة</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-black text-[#1F2F4A] tracking-tighter">المنهج الدراسي</h2>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                {course.lessons.length} وحدات تعليمية
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden">
              {course.lessons.map((lesson: any, index: number) => (
                <div key={lesson.id} className={`p-6 md:p-8 flex items-center justify-between ${index !== course.lessons.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-all duration-300 group/lesson`}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#1F2F4A]/5 flex items-center justify-center text-slate-400 shrink-0 group-hover/lesson:bg-[#6FA65A] group-hover/lesson:text-white transition-all">
                      {lesson.type === 'video' ? <PlayCircle className="w-5 h-5" /> : lesson.type === 'text' ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg ${hasPurchased || lesson.isPreview ? 'text-[#1F2F4A]' : 'text-slate-400'}`}>
                        {index + 1}. {lesson.title}
                      </h4>
                      <div className="text-[10px] font-black text-slate-400 mt-2 flex items-center gap-3 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {lesson.type}</span>
                        {lesson.duration && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {lesson.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-4">
                    {hasPurchased ? (
                      <Link to={`/courses/${course.slug}/learn`} className="block bg-[#6FA65A]/10 text-[#6FA65A] p-3 rounded-2xl hover:bg-[#6FA65A] hover:text-white transition-all shadow-sm">
                        <PlayCircle className="w-6 h-6" />
                      </Link>
                    ) : lesson.isPreview ? (
                      <motion.button whileHover={{ scale: 1.05 }} className="text-[#6FA65A] text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all">
                        معاينة
                      </motion.button>
                    ) : (
                      <Lock className="w-5 h-5 text-slate-200" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/40 backdrop-blur-xl p-10 md:p-14 rounded-[3.5rem] border border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#6FA65A]" />
            <h2 className="text-3xl font-black text-[#1F2F4A] mb-10 tracking-tighter">رؤية المحاضر</h2>
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="w-40 h-40 rounded-[2.5rem] bg-[#1F2F4A] overflow-hidden shrink-0 shadow-2xl border-4 border-white">
                {course.instructor.photo || course.instructor.user.avatar ? (
                  <img src={course.instructor.photo || course.instructor.user.avatar} alt={course.instructor.user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-5xl">
                    {course.instructor.user.name.charAt(0) || 'D'}
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-[#1F2F4A]">{course.instructor.user.name}</h3>
                  <p className="text-[#6FA65A] font-black text-sm uppercase tracking-widest mt-1">{course.instructor.title}</p>
                </div>
                <p className="text-slate-500 leading-[2] text-lg font-medium italic">"{course.instructor.bio}"</p>

                {course.instructor.specialties && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    {JSON.parse(course.instructor.specialties).map((spec: string) => (
                      <span key={spec} className="bg-[#1F2F4A]/5 text-[#1F2F4A] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#1F2F4A]/10">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50 sticky top-32"
          >
            {/* What You'll Learn — only if set */}
            {course.whatYouLearn && (
              <>
                <h3 className="font-black text-[#1F2F4A] text-xl mb-8 border-b border-slate-100 pb-4">مكتسبات الدورة</h3>
                <ul className="space-y-6">
                  {course.whatYouLearn.split('|').filter(Boolean).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-[#6FA65A] transition-all">
                        <CheckCircle className="w-3.5 h-3.5 text-[#6FA65A] group-hover:text-white" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 leading-relaxed group-hover:text-[#1F2F4A] transition-colors">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
                {course.requirements && <div className="my-10 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />}
              </>
            )}

            {/* Requirements — only if set */}
            {course.requirements && (
              <>
                <h3 className="font-black text-[#1F2F4A] text-xl mb-8">المهارات المطلوبة</h3>
                <div className="space-y-4">
                  {course.requirements.split('|').filter(Boolean).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6FA65A]" />
                      <span className="text-sm font-bold text-[#1F2F4A]">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Fallback if neither is set */}
            {!course.whatYouLearn && !course.requirements && (
              <p className="text-slate-400 text-sm font-medium text-center py-4">لم يتم تحديد مكتسبات أو متطلبات بعد</p>
            )}
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
