import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Video, ArrowLeft, Phone, Activity, MessageCircle, FileText, User } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function DoctorProfile() {
    const { id } = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [showBookingOptions, setShowBookingOptions] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [payerPhone, setPayerPhone] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const { data: doctor, isLoading, error } = useQuery({
        queryKey: ['doctor', id],
        queryFn: () => fetch(`/api/doctors/${id}`).then(res => {
            if (!res.ok) throw new Error('Doctor not found');
            return res.json();
        })
    });

    const { data: reviews } = useQuery({
        queryKey: ['doctor-reviews', id],
        queryFn: () => fetch(`/api/doctors/${id}/reviews`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).then(res => res.json()),
        enabled: !!doctor
    });

    const handleBooking = async () => {
        if (!user) {
            alert("يرجى تسجيل الدخول أولاً");
            return;
        }
        if (!selectedSlot) {
            alert("يرجى اختيار ميعاد أولاً");
            return;
        }
        if (!paymentMethod || !payerPhone.trim()) {
            alert("يرجى اختيار طريقة دفع وإدخال رقم الهاتف");
            return;
        }

        setPaymentStatus('loading');
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctor.id,
                    slotId: selectedSlot.id,
                    amount: doctor.sessionPrice,
                    paymentMethod,
                    payerPhone
                })
            });
            const data = await res.json();
            if (data.success) {
                setPaymentStatus('success');
            } else {
                setPaymentStatus('error');
                alert(data.error || "حدث خطأ أثناء إعداد الحجز");
            }
        } catch (err) {
            setPaymentStatus('error');
            alert("حدث خطأ");
        }
    };

    if (isLoading) return <div className="p-24 text-center">جاري تحميل بيانات الأخصائي...</div>;
    if (!doctor || error) return <div className="p-24 text-center">لم يتم العثور على الأخصائي</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Portfolio Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1F2F4A] rounded-[3.5rem] overflow-hidden relative shadow-2xl mt-10"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/30 via-transparent to-transparent mix-blend-overlay" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 md:p-20 relative z-10 items-center text-white">
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl font-black">{doctor.user.name}</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-[#6FA65A] font-black text-xl tracking-widest">{doctor.title}</p>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-black">{doctor.rating?.toFixed(1) || '0.0'}</span>
                                <span className="text-[10px] text-slate-400">({doctor._count?.reviews || 0})</span>
                            </div>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed max-w-xl font-medium">{doctor.bio || 'لم يقم الأخصائي بإضافة نبذة شخصية حتى الآن.'}</p>

                        <div className="flex flex-wrap gap-3 pt-6">
                            {doctor.specialties && JSON.parse(doctor.specialties).map((spec: string, i: number) => (
                                <span key={i} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-black border border-white/20">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end">
                        <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-white/5 border-4 border-white/10 overflow-hidden shadow-2xl relative group">
                            {doctor.photo || doctor.user.avatar ? (
                                <img src={doctor.photo || doctor.user.avatar} alt={doctor.user.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#6FA65A]">
                                    <User className="w-32 h-32 opacity-50" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content: CV / Portfolio Details */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-2xl font-black text-[#1F2F4A] mb-8 flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            السيرة الذاتية والتخصص
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-[2]">
                            {doctor.bio ? (
                                <div dangerouslySetInnerHTML={{ __html: doctor.bio.replace(/\n/g, '<br/>') }} />
                            ) : (
                                <p className="italic text-slate-400">لا توجد تفاصيل إضافية للسيرة الذاتية.</p>
                            )}
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-2xl font-black text-[#1F2F4A] mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                                    <Star className="w-6 h-6 fill-amber-500" />
                                </div>
                                آراء المراجعين
                            </div>
                            <span className="text-sm font-bold text-slate-400">{reviews?.length || 0} مراجعة</span>
                        </h2>

                        {reviews && reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((rev: any) => (
                                    <div key={rev.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <Star key={n} className={`w-3.5 h-3.5 ${n <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(rev.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed text-right">
                                            {rev.comment || <span className="italic opacity-50">لا يوجد تعليق مضاف</span>}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                                <User className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                {user?.role === 'ADMIN' && rev.user?.name ? rev.user.name : 'مُراجع مجهول'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 italic text-slate-400 font-bold">
                                لا توجد مراجعات حتى الآن.
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Booking Logic */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-32">
                        <h3 className="font-black text-2xl text-[#1F2F4A] mb-6 text-center">حجز جلسة</h3>

                        <div className="bg-slate-50 rounded-2xl p-6 text-center mb-6">
                            <span className="text-slate-500 font-bold block mb-2">تكلفة الجلسة</span>
                            <span className="text-4xl font-black text-[#6FA65A]">{doctor.sessionPrice} <span className="text-lg">ج.م</span></span>
                        </div>

                        {!showBookingOptions ? (
                            <button
                                onClick={() => setShowBookingOptions(true)}
                                className="w-full bg-[#1F2F4A] text-white py-5 rounded-[2rem] font-black text-xl hover:bg-[#6FA65A] transition-colors shadow-lg active:scale-95"
                            >
                                المواعيد المتاحة
                            </button>
                        ) : paymentStatus === 'success' ? (
                            <div className="space-y-4">
                                <div className="p-6 bg-emerald-50 text-emerald-900 rounded-[2rem] text-sm font-bold border border-emerald-100 italic text-right">
                                    " تم استلام طلب الحجز بنجاح! طلبك الآن قيد المراجعة من قبل الإدارة لتأكيد الجلسة. "
                                </div>
                                <div className="py-3 px-6 bg-slate-50 rounded-2xl text-[10px] text-[#1F2F4A] font-black uppercase tracking-widest border border-slate-100 text-center">
                                     حالة الطلب: قيد المراجعة 🕒
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest text-right block">اختر الموعد المناسب</label>
                                    {doctor.slots && doctor.slots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {doctor.slots.map((slot: any) => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${selectedSlot?.id === slot.id ? 'border-[#6FA65A] bg-emerald-50 text-[#6FA65A]' : 'border-slate-100 text-slate-500 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <span>{new Date(slot.startAt).toLocaleDateString('ar-EG', { weekday: 'short', month: 'numeric', day: 'numeric' })}</span>
                                                    <span>{new Date(slot.startAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 font-bold text-sm">
                                            عذراً، لا يوجد مواعيد متاحة حالياً.
                                        </div>
                                    )}
                                </div>

                                {selectedSlot && (
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        {!paymentMethod ? (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic text-center">اختر طريقة الدفع</p>
                                                
                                                <button onClick={() => setPaymentMethod('VODAFONE_CASH')} className="w-full flex items-center justify-between bg-rose-50 hover:bg-rose-100 text-rose-700 p-4 rounded-2xl transition-all border border-rose-100 group/pay">
                                                    <span className="font-black text-xs">فودافون كاش</span>
                                                    <img src="/images/logos/vodafone-cash.png" alt="Vodafone Cash" className="h-6 object-contain" />
                                                </button>

                                                <button onClick={() => setPaymentMethod('INSTAPAY')} className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-2xl transition-all border border-indigo-100 group/pay">
                                                    <span className="font-black text-xs">إنستاباي</span>
                                                    <img src="/images/logos/instapay.png" alt="InstaPay" className="h-6 object-contain" />
                                                </button>

                                                <button onClick={() => setSelectedSlot(null)} className="w-full text-slate-400 text-[10px] font-bold py-2 text-center">إلغاء</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className={`p-4 rounded-2xl border ${paymentMethod === 'VODAFONE_CASH' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                                                    <p className="text-[10px] font-black mb-1 opacity-60 text-right">حول المبلغ إلى:</p>
                                                    <p className="font-black text-lg tracking-wider text-center" dir="ltr">{paymentMethod === 'VODAFONE_CASH' ? '01032238095' : 'mustafasaleh97@instapay'}</p>
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
                                                    onClick={handleBooking} 
                                                    disabled={paymentStatus === 'loading' || !payerPhone.trim()}
                                                    className="w-full bg-[#6FA65A] text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
                                                >
                                                    {paymentStatus === 'loading' ? 'جاري التأكيد...' : 'تأكيد إرسال المبلغ'}
                                                </button>

                                                <button onClick={() => { setPaymentMethod(null); setPayerPhone(''); }} className="text-slate-400 text-[10px] font-bold block mx-auto">← تغيير الطريقة</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
