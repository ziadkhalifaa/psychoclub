import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp, Share2, User, Search, PlusCircle, X, Brain, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('latest');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const res = await fetch('/api/forum/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  // Fetch Posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory, search, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({
        categoryId: selectedCategory,
        search,
        sort: activeTab
      });
      const res = await fetch(`/api/forum/posts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    }
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/forum/posts/${postId}/like`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      if (selectedPost) queryClient.invalidateQueries({ queryKey: ['forum-post', selectedPost.id] });
    }
  });

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في النقاشات..."
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 text-sm"
            />
          </div>
          {user ? (
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="bg-[#6FA65A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-[#6FA65A]/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">نقاش جديد</span>
            </button>
          ) : (
            <div className="hidden sm:block text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-dashed border-slate-200">
              سجل دخول للمشاركة
            </div>
          )}
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
                className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === tab.id ? 'text-[#6FA65A]' : 'text-slate-500 hover:text-slate-700'
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse h-40" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">لا توجد نقاشات حالياً</p>
              </div>
            ) : posts.map((post: any) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#6FA65A]/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-[#6FA65A] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner">
                    {post.author.avatar ? (
                      <img src={post.author.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm text-[#1F2F4A] hover:text-[#6FA65A] transition-colors">{post.author.name}</span>
                      {post.author.role === 'DOCTOR' && (
                        <span className="bg-[#6FA65A]/10 text-[#6FA65A] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">مختص</span>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold">• {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</span>
                    </div>
                    <h3 className="text-xl font-black text-[#1F2F4A] mb-3 group-hover:text-[#6FA65A] transition-colors">{post.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 font-medium">{post.body}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100">
                          {post.category.name}
                        </span>
                        <span className="text-[10px] text-slate-300 font-bold">{post.viewCount || 0} مشاهدة</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-xs font-black group-hover:bg-[#6FA65A]/5 transition-colors">
                          <MessageSquare className="w-4 h-4 text-slate-300 group-hover:text-[#6FA65A]" />
                          <span>{post._count.comments}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) return toast.error('يرجى تسجيل الدخول أولاً');
                            likeMutation.mutate(post.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-xs font-black hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post._count.likes}</span>
                        </button>
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
            <h3 className="font-black text-[#1F2F4A] mb-4">التصنيفات الشائعة</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-right px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === 'all' ? 'bg-[#6FA65A] text-white shadow-lg shadow-[#6FA65A]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#6FA65A]'
                  }`}
              >
                الكل
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-right px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-[#6FA65A] text-white shadow-lg shadow-[#6FA65A]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#6FA65A]'
                    }`}
                >
                  {cat.name}
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
      {/* Modal - Details and Create (impl next tool call to avoid size limits) */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        categories={categories}
      />

      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────

function NewPostModal({ isOpen, onClose, categories }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: '', body: '', categoryId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      toast.success('تم نشر النقاش بنجاح');
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      onClose();
      setFormData({ title: '', body: '', categoryId: '' });
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1F2F4A]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-[#1F2F4A]">بدء نقاش جديد</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><PlusCircle className="w-6 h-6 rotate-45" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">عنوان النقاش</label>
              <input
                type="text"
                placeholder="عن ماذا تود الحديث؟"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 font-bold"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">التصنيف</label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 font-bold appearance-none"
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">اختر تصنيفاً...</option>
                {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">المحتوى</label>
              <textarea
                rows={5}
                placeholder="اكتب تفاصيل سؤالك أو تجربتك هنا..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 font-medium resize-none"
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={mutation.isPending || !formData.title || !formData.body || !formData.categoryId}
            onClick={() => mutation.mutate(formData)}
            className="w-full bg-[#6FA65A] text-white py-5 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-[#6FA65A]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {mutation.isPending ? 'جاري النشر...' : 'نشر النقاش الآن'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PostDetailsModal({ post: initialPost, onClose }: any) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['forum-post', initialPost.id],
    queryFn: async () => {
      const res = await fetch(`/api/forum/posts/${initialPost.id}`);
      return res.json();
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });
      return res.json();
    },
    onSuccess: () => {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['forum-post', initialPost.id] });
    }
  });

  const activePost = post || initialPost;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center lg:p-4">
      <div className="absolute inset-0 bg-[#1F2F4A]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl h-full lg:h-[90vh] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              {activePost.author.avatar ? <img src={activePost.author.avatar} className="w-full h-full object-cover rounded-2xl" /> : <User className="text-slate-300" />}
            </div>
            <div>
              <h4 className="font-black text-[#1F2F4A]">{activePost.author.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(activePost.createdAt), { addSuffix: true, locale: ar })}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors text-slate-400"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-[#1F2F4A] leading-tight">{activePost.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">{activePost.body}</p>
            <div className="flex gap-2">
              <span className="bg-[#6FA65A]/10 text-[#6FA65A] px-4 py-2 rounded-xl text-xs font-black">{activePost.category.name}</span>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-black text-[#1F2F4A] flex items-center gap-3">
              التعليقات والمناقشات
              <span className="text-sm bg-slate-100 text-slate-400 px-3 py-1 rounded-full">{activePost.comments?.length || initialPost._count.comments}</span>
            </h3>

            <div className="space-y-6">
              {activePost.comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 shrink-0 flex items-center justify-center border border-slate-100">
                    {comment.author.avatar ? <img src={comment.author.avatar} className="w-full h-full object-cover rounded-xl" /> : <User className="text-slate-200 w-5 h-5" />}
                  </div>
                  <div className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-sm text-[#1F2F4A]">{comment.author.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          {user ? (
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="أضف تعليقك بصفتك مختص..."
                className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 font-bold"
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commentBody && commentMutation.mutate(commentBody)}
              />
              <button
                disabled={!commentBody || commentMutation.isPending}
                onClick={() => commentMutation.mutate(commentBody)}
                className="bg-[#1F2F4A] text-white px-8 rounded-2xl font-black hover:opacity-90 transition-all disabled:opacity-50"
              >
                ارسال
              </button>
            </div>
          ) : (
            <div className="text-center py-4 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-bold text-sm">يجب تسجيل الدخول للإضافة تعليق</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
