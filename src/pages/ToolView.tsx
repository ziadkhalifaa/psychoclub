import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Download, Printer, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function ToolView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { data: tool, isLoading } = useQuery({
    queryKey: ['tool', id],
    queryFn: () => fetch('/api/tools').then(res => res.json()).then(data => data.find((t: any) => t.id === id))
  });

  const { data: myPurchases } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: () => fetch('/api/purchases/my').then(res => res.ok ? res.json() : []),
    enabled: !!user
  });

  if (isLoading) return <div className="p-24 text-center">جاري التحميل...</div>;
  if (!tool) return <div className="p-24 text-center">لم يتم العثور على الأداة</div>;

  const toolPurchase = myPurchases?.find((p: any) => p.itemId === id && p.type === 'TOOL');
  const hasPurchased = user?.role === 'ADMIN' || toolPurchase?.status === 'APPROVED';
  const isPending = toolPurchase?.status === 'PENDING';

  const handleManualCheckout = async (method: string) => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }
    setPaymentStatus('loading');
    try {
      const res = await fetch('/api/checkout/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, type: 'TOOL', paymentMethod: method })
      });
      if (res.ok) {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('error');
      }
    } catch {
      setPaymentStatus('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Link to="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#6FA65A] transition-colors">
        <ArrowRight className="w-4 h-4" />
        العودة للأدوات
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[80vh] relative">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#1F2F4A]">{tool.title}</h1>
            <p className="text-sm text-slate-500">{tool.type}</p>
          </div>

          <div className="flex gap-3">
            <button
              disabled={!hasPurchased}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button
              disabled={!hasPurchased || !tool.fileKey}
              onClick={() => {
                if (tool.fileKey) window.open(tool.fileKey, '_blank');
              }}
              className="bg-[#6FA65A] hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" />
              {tool.type === 'HTML' ? 'فتح الأداة' : 'تحميل الملف'}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center relative">
          {/* Document Content */}
          <div className={`bg-white w-full max-w-3xl min-h-full shadow-lg p-12 transition-all ${!hasPurchased ? 'blur-sm select-none overflow-hidden' : ''}`}>

            {hasPurchased && tool.fileKey && tool.fileKey.endsWith('.pdf') ? (
              <iframe
                src={tool.fileKey}
                className="w-full h-[800px] border-0 rounded-xl"
                title={tool.title}
              />
            ) : hasPurchased && tool.fileKey && tool.fileKey.endsWith('.html') ? (
              <iframe
                src={tool.fileKey}
                className="w-full h-[800px] border-0 rounded-xl bg-white"
                title={tool.title}
              />
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">{tool.title}</h2>
                  <div className="w-24 h-1 bg-[#6FA65A] mx-auto" />
                </div>

                <div className="space-y-8 pointer-events-none">
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="border-b-2 border-slate-200 pb-2">
                      <span className="text-slate-500 text-sm font-bold ml-2">الاسم:</span>
                      <span className="text-slate-800">..................................................</span>
                    </div>
                    <div className="border-b-2 border-slate-200 pb-2">
                      <span className="text-slate-500 text-sm font-bold ml-2">التاريخ:</span>
                      <span className="text-slate-800">..................................................</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {tool.description}
                    </p>

                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
                          {i}
                        </div>
                        <div className="flex-1 space-y-4">
                          <p className="text-slate-700 font-medium h-4 bg-slate-200 rounded w-3/4 mb-4"></p>
                          <div className="flex justify-between gap-4">
                            {['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'].map(option => (
                              <label key={option} className="flex flex-col items-center gap-2 cursor-pointer">
                                <input type="radio" disabled={!hasPurchased} name={`q${i}`} className="w-4 h-4 text-[#6FA65A] focus:ring-[#6FA65A] disabled:opacity-50" />
                                <span className="text-xs text-slate-500">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Purchase Overlay */}
          {!hasPurchased && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center border border-white/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-[#1F2F4A]" />
                </div>

                <h3 className="text-2xl font-bold text-[#1F2F4A] mb-2">أداة مقفلة</h3>
                <p className="text-slate-600 mb-6">قم بشراء الأداة للوصول إلى المحتوى الكامل وإمكانية الطباعة والتحميل.</p>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold text-slate-700">سعر التحميل:</span>
                    <span className="text-xl font-bold text-[#6FA65A]">{tool.priceDownload || tool.priceView || 150} ج.م</span>
                  </div>

                  {!showPaymentOptions ? (
                    <button onClick={() => setShowPaymentOptions(true)} className="w-full bg-[#1F2F4A] text-white py-3 rounded-xl font-bold hover:bg-[#2a3f63] transition-colors">
                      {isPending ? 'الطلب قيد المراجعة' : 'شراء الآن'}
                    </button>
                  ) : paymentStatus === 'success' || isPending ? (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                      تم استلام طلبك! يرجى التواصل عبر واتساب لتأكيد الدفع وتفعيل الأداة فوراً.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button onClick={() => handleManualCheckout('VODAFONE_CASH')} className="w-full bg-red-50 text-red-700 py-2 rounded-xl text-sm font-bold border border-red-200 hover:bg-red-100">فوادفون كاش</button>
                      <button onClick={() => handleManualCheckout('INSTAPAY')} className="w-full bg-purple-50 text-purple-700 py-2 rounded-xl text-sm font-bold border border-purple-200 hover:bg-purple-100">إنستاباي</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
