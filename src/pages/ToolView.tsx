import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Download, Lock, FileText, Eye, Package, Phone, CreditCard, Clock, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function ToolView() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [payerPhone, setPayerPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: () => fetch(`/api/packages/${id}`).then(res => res.json())
  });

  const { data: myPurchases } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: () => fetch('/api/purchases/my').then(res => res.ok ? res.json() : []),
    enabled: !!user
  });

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#6FA65A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!pkg || pkg.error) return (
    <div className="p-24 text-center">
      <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
      <p className="text-xl font-bold text-slate-500">لم يتم العثور على الحزمة</p>
    </div>
  );

  const pkgPurchase = myPurchases?.find((p: any) => p.itemId === id && p.type === 'PACKAGE');
  const hasPurchased = user?.role === 'ADMIN' || pkgPurchase?.status === 'APPROVED';
  const isPending = pkgPurchase?.status === 'PENDING';
  const isFree = pkg.price === 0;

  const handleCheckout = async () => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }
    if (!payerPhone.trim()) {
      alert("يرجى إدخال رقم الموبايل");
      return;
    }
    setPaymentStatus('loading');
    try {
      const res = await fetch('/api/checkout/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          type: 'PACKAGE',
          paymentMethod,
          payerPhone: payerPhone.trim()
        })
      });
      if (res.ok) {
        setPaymentStatus('success');
        queryClient.invalidateQueries({ queryKey: ['myPurchases'] });
      } else {
        const data = await res.json();
        if (data.error?.includes('Already')) {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('error');
        }
      }
    } catch {
      setPaymentStatus('error');
    }
  };

  const handleDownload = () => {
    window.open(`/api/packages/${id}/download`, '_blank');
  };

  const previewFile = pkg.files?.find((f: any) => f.id === previewFileId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
      {/* Back Button */}
      <Link to="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#6FA65A] transition-colors font-medium">
        <ArrowRight className="w-4 h-4" />
        العودة للحزم
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1F2F4A] via-[#253756] to-[#1a2940] rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#6FA65A]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-[#6FA65A]/20 rounded-2xl flex items-center justify-center shrink-0 border border-[#6FA65A]/30">
                <Package className="w-8 h-8 text-[#6FA65A]" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{pkg.title}</h1>
                <p className="text-slate-300 text-sm leading-relaxed">{pkg.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {pkg.files?.length || 0} ملف
                  </span>
                  <span className="bg-[#6FA65A]/20 px-3 py-1 rounded-full text-xs font-bold text-[#6FA65A]">
                    {isFree ? 'مجاني' : `${pkg.price} ج.م`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* File Preview */}
          <AnimatePresence>
            {previewFileId && previewFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1F2F4A] text-sm">{previewFile.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewFileId(null)}
                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div
                  className="relative bg-slate-900"
                >
                  
                  <iframe
                    ref={iframeRef}
                    src={`/api/packages/${id}/files/${previewFileId}/preview`}
                    className="w-full border-0 bg-white"
                    style={{ height: '75vh', pointerEvents: 'auto' }}
                    title={previewFile.title}
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Files List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#1F2F4A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6FA65A]" />
                محتويات الحزمة
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {pkg.files?.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">لا توجد ملفات في هذه الحزمة حالياً</p>
                </div>
              )}
              {pkg.files?.map((file: any, i: number) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${previewFileId === file.id ? 'bg-[#6FA65A]/5 border-r-4 border-[#6FA65A]' : ''}`}
                  onClick={() => setPreviewFileId(previewFileId === file.id ? null : file.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${previewFileId === file.id ? 'bg-[#6FA65A] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#6FA65A]/10 group-hover:text-[#6FA65A]'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1F2F4A] text-sm group-hover:text-[#6FA65A] transition-colors">{file.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{file.fileName}</p>
                    </div>
                  </div>
                  <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewFileId === file.id ? 'bg-[#6FA65A] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-[#6FA65A] group-hover:text-white'}`}>
                    <Eye className="w-3.5 h-3.5" />
                    {previewFileId === file.id ? 'قيد العرض' : 'معاينة'}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar — Purchase & Download */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 sticky top-24"
          >
            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-3xl font-black text-[#1F2F4A] mb-1">
                {isFree ? 'مجاني' : `${pkg.price} ج.م`}
              </div>
              <p className="text-xs text-slate-400">سعر تحميل الحزمة كاملة</p>
            </div>

            {/* Status */}
            {hasPurchased ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-emerald-700 text-sm">تم تأكيد الدفع</p>
                  <p className="text-xs text-emerald-600 mt-1">يمكنك تحميل جميع الملفات</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-[#6FA65A] hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg shadow-[#6FA65A]/20"
                >
                  <Download className="w-5 h-5" />
                  تحميل الحزمة كاملة
                </button>
              </div>
            ) : isPending ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                  <p className="font-bold text-amber-700 text-sm">قيد التحقق</p>
                  <p className="text-xs text-amber-600 mt-1">طلبك قيد المراجعة من الإدارة — سيتم إشعارك عند الموافقة</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldAlert className="w-4 h-4" />
                    <span>لا تقلق، سيتم مراجعة طلبك في أقرب وقت</span>
                  </div>
                </div>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-700 text-sm">تم إرسال طلبك بنجاح!</p>
                <p className="text-xs text-emerald-600 mt-1">سيتم مراجعة الدفع وتفعيل الحزمة في أقرب وقت</p>
              </div>
            ) : !showPayment ? (
              <div className="space-y-4">
                {!isFree && (
                  <>
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-sm text-slate-600">عدد الملفات</span>
                      <span className="font-bold text-[#1F2F4A]">{pkg.files?.length || 0} ملف</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <Eye className="w-4 h-4" />
                        يمكنك معاينة جميع الملفات مجاناً
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Download className="w-4 h-4" />
                        التحميل يتطلب شراء الحزمة
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) {
                          alert("يرجى تسجيل الدخول أولاً");
                          return;
                        }
                        setShowPayment(true);
                      }}
                      className="w-full bg-[#1F2F4A] hover:bg-[#2a3f63] text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
                    >
                      <Lock className="w-5 h-5" />
                      شراء الحزمة
                    </button>
                  </>
                )}
              </div>
            ) : !paymentMethod ? (
              <div className="space-y-4">
                <h3 className="font-bold text-[#1F2F4A] text-center mb-2">اختر طريقة الدفع</h3>

                {/* Vodafone Cash */}
                <button
                  onClick={() => setPaymentMethod('VODAFONE_CASH')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-red-300 hover:bg-red-50/50 transition-all group"
                >
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                    <img src="/images/logos/vodafone-cash.png" alt="Vodafone Cash" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1F2F4A] text-sm">فودافون كاش</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">الدفع عبر فودافون كاش</div>
                  </div>
                </button>

                {/* InstaPay */}
                <button
                  onClick={() => setPaymentMethod('INSTAPAY')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                    <img src="/images/logos/instapay.png" alt="InstaPay" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1F2F4A] text-sm">إنستاباي</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">الدفع عبر إنستاباي</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium py-2 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Payment Instructions */}
                <div className={`rounded-2xl p-4 border-2 ${paymentMethod === 'VODAFONE_CASH' ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {paymentMethod === 'VODAFONE_CASH' ? (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vodafone_icon.svg/1024px-Vodafone_icon.svg.png" alt="Vodafone" className="w-8 h-8 object-contain" />
                    ) : (
                      <CreditCard className="w-8 h-8 text-purple-600" />
                    )}
                    <div>
                      <div className="font-bold text-[#1F2F4A] text-sm">
                        {paymentMethod === 'VODAFONE_CASH' ? 'فودافون كاش' : 'إنستاباي'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">
                      {paymentMethod === 'VODAFONE_CASH' ? 'حوّل المبلغ على الرقم' : 'حوّل المبلغ على حساب'}
                    </p>
                    <p className="font-black text-[#1F2F4A] text-lg tracking-wider" dir="ltr">
                      {paymentMethod === 'VODAFONE_CASH' ? '01032238095' : 'mustafasaleh97@instapay'}
                    </p>
                    <p className="text-xs font-bold text-[#6FA65A] mt-1">المبلغ: {pkg.price} ج.م</p>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block mr-1">
                    <Phone className="w-3.5 h-3.5 inline ml-1" />
                    رقم الموبايل المحوّل منه
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={e => setPayerPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 focus:border-[#6FA65A]"
                    dir="ltr"
                  />
                </div>

                {paymentStatus === 'error' && (
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold text-center border border-rose-100">
                    حدث خطأ — حاول مرة أخرى
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={paymentStatus === 'loading' || !payerPhone.trim()}
                  className="w-full bg-[#6FA65A] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
                >
                  {paymentStatus === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      تأكيد الدفع
                    </>
                  )}
                </button>

                <button
                  onClick={() => { setPaymentMethod(null); setPayerPhone(''); setPaymentStatus('idle'); }}
                  className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium py-2 transition-colors"
                >
                  ← تغيير طريقة الدفع
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
