import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, Download, Settings, User, Camera, Mail, Phone, Lock, Check, X, Shield, Clock, Video, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/Toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [retryingItem, setRetryingItem] = useState<any>(null); // { id, type: 'BOOKING' | 'PURCHASE' }
  const [retryPaymentMethod, setRetryPaymentMethod] = useState<string | null>(null);
  const [retryPayerPhone, setRetryPayerPhone] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: myPurchases } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: () => fetch('/api/purchases/my').then(res => res.ok ? res.json() : []),
    enabled: !!user
  });

  const { data: myBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => fetch('/api/bookings/my').then(res => res.ok ? res.json() : []),
    enabled: !!user
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetch('/api/courses').then(res => res.ok ? res.json() : []),
    initialData: []
  });

  const { data: packages } = useQuery({
    queryKey: ['packages'],
    queryFn: () => fetch('/api/packages').then(res => res.ok ? res.json() : []),
    initialData: []
  });
  
  const { data: doctorProfile } = useQuery({
    queryKey: ['doctorProfile'],
    queryFn: () => fetch('/api/doctors/me').then(res => res.ok ? res.json() : null),
    enabled: !!user && ['DOCTOR', 'SPECIALIST', 'SUPERVISOR'].includes(user.role)
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setIsEditing(false);
      showToast('تم تحديث الملف الشخصي بنجاح', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'خطأ في التحديث', 'error');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      if (data.newPassword !== data.confirmPassword) throw new Error('كلمات المرور الجديدة غير متطابقة');
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'خطأ في تغيير كلمة المرور');
      }
      return res.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, avatar: data.url }));
        showToast('تم رفع الصورة بنجاح', 'success');
      }
    } catch (err) {
      showToast('فشل رفع الصورة', 'error');
    }
  };

  if (!user) return <div className="p-24 text-center">الرجاء تسجيل الدخول</div>;

  const myCourses = courses?.filter((c: any) => myPurchases?.some((p: any) => p.itemId === c.id && p.type === 'COURSE' && p.status === 'APPROVED')) || [];
  const myTools = packages?.filter((t: any) => myPurchases?.some((p: any) => p.itemId === t.id && p.type === 'PACKAGE' && p.status === 'APPROVED')) || [];
  const pendingOrRejectedPurchases = myPurchases?.filter((p: any) => p.status !== 'APPROVED') || [];

  const submitReview = async () => {
    if (!reviewingBooking) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: reviewingBooking.doctorId,
          bookingId: reviewingBooking.id,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم إرسال التقييم بنجاح', 'success');
        setReviewingBooking(null);
        setRating(5);
        setComment('');
        queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      } else {
        showToast(data.error || 'فشل إرسال التقييم', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء إرسال التقييم', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!retryingItem || !retryPaymentMethod || !retryPayerPhone.trim()) return;
    setIsRetrying(true);
    try {
      const endpoint = retryingItem.type === 'BOOKING' 
        ? `/api/bookings/${retryingItem.id}/retry` 
        : `/api/purchases/${retryingItem.id}/retry`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: retryPaymentMethod,
          payerPhone: retryPayerPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم إعادة إرسال طلب الدفع بنجاح', 'success');
        setRetryingItem(null);
        setRetryPaymentMethod(null);
        setRetryPayerPhone('');
        queryClient.invalidateQueries({ queryKey: [retryingItem.type === 'BOOKING' ? 'myBookings' : 'myPurchases'] });
      } else {
        showToast(data.error || 'فشل إعادة المحاولة', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء المحاولة', 'error');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-700">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

        <div className="relative flex flex-col md:flex-row items-center gap-10">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[#1F2F4A] font-bold text-5xl shadow-inner overflow-hidden border-4 border-white ring-1 ring-slate-100 transition-transform duration-500 group-hover:scale-105">
              {formData.avatar ? (
                <img src={formData.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#6FA65A] text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform ring-4 ring-white">
                <Camera className="w-6 h-6" />
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
              </label>
            )}
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center md:text-right space-y-4">
            <div className="space-y-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-3xl font-bold text-[#1F2F4A] bg-slate-50 border-2 border-[#6FA65A]/20 focus:border-[#6FA65A] rounded-2xl px-4 py-2 w-full outline-none transition-all"
                  placeholder="الاسم بالكامل"
                />
              ) : (
                <h1 className="text-4xl font-black text-[#1F2F4A] tracking-tight">{user.name}</h1>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  <Mail className="w-4 h-4 text-[#6FA65A]" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <Phone className="w-4 h-4 text-blue-500" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#1F2F4A] text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {user.role === 'USER' ? 'متدرب / عميل' : 
                   user.role === 'DOCTOR' ? 'طبيب' : 
                   user.role === 'SPECIALIST' ? 'أخصائي / معالج' :
                   user.role === 'SUPERVISOR' ? 'مشرف محتوى' :
                   user.role === 'ADMIN' ? 'مدير النظام' : 'عضو'}
                </div>
                {doctorProfile && (
                  <div className="flex items-center gap-2 bg-amber-400 text-[#1F2F4A] px-4 py-2 rounded-2xl text-sm font-black shadow-lg shadow-amber-100">
                    <Star className="w-4 h-4 fill-current" />
                    {doctorProfile.rating ? Number(doctorProfile.rating).toFixed(1) : '0.0'} / 5
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col gap-3">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => updateProfileMutation.mutate(formData)}
                  disabled={updateProfileMutation.isPending}
                  className="bg-[#6FA65A] hover:bg-[#5d8d4c] text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  حفظ
                </button>
                <button
                  onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone || '', avatar: user.avatar || '' }); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  إلغاء
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-slate-50 text-[#1F2F4A] border-2 border-slate-100 px-8 py-4 rounded-[1.5rem] font-bold transition-all shadow-sm hover:shadow-md hover:border-[#6FA65A] flex items-center gap-3 active:scale-95"
                >
                  <Settings className="w-5 h-5 text-[#6FA65A]" />
                  تعديل الملف
                </button>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="bg-white hover:bg-slate-50 text-[#1F2F4A] border-2 border-slate-100 px-8 py-4 rounded-[1.5rem] font-bold transition-all shadow-sm hover:shadow-md hover:border-blue-500 flex items-center gap-3 active:scale-95"
                >
                  <Lock className="w-5 h-5 text-blue-500" />
                  تغيير كلمة المرور
                </button>
              </>
            )}
          </div>
        </div>

        {/* Password Edit Section */}
        {isChangingPassword && (
          <div className="mt-10 pt-10 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl font-bold text-[#1F2F4A] mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-500" />
              تغيير كلمة المرور الآمنة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => updatePasswordMutation.mutate(passwordData)}
                disabled={updatePasswordMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 hover:scale-105 active:scale-95"
              >
                تحديث كلمة المرور
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats and Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Courses Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#6FA65A]">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1F2F4A]">دوراتي التدريبية</h2>
                  <p className="text-slate-500 text-sm">الدورات التي تم الاشتراك بها بنجاح</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-[#6FA65A] px-4 py-1 rounded-full text-sm font-bold">
                {myCourses?.length || 0} دورة
              </div>
            </div>

            {myCourses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCourses.map((course: any) => (
                  <a
                    href={`/courses/${course.slug}`}
                    key={course.id}
                    className="group bg-slate-50/50 hover:bg-white p-5 rounded-3xl border border-transparent hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        <img src={course.thumbnail || 'https://picsum.photos/seed/course/200'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#1F2F4A] truncate group-hover:text-[#6FA65A] transition-colors">{course.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-white text-slate-500 px-2 py-1 rounded-lg border border-slate-100">{course.level}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">لم تشترك في أي دورة بعد</p>
                <a href="/courses" className="text-[#6FA65A] text-sm font-bold mt-2 inline-block hover:underline">استكشف الدورات المتاحة</a>
              </div>
            )}

            {pendingOrRejectedPurchases?.length > 0 && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#1F2F4A]">طلبات الاشتراك المعلقة / المرفوضة</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrRejectedPurchases.map((purchase: any) => {
                    const item = purchase.type === 'COURSE' 
                      ? courses?.find((c: any) => c.id === purchase.itemId)
                      : packages?.find((t: any) => t.id === purchase.itemId);
                    if (!item) return null;
                    return (
                      <div key={purchase.id} className="p-4 rounded-3xl border border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white">
                            <img src={item.thumbnail || 'https://picsum.photos/seed/item/100'} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#1F2F4A] truncate">{item.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {purchase.status === 'PENDING' ? (
                                <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">قيد المراجعة</span>
                              ) : (
                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">مرفوض</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {purchase.status === 'REJECTED' && (
                          <button
                            onClick={() => {
                              setRetryingItem({ id: purchase.id, type: 'PURCHASE', amount: purchase.amount });
                              setRetryPaymentMethod(purchase.paymentMethod);
                              setRetryPayerPhone(purchase.payerPhone || '');
                            }}
                            className="bg-[#6FA65A] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all shrink-0"
                          >
                            تعديل الدفع
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1F2F4A]">مواعيد الجلسات</h2>
                <p className="text-slate-500 text-sm">جدول جلساتك القادمة مع الأخصائيين</p>
              </div>
            </div>
            {myBookings?.length > 0 ? (
              <div className="space-y-4">
                {myBookings.map((booking: any) => (
                  <div key={booking.id} className="p-5 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                        {booking.doctor?.user?.avatar || booking.doctor?.photo ? (
                          <img src={booking.doctor?.photo || booking.doctor?.user?.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 m-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1F2F4A]">مع د. {booking.doctor?.user?.name}</h3>
                        <div className="text-sm font-bold text-slate-500 mt-1">
                          {booking.slot ? new Date(booking.slot.startAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }) : 'حجز محذوف'}
                        </div>
                      </div>
                    </div>
                    <div>
                      {booking.status === 'CONFIRMED' ? (
                        <div className="flex flex-col md:flex-row gap-2">
                          <a href={booking.meetingLink || booking.doctor?.sessionLink || '#'} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            رابط Zoom
                          </a>
                          {!booking.review && (
                            <button
                              onClick={() => setReviewingBooking(booking)}
                              className="bg-emerald-50 text-[#6FA65A] border border-emerald-100 px-6 py-3 rounded-xl font-bold hover:bg-[#6FA65A] hover:text-white transition-all flex items-center gap-2"
                            >
                              <Star className="w-5 h-5" />
                              تقييم الجلسة
                            </button>
                          )}
                        </div>
                      ) : booking.status === 'PENDING' ? (
                        <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm">قيد المراجعة</span>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl font-bold text-sm">ملغي/مرفوض</span>
                          <button
                            onClick={() => {
                              setRetryingItem({ id: booking.id, type: 'BOOKING', amount: booking.amount });
                              setRetryPaymentMethod(booking.paymentMethod);
                              setRetryPayerPhone(booking.payerPhone || '');
                            }}
                            className="text-[#6FA65A] text-xs font-bold hover:underline"
                          >
                            إعادة محاولة الدفع
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 italic text-slate-400">
                <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                لا يوجد مواعيد مسجلة حالياً
              </div>
            )}
          </div>
        </div>

        {/* Tools Sidebar Section */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <Download className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[#1F2F4A]">الأدوات والموارد</h2>
              </div>
            </div>

            {myTools?.length > 0 ? (
              <div className="space-y-4">
                {myTools.map((tool: any) => (
                  <a
                    href={`/tools/${tool.id}`}
                    key={tool.id}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-purple-100 hover:bg-purple-50/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-purple-400 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                      {tool.type === 'PDF' ? <Download className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#1F2F4A] truncate">{tool.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{tool.type}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                <Download className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium px-4">لم تقم باقتناء أي أدوات أو موارد حتى الآن</p>
              </div>
            )}

            <div className="mt-8 p-6 bg-gradient-to-br from-[#1F2F4A] to-[#2d4469] rounded-[2rem] text-white">
              <Shield className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="font-bold mb-2">مركز الأمان</h4>
              <p className="text-xs text-slate-300 leading-relaxed">بصفتك عضواً في منصة البايز، فإن جميع بياناتك وجلساتك محمية بأعلى معايير التشفير والخصوصية.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-[#1F2F4A] mb-2 text-right">تقييم الجلسة</h3>
            <p className="text-slate-500 mb-8 font-bold text-right">مع د. {reviewingBooking.doctor?.user?.name}</p>

            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">اختر التقييم</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setRating(num)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        className={`w-10 h-10 ${num <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-right">
                <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-widest">تعليقك (اختياري)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="كيف كانت تجربتك مع الأخصائي؟"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#6FA65A] rounded-2xl px-4 py-3 min-h-[120px] outline-none transition-all font-medium text-right"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={submitReview}
                  disabled={isSubmittingReview}
                  className="flex-1 bg-[#6FA65A] text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
                <button
                  onClick={() => setReviewingBooking(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all border border-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Retry Payment Modal */}
      {retryingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-right">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-[#1F2F4A] mb-4">إعادة محاولة الدفع</h3>
            <p className="text-slate-500 mb-8 font-bold">يرجى إعادة إدخال بيانات الدفع لتأكيد طلبك</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">اختر طريقة الدفع</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setRetryPaymentMethod('VODAFONE_CASH')} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border ${retryPaymentMethod === 'VODAFONE_CASH' ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200' : 'bg-slate-50 border-slate-100 hover:bg-rose-50'}`}>
                    <img src="/images/logos/vodafone-cash.png" alt="Vodafone Cash" className="h-6 object-contain mb-2" />
                    <span className="font-bold text-[10px] text-rose-700">فودافون كاش</span>
                  </button>
                  <button onClick={() => setRetryPaymentMethod('INSTAPAY')} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border ${retryPaymentMethod === 'INSTAPAY' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-indigo-50'}`}>
                    <img src="/images/logos/instapay.png" alt="InstaPay" className="h-6 object-contain mb-2" />
                    <span className="font-bold text-[10px] text-indigo-700">إنستاباي</span>
                  </button>
                </div>
              </div>

              {retryPaymentMethod && (
                <div className={`p-4 rounded-2xl border text-center ${retryPaymentMethod === 'VODAFONE_CASH' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                  <p className="text-[10px] font-black mb-1 opacity-60">حول مبلغ {retryingItem.amount} ج.م إلى:</p>
                  <p className="font-black text-lg tracking-wider" dir="ltr">{retryPaymentMethod === 'VODAFONE_CASH' ? '01031611290' : 'mustafasaleh97@instapay'}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest flex items-center gap-1 justify-end">
                  رقم الموبايل المحوّل منه <Phone className="w-3 h-3 text-[#6FA65A]" />
                </label>
                <input 
                  type="tel" 
                  value={retryPayerPhone}
                  onChange={e => setRetryPayerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold focus:border-[#6FA65A] outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleRetryPayment}
                  disabled={isRetrying || !retryPaymentMethod || !retryPayerPhone.trim()}
                  className="flex-1 bg-[#6FA65A] text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {isRetrying ? 'جاري الإرسال...' : 'تأكيد الإرسال'}
                </button>
                <button
                  onClick={() => setRetryingItem(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all border border-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
