import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, FileText, Activity,
  Settings, DollarSign, Shield, CheckCircle,
  XCircle, Plus, Trash2, Edit3, Wrench,
  Clock, TrendingUp, Eye, BarChart3,
  Upload, Image as ImageIcon, Search, Filter,
  History, ListPlus, Tag, Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Modular Components
import { DashboardSidebar } from '../components/DashboardSidebar';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardHeader } from '../components/DashboardHeader';
import { CourseCreator } from '../components/CourseCreator';
import { ArticleEditor } from '../components/ArticleEditor';

const ADMIN_SIDEBAR_ITEMS = [
  { id: 'overview', label: 'نظرة عامة', icon: Activity },
  { id: 'users', label: 'إدارة المستخدمين', icon: Users },
  { id: 'bookings', label: 'حجوزات الجلسات', icon: Calendar },
  { id: 'courses', label: 'إدارة الدورات', icon: BookOpen },
  { id: 'articles', label: 'إدارة المقالات', icon: FileText },
  { id: 'categories', label: 'الأقسام العلمية', icon: ListPlus },
  { id: 'tags', label: 'التسميات (Tags)', icon: Tag },
  { id: 'tools', label: 'الأدوات التفاعلية', icon: Wrench },
  { id: 'financials', label: 'التقارير المالية', icon: DollarSign },
  { id: 'audit', label: 'سجل النشاطات', icon: Shield },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  const [newCatName, setNewCatName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  // Forms
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);

  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editingTool, setEditingTool] = useState<any>(null);

  const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', coverImage: '', contentRichText: '', category: 'مقالات عامة', tags: '' });
  const [toolForm, setToolForm] = useState({ title: '', description: '', type: 'PDF', categories: '', priceView: '', priceDownload: '', fileUrl: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'overview') {
          const res = await fetch('/api/admin/stats');
          const data = await res.json();
          setStats(data.error ? null : data);
        }
        if (activeTab === 'courses' && !showAddCourse) {
          const res = await fetch('/api/courses');
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
          if (data.error) showToast(data.error, 'error');
        }
        if (activeTab === 'articles' && !showAddArticle) {
          const res = await fetch('/api/articles');
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : []);
          if (data.error) showToast(data.error, 'error');
        }
        if (activeTab === 'tools' && !showAddTool) {
          const res = await fetch('/api/admin/tools');
          const data = await res.json();
          setTools(Array.isArray(data) ? data : []);
          if (data.error) showToast(data.error, 'error');
        }
        if (activeTab === 'financials') {
          const res = await fetch('/api/admin/purchases');
          const data = await res.json();
          setPurchases(Array.isArray(data) ? data : []);
          if (data.error) showToast(data.error, 'error');
        }
        if (activeTab === 'bookings') {
          const res = await fetch('/api/admin/bookings');
          const data = await res.json();
          setBookings(Array.isArray(data) ? data : []);
        }
        if (activeTab === 'users') {
          const res = await fetch('/api/admin/users');
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
          if (data.error) showToast(data.error, 'error');
        }
        if (activeTab === 'audit') {
          const res = await fetch('/api/admin/audit-log');
          const data = await res.json();
          setAuditLogs(Array.isArray(data) ? data : []);
          if (data.error) showToast(data.error, 'error');
        }
        if (activeTab === 'categories') {
          const res = await fetch('/api/article-categories');
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
        if (activeTab === 'tags') {
          const res = await fetch('/api/article-tags');
          const data = await res.json();
          setTags(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        showToast('يرجى التحقق من اتصال قاعدة البيانات', 'error');
      }
    };
    fetchData();
  }, [activeTab, showAddCourse, showAddArticle, showAddTool, editingCourse, editingArticle, editingTool]);

  // Initialize tool form when editing starts
  useEffect(() => {
    if (editingTool) {
      setToolForm({
        title: editingTool.title || '',
        description: editingTool.description || '',
        type: editingTool.type || 'PDF',
        categories: Array.isArray(editingTool.categories) ? editingTool.categories.join(', ') : (editingTool.categories || ''),
        priceView: editingTool.priceView?.toString() || '0',
        priceDownload: editingTool.priceDownload?.toString() || '0',
        fileUrl: editingTool.fileKey || ''
      });
    } else {
      setToolForm({ title: '', description: '', type: 'PDF', categories: '', priceView: '0', priceDownload: '0', fileUrl: '' });
    }
  }, [editingTool]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-[2rem] shadow-xl border border-slate-100">
          <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2F4A]">غير مصرح لك بالوصول</h2>
          <p className="text-slate-500 mt-2">هذه المساحة مخصصة للإدارة العليا فقط.</p>
        </div>
      </div>
    );
  }

  // ─── Handlers ─────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    } catch { showToast('حدث خطأ أثناء الرفع', 'error'); return null; }
  };

  const submitCourse = async (courseData: any) => {
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(courseData) });
      if (res.ok) {
        showToast(editingCourse ? 'تم تحديث الكورس بنجاح ✅' : 'تم إضافة الكورس بنجاح ✅');
        setShowAddCourse(false);
        setEditingCourse(null);
      }
      else showToast('حدث خطأ أثناء العملية', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) { setCourses(courses.filter(c => c.id !== id)); showToast('تم حذف الكورس بنجاح'); }
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const submitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...articleForm, tags: articleForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { showToast('تم إضافة المقال بنجاح ✅'); setShowAddArticle(false); }
      else showToast('حدث خطأ', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('حذف هذا المقال؟')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) { setArticles(articles.filter(a => a.id !== id)); showToast('تم حذف المقال'); }
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const submitTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...toolForm, categories: toolForm.categories.split(',').map(t => t.trim()).filter(Boolean) };
      const res = await fetch('/api/tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { showToast('تم إضافة الأداة بنجاح ✅'); setShowAddTool(false); }
      else showToast('حدث خطأ', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const deleteTool = async (id: string) => {
    if (!confirm('حذف هذه الأداة؟')) return;
    try {
      const res = await fetch(`/api/tools/${id}`, { method: 'DELETE' });
      if (res.ok) { setTools(tools.filter(t => t.id !== id)); showToast('تم حذف الأداة'); }
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const handleApprovePurchase = async (id: string) => {
    const res = await fetch(`/api/admin/purchases/${id}/approve`, { method: 'POST' });
    if (res.ok) { setPurchases(purchases.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p)); showToast('تم تأكيد الدفع ✅'); }
  };

  const handleRejectPurchase = async (id: string) => {
    const res = await fetch(`/api/admin/purchases/${id}/reject`, { method: 'POST' });
    if (res.ok) { setPurchases(purchases.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p)); showToast('تم رفض الدفع'); }
  };

  const handleApproveBooking = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setBookings(bookings.map(b => b.id === id ? data : b));
      showToast('تم تأكيد الحجز للمتدرب ✅');
    } else {
      showToast('حدث خطأ', 'error');
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED', paymentStatus: 'REJECTED' } : b));
        showToast('تم رفض الحجز');
      } else {
        const data = await res.json();
        showToast(data.error || 'حدث خطأ في عملية الرفض', 'error');
        console.error("Reject Booking Error Data:", data);
      }
    } catch (error) {
      console.error("Reject Booking Fetch Error:", error);
      showToast('مشكلة في الاتصال بالخادم', 'error');
    }
  };

  const handleTogglePermission = async (doctorId: string, permission: string, value: boolean) => {
    const doctor = users.find(u => u.doctorProfile?.id === doctorId)?.doctorProfile;
    if (!doctor) return;
    const res = await fetch(`/api/admin/doctors/${doctorId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...doctor, [permission]: value })
    });
    if (res.ok) {
      setUsers(users.map(u => u.doctorProfile?.id === doctorId ? { ...u, doctorProfile: { ...u.doctorProfile, [permission]: value } } : u));
      showToast('تم تحديث الصلاحيات');
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
        showToast('تم تغيير الدور بنجاح', 'success');
      } else {
        const errorData = await res.json();
        showToast(errorData.error, 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  const handleChangeStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
        showToast(status === 'ACTIVE' ? 'تم التفعيل' : 'تم التعليق');
      } else {
        const errorData = await res.json();
        showToast(errorData.error, 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  const handleClearData = async () => {
    if (!confirm('تمسح كل الداتا بجد؟ الموضوع خطير!')) return;
    const res = await fetch('/api/admin/clear-data', { method: 'POST' });
    if (res.ok) { showToast('تم مسح البيانات بنجاح'); setCourses([]); setArticles([]); setTools([]); }
  };

  // ─── Render Functions ─────────────────────────────────

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await fetch('/api/article-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName })
      });
      if (res.ok) {
        showToast('تمت إضافة القسم بنجاح');
        setNewCatName('');
        const newCats = await fetch('/api/article-categories').then(res => res.json());
        setCategories(newCats);
      } else showToast('خطأ في الإضافة', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('متأكد من حذف هذا القسم؟')) return;
    try {
      const res = await fetch(`/api/article-categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم الحذف بنجاح');
        setCategories(categories.filter(c => c.id !== id));
      } else showToast('خطأ في الحذف', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName) return;
    try {
      const res = await fetch('/api/article-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName })
      });
      if (res.ok) {
        showToast('تمت إضافة التسمية بنجاح');
        setNewTagName('');
        const newTags = await fetch('/api/article-tags').then(res => res.json());
        setTags(newTags);
      } else showToast('خطأ في الإضافة', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('متأكد من حذف هذه التسمية؟')) return;
    try {
      const res = await fetch(`/api/article-tags/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم الحذف بنجاح');
        setTags(tags.filter(t => t.id !== id));
      } else showToast('خطأ في الحذف', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const renderCategories = () => (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-5">
      <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-2xl">
        <h2 className="text-2xl font-black text-[#1F2F4A] mb-8 flex items-center gap-3">
          <ListPlus className="text-[#6FA65A]" /> إدارة الأقسام العلمية
        </h2>
        <form onSubmit={handleAddCategory} className="flex gap-4 mb-10">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="اسم القسم (مثال: العلاج المعرفي)"
            className="flex-1 bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#6FA65A] font-bold"
          />
          <button type="submit" className="bg-[#1F2F4A] text-white px-8 py-4 rounded-2xl font-black shadow-lg">إضافة قسم</button>
        </form>

        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between bg-white/60 px-8 py-6 rounded-2xl border border-white">
              <span className="font-bold text-[#1F2F4A]">{cat.name}</span>
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTags = () => (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-5">
      <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-2xl">
        <h2 className="text-2xl font-black text-[#1F2F4A] mb-8 flex items-center gap-3">
          <Tag className="text-[#6FA65A]" /> إدارة التسميات (Tags)
        </h2>
        <form onSubmit={handleAddTag} className="flex gap-4 mb-10">
          <input
            type="text"
            required
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="اسم التسمية (مثال: اكتئاب)"
            className="flex-1 bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#6FA65A] font-bold"
          />
          <button type="submit" className="bg-[#1F2F4A] text-white px-8 py-4 rounded-2xl font-black shadow-lg">إضافة تسمية</button>
        </form>

        <div className="flex flex-wrap gap-4">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-3 bg-white/60 px-6 py-3 rounded-xl border border-white">
              <span className="font-bold text-[#1F2F4A] text-sm">#{tag.name}</span>
              <button onClick={() => handleDeleteTag(tag.id)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"><XCircle className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-5">
      <DashboardStats
        stats={[
          { title: 'إجمالي المستخدمين', value: stats?.totalUsers?.toLocaleString() || '0', icon: Users, gradient: 'bg-gradient-to-br from-blue-600 to-indigo-800', trend: 'نمو مستمر' },
          { title: 'الدورات المنشورة', value: stats?.totalCourses || '0', icon: BookOpen, gradient: 'bg-gradient-to-br from-emerald-600 to-teal-800', trend: 'محتوى تعليمي' },
          { title: 'المقالات العلمية', value: stats?.totalArticles || '0', icon: FileText, gradient: 'bg-gradient-to-br from-purple-600 to-pink-800' },
          { title: 'إجمالي الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString()} ج.م`, icon: DollarSign, gradient: 'bg-gradient-to-br from-amber-500 to-orange-700', trend: 'أرباح المنصة' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'عمليات معلقة', value: stats?.pendingPurchases || 0, icon: Clock, color: '#f43f5e' },
          { label: 'الأدوات التفاعلية', value: stats?.totalTools || 0, icon: Wrench, color: '#06b6d4' },
          { label: 'متوسط الإيراد', value: stats?.totalRevenue && stats?.totalCourses ? Math.round(stats.totalRevenue / stats.totalCourses).toLocaleString() : 0, icon: TrendingUp, color: '#f59e0b', suffix: ' ج.م' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white/40 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-2xl flex items-center justify-between group overflow-hidden relative active:scale-95 transition-all cursor-default">
            <div className="absolute right-0 top-0 w-2 h-full" style={{ backgroundColor: item.color, boxShadow: `0 0 20px ${item.color}40` }} />
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.3em] leading-none">{item.label}</p>
              <h3 className="text-4xl font-black text-[#1F2F4A] tracking-tighter">{item.value}{item.suffix}</h3>
            </div>
            <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:bg-[#1F2F4A] transition-colors duration-500">
              <item.icon className="w-8 h-8 text-slate-300 group-hover:text-white transition-all duration-500 group-hover:rotate-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -translate-y-20 translate-x-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h2 className="text-xl font-bold text-[#1F2F4A] mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600"><BarChart3 className="w-5 h-5" /></div>
            تحليل الإيرادات الشهرية
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueChart || []}>
                <defs><linearGradient id="cT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6FA65A" stopOpacity={0.3} /><stop offset="95%" stopColor="#6FA65A" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={v => `${v} ج.م`} tick={{ fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#f1f5f9" />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }} />
                <Area type="monotone" dataKey="total" stroke="#6FA65A" strokeWidth={5} fill="url(#cT)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -translate-y-20 translate-x-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h2 className="text-xl font-bold text-[#1F2F4A] mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600"><Users className="w-5 h-5" /></div>
            نمو قاعدة المستخدمين
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.usersChart || []} margin={{ bottom: 20 }}>
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#1F2F4A" radius={[12, 12, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[4rem] border border-white shadow-2xl overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 md:p-16 border-b border-slate-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1F2F4A] tracking-tighter">إدارة أعضاء المنصة</h2>
          <p className="text-slate-400 font-bold mt-2 text-sm">لديك {users.length} مستخدم مسجل في النظام</p>
        </div>
        <div className="w-full md:w-96 relative group">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#6FA65A] transition-colors" />
          <input
            type="text"
            placeholder="البحث عن طريق الاسم أو البريد..."
            className="w-full pr-12 md:pr-16 pl-6 md:pl-8 py-4 md:py-5 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] outline-none focus:ring-8 focus:ring-[#6FA65A]/5 transition-all font-black text-sm shadow-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto p-4 md:p-12 min-h-[600px]">
        <table className="w-full text-right border-separate border-spacing-y-4 md:border-spacing-y-6 min-w-[800px]">
          <thead>
            <tr className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
              <th className="px-10 py-4">العضو</th>
              <th className="px-10 py-4">الدور الوظيفي</th>
              <th className="px-10 py-4">الصلاحيات</th>
              <th className="px-10 py-4 text-center">الوضعية</th>
              <th className="px-10 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.map(u => (
              <tr key={u.id} className="group transition-all">
                <td className="px-10 py-8 bg-white border-y border-r border-slate-50 rounded-r-[2.5rem] shadow-sm group-hover:shadow-xl transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[#1F2F4A] text-xl">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-[#1F2F4A] text-lg leading-none mb-1">{u.name}</div>
                      <div className="text-xs text-slate-400 font-bold tracking-tight">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 bg-white border-y border-slate-50 shadow-sm group-hover:shadow-xl transition-all">
                  <select
                    value={u.role}
                    onChange={e => handleChangeRole(u.id, e.target.value)}
                    disabled={u.role === 'ADMIN'}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black border border-slate-100 outline-none focus:ring-4 focus:ring-[#1F2F4A]/5 transition-all text-center min-w-[140px] ${u.role === 'ADMIN' ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 cursor-pointer appearance-none'}`}
                  >
                    <option value="USER">متدرب</option>
                    <option value="DOCTOR">طبيب / مشرف</option>
                    <option value="ADMIN">مدير النظام</option>
                  </select>
                </td>
                <td className="px-10 py-8 bg-white border-y border-slate-50 shadow-sm group-hover:shadow-xl transition-all">
                  {u.role === 'DOCTOR' && u.doctorProfile && (
                    <div className="flex gap-2 flex-wrap">
                      {[['canWriteCourses', 'دورات'], ['canWriteArticles', 'مقالات'], ['canManageSlots', 'مواعيد']].map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => handleTogglePermission(u.doctorProfile.id, key, !u.doctorProfile[key])}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${u.doctorProfile[key] ? 'bg-[#6FA65A] text-white border-[#6FA65A] shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-300 border-slate-100 opacity-60'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {u.role !== 'DOCTOR' && <div className="w-10 h-1 bg-slate-50 rounded-full" />}
                </td>
                <td className="px-10 py-8 text-center bg-white border-y border-slate-50 shadow-sm group-hover:shadow-xl transition-all">
                  <button
                    onClick={() => handleChangeStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    disabled={u.role === 'ADMIN'}
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all ${u.role === 'ADMIN' ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70' : u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {u.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                  </button>
                </td>
                <td className="px-10 py-8 text-center bg-white border-y border-l border-slate-50 rounded-l-[2.5rem] shadow-sm group-hover:shadow-xl transition-all">
                  <button className="p-4 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourses = () => {
    if (showAddCourse || editingCourse) return (
      <CourseCreator
        onCancel={() => { setShowAddCourse(false); setEditingCourse(null); }}
        onSubmit={submitCourse}
        handleFileUpload={handleFileUpload}
        initialData={editingCourse}
      />
    );
    return (
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1F2F4A] relative overflow-hidden gap-6">
          <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,#1F2F4A_25%,transparent_25%),linear-gradient(-45deg,#1F2F4A_25%,transparent_25%)] bg-[length:20px_20px] opacity-10" />
          <div className="relative z-10 text-white">
            <h2 className="text-xl md:text-2xl font-bold">مستودع الدورات التدريبية</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">إدارة المحتوى العلمي والأكاديمي للمنصة</p>
          </div>
          <button onClick={() => setShowAddCourse(true)} className="w-full md:w-auto bg-[#6FA65A] hover:bg-emerald-600 text-white px-8 py-3 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95"><Plus className="w-5 h-5" /> إضافة دورة</button>
        </div>
        <div className="overflow-x-auto min-h-[400px] p-4 md:p-6">
          <table className="w-full text-right border-separate border-spacing-y-4 min-w-[700px]">
            <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest"><tr><th className="px-8 py-4">اسم الدورة والبيانات</th><th className="px-8 py-4 text-center">تكلفة الانضمام</th><th className="px-8 py-4 text-center">الطبيب المحاضر</th><th className="px-8 py-4 text-center">أدوات التحكم</th></tr></thead>
            <tbody>{Array.isArray(courses) && courses.map(c => (
              <tr key={c.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl group hover:shadow-lg transition-all">
                <td className="px-8 py-6 first:rounded-r-[2rem]"><div className="flex items-center gap-6"><div className="w-16 h-16 rounded-[1.25rem] overflow-hidden border border-slate-100"><img src={c.thumbnail} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" alt="" /></div><span className="font-extrabold text-[#1F2F4A] text-lg active:text-[#6FA65A]">{c.title}</span></div></td>
                <td className="px-8 py-6 text-center font-black text-xl text-[#6FA65A]">{c.isFree ? 'مجانية' : `${c.price} ج.م`}</td>
                <td className="px-8 py-6 text-center text-slate-500 text-sm font-bold bg-slate-50/50">{c.instructor?.user?.name || '---'}</td>
                <td className="px-8 py-6 text-center last:rounded-l-[2rem]">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => setEditingCourse(c)} className="w-10 h-10 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4 mx-auto" /></button>
                    <button onClick={() => deleteCourse(c.id)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4 mx-auto" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFinancials = () => (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#1F2F4A] to-[#2a4068] text-white gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3"><DollarSign className="w-6 h-6 md:w-8 md:h-8 text-[#6FA65A]" /> سجل المشتريات والمدفوعات</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium italic">مراجعة وتحصيل العمليات المالية من المتدربين</p>
        </div>
      </div>
      <div className="overflow-x-auto min-h-[500px] p-4 md:p-6">
        <table className="w-full text-right border-separate border-spacing-y-4 min-w-[900px]">
          <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest"><tr><th className="px-8 py-4">بيانات المشتري</th><th className="px-8 py-4">المحتوى المطلوب</th><th className="px-8 py-4 text-center">قيمة العملية</th><th className="px-8 py-4 text-center">الحالة النهائية</th><th className="px-8 py-4 text-center">إجراءات المراجعة</th></tr></thead>
          <tbody>
            {Array.isArray(purchases) && purchases.map(p => (
              <tr key={p.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6 first:rounded-r-[2rem] border-y border-r border-slate-50"><div className="font-black text-[#1F2F4A] hover:text-[#6FA65A] transition-colors">{p.user?.name}</div><div className="text-[10px] text-slate-400 mt-1 font-mono tracking-tighter">{p.user?.phone || p.user?.email}</div></td>
                <td className="px-8 py-6 text-slate-500 text-sm font-black border-y border-slate-50 italic">{p.courseTitle || '---'}</td>
                <td className="px-8 py-6 text-center font-black text-[#6FA65A] border-y border-slate-50 text-xl">{p.amount} <span className="text-[10px]">ج.م</span></td>
                <td className="px-8 py-6 text-center border-y border-slate-50">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200' : p.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm' : 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200 animate-pulse'}`}>
                    {p.status === 'APPROVED' ? 'تم التحصيل' : p.status === 'REJECTED' ? 'عملية مرفوضة' : 'في انتظار المراجعة'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center last:rounded-l-[2rem] border-y border-l border-slate-50">
                  {p.status === 'PENDING' && (
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => handleApprovePurchase(p.id)} className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-[1rem] hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-90"><CheckCircle className="w-6 h-6 mx-auto" /></button>
                      <button onClick={() => handleRejectPurchase(p.id)} className="w-12 h-12 bg-rose-100 text-rose-600 rounded-[1rem] hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-90"><XCircle className="w-6 h-6 mx-auto" /></button>
                    </div>
                  )}
                  {p.status !== 'PENDING' && <span className="text-slate-200"><CheckCircle className="w-6 h-6 mx-auto opacity-10" /></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {purchases.length === 0 && <div className="py-20 text-center font-bold text-slate-300 tracking-widest">--- لا توجد معاملات مالية حالياً ---</div>}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#1F2F4A] to-[#2a4068] text-white gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3"><Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#6FA65A]" /> حجوزات الجلسات</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium italic">مراجعة وتحصيل جلسات الاستشاريين</p>
        </div>
      </div>
      <div className="overflow-x-auto min-h-[500px] p-4 md:p-6">
        <table className="w-full text-right border-separate border-spacing-y-4 min-w-[900px]">
          <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">بيانات المتدرب</th>
              <th className="px-8 py-4">الأخصائي والموعد</th>
              <th className="px-8 py-4 text-center">القيمة وتأكيد الدفع</th>
              <th className="px-8 py-4 text-center">إجراءات المراجعة</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(bookings) && bookings.map(b => (
              <tr key={b.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6 first:rounded-r-[2rem] border-y border-r border-slate-50">
                  <div className="font-black text-[#1F2F4A] hover:text-[#6FA65A] transition-colors">{b.user?.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono tracking-tighter">{b.paymentMethod}</div>
                </td>
                <td className="px-8 py-6 text-slate-500 text-sm font-black border-y border-slate-50 italic">
                  مع {b.doctor?.user?.name || '---'}
                  <div className="text-xs text-[#6FA65A] mt-1">{b.slot ? new Date(b.slot.startAt).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' }) : 'وقت محذوف!'}</div>
                </td>
                <td className="px-8 py-6 text-center border-y border-slate-50">
                  <div className="font-black text-[#1F2F4A] text-xl">{b.amount} <span className="text-[10px]">ج.م</span></div>
                  <span className={`px-5 py-1 mt-2 inline-block rounded-full text-[10px] font-black uppercase tracking-widest ${b.paymentStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : b.paymentStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                    {b.paymentStatus === 'APPROVED' ? 'تم الدفع' : b.paymentStatus === 'REJECTED' ? 'مرفوض' : 'في الانتظار'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center last:rounded-l-[2rem] border-y border-l border-slate-50">
                  {b.status === 'PENDING' && (
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => handleApproveBooking(b.id)} className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-[1rem] hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-90"><CheckCircle className="w-6 h-6 mx-auto" /></button>
                      <button onClick={() => handleRejectBooking(b.id)} className="w-12 h-12 bg-rose-100 text-rose-600 rounded-[1rem] hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-90"><XCircle className="w-6 h-6 mx-auto" /></button>
                    </div>
                  )}
                  {b.status === 'CONFIRMED' && <span className="text-emerald-500 font-bold text-sm">تم التأكيد والموافقة</span>}
                  {b.status === 'CANCELLED' && <span className="text-rose-500 font-bold text-sm">مرفوض/ملغي</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <div className="py-20 text-center font-bold text-slate-300 tracking-widest">--- لا توجد حجوزات حالياً ---</div>}
      </div>
    </div>
  );

  const renderArticles = () => {
    if (showAddArticle || editingArticle) return (
      <ArticleEditor
        onCancel={() => { setShowAddArticle(false); setEditingArticle(null); }}
        handleFileUpload={handleFileUpload}
        initialData={editingArticle}
        onSubmit={async (articleData) => {
          try {
            const payload = {
              ...articleData,
              tags: typeof articleData.tags === 'string' ? articleData.tags.split(',').map(t => t.trim()).filter(Boolean) : articleData.tags
            };
            const url = editingArticle ? `/api/articles/${editingArticle.id}` : '/api/articles';
            const method = editingArticle ? 'PUT' : 'POST';
            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              showToast(editingArticle ? 'تم تحديث المقال بنجاح ✅' : 'تم بنشر المقال بنجاح ✅');
              setShowAddArticle(false);
              setEditingArticle(null);
            } else {
              showToast('حدث خطأ أثناء العملية', 'error');
            }
          } catch (err) {
            showToast('حدث خطأ', 'error');
          }
        }}
      />
    );

    return (
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1F2F4A] relative overflow-hidden gap-6">
          <div className="absolute top-0 right-0 w-full h-full bg-[length:20px_20px] opacity-10" />
          <div className="relative z-10 text-white">
            <h2 className="text-xl md:text-2xl font-bold">إدارة المقالات العلمية</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">إدارة المحتوى المكتوب والأخبار في المنصة</p>
          </div>
          <button onClick={() => setShowAddArticle(true)} className="w-full md:w-auto bg-[#6FA65A] hover:bg-emerald-600 text-white px-8 py-3 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95"><Plus className="w-5 h-5" /> مقال جديد</button>
        </div>
        <div className="overflow-x-auto min-h-[400px] p-4 md:p-6">
          <table className="w-full text-right border-separate border-spacing-y-4 min-w-[700px]">
            <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">المقال</th>
                <th className="px-8 py-4">التصنيف</th>
                <th className="px-8 py-4 text-center">الكاتب</th>
                <th className="px-8 py-4 text-center">أدوات التحكم</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(articles) && articles.map(a => (
                <tr key={a.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl group hover:shadow-lg transition-all">
                  <td className="px-8 py-6 first:rounded-r-[2rem]">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                        {a.coverImage ? (
                          <img src={a.coverImage} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" alt="" />
                        ) : (
                          <FileText className="w-8 h-8 text-slate-200" />
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-[#1F2F4A] block">{a.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(a.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{a.category}</span>
                  </td>
                  <td className="px-8 py-6 text-center text-slate-500 text-sm font-bold bg-slate-50/50">{a.author?.user?.name || '---'}</td>
                  <td className="px-8 py-6 text-center last:rounded-l-[2rem]">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setEditingArticle(a)} className="w-10 h-10 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4 mx-auto" /></button>
                      <button onClick={() => deleteArticle(a.id)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4 mx-auto" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && <div className="py-20 text-center font-bold text-slate-200">لا توجد مقالات منشورة</div>}
        </div>
      </div>
    );
  };

  const renderTools = () => {
    const isEditing = !!editingTool;

    if (showAddTool || isEditing) return (
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#1F2F4A]">{isEditing ? 'تعديل الأداة التفاعلية' : 'إضافة أداة تفاعلية جديدة'}</h2>
          <button type="button" onClick={() => { setShowAddTool(false); setEditingTool(null); }} className="text-slate-400 hover:text-rose-500 font-bold">إلغاء</button>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const payload = {
            ...toolForm,
            priceView: parseFloat(toolForm.priceView) || 0,
            priceDownload: parseFloat(toolForm.priceDownload) || 0,
            categories: toolForm.categories.split(',').map((t: string) => t.trim()).filter(Boolean)
          };
          try {
            const url = isEditing ? `/api/tools/${editingTool.id}` : '/api/tools';
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) {
              showToast(isEditing ? 'تم تحديث الأداة بنجاح ✅' : 'تم إضافة الأداة بنجاح ✅');
              setShowAddTool(false);
              setEditingTool(null);
            }
            else showToast('حدث خطأ', 'error');
          } catch { showToast('حدث خطأ', 'error'); }
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">اسم الأداة</label>
              <input
                type="text"
                value={toolForm.title}
                onChange={e => setToolForm({ ...toolForm, title: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl"
                placeholder="مثلاً: اختبار تحليل الشخصية"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">نوع الأداة</label>
              <select
                value={toolForm.type}
                onChange={e => setToolForm({ ...toolForm, type: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl"
              >
                <option value="PDF">ملف PDF</option>
                <option value="HTML">أداة برمجية HTML</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">السعر (ج.م)</label>
              <input
                type="number"
                value={toolForm.priceView}
                onChange={e => setToolForm({ ...toolForm, priceView: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">ملف الأداة (PDF/HTML)</label>
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,.html"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleFileUpload(file);
                      if (url) {
                        setToolForm(prev => ({ ...prev, fileUrl: url }));
                        showToast('تم رفع الملف بنجاح ✅');
                      }
                    }
                  }}
                  className="w-full p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-sm file:hidden cursor-pointer hover:bg-slate-100 transition-colors"
                />
                <input type="hidden" value={toolForm.fileUrl} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                  {toolForm.fileUrl && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  <Upload className="w-5 h-5 text-slate-300 group-hover:text-[#6FA65A] transition-colors" />
                </div>
              </div>
              {toolForm.fileUrl && <p className="text-[10px] text-emerald-600 font-bold mt-1 mr-2">✓ تم العثور على ملف مرفوع</p>}
            </div>
          </div>
          <button type="submit" className="w-full bg-[#6FA65A] text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-600 transition-all">{isEditing ? 'تحديث الأداة' : 'إضافة الأداة'}</button>
        </form>
      </div>
    );

    return (
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1F2F4A] relative overflow-hidden gap-6">
          <div className="absolute top-0 right-0 w-full h-full bg-[length:20px_20px] opacity-10" />
          <div className="relative z-10 text-white">
            <h2 className="text-xl md:text-2xl font-bold">مكتبة الأدوات التفاعلية</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">إدارة الأدوات والوسائل التعليمية المساعدة</p>
          </div>
          <button onClick={() => setShowAddTool(true)} className="w-full md:w-auto bg-[#6FA65A] hover:bg-emerald-600 text-white px-8 py-3 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95"><Plus className="w-5 h-5" /> أداة جديدة</button>
        </div>
        <div className="overflow-x-auto min-h-[400px] p-4 md:p-6">
          <table className="w-full text-right border-separate border-spacing-y-4 min-w-[700px]">
            <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">الأداة</th>
                <th className="px-8 py-4">النوع</th>
                <th className="px-8 py-4 text-center">السعر</th>
                <th className="px-8 py-4 text-center">أدوات التحكم</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(tools) && tools.map(t => (
                <tr key={t.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl group hover:shadow-lg transition-all">
                  <td className="px-8 py-6 first:rounded-r-[2rem]">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="font-extrabold text-[#1F2F4A]">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black">{t.type}</span>
                  </td>
                  <td className="px-8 py-6 text-center font-black text-[#6FA65A] text-lg">{t.priceView} ج.م</td>
                  <td className="px-8 py-6 text-center last:rounded-l-[2rem]">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setEditingTool(t)} className="w-10 h-10 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4 mx-auto" /></button>
                      <button onClick={() => deleteTool(t.id)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4 mx-auto" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tools.length === 0 && <div className="py-20 text-center font-bold text-slate-200">لا توجد أدوات حالياً</div>}
        </div>
      </div>
    );
  };

  const renderAudit = () => (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
        <h2 className="text-xl font-bold flex items-center gap-3"><History className="w-6 h-6 text-blue-500" /> سجل العمليات الأمنية والنشاطات</h2>
        <div className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-xl border border-white/5">حماية كاملة 🛡️</div>
      </div>
      <div className="p-4 overflow-x-auto min-h-[500px]">
        <table className="w-full text-right border-separate border-spacing-y-2 px-4">
          <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest"><tr><th className="px-8 py-4">الفاعل</th><th className="px-8 py-4">العملية المنفذة</th><th className="px-8 py-4">كيان النظام</th><th className="px-8 py-4 text-center">التوقيت الزمني</th></tr></thead>
          <tbody>
            {Array.isArray(auditLogs) && auditLogs.map(log => (
              <tr key={log.id} className="bg-white border border-slate-50 shadow-sm rounded-2xl hover:bg-slate-50/80 transition-all">
                <td className="px-8 py-5 first:rounded-r-[1.5rem] font-bold text-[#1F2F4A]">{log.actorName}</td>
                <td className="px-8 py-5 text-slate-600 text-sm font-medium">{log.action}</td>
                <td className="px-8 py-5"><span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">{log.entityType}</span></td>
                <td className="px-8 py-5 text-center last:rounded-l-[1.5rem] text-slate-400 text-xs font-mono">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {auditLogs.length === 0 && <div className="py-20 text-center font-bold text-slate-300">السجل فارغ تماماً</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-10">
        <DashboardHeader
          title="نظام الإدارة المتكامل "
          subtitle="تحكم شمولي في منصة Clinical Cases Group وإدارة شؤون المتدربين"
          extra={<div className="bg-[#6FA65A]/10 text-[#6FA65A] border border-[#6FA65A]/30 px-6 py-2.5 rounded-2xl font-bold shadow-xl flex items-center gap-3 backdrop-blur-md"><Activity className="w-5 h-5 animate-pulse" /> استقرار النظام: 100%</div>}
        />
        <div className="flex flex-col lg:flex-row gap-10">
          <DashboardSidebar
            items={ADMIN_SIDEBAR_ITEMS}
            activeTab={activeTab}
            onTabChange={(id) => { setActiveTab(id); setShowAddCourse(false); setShowAddArticle(false); setShowAddTool(false); }}
          />
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab + showAddCourse + showAddArticle + showAddTool} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.4 }}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'bookings' && renderBookings()}
                {activeTab === 'courses' && renderCourses()}
                {activeTab === 'articles' && renderArticles()}
                {activeTab === 'categories' && renderCategories()}
                {activeTab === 'tags' && renderTags()}
                {activeTab === 'tools' && renderTools()}
                {activeTab === 'financials' && renderFinancials()}
                {activeTab === 'audit' && renderAudit()}
                <div className="mt-20 flex justify-center opacity-5">
                  <button onClick={handleClearData} className="px-10 py-4 bg-red-600 text-white font-black rounded-[3rem] tracking-[1em] hover:opacity-100 transition-opacity">تصفية شاملة للنظام</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
