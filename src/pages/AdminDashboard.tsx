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
  History, ListPlus, Tag, Calendar, MessageSquare,
  PlusCircle, User, FolderClosed
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
  { id: 'myProfile', label: 'ملفي الشخصي (إشراف)', icon: Users },
  { id: 'courses', label: 'إدارة الدورات', icon: BookOpen },
  { id: 'articles', label: 'إدارة المقالات', icon: FileText },
  { id: 'categories', label: 'الأقسام العلمية', icon: ListPlus },
  { id: 'tags', label: 'التسميات (Tags)', icon: Tag },
  { id: 'tools', label: 'الحزم التعليمية', icon: Wrench },
  { id: 'financials', label: 'التقارير المالية', icon: DollarSign },
  { id: 'forum', label: 'إدارة المنتدى', icon: MessageSquare },
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
  const [forumCategories, setForumCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // New states for Portfolio & Slots (for Admin/Mostafa)
  const [portfolio, setPortfolio] = useState({
    bio: '', specialties: '', title: '', photo: '', sessionPrice: 0, sessionLink: ''
  });
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', durationMinutes: 45 });

  const [newCatName, setNewCatName] = useState('');
  const [newForumCatName, setNewForumCatName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  // Forms
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);

  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [editingFile, setEditingFile] = useState<any>(null); // file being edited
  const [managingFiles, setManagingFiles] = useState<any>(null); // package being file-managed

  const [toolForm, setToolForm] = useState({ title: '', description: '', price: '', coverImage: '' });
  const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', coverImage: '', contentRichText: '', category: 'مقالات عامة', tags: '' });
  const [newFileForm, setNewFileForm] = useState({ title: '', file: null as File | null });

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
        if (activeTab === 'tools' && !showAddTool && !managingFiles) {
          const res = await fetch('/api/admin/packages');
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
        if (activeTab === 'forum') {
          const res = await fetch('/api/forum/categories');
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error ${res.status}`);
          }
          const data = await res.json();
          setForumCategories(Array.isArray(data) ? data : []);
        }
        if (activeTab === 'myProfile') {
          const res = await fetch('/api/doctor/me');
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
            const slotsRes = await fetch('/api/doctor/slots');
            if (slotsRes.ok) setSlots(await slotsRes.json());
          }
        }
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        showToast(`خطأ في جلب البيانات: ${err.message || 'مشكلة في الاتصال'}`, 'error');
      }
    };
    fetchData();
  }, [activeTab, showAddCourse, showAddArticle, showAddTool, editingCourse, editingArticle, editingTool, managingFiles]);

  // Initialize tool form when editing starts
  useEffect(() => {
    if (editingTool) {
      setToolForm({
        title: editingTool.title || '',
        description: editingTool.description || '',
        price: editingTool.price?.toString() || '0',
        coverImage: editingTool.coverImage || ''
      });
    } else {
      setToolForm({ title: '', description: '', price: '', coverImage: '' });
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
      const payload = { ...toolForm, price: parseFloat(toolForm.price) || 0 };
      const url = editingTool ? `/api/admin/packages/${editingTool.id}` : '/api/admin/packages';
      const method = editingTool ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { showToast(editingTool ? 'تم تحديث الحزمة بنجاح ✅' : 'تم إضافة الحزمة بنجاح ✅'); setShowAddTool(false); setEditingTool(null); }
      else showToast('حدث خطأ', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const deleteTool = async (id: string) => {
    if (!confirm('حذف هذه الحزمة؟ سيتم حذف جميع ملفاتها.')) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      if (res.ok) { setTools(tools.filter(t => t.id !== id)); showToast('تم حذف الحزمة'); }
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const addFileToPackage = async (packageId: string) => {
    if (!newFileForm.title.trim() || (!editingFile && !newFileForm.file)) {
      showToast('يرجى إدخال اسم الملف ورفع ملف HTML', 'error');
      return;
    }
    try {
      let fileUrl = editingFile?.fileUrl;
      let fileName = editingFile?.fileName;

      if (newFileForm.file) {
        const url = await handleFileUpload(newFileForm.file);
        if (!url) return;
        fileUrl = url;
        fileName = newFileForm.file.name;
      }

      const method = editingFile ? 'PUT' : 'POST';
      const url = editingFile 
        ? `/api/admin/packages/${packageId}/files/${editingFile.id}`
        : `/api/admin/packages/${packageId}/files`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newFileForm.title, fileName, fileUrl })
      });

      if (res.ok) {
        showToast(editingFile ? 'تم تحديث الملف ✅' : 'تم رفع الملف بنجاح ✅');
        setNewFileForm({ title: '', file: null });
        setEditingFile(null);
        // Refresh package data
        const pkgRes = await fetch('/api/admin/packages');
        const pkgData = await pkgRes.json();
        if (Array.isArray(pkgData)) {
          setTools(pkgData);
          const updated = pkgData.find((p: any) => p.id === packageId);
          if (updated) setManagingFiles(updated);
        }
      } else showToast('خطأ في العملية', 'error');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const deleteFileFromPackage = async (packageId: string, fileId: string) => {
    if (!confirm('حذف هذا الملف؟')) return;
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف الملف');
        const updatedFiles = managingFiles.files.filter((f: any) => f.id !== fileId);
        setManagingFiles({ ...managingFiles, files: updatedFiles });
      } else showToast('خطأ في الحذف', 'error');
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

  const submitPortfolio = async () => {
    try {
      const payload = {
        ...portfolio,
        specialties: portfolio.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      };
      const res = await fetch('/api/doctor/portfolio', {
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

      const res = await fetch('/api/doctor/slots', {
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
    const res = await fetch(`/api/doctor/slots/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSlots(slots.filter(s => s.id !== id));
      showToast('تم الحذف بنجاح');
    }
  };

  // ─── Render Functions ─────────────────────────────────

  const renderMyProfile = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden">
        <h2 className="text-2xl font-black text-[#1F2F4A] mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6FA65A]/10 flex items-center justify-center text-[#6FA65A]">
            <User className="w-6 h-6" />
          </div>
          إعداد ملف الإشراف الشخصي
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-black text-slate-500 block mb-2 mr-2">المسمى الوظيفي (مثال: استشاري نفسي)</label>
              <input type="text" value={portfolio.title} onChange={e => setPortfolio({ ...portfolio, title: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" />
            </div>

            <div>
              <label className="text-sm font-black text-slate-500 mt-4 block mb-2 mr-2">التخصصات (مفصولة بفاصلة)</label>
              <input type="text" value={portfolio.specialties} onChange={e => setPortfolio({ ...portfolio, specialties: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" />
            </div>

            <div className="flex gap-6">
              <div className="flex-1">
                <label className="text-sm font-black text-slate-500 block mb-2 mr-2">سعر جلسة الإشراف (ج.م)</label>
                <input type="number" value={portfolio.sessionPrice} onChange={e => setPortfolio({ ...portfolio, sessionPrice: Number(e.target.value) })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" />
              </div>
            </div>

            <div>
              <label className="text-sm font-black text-slate-500 mt-4 block mb-2 mr-2">رابط اجتماع Zoom الدائم</label>
              <input type="text" value={portfolio.sessionLink} onChange={e => setPortfolio({ ...portfolio, sessionLink: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" placeholder="https://zoom.us/j/123456789..." />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-black text-slate-500 block mb-2 mr-2">النبذة الشخصية (Portfolio / CV)</label>
              <textarea value={portfolio.bio} onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })} rows={8} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" />
            </div>

            <div>
              <label className="text-sm font-black text-slate-500 mt-4 block mb-2 mr-2">رابط الصورة الشخصية</label>
              <input type="text" value={portfolio.photo} onChange={e => setPortfolio({ ...portfolio, photo: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" placeholder="ارفع الصورة وانسخ الرابط هنا" />
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-end">
          <button onClick={submitPortfolio} className="bg-[#1F2F4A] text-white px-12 py-5 rounded-[2rem] font-black hover:bg-[#6FA65A] transition-all shadow-2xl active:scale-95 shadow-[#1F2F4A]/20">
            حفظ وتحديث الملف الشخصي
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden">
        <h2 className="text-2xl font-black text-[#1F2F4A] mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Calendar className="w-6 h-6" />
          </div>
          إدارة مواعيد جلسات الإشراف
        </h2>

        <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 mb-12 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-widest mr-4">تاريخ الموعد المتاح</label>
            <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" />
          </div>
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-widest mr-4">الوقت (ص/م)</label>
            <input type="time" value={newSlot.time} onChange={e => setNewSlot({ ...newSlot, time: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6FA65A] transition-all font-bold" />
          </div>
          <button onClick={submitSlot} className="bg-[#1F2F4A] text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl h-[60px] shrink-0 active:scale-95">
            إضافة موعد متاح
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slots.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-300 font-black border-2 border-dashed border-slate-50 rounded-[3rem]">لا توجد مواعيد متاحة مسجلة حالياً.</div>
          ) : (
            slots.map(slot => {
              const start = new Date(slot.startAt);
              const isBooked = slot.isBooked;
              return (
                <div key={slot.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${isBooked ? 'border-amber-100 bg-amber-50/50' : 'border-emerald-100 bg-emerald-50/50'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isBooked ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-black text-[#1F2F4A] text-lg">{start.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className={`text-sm font-black ${isBooked ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {start.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} • {isBooked ? 'محجوز (بانتظار التأكيد)' : 'متاح للحجز'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteSlot(slot.id)} disabled={isBooked} className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-rose-500 shadow-sm transition-all ${isBooked ? 'opacity-20 cursor-not-allowed' : 'hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-90'}`}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

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
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[#1F2F4A] text-xl overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        u.name.charAt(0)
                      )}
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
          <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest"><tr><th className="px-8 py-4">بيانات المشتري</th><th className="px-8 py-4">المحتوى المطلوب</th><th className="px-8 py-4 text-center">قيمة العملية</th><th className="px-8 py-4 text-center">طريقة الدفع</th><th className="px-8 py-4 text-center">الحالة النهائية</th><th className="px-8 py-4 text-center">إجراءات المراجعة</th></tr></thead>
          <tbody>
            {Array.isArray(purchases) && purchases.map(p => (
              <tr key={p.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6 first:rounded-r-[2rem] border-y border-r border-slate-50"><div className="font-black text-[#1F2F4A] hover:text-[#6FA65A] transition-colors">{p.user?.name}</div><div className="text-[10px] text-slate-400 mt-1 font-mono tracking-tighter">{p.user?.phone || p.user?.email}</div></td>
                <td className="px-8 py-6 text-slate-500 text-sm font-black border-y border-slate-50 italic">{p.itemTitle || p.courseTitle || '---'}</td>
                <td className="px-8 py-6 text-center font-black text-[#6FA65A] border-y border-slate-50 text-xl">{p.amount} <span className="text-[10px]">ج.م</span></td>
                <td className="px-8 py-6 text-center border-y border-slate-50">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-600">
                        {p.paymentMethod === 'VODAFONE_CASH' ? 'فودافون كاش' : p.paymentMethod === 'INSTAPAY' ? 'إنستاباي' : p.paymentMethod || '---'}
                      </span>
                      {p.paymentMethod === 'VODAFONE_CASH' && <img src="/images/logos/vodafone-cash.png" alt="Vodafone" className="h-4 object-contain" />}
                      {p.paymentMethod === 'INSTAPAY' && <img src="/images/logos/instapay.png" alt="InstaPay" className="h-4 object-contain" />}
                    </div>
                    {p.payerPhone && <div className="text-[10px] text-blue-600 font-mono" dir="ltr">☎ {p.payerPhone}</div>}
                  </div>
                </td>
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
                  <div className="text-[10px] text-slate-400 mt-1 font-mono tracking-tighter" dir="ltr">{b.user?.phone || b.user?.email}</div>
                </td>
                <td className="px-8 py-6 text-slate-500 text-sm font-black border-y border-slate-50 italic">
                  مع {b.doctor?.user?.name || '---'}
                  <div className="text-xs text-[#6FA65A] mt-1">{b.slot ? new Date(b.slot.startAt).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' }) : 'وقت محذوف!'}</div>
                </td>
                <td className="px-8 py-6 text-center border-y border-slate-50">
                  <div className="font-black text-[#1F2F4A] text-xl">{b.amount} <span className="text-[10px]">ج.م</span></div>
                  <div className="mt-2 space-y-1 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-[10px] text-slate-600">
                        {b.paymentMethod === 'VODAFONE_CASH' ? 'فودافون كاش' : b.paymentMethod === 'INSTAPAY' ? 'إنستاباي' : b.paymentMethod || '---'}
                      </span>
                      {b.paymentMethod === 'VODAFONE_CASH' && <img src="/images/logos/vodafone-cash.png" alt="Vodafone" className="h-4 object-contain" />}
                      {b.paymentMethod === 'INSTAPAY' && <img src="/images/logos/instapay.png" alt="InstaPay" className="h-4 object-contain" />}
                    </div>
                    {b.payerPhone && (
                      <div className="text-[10px] text-blue-600 font-black" dir="ltr">☎ {b.payerPhone}</div>
                    )}
                  </div>
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

    // File Management View
    if (managingFiles) return (
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl animate-in fade-in duration-500 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-[#1F2F4A]">إدارة ملفات: {managingFiles.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{managingFiles.files?.length || 0} ملف في الحزمة</p>
          </div>
          <button onClick={() => { setManagingFiles(null); setNewFileForm({ title: '', file: null }); }} className="text-slate-400 hover:text-rose-500 font-bold px-4 py-2">← رجوع</button>
        </div>

        {/* Upload New File */}
        <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-4">
          <h3 className="font-bold text-[#1F2F4A] flex items-center gap-2">
            {editingFile ? <Edit3 className="w-5 h-5 text-blue-500" /> : <Upload className="w-5 h-5 text-[#6FA65A]" />}
            {editingFile ? `تعديل ملف: ${editingFile.title}` : 'رفع ملف HTML جديد'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">عنوان الملف</label>
              <input
                type="text"
                value={newFileForm.title}
                onChange={e => setNewFileForm({ ...newFileForm, title: e.target.value })}
                className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold"
                placeholder="مثلاً: مقياس القلق"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">
                {editingFile ? 'استبدال ملف HTML (اختياري)' : 'ملف HTML'}
              </label>
              <input
                type="file"
                accept=".html,.htm"
                onChange={e => setNewFileForm({ ...newFileForm, file: e.target.files?.[0] || null })}
                className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); addFileToPackage(managingFiles.id); }}
              disabled={!newFileForm.title || (!editingFile && !newFileForm.file)}
              className={`${editingFile ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#6FA65A] hover:bg-emerald-600'} text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {editingFile ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingFile ? 'حفظ التعديلات' : 'رفع الملف'}
            </button>
            {editingFile && (
              <button
                type="button"
                onClick={() => { setEditingFile(null); setNewFileForm({ title: '', file: null }); }}
                className="bg-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-300 transition-all"
              >
                إلغاء التعديل
              </button>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="space-y-3">
          {managingFiles.files?.length === 0 && (
            <div className="py-16 text-center text-slate-200 font-bold border-2 border-dashed border-slate-50 rounded-[2rem]">لا توجد ملفات — ابدأ برفع أول ملف HTML</div>
          )}
          {managingFiles.files?.map((f: any, i: number) => (
            <div key={f.id} className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#6FA65A]/10 text-[#6FA65A] rounded-xl flex items-center justify-center font-black text-sm">{i + 1}</div>
                <div>
                  <div className="font-bold text-[#1F2F4A]">{f.title}</div>
                  <div className="text-[10px] text-slate-400">{f.fileName}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={f.fileUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center" title="معاينة">
                  <Eye className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => { setEditingFile(f); setNewFileForm({ title: f.title, file: null }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                  title="تعديل أو استبدال الملف"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteFileFromPackage(managingFiles.id, f.id)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // Add/Edit Package Form
    if (showAddTool || isEditing) return (
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#1F2F4A]">{isEditing ? 'تعديل الحزمة' : 'إضافة حزمة جديدة'}</h2>
          <button type="button" onClick={() => { setShowAddTool(false); setEditingTool(null); }} className="text-slate-400 hover:text-rose-500 font-bold">إلغاء</button>
        </div>
        <form onSubmit={submitTool} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">اسم الحزمة</label>
              <input
                type="text"
                value={toolForm.title}
                onChange={e => setToolForm({ ...toolForm, title: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                placeholder="مثلاً: حزمة مقاييس القلق"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 mr-2">سعر التحميل (ج.م)</label>
              <input
                type="number"
                value={toolForm.price}
                onChange={e => setToolForm({ ...toolForm, price: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                placeholder="0 = مجاني"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 mr-2">وصف الحزمة</label>
            <textarea
              value={toolForm.description}
              onChange={e => setToolForm({ ...toolForm, description: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold h-32"
              placeholder="وصف مختصر لمحتويات الحزمة..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 mr-2">صورة الغلاف (رابط أو رفع)</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={toolForm.coverImage}
                onChange={e => setToolForm({ ...toolForm, coverImage: e.target.value })}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                placeholder="رابط صورة الغلاف (اختياري)"
              />
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-bold cursor-pointer transition-colors flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleFileUpload(file);
                      if (url) setToolForm(prev => ({ ...prev, coverImage: url }));
                    }
                  }}
                />
              </label>
            </div>
            {toolForm.coverImage && (
              <div className="mt-3 w-32 h-20 rounded-xl overflow-hidden border border-slate-100">
                <img src={toolForm.coverImage} className="w-full h-full object-cover" alt="" />
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-[#6FA65A] text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-600 transition-all">
            {isEditing ? 'تحديث الحزمة' : 'إضافة الحزمة'}
          </button>
        </form>
      </div>
    );

    // Packages List
    return (
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1F2F4A] relative overflow-hidden gap-6">
          <div className="absolute top-0 right-0 w-full h-full bg-[length:20px_20px] opacity-10" />
          <div className="relative z-10 text-white">
            <h2 className="text-xl md:text-2xl font-bold">إدارة الحزم التعليمية</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">إنشاء وإدارة الحزم التعليمية وملفات HTML الخاصة بها</p>
          </div>
          <button onClick={() => setShowAddTool(true)} className="w-full md:w-auto bg-[#6FA65A] hover:bg-emerald-600 text-white px-8 py-3 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95"><Plus className="w-5 h-5" /> حزمة جديدة</button>
        </div>
        <div className="overflow-x-auto min-h-[400px] p-4 md:p-6">
          <table className="w-full text-right border-separate border-spacing-y-4 min-w-[700px]">
            <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">الحزمة</th>
                <th className="px-8 py-4 text-center">الملفات</th>
                <th className="px-8 py-4 text-center">السعر</th>
                <th className="px-8 py-4 text-center">أدوات التحكم</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(tools) && tools.map(t => (
                <tr key={t.id} className="bg-white border border-slate-50 shadow-sm rounded-3xl group hover:shadow-lg transition-all">
                  <td className="px-8 py-6 first:rounded-r-[2rem]">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                        {t.coverImage ? (
                          <img src={t.coverImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Wrench className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-[#1F2F4A] block">{t.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold line-clamp-1">{t.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => setManagingFiles(t)}
                      className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all border border-blue-100 cursor-pointer"
                      title="عرض وإدارة الملفات"
                    >
                      {t.files?.length || 0} ملف
                    </button>
                  </td>
                  <td className="px-8 py-6 text-center font-black text-[#6FA65A] text-lg">{t.price || 0} ج.م</td>
                  <td className="px-8 py-6 text-center last:rounded-l-[2rem]">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setManagingFiles(t)} className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="إدارة ملفات الحزمة"><FolderClosed className="w-4 h-4 mx-auto" /></button>
                      <button onClick={() => setEditingTool(t)} className="w-10 h-10 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4 mx-auto" /></button>
                      <button onClick={() => deleteTool(t.id)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4 mx-auto" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tools.length === 0 && <div className="py-20 text-center font-bold text-slate-200">لا توجد حزم حالياً — ابدأ بإضافة أول حزمة تعليمية</div>}
        </div>
      </div>
    );
  };

  const renderForumManagement = () => (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-[#1F2F4A] text-white">
        <h2 className="text-xl font-bold flex items-center gap-3"><MessageSquare className="w-6 h-6 text-[#6FA65A]" /> إدارة أقسام المنتدى المجتمعي</h2>
        <div className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">تنسيق المجتمع</div>
      </div>

      <div className="p-10 space-y-10">
        <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اسم القسم الجديد</label>
            <input
              type="text"
              value={newForumCatName}
              onChange={e => setNewForumCatName(e.target.value)}
              className="w-full p-5 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm"
              placeholder="مثلاً: علم النفس الإيجابي، الاضطرابات النفسية..."
            />
          </div>
          <button
            onClick={async () => {
              if (!newForumCatName) return;
              try {
                const res = await fetch('/api/admin/forum/categories', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newForumCatName })
                });
                if (res.ok) {
                  const created = await res.json();
                  setForumCategories([...forumCategories, created]);
                  setNewForumCatName('');
                  showToast('تم إضافة القسم بنجاح ✅');
                } else {
                  const errData = await res.json().catch(() => ({}));
                  showToast(`خطأ: ${errData.error || 'فشل في الإضافة'}`, 'error');
                }
              } catch (err: any) {
                showToast(`خطأ في الإضافة: ${err.message}`, 'error');
              }
            }}
            className="self-end h-[60px] bg-[#6FA65A] text-white px-12 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-[#6FA65A]/20 active:scale-95"
          >
            إضافة القسم الآن
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forumCategories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 group hover:border-[#6FA65A]/40 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-[#6FA65A] opacity-10 group-hover:opacity-100 transition-opacity" />
              <span className="font-black text-[#1F2F4A]">{cat.name}</span>
              <button
                onClick={async () => {
                  if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الربط المتعلق به.')) return;
                  try {
                    const res = await fetch(`/api/admin/forum/categories/${cat.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      setForumCategories(forumCategories.filter(c => c.id !== cat.id));
                      showToast('تم الحذف بنجاح');
                    }
                  } catch { showToast('حدث خطأ', 'error'); }
                }}
                className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {forumCategories.length === 0 && (
          <div className="py-20 text-center text-slate-200 font-bold border-2 border-dashed border-slate-50 rounded-[3rem]">
            لا توجد أقسام منتدى حالياً، ابدأ بإضافة أول قسم!
          </div>
        )}
      </div>
    </div>
  );

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
          subtitle="تحكم شمولي في منصة Clinical Cases Group | Psycho-Club وإدارة شؤون المتدربين"
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
                {activeTab === 'forum' && renderForumManagement()}
                {activeTab === 'audit' && renderAudit()}
                {activeTab === 'myProfile' && renderMyProfile()}
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
