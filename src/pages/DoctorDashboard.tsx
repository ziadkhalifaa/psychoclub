import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Calendar, Users,
  Settings, DollarSign, Activity, Star,
  Trash2, PlusCircle, LayoutDashboard,
  ArrowLeft, Search, Filter, User, PenTool
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Modular Components
import { DashboardSidebar } from '../components/DashboardSidebar';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardHeader } from '../components/DashboardHeader';
import { CourseCreator } from '../components/CourseCreator';
import { ArticleEditor } from '../components/ArticleEditor';

const menuItems = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, roles: ['DOCTOR', 'SPECIALIST'] },
  { id: 'portfolio', label: 'الملف الشخصي', icon: User, roles: ['DOCTOR', 'SPECIALIST'] },
  { id: 'slots', label: 'مواعيد الجلسات', icon: Calendar, roles: ['DOCTOR', 'SPECIALIST'] },
  { id: 'courses', label: 'الدورات التدريبية', icon: BookOpen, roles: ['DOCTOR', 'SPECIALIST'] },
  { id: 'articles', label: 'إدارة المقالات', icon: PenTool, roles: ['DOCTOR', 'SPECIALIST', 'SUPERVISOR'] },
  { id: 'earnings', label: 'الأرباح', icon: Activity, roles: ['DOCTOR', 'SPECIALIST'] },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const filteredMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));
  const [activeTab, setActiveTab] = useState(user && user.role === 'SUPERVISOR' ? 'articles' : 'overview');
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);

  // New states for Portfolio & Slots
  const [portfolio, setPortfolio] = useState({
    bio: '', specialties: '', title: '', photo: '', sessionPrice: 0, sessionLink: ''
  });
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', durationMinutes: 45 });

  useEffect(() => {
    if (!user || !['DOCTOR', 'SPECIALIST', 'SUPERVISOR'].includes(user.role)) return;
    const fetchData = async () => {
      try {
        if (activeTab === 'overview') {
          const res = await fetch('/api/doctors/stats');
          const data = await res.json();
          setStats(data);
        }
        if (activeTab === 'courses' && !showAddCourse) {
          const res = await fetch('/api/courses');
          const data = await res.json();
          setCourses(data);
        }
        if (activeTab === 'articles' && !showAddArticle) {
          const res = await fetch('/api/doctors/articles');
          const data = await res.json();
          setArticles(data);
        }
        if (activeTab === 'portfolio') {
          const res = await fetch('/api/doctors/me');
          if (res.ok) {
            const data = await res.json();
            setPortfolio({
              bio: data.bio || '',
              specialties: data.specialties ? (typeof data.specialties === 'string' ? JSON.parse(data.specialties).join(', ') : data.specialties) : '',
              title: data.title || '',
              photo: data.photo || '',
              sessionPrice: data.sessionPrice || 0,
              sessionLink: data.sessionLink || '',
            });
          }
        }
        if (activeTab === 'slots') {
          const res = await fetch('/api/doctors/slots');
          if (res.ok) setSlots(await res.json());
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, [activeTab, showAddCourse, showAddArticle, user]);

  if (!user || !['DOCTOR', 'SPECIALIST', 'SUPERVISOR'].includes(user.role)) {
    return <div className="p-24 text-center">غير مصرح لك بدخول هذه الصفحة</div>;
  }

  const handleFileUpload = async (file: File, onProgress?: (percent: number) => void) => {
    return new Promise<string | null>((resolve) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } catch {
            showToast('خطأ في معالجة الرد', 'error');
            resolve(null);
          }
        } else {
          showToast('حدث خطأ أثناء الرفع', 'error');
          resolve(null);
        }
      };

      xhr.onerror = () => {
        showToast('خطأ في الاتصال بالسيرفر', 'error');
        resolve(null);
      };

      xhr.send(formData);
    });
  };

  const submitCourse = async (courseForm: any) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        showToast('تم بنجاح! كورس جديد قيد النشر ✅');
        setShowAddCourse(false);
        setActiveTab('courses');
      } else {
        const d = await res.json();
        showToast(d.error || 'حدث خطأ', 'error');
      }
    } catch {
      showToast('حدث خطأ غير متوقع', 'error');
    }
  };

  const submitArticle = async (form: any) => {
    try {
      const payload = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : form.tags };
      const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('تم نشر المقال بنجاح ✅');
        setShowAddArticle(false);
      } else {
        const d = await res.json();
        showToast(d.error || 'حدث خطأ', 'error');
      }
    } catch {
      showToast('حدث خطأ', 'error');
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) return;
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setArticles(articles.filter(a => a.id !== id));
      showToast('تم حذف المقال بنجاح');
    }
  };

  const submitPortfolio = async () => {
    try {
      const payload = {
        ...portfolio,
        specialties: portfolio.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      };
      const res = await fetch('/api/doctors/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) showToast('تم تحديث البورتفوليو بنجاح ✅');
      else showToast('حدث خطأ أثناء التحديث', 'error');
    } catch {
      showToast('حدث خطأ', 'error');
    }
  };

  const submitSlot = async () => {
    try {
      if (!newSlot.date || !newSlot.time) return showToast('الرجاء إدخال التاريخ والوقت', 'error');
      const startAt = new Date(`${newSlot.date}T${newSlot.time}`);
      const endAt = new Date(startAt.getTime() + newSlot.durationMinutes * 60000);

      const res = await fetch('/api/doctors/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startAt, endAt })
      });
      if (res.ok) {
        setSlots([...slots, await res.json()]);
        setNewSlot({ date: '', time: '', durationMinutes: 45 });
        showToast('تمت إضافة الموعد بنجاح ✅');
      } else {
        const d = await res.json();
        showToast(d.error || 'حدث خطأ', 'error');
      }
    } catch {
      showToast('حدث خطأ', 'error');
    }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;
    const res = await fetch(`/api/doctors/slots/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSlots(slots.filter(s => s.id !== id));
      showToast('تم الحذف بنجاح');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardStats
        stats={[
          { title: 'دوراتي النشطة', value: stats?.coursesCount || '0', icon: BookOpen, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700', trend: 'نمو مستقر' },
          { title: 'مقالاتي العلمية', value: stats?.articlesCount || '0', icon: FileText, gradient: 'bg-gradient-to-br from-[#1F2F4A] to-[#2a4068]', trend: '+2 هذا الشهر' },
          { title: 'إجمالي الحجوزات', value: stats?.bookingsCount || '0', icon: Calendar, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
          { title: 'صافي الأرباح', value: `${(stats?.totalEarnings || 0).toLocaleString()} ج.م`, icon: DollarSign, gradient: 'bg-gradient-to-br from-purple-600 to-indigo-700', trend: 'أرباح تراكمية' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-[#1F2F4A]">تحليلات الأداء المالي</h2>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#6FA65A]" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">إحصائيات 2026</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.earningsChart || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6FA65A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6FA65A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={v => `${v} ج.م`} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  formatter={(v: number) => [`${v.toLocaleString()} ج.م`, 'الأرباح']}
                />
                <Area type="monotone" dataKey="total" stroke="#6FA65A" strokeWidth={4} fillOpacity={1} fill="url(#colorEarn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#6FA65A]/10 rounded-full -translate-y-20 translate-x-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h2 className="text-xl md:text-2xl font-black text-[#1F2F4A] tracking-tighter mb-6 md:mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6FA65A]/20 flex items-center justify-center"><Activity className="w-5 h-5 text-[#6FA65A]" /></div>
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <button
              onClick={() => { setActiveTab('courses'); setShowAddCourse(true); }}
              className="w-full flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-[#6FA65A] hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group active:scale-95"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#6FA65A] group-hover:rotate-12 transition-transform duration-500">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="block font-black text-xl text-[#1F2F4A] tracking-tight">إضافة دورة جديدة</span>
                  <p className="text-slate-400 font-bold text-xs mt-1">ابدأ بتعليم الآخرين اليوم</p>
                </div>
              </div>
              <ArrowLeft className="w-6 h-6 text-slate-200 group-hover:text-[#6FA65A] transition-colors" />
            </button>

            <button
              onClick={() => { setActiveTab('articles'); setShowAddArticle(true); }}
              className="w-full flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group active:scale-95"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform duration-500">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="block font-black text-xl text-[#1F2F4A] tracking-tight">نشر مقال علمي</span>
                  <p className="text-slate-400 font-bold text-xs mt-1">شارك خبراتك مع المجتمع</p>
                </div>
              </div>
              <ArrowLeft className="w-6 h-6 text-slate-200 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          <div className="mt-12 p-8 bg-[#1F2F4A] rounded-[2.5rem] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
            <p className="text-white font-black text-lg leading-relaxed relative z-10 italic">"العلم هو القوة الحقيقية التي تبني العقول."</p>
            <p className="text-[#6FA65A] font-black text-[10px] uppercase tracking-[0.4em] mt-4">فلسفة المنصة</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    if (showAddCourse) return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <CourseCreator
          onCancel={() => setShowAddCourse(false)}
          onSubmit={submitCourse}
          handleFileUpload={handleFileUpload}
        />
      </motion.div>
    );

    return (
      <div className="bg-white/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[4rem] border border-white shadow-2xl overflow-hidden animate-in fade-in duration-700">
        <div className="p-8 md:p-16 border-b border-slate-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A] tracking-tighter">إدارة دوراتي التدريبية</h2>
            <p className="text-slate-400 font-bold mt-2 text-sm">نظرة شاملة على محتواك التعليمي</p>
          </div>
          <button
            onClick={() => setShowAddCourse(true)}
            className="w-full md:w-auto bg-[#1F2F4A] text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-sm hover:bg-[#6FA65A] hover:shadow-2xl hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-4 active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
              <PlusCircle className="w-4 h-4" />
            </div>
            إضافة كورس جديد
          </button>
        </div>

        <div className="p-6 md:p-12">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="flex-1 relative group">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-[#6FA65A] transition-colors" />
              <input
                type="text"
                placeholder="ابحث في دوراتك..."
                className="w-full pr-12 md:pr-16 pl-6 md:pl-8 py-4 md:py-5 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] outline-none focus:ring-8 focus:ring-[#6FA65A]/5 transition-all font-black text-sm"
              />
            </div>
            <button className="px-8 md:px-10 py-4 md:py-5 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] text-[#1F2F4A] hover:bg-slate-50 transition-all flex items-center gap-4 font-black text-sm shadow-sm justify-center">
              <Filter className="w-5 h-5 text-[#6FA65A]" /> تصفية النتائج
            </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 md:py-32 text-slate-300">
                <div className="w-20 md:w-24 h-20 md:h-24 rounded-2xl md:rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                  <BookOpen className="w-8 md:w-10 h-8 md:h-10 opacity-20" />
                </div>
                <p className="font-black text-lg md:text-xl tracking-tighter">لا يوجد دورات حالياً</p>
                <p className="text-xs md:text-sm font-bold mt-2">اضغط على زر الإضافة للبدء في نشر محتواك</p>
              </div>
            ) : (
              <table className="w-full text-right border-separate border-spacing-y-4 md:border-spacing-y-6 min-w-[700px]">
                <thead>
                  <tr className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
                    <th className="px-10 py-4">اسم الدورة</th>
                    <th className="px-10 py-4 text-center">التسعير</th>
                    <th className="px-10 py-4 text-center">المدة</th>
                    <th className="px-10 py-4 text-center">الوضعية</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} className="group transition-all">
                      <td className="px-10 py-8 bg-white border-y border-r border-slate-50 rounded-r-[2.5rem] shadow-sm group-hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-inner border border-slate-100 bg-slate-50">
                            <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div>
                            <span className="font-black text-[#1F2F4A] text-xl block mb-2 tracking-tight">{c.title}</span>
                            <span className="text-[10px] font-black text-white bg-[#1F2F4A] px-4 py-1.5 rounded-full uppercase tracking-widest">{c.category || 'عام'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center bg-white border-y border-slate-50 shadow-sm group-hover:shadow-xl transition-all">
                        <span className="font-black text-[#6FA65A] text-xl">
                          {c.isFree ? 'مجاني' : `${Number(c.price).toLocaleString()} ج.م`}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center bg-white border-y border-slate-50 shadow-sm group-hover:shadow-xl transition-all">
                        <div className="flex flex-col items-center">
                          <span className="text-slate-800 font-black text-lg">{c.duration}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">إجمالي الوقت</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center bg-white border-y border-l border-slate-50 rounded-l-[2.5rem] shadow-sm group-hover:shadow-xl transition-all">
                        <span className="px-6 py-3 rounded-2xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 inline-flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> قيد العرض
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderArticles = () => {
    if (showAddArticle) return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <ArticleEditor
          onCancel={() => setShowAddArticle(false)}
          onSubmit={submitArticle}
          handleFileUpload={handleFileUpload}
        />
      </motion.div>
    );

    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-2xl font-bold text-[#1F2F4A]">إدارة المقالات</h2>
          <button onClick={() => setShowAddArticle(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 active:scale-95">
            <FileText className="w-5 h-5" /> كتابة مقال جديد
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {articles.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold">لم تنشر أي مقالات بعد.</div>
          ) : (
            articles.map(a => (
              <div key={a.id} className="p-8 hover:bg-slate-50/50 transition-colors group flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0 overflow-hidden">
                    <img src={a.coverImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2F4A] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{a.title}</h3>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-slate-400 font-medium">{a.category}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-medium">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('ar-EG') : '-'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteArticle(a.id)} className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderEarnings = () => (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="p-8 md:p-10 bg-[#1F2F4A] rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-[#6FA65A] mb-4 md:mb-6" />
          <p className="text-slate-400 text-base md:text-lg mb-2">إجمالي الأرباح المستلمة</p>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tighter">{(stats?.totalEarnings || 0).toLocaleString()} <span className="text-lg md:text-xl font-medium text-[#6FA65A]">ج.م</span></h3>
        </div>
        <div className="p-8 md:p-10 bg-white border border-slate-100 shadow-xl rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-end">
          <Activity className="w-10 h-10 md:w-12 md:h-12 text-[#6FA65A] mb-4 md:mb-6 animate-pulse" />
          <p className="text-slate-400 font-medium mb-2">معدل التحويل (CR)</p>
          <h3 className="text-2xl md:text-4xl font-bold text-[#1F2F4A]">12.4% <span className="text-xs md:text-sm font-bold text-emerald-500 mr-2">↑ 3.1%</span></h3>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2F4A]">التدفقات المالية الشهرية</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-xs font-bold text-[#1F2F4A] bg-white shadow-sm transition-all">شهري</button>
            <button className="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-xs font-bold text-slate-500">سنوي</button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.earningsChart || []}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6FA65A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6FA65A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                itemStyle={{ color: '#1F2F4A', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="total" stroke="#6FA65A" strokeWidth={5} fill="url(#earnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-10 pt-6 md:pt-10">
        <DashboardHeader
          roleLabel={user.role === 'DOCTOR' ? "لوحة الطبيب" : user.role === 'SPECIALIST' ? "لوحة المعالج المختص" : "لوحة المشرف"}
          title={user.role === 'SUPERVISOR' ? `مرحباً بك، أ. ${user.name}` : 
                 user.role === 'SPECIALIST' ? `مرحباً بك، أ. ${user.name}` :
                 `مرحباً بك، د. ${user.name}`}
          subtitle={user.role === 'SUPERVISOR' ? "إدارة المقالات والمحتوى العلمي بكل سهولة" : 
                    user.role === 'SPECIALIST' ? "إدارة دوراتك، مقالاتك، ومتابعة أداءك المالي بكل سهولة" :
                    "إدارة دوراتك، مقالاتك، ومتابعة أداءك المالي بكل سهولة"}
          onSettingsClick={() => setActiveTab('portfolio')}
          extra={
            <div className="flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-[1.25rem] border border-amber-400/30 text-xs md:text-base">
              <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span className="font-bold">
                {stats?.rating ? Number(stats.rating).toFixed(1) : '0.0'} / 5 تقييم {user.role === 'SUPERVISOR' ? 'المشرف' : 'الطبيب'}
                {stats?.reviewsCount > 0 && <span className="text-[10px] mr-1 opacity-60">({stats.reviewsCount})</span>}
              </span>
            </div>
          }
        />

        <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
          <div className="lg:w-80">
            <DashboardSidebar
              items={filteredMenuItems}
              activeTab={activeTab}
              onTabChange={(id) => { setActiveTab(id); setShowAddCourse(false); setShowAddArticle(false); }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + showAddCourse + showAddArticle}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'portfolio' && (
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl overflow-hidden mb-8">
                    <h2 className="text-2xl font-bold text-[#1F2F4A] mb-8">إعداد البورتفوليو</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-500">المسمى الوظيفي (مثال: استشاري نفسي)</label>
                        <input type="text" value={portfolio.title} onChange={e => setPortfolio({ ...portfolio, title: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-[#6FA65A] transition-all" />

                        <label className="text-sm font-bold text-slate-500 mt-4 block">التخصصات (مفصولة بفاصلة)</label>
                        <input type="text" value={portfolio.specialties} onChange={e => setPortfolio({ ...portfolio, specialties: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-[#6FA65A] transition-all" />

                        <div className="flex gap-4 mt-4">
                          <div className="flex-1">
                            <label className="text-sm font-bold text-slate-500 block mb-2">سعر الجلسة (ج.م)</label>
                            <input type="number" value={portfolio.sessionPrice} onChange={e => setPortfolio({ ...portfolio, sessionPrice: Number(e.target.value) })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-[#6FA65A] transition-all" />
                          </div>
                        </div>

                        <label className="text-sm font-bold text-slate-500 mt-4 block">رابط اجتماع Zoom الدائم المنفصل بك</label>
                        <input type="text" value={portfolio.sessionLink} onChange={e => setPortfolio({ ...portfolio, sessionLink: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-[#6FA65A] transition-all" placeholder="https://zoom.us/j/123456789..." />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-500">النبذة الشخصية (السيرة الذاتية)</label>
                        <textarea value={portfolio.bio} onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })} rows={6} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-[#6FA65A] transition-all" />

                        <label className="text-sm font-bold text-slate-500 mt-4 block">رابط الصورة الشخصية</label>
                        <input type="text" value={portfolio.photo} onChange={e => setPortfolio({ ...portfolio, photo: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-[#6FA65A] transition-all" placeholder="يمكنك رفع صورة ونسخ رابطها هنا" />
                        <div className="text-xs text-slate-400 mt-1">أو اتركها فارغة لاستخدام صورة حسابك الشخصي.</div>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button onClick={submitPortfolio} className="bg-[#6FA65A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#5d8d4c] transition-all shadow-lg active:scale-95">
                        حفظ البورتفوليو
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === 'slots' && (
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl overflow-hidden mb-8">
                    <h2 className="text-2xl font-bold text-[#1F2F4A] mb-8">إدارة مواعيد الجلسات</h2>

                    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                        <label className="text-sm font-bold text-slate-500 block mb-2">تاريخ الموعد المتاح</label>
                        <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-[#6FA65A] transition-all" />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="text-sm font-bold text-slate-500 block mb-2">الوقت (ص/م)</label>
                        <input type="time" value={newSlot.time} onChange={e => setNewSlot({ ...newSlot, time: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-[#6FA65A] transition-all" />
                      </div>
                      <button onClick={submitSlot} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg h-[44px] shrink-0">
                        إضافة موعد
                      </button>
                    </div>

                    <div className="space-y-4">
                      {slots.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold">لا توجد مواعيد متاحة مسجلة. قم بإضافة مواعيد جديدة للحجز.</div>
                      ) : (
                        slots.map(slot => {
                          const start = new Date(slot.startAt);
                          const isBooked = slot.isBooked;
                          return (
                            <div key={slot.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${isBooked ? 'border-amber-100 bg-amber-50' : 'border-emerald-100 bg-emerald-50'} transition-all`}>
                              <div className="flex items-center gap-4">
                                <Calendar className={`w-8 h-8 ${isBooked ? 'text-amber-500' : 'text-emerald-500'}`} />
                                <div>
                                  <div className="font-bold text-[#1F2F4A]">{start.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                  <div className={`text-sm font-bold ${isBooked ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {start.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} • {isBooked ? 'محجوز' : 'متاح للحجز'}
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => deleteSlot(slot.id)} disabled={isBooked} className={`w-10 h-10 flex items-center justify-center rounded-xl bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all ${isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'courses' && renderCourses()}
                {activeTab === 'articles' && renderArticles()}
                {activeTab === 'earnings' && renderEarnings()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
