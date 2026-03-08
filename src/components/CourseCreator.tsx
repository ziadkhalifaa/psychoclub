import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Check, Upload, BookOpen,
    Layers, Wallet, Plus, Trash2, Video, FileText, Image as ImageIcon, Sparkles, Shield, Link
} from 'lucide-react';

interface Lesson {
    id?: string;
    title: string;
    type: string;
    resourceUrl: string;
    duration: string;
    content: string;
}

interface CourseForm {
    title: string;
    description: string;
    price: string;
    isFree: boolean;
    duration: string;
    category: string;
    level: string;
    thumbnail: string;
    lessons: Lesson[];
    whatYouLearn: string;
    requirements: string;
}

interface CourseCreatorProps {
    onCancel: () => void;
    onSubmit: (form: CourseForm) => Promise<void>;
    handleFileUpload: (file: File) => Promise<string | null>;
    initialData?: Partial<CourseForm>;
}

const STEPS = [
    { id: 'identity', title: 'هوية الكورس', icon: BookOpen },
    { id: 'content', title: 'الوصف والتفاصيل', icon: Layers },
    { id: 'curriculum', title: 'المنهج والدروس', icon: Sparkles },
    { id: 'pricing', title: 'التسعير والنشر', icon: Wallet },
];

export function CourseCreator({ onCancel, onSubmit, handleFileUpload, initialData }: CourseCreatorProps) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<CourseForm>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price?.toString() || '',
        isFree: initialData?.isFree || false,
        duration: initialData?.duration || '',
        category: initialData?.category || 'عام',
        level: initialData?.level || 'مبتدئ',
        thumbnail: initialData?.thumbnail || '',
        lessons: initialData?.lessons?.map(l => ({
            id: (l as any).id || undefined,
            title: l.title || '',
            type: l.type || 'video',
            resourceUrl: l.resourceUrl || '',
            duration: l.duration || '',
            content: l.content || '',
        })) || [{ title: '', type: 'video', resourceUrl: '', duration: '', content: '' }],
        whatYouLearn: (initialData as any)?.whatYouLearn
            ? (initialData as any).whatYouLearn.split('|').join('\n')
            : '',
        requirements: (initialData as any)?.requirements
            ? (initialData as any).requirements.split('|').join('\n')
            : '',
    });

    const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep(s => Math.max(s - 1, 0));

    const handleLessonChange = (i: number, f: string, v: string) => {
        const l = [...form.lessons];
        l[i] = { ...l[i], [f]: v };
        setForm({ ...form, lessons: l });
    };

    const addLesson = () => {
        setForm({ ...form, lessons: [...form.lessons, { id: undefined, title: '', type: 'video', resourceUrl: '', duration: '', content: '' }] });
    };

    const removeLesson = (i: number) => {
        setForm({ ...form, lessons: form.lessons.filter((_, idx) => idx !== i) });
    };

    return (
        <div className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-2xl overflow-hidden max-w-6xl mx-auto relative">
            <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent via-[#6FA65A] to-transparent opacity-50" />

            {/* Header */}
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center relative z-10 bg-white/40">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-[#1F2F4A] shadow-2xl flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A] to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                        <BookOpen className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[#6FA65A] uppercase tracking-[0.3em] mb-1 italic">الأكاديمية العلمية</div>
                        <h2 className="text-4xl font-black text-[#1F2F4A] tracking-tighter">بناء تجربة تعليمية</h2>
                        <p className="text-slate-400 text-sm font-medium">خطوات بسيطة لتحويل خبرتك إلى منهج احترافي</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="px-8 py-3 rounded-2xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                >
                    إلغاء العملية
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[700px]">
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

                    <div className="pt-20">
                        <div className="p-6 bg-[#1F2F4A] rounded-[2rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/20 to-transparent" />
                            <Sparkles className="w-8 h-8 text-[#6FA65A] mb-2 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">نصيحة تقنية</p>
                            <p className="text-xs leading-relaxed font-bold italic">
                                " اجعل الدروس قصيرة ومكثفة لضمان أعلى معدل استيعاب لدى طلابك. "
                            </p>
                        </div>
                    </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <BookOpen className="w-3.5 h-3.5" /> العنوان الرئيسي
                                            </div>
                                            <input
                                                required type="text"
                                                value={form.title}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-[#6FA65A]/5 focus:border-[#6FA65A] outline-none transition-all font-black text-xl placeholder:text-slate-200"
                                                placeholder="اكتب عنواناً جذاباً..."
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Layers className="w-3.5 h-3.5" /> التخصص العلمي
                                            </div>
                                            <select
                                                value={form.category}
                                                onChange={e => setForm({ ...form, category: e.target.value })}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-black text-lg appearance-none cursor-pointer"
                                            >
                                                <option value="عام">تخصص عام</option>
                                                <option value="علاج معرفي سلوكي">العلاج المعرفي السلوكي (CBT)</option>
                                                <option value="تحليل نفسي">التحليل النفسي العميق</option>
                                                <option value="أطفال ومراهقين">الاضطرابات النمائية والأطفال</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المستوى الدراسي المستهدف</div>
                                        <div className="grid grid-cols-3 gap-6">
                                            {['مبتدئ', 'متوسط', 'متقدم'].map(l => (
                                                <button
                                                    key={l}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, level: l })}
                                                    className={`py-5 rounded-[2rem] text-sm font-black transition-all border-2 relative overflow-hidden group ${form.level === l ? 'bg-[#1F2F4A] border-[#1F2F4A] text-white shadow-2xl' : 'bg-white border-slate-100 text-slate-400 hover:border-[#6FA65A]/30 hover:bg-emerald-50'
                                                        }`}
                                                >
                                                    {form.level === l && <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-[#6FA65A]" />}
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">غلاف الدورة (البوستر)</div>
                                        <div className="relative group">
                                            <div className={`w-full h-80 rounded-[3rem] border-4 border-dashed transition-all overflow-hidden relative flex flex-col items-center justify-center p-8 ${form.thumbnail ? 'border-[#6FA65A]/50 bg-white' : 'border-slate-100 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-[#6FA65A]/20'}`}>
                                                {form.thumbnail ? (
                                                    <>
                                                        <img src={form.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" alt="" />
                                                        <div className="relative z-10 flex flex-col items-center">
                                                            <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#6FA65A] mb-4">
                                                                <Check className="w-8 h-8" />
                                                            </div>
                                                            <span className="bg-[#1F2F4A] text-white px-6 py-2 rounded-xl text-xs font-black shadow-xl">تغيير الصورة</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-16 h-16 text-slate-200 mb-6" />
                                                        <p className="text-slate-400 font-bold mb-8">اسحب الصورة هنا أو اضغط للرفع</p>
                                                        <span className="bg-[#6FA65A] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">اختر ملف الصورة</span>
                                                    </>
                                                )}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async e => {
                                                    if (e.target.files?.[0]) {
                                                        const url = await handleFileUpload(e.target.files[0]);
                                                        if (url) setForm({ ...form, thumbnail: url });
                                                    }
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                                    <div className="lg:col-span-3 space-y-8 min-w-0">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وصف المنهج والشرح (Markdown مدعوم)</div>
                                            <textarea
                                                required rows={8}
                                                value={form.description}
                                                onChange={e => setForm({ ...form, description: e.target.value })}
                                                className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[3rem] focus:bg-white focus:ring-4 focus:ring-[#6FA65A]/5 outline-none font-medium text-lg leading-[2] transition-all scrollbar-hide min-w-0"
                                                placeholder="ابدأ بكتابة مقدمة محفزة وشرح تفصيلي لما سيتم تناوله..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-w-0">
                                            <div className="space-y-4 min-w-0">
                                                <div className="text-[10px] font-black text-[#6FA65A] uppercase tracking-widest flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5" /> مكتسبات الدورة
                                                </div>
                                                <textarea
                                                    rows={5}
                                                    value={form.whatYouLearn}
                                                    onChange={e => setForm({ ...form, whatYouLearn: e.target.value })}
                                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-[#6FA65A]/5 outline-none font-medium text-sm leading-relaxed transition-all min-w-0"
                                                    placeholder="اكتب كل مكتسب في سطر منفصل...
إتقان المبادئ الإكلينيكية
تطبيق بروتوكولات العلاج"
                                                />
                                                <p className="text-[9px] text-slate-300 font-bold">كل سطر = عنصر مستقل في القائمة</p>
                                            </div>
                                            <div className="space-y-4 min-w-0">
                                                <div className="text-[10px] font-black text-[#1F2F4A] uppercase tracking-widest flex items-center gap-2">
                                                    <Shield className="w-3.5 h-3.5" /> المهارات المطلوبة
                                                </div>
                                                <textarea
                                                    rows={5}
                                                    value={form.requirements}
                                                    onChange={e => setForm({ ...form, requirements: e.target.value })}
                                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-[#6FA65A]/5 outline-none font-medium text-sm leading-relaxed transition-all min-w-0"
                                                    placeholder="اكتب كل متطلب في سطر منفصل...
خلفية علمية أساسية
الالتزام بمواعيد التدريب"
                                                />
                                                <p className="text-[9px] text-slate-300 font-bold">كل سطر = عنصر مستقل في القائمة</p>
                                            </div>
                                        </div>
                                    </div>
                                    <aside className="lg:col-span-1 space-y-6 min-w-0">
                                        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                                            <div className="text-[10px] font-black text-[#6FA65A] uppercase tracking-widest mb-6 border-b border-emerald-100 pb-2">الجدول الزمني</div>
                                            <div className="space-y-4">
                                                <p className="text-xs font-bold text-slate-500">مدة الدورة الإجمالية</p>
                                                <input
                                                    required type="text"
                                                    value={form.duration}
                                                    onChange={e => setForm({ ...form, duration: e.target.value })}
                                                    className="w-full px-6 py-4 bg-white border border-emerald-100 rounded-2xl text-center font-black text-xl text-[#1F2F4A] shadow-sm min-w-0 inline-block overflow-hidden"
                                                    placeholder="12 ساعة"
                                                />
                                            </div>
                                        </div>
                                    </aside>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10">
                                    <header className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-3xl font-black text-[#1F2F4A] tracking-tighter">وحدات المنهاج</h3>
                                            <p className="text-slate-400 text-sm font-medium mt-1">قم بترتيب المحتوى العلمي الخاص بك</p>
                                        </div>
                                        <button type="button" onClick={addLesson} className="flex items-center gap-3 bg-[#6FA65A] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                            <Plus className="w-5 h-5" /> إضافة وحدة جديدة
                                        </button>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                        {form.lessons.map((lesson, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500"
                                            >
                                                <div className="absolute top-8 left-8 flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-100">#{String(i + 1).padStart(2, '0')}</div>
                                                    {form.lessons.length > 1 && (
                                                        <button type="button" onClick={() => removeLesson(i)} className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                                                    <div className="lg:col-span-3 space-y-6">
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">عنوان الوحدة</p>
                                                            <input required type="text" value={lesson.title} onChange={e => handleLessonChange(i, 'title', e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl font-black text-lg focus:bg-white focus:border-[#6FA65A]/30 outline-none transition-all" placeholder="مقدمة في..." />
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-2 space-y-6">
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">نمط المحتوى</p>
                                                            <div className="flex gap-2">
                                                                {[
                                                                    { id: 'video', icon: Video, label: 'فيديو' },
                                                                    { id: 'pdf', icon: FileText, label: 'PDF' },
                                                                    { id: 'text', icon: BookOpen, label: 'نقال' }
                                                                ].map(type => (
                                                                    <button
                                                                        key={type.id}
                                                                        type="button"
                                                                        onClick={() => handleLessonChange(i, 'type', type.id)}
                                                                        className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${lesson.type === type.id ? 'bg-[#1F2F4A] border-[#1F2F4A] text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}
                                                                    >
                                                                        <type.icon className="w-4 h-4" />
                                                                        <span className="text-[8px] font-bold uppercase">{type.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-12">
                                                        {lesson.type !== 'text' ? (
                                                            <div className="space-y-4">
                                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">رابط المصدر السحابي</p>
                                                                <div className="relative group/link">
                                                                    <Link className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/link:text-[#6FA65A] transition-colors" />
                                                                    <input required type="text" value={lesson.resourceUrl} onChange={e => handleLessonChange(i, 'resourceUrl', e.target.value)} className="w-full pr-12 pl-20 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-mono outline-none focus:bg-white transition-all" placeholder="https://..." />
                                                                    <label className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#1F2F4A] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-[#6FA65A] transition-colors shadow-lg">
                                                                        إرفاق ملف
                                                                        <input type="file" className="hidden" onChange={async e => {
                                                                            if (e.target.files?.[0]) {
                                                                                const url = await handleFileUpload(e.target.files[0]);
                                                                                if (url) handleLessonChange(i, 'resourceUrl', url);
                                                                            }
                                                                        }} />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <textarea rows={4} value={lesson.content} onChange={e => handleLessonChange(i, 'content', e.target.value)} className="w-full p-8 bg-slate-50 border border-slate-50 rounded-[2rem] text-sm leading-relaxed outline-none focus:bg-white transition-all font-medium" placeholder="اكتب المحتوى النصي هنا..." />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="max-w-2xl mx-auto space-y-16 py-10">
                                    <div className="text-center space-y-4">
                                        <h3 className="text-4xl font-black text-[#1F2F4A] tracking-tighter">التسعير وسياسة النشر</h3>
                                        <p className="text-slate-400 font-medium">خطوتك الأخيرة لإطلاق الدورة في ساحة التدريب</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isFree: false })}
                                            className={`p-10 rounded-[3rem] border-4 transition-all text-right relative overflow-hidden group ${!form.isFree ? 'border-[#1F2F4A] bg-[#1F2F4A] text-white shadow-2xl' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-[#1F2F4A]/20'}`}
                                        >
                                            <Wallet className="w-12 h-12 mb-6" />
                                            <h4 className="text-2xl font-black mb-2">دورة مدفوعة</h4>
                                            <p className="text-xs font-medium opacity-60 italic">استثمار مالي مقابل المعلمة العلمية</p>
                                            {!form.isFree && <Check className="absolute top-8 left-8 w-8 h-8 text-[#6FA65A]" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isFree: true, price: '0' })}
                                            className={`p-10 rounded-[3rem] border-4 transition-all text-right relative overflow-hidden group ${form.isFree ? 'border-[#1F2F4A] bg-[#1F2F4A] text-white shadow-2xl' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-[#1F2F4A]/20'}`}
                                        >
                                            <Sparkles className="w-12 h-12 mb-6" />
                                            <h4 className="text-2xl font-black mb-2">دورة مجانية</h4>
                                            <p className="text-xs font-medium opacity-60 italic">محتوى متاح للجميع لنشر العلم</p>
                                            {form.isFree && <Check className="absolute top-8 left-8 w-8 h-8 text-[#6FA65A]" />}
                                        </button>
                                    </div>

                                    {!form.isFree && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 text-center space-y-8 shadow-inner"
                                        >
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">حدد القيمة المالية (ج.م)</p>
                                            <div className="relative inline-block">
                                                <input
                                                    type="number" value={form.price}
                                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                                    className="bg-transparent border-b-8 border-[#6FA65A] px-10 py-4 text-8xl font-black text-center text-[#1F2F4A] outline-none w-full max-w-sm"
                                                    placeholder="000"
                                                />
                                                <div className="absolute top-0 right-[-60px] text-2xl font-black text-slate-200">EGP</div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="bg-[#1F2F4A]/5 p-8 rounded-[2.5rem] border border-[#1F2F4A]/10 flex items-start gap-6 relative overflow-hidden italic">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0">
                                            <Shield className="w-7 h-7 text-[#6FA65A]" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-[#1F2F4A]">مادة علمية موثقة</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                " بموافقتك على نشر هذه الدورة، فإنك تقر بملكيتك الفكرية للمادة العلمية ومسؤوليتك الإكلينيكية الكاملة عما يرد فيها من معلومات وتدريبات. "
                                            </p>
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
                            استمر للأمام <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onSubmit(form)}
                            className="bg-[#6FA65A] hover:bg-emerald-600 text-white px-20 py-5 rounded-[2.25rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 animate-pulse-slow"
                        >
                            إطلاق الدورة الآن <div className="p-1 bg-white rounded-full text-[#6FA65A]"><Check className="w-4 h-4" /></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
