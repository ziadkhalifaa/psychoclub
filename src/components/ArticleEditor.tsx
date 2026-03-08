import React, { useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Check, Upload, FileText,
    Layers, Sparkles, Image as ImageIcon, Tag, Type, AlignLeft
} from 'lucide-react';

interface ArticleForm {
    title: string;
    excerpt: string;
    coverImage: string;
    contentRichText: string;
    category: string;
    tags: string;
}

interface ArticleEditorProps {
    onCancel: () => void;
    onSubmit: (form: ArticleForm) => Promise<void>;
    handleFileUpload: (file: File) => Promise<string | null>;
    initialData?: Partial<ArticleForm>;
}

const STEPS = [
    { id: 'identity', title: 'هوية المقال', icon: Type },
    { id: 'content', title: 'المحتوى العلمي', icon: AlignLeft },
    { id: 'media', title: 'الوسائط والغلاف', icon: ImageIcon },
    { id: 'publish', title: 'النشر والوسوم', icon: Sparkles },
];

export function ArticleEditor({ onCancel, onSubmit, handleFileUpload, initialData }: ArticleEditorProps) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<ArticleForm>({
        title: initialData?.title || '',
        excerpt: initialData?.excerpt || '',
        coverImage: initialData?.coverImage || '',
        contentRichText: initialData?.contentRichText || '',
        category: initialData?.category || 'مقالات عامة',
        tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : (initialData?.tags || '')
    });

    const [availableCategories, setAvailableCategories] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/article-categories').then(res => res.json()).then(data => {
            const cats = Array.isArray(data) ? data : [];
            setAvailableCategories(cats);
            if (cats.length > 0 && (!initialData?.category || initialData.category === 'مقالات عامة')) {
                setForm(prev => ({ ...prev, category: cats[0].name }));
            }
        });
        fetch('/api/article-tags').then(res => res.json()).then(data => setAvailableTags(Array.isArray(data) ? data : []));
    }, [initialData]);

    const editorConfig = React.useMemo(() => ({
        readonly: false,
        placeholder: "ابدأ بكتابة مقالك هنا. يمكنك الحفاظ على التنسيق وإضافة الصور، الفيديوهات أو أي وسائط أخرى...",
        enableDragAndDropFileToEditor: true,
        height: 500,
        direction: 'rtl',
        language: 'ar',
        imageDefaultWidth: 300,
        useSplitMode: true,
        allowInlineStyles: true,
        resizer: {
            showSize: true,
            hideSizeTimeout: 1000,
        },
        uploader: {
            insertImageAsBase64URI: false,
            url: '/api/upload',
            format: 'json',
            method: 'POST',
            buildData: function (data: any) {
                const formData = new FormData();
                if (data.getAll) {
                    const files = data.getAll('files[0]');
                    if (files.length > 0) {
                        formData.append('file', files[0]);
                    }
                }
                return formData;
            },
            isSuccess: function (resp: any) {
                return !resp.error && !!resp.url;
            },
            process: function (resp: any) {
                return {
                    files: resp.url ? [resp.url] : [],
                    path: resp.url || '',
                    baseurl: resp.url ? '' : '',
                    error: resp.error ? 1 : 0,
                    msg: resp.error || 'تم الرفع بنجاح'
                };
            },
            defaultHandlerSuccess: function (data: any) {
                if (data.files && data.files.length) {
                    this.s.insertImage(data.baseurl + data.files[0], null, 300);
                }
            }
        },
        buttons: [
            'source', '|',
            'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'image', 'video', 'table', 'link', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'symbol', 'fullsize', 'print'
        ]
    }), []);

    const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-2xl overflow-hidden max-w-6xl mx-auto relative">
            <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent via-[#1F2F4A] to-transparent opacity-50" />

            {/* Header */}
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center relative z-10 bg-white/40">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-[#1F2F4A] shadow-2xl flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A] to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                        <FileText className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[#6FA65A] uppercase tracking-[0.3em] mb-1 italic">المحرر العلمي</div>
                        <h2 className="text-4xl font-black text-[#1F2F4A] tracking-tighter">كتابة مقال جديد</h2>
                        <p className="text-slate-400 text-sm font-medium">شارك معرفتك الإكلينيكية مع المجتمع</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="px-8 py-3 rounded-2xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                >
                    إلغاء المسودة
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[600px]">
                {/* Vertical Stepper Navigation */}
                <aside className="lg:col-span-1 border-l border-slate-100 bg-slate-50/30 p-10 space-y-8 relative">
                    <div className="absolute top-10 left-10 w-px h-[calc(100%-80px)] bg-slate-100" />

                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = i === step;
                        const isCompleted = i < step;

                        return (
                            <button
                                key={s.id}
                                onClick={() => i <= step && setStep(i)}
                                className={`relative z-10 flex items-center gap-6 w-full text-right transition-all duration-500 group ${isActive ? 'translate-x-[-8px]' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 border-4 ${isActive ? 'bg-[#1F2F4A] border-white text-white shadow-2xl scale-125' :
                                    isCompleted ? 'bg-[#6FA65A] border-white text-white' :
                                        'bg-white border-slate-100 text-slate-300'
                                    }`}>
                                    {isCompleted ? <Check className="w-5 h-5 font-black" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <span className={`text-[10px] block font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-[#6FA65A]' : 'text-slate-300'}`}>الخطوة {i + 1}</span>
                                    <span className={`text-sm font-black transition-colors ${isActive ? 'text-[#1F2F4A]' : 'text-slate-400'}`}>
                                        {s.title}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="absolute left-[-40px] w-2 h-2 rounded-full bg-[#6FA65A] shadow-[0_0_15px_#6FA65A]" />
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* Content Area */}
                <main className="lg:col-span-3 p-12 lg:p-16 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6, ease: "circOut" }}
                            className="space-y-12"
                        >
                            {step === 0 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Type className="w-3.5 h-3.5" /> عنوان المقال
                                        </div>
                                        <input
                                            required type="text"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-[#6FA65A]/5 focus:border-[#6FA65A] outline-none transition-all font-black text-2xl placeholder:text-slate-200"
                                            placeholder="اكتب عنواناً جذاباً لمقالك..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5" /> التصنيف العلمي
                                        </div>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-black text-lg appearance-none cursor-pointer"
                                        >
                                            {availableCategories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                            {availableCategories.length === 0 && <option value="مقالات عامة">مقالات عامة</option>}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ملخص المقال (Excerpt)</div>
                                        <textarea
                                            rows={3}
                                            value={form.excerpt}
                                            onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                            className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white transition-all font-medium text-lg"
                                            placeholder="اكتب ملخصاً قصيراً يظهر في صفحة المقالات..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المحتوى الكامل (يدعم التقنيات الغنية)</div>
                                        <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm bg-white jodit-wrapper-custom">
                                            <JoditEditor
                                                value={form.contentRichText}
                                                config={editorConfig}
                                                onBlur={newContent => setForm({ ...form, contentRichText: newContent })}
                                                onChange={() => { }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 text-center">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">صورة الغلاف (Cover Image)</div>
                                    <div className="relative group max-w-2xl mx-auto">
                                        <div className={`w-full h-96 rounded-[3.5rem] border-4 border-dashed transition-all overflow-hidden relative flex flex-col items-center justify-center p-8 ${form.coverImage ? 'border-[#6FA65A]/50 bg-white' : 'border-slate-100 bg-slate-50/50 hover:bg-[#1F2F4A]/5 hover:border-[#1F2F4A]/20'}`}>
                                            {form.coverImage ? (
                                                <>
                                                    <img src={form.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="bg-white text-[#1F2F4A] px-10 py-4 rounded-2xl text-sm font-black shadow-2xl">تغيير الصورة</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-20 h-20 text-slate-200 mb-6" />
                                                    <p className="text-slate-400 font-bold mb-8">اختر صورة غلاف احترافية لمقالك</p>
                                                    <span className="bg-[#1F2F4A] text-white px-10 py-5 rounded-3xl text-sm font-black shadow-xl active:scale-95 transition-all">ارفع صورة الغلاف</span>
                                                </>
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async e => {
                                                if (e.target.files?.[0]) {
                                                    const url = await handleFileUpload(e.target.files[0]);
                                                    if (url) setForm({ ...form, coverImage: url });
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="max-w-2xl mx-auto space-y-12">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> الوسوم (Tags)
                                        </div>
                                        <input
                                            type="text"
                                            value={form.tags}
                                            onChange={e => setForm({ ...form, tags: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold placeholder:text-slate-200"
                                            placeholder="فصل بين الوسوم بفواصل (مثلاً: علم النفس, علاج, اكتئاب)"
                                        />
                                        {availableTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {availableTags.map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
                                                            if (!currentTags.includes(tag.name)) {
                                                                setForm({ ...form, tags: currentTags.concat(tag.name).join(', ') });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-slate-100/50 hover:bg-[#6FA65A]/10 text-slate-500 hover:text-[#6FA65A] text-xs font-black rounded-lg transition-colors border border-slate-200/50 hover:border-[#6FA65A]/30"
                                                    >
                                                        + {tag.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-10 bg-[#1F2F4A] rounded-[3rem] text-white space-y-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#6FA65A]/20 to-transparent" />
                                        <div className="relative z-10 flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-[#6FA65A]" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black">جاهز للنشر؟</h4>
                                                <p className="text-slate-400 text-sm font-medium">تأكد من مراجعة المحتوى قبل إطلاقه للجمهور.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Footer Navigation */}
            <div className="bg-white/40 backdrop-blur-3xl px-12 py-10 border-t border-slate-100 flex justify-between items-center relative z-20">
                <button
                    onClick={prev} disabled={step === 0}
                    className={`flex items-center gap-4 px-10 py-5 rounded-[2.25rem] font-black text-sm uppercase tracking-widest transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 bg-white hover:bg-[#1F2F4A] hover:text-white shadow-xl active:scale-95'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" /> خطوة للخلف
                </button>

                <div className="flex gap-6">
                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={next}
                            className="bg-[#1F2F4A] hover:bg-[#6FA65A] text-white px-12 py-5 rounded-[2.25rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl active:scale-95"
                        >
                            التالي <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onSubmit(form)}
                            className="bg-[#6FA65A] hover:bg-emerald-600 text-white px-20 py-5 rounded-[2.25rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95"
                        >
                            نشر المقال الآن <div className="p-1 bg-white rounded-full text-[#6FA65A]"><Check className="w-4 h-4" /></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
