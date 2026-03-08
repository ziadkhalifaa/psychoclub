import { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, User, Search, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('latest');

  const discussions = [
    {
      id: 1,
      title: 'كيفية التعامل مع مقاومة المريض في الجلسات الأولى',
      author: 'د. سارة كمال',
      category: 'العلاج المعرفي السلوكي',
      replies: 12,
      likes: 45,
      time: 'منذ ساعتين',
      content: 'أواجه صعوبة مع مريض يظهر مقاومة شديدة في الجلسات الأولى، هل من نصائح للتعامل مع هذا الموقف؟'
    },
    {
      id: 2,
      title: 'أفضل المقاييس لتشخيص اضطراب القلق العام',
      author: 'أحمد محمد',
      category: 'التقييم والتشخيص',
      replies: 8,
      likes: 23,
      time: 'منذ 5 ساعات',
      content: 'ما هي أفضل المقاييس المعتمدة في البيئة العربية لتشخيص اضطراب القلق العام؟'
    },
    {
      id: 3,
      title: 'تحديثات بروتوكول علاج الإدمان 2024',
      author: 'د. أحمد محمود',
      category: 'علاج الإدمان',
      replies: 34,
      likes: 89,
      time: 'منذ يومين',
      content: 'نظرة عامة على أحدث التغييرات في بروتوكولات علاج الإدمان وكيفية تطبيقها في العيادة.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2F4A] mb-2">مجتمع الممارسين</h1>
          <p className="text-slate-500 text-sm">شارك خبراتك، اطرح أسئلتك، وتواصل مع زملائك في المجال</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث في النقاشات..." 
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 text-sm"
            />
          </div>
          <button className="bg-[#6FA65A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">نقاش جديد</span>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex gap-4 border-b border-slate-200">
            {[
              { id: 'latest', label: 'الأحدث' },
              { id: 'popular', label: 'الأكثر تفاعلاً' },
              { id: 'unanswered', label: 'بانتظار إجابة' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${
                  activeTab === tab.id ? 'text-[#6FA65A]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6FA65A] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {discussions.map(discussion => (
              <div key={discussion.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#1F2F4A]">{discussion.author}</span>
                      <span className="text-xs text-slate-400">• {discussion.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1F2F4A] mb-2">{discussion.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{discussion.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
                        {discussion.category}
                      </span>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-1 hover:text-[#6FA65A] transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>{discussion.replies}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-[#6FA65A] transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{discussion.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-[#6FA65A] transition-colors">
                          <Share2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#1F2F4A] mb-4">التصنيفات الشائعة</h3>
            <div className="space-y-2">
              {['العلاج المعرفي السلوكي', 'التقييم والتشخيص', 'علاج الإدمان', 'حالات إكلينيكية', 'أدوات ومقاييس'].map(cat => (
                <button key={cat} className="w-full text-right px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-[#6FA65A] transition-colors">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1F2F4A] to-slate-800 p-6 rounded-2xl text-white">
            <h3 className="font-bold mb-2">قواعد المجتمع</h3>
            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
              <li>احترام خصوصية المرضى وعدم ذكر أسماء</li>
              <li>الالتزام بالآداب المهنية في النقاش</li>
              <li>الاعتماد على المصادر العلمية الموثوقة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
