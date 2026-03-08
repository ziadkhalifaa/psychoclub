import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1F2F4A] mb-2">تم الدفع بنجاح!</h1>
        <p className="text-slate-500 mb-8">
          شكراً لك. لقد تم تأكيد عملية الدفع الخاصة بك بنجاح ويمكنك الآن الوصول إلى محتوى الدورة.
        </p>
        <Link 
          to="/profile" 
          className="block w-full bg-[#1F2F4A] text-white py-3 rounded-xl font-bold hover:bg-[#2a3f63] transition-colors"
        >
          الذهاب إلى دوراتي
        </Link>
      </div>
    </div>
  );
}
