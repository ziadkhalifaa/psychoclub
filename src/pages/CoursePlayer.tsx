import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlayCircle, FileText, CheckCircle, Clock, BookOpen,
    ArrowLeft, ArrowRight, Menu, X, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
import ScrollToTop from '../components/ScrollToTop';

// Fix version mismatch: The installed API version is 5.4.296, we must force the worker to match this exactly.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

const getEmbedUrl = (url: string, type: string = 'video') => {
    if (!url || url === '#' || url.startsWith('data:')) return url;

    // For PDFs, append toolbar=0 to native viewer
    if (type === 'pdf') {
        if (!url.includes('#')) {
            return `${url}#toolbar=0&navpanes=0`;
        }
        return url;
    }

    try {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http')) {
            if (cleanUrl.startsWith('/')) return cleanUrl;
            return `/${cleanUrl}`;
        }

        const urlObj = new URL(cleanUrl);
        // YouTube
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            let videoId = urlObj.searchParams.get('v');
            if (!videoId && urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.split('/').pop() || null;
            }
            if (!videoId && urlObj.pathname.includes('/embed/')) {
                videoId = urlObj.pathname.split('/embed/').pop()?.split('?')[0] || null;
            }
            if (!videoId && urlObj.pathname.includes('/v/')) {
                videoId = urlObj.pathname.split('/v/').pop()?.split('?')[0] || null;
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&shlowinfo=0`;
        }
        // Vimeo
        if (urlObj.hostname.includes('vimeo.com')) {
            const videoId = urlObj.pathname.split('/').pop();
            if (videoId) return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0`;
        }
        return cleanUrl;
    } catch (e) {
        return url;
    }
};

const isDirectVideo = (url: string) => {
    if (!url || url === '#' || url.startsWith('data:')) return false;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) return false;
    return lowerUrl.includes('/uploads/') || lowerUrl.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
};

const PdfViewer = ({ url }: { url: string }) => {
    const [numPages, setNumPages] = useState<number>();
    const [loadError, setLoadError] = useState<string | null>(null);

    if (!url || url === '#') {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-[#1F2F4A]">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm mx-auto border border-slate-100 mt-24">
                    <FileText className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                    <p className="text-lg font-bold mb-2">تعذر تحميل المستند لأن الرابط غير صالح (بيانات تجريبية).</p>
                </div>
            </div>
        );
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center bg-slate-900 min-h-full p-8 overflow-y-auto w-full absolute inset-0 custom-scrollbar">
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                error={
                    <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm mx-auto border border-slate-100 mt-24">
                        <FileText className="w-16 h-16 mx-auto mb-6 text-rose-500/50" />
                        <p className="text-lg font-bold mb-2">تعذر تحميل المستند. قد يكون الملف غير موجود أو محمي بصلاحيات.</p>
                        {loadError && (
                            <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 text-left font-mono break-all line-clamp-3">
                                {loadError}
                            </div>
                        )}
                        <p className="text-xs text-slate-400 mt-4">رابط الملف: {url}</p>
                    </div>
                }
                className="flex flex-col items-center w-full max-w-4xl mx-auto"
            >
                {Array.from(new Array(numPages || 0), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        className="mb-8 rounded-xl overflow-hidden shadow-2xl transition-all"
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={Math.min(window.innerWidth - 64, 800)}
                    />
                ))}
            </Document>
        </div>
    );
};

export default function CoursePlayer() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Fetch course and progress
    const { data, isLoading, error } = useQuery({
        queryKey: ['course-learn', slug],
        queryFn: async () => {
            const res = await fetch(`/api/courses/${slug}/learn`);
            if (!res.ok) {
                if (res.status === 403 || res.status === 401) {
                    throw new Error('Unauthorized');
                }
                throw new Error('Failed to load course');
            }
            return res.json();
        },
        retry: false
    });

    const course = data?.course;
    const progressList = data?.progress || [];

    // Update Progress Mutation
    const updateProgress = useMutation({
        mutationFn: async ({ lessonId, completed }: { lessonId: string, completed: boolean }) => {
            const res = await fetch('/api/courses/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    lessonId,
                    completed
                })
            });
            if (!res.ok) throw new Error('Failed to update progress');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-learn', slug] });
        }
    });

    useEffect(() => {
        if (error?.message === 'Unauthorized') {
            navigate(`/courses/${slug}`);
        }
    }, [error, navigate, slug]);

    // Handle active lesson
    useEffect(() => {
        if (course?.lessons && course.lessons.length > 0 && !activeLessonId) {
            // Find first uncompleted lesson, or just first lesson
            const uncompleted = course.lessons.find((l: any) =>
                !progressList.some((p: any) => p.lessonId === l.id && p.completed)
            );
            setActiveLessonId(uncompleted?.id || course.lessons[0].id);
        }
    }, [course, activeLessonId, progressList]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">جاري التحميل...</div>;
    }

    if (!course) return null;

    const activeLessonRaw = course.lessons.find((l: any) => l.id === activeLessonId) || course.lessons[0];
    
    // CONTENT-AWARE DETECTION: Guess type based on URL if DB type is generic/wrong
    let detectedType = activeLessonRaw?.type?.toLowerCase().trim();
    const cleanUrl = activeLessonRaw?.resourceUrl?.replace(/\/+$/, '') || '';
    
    if (cleanUrl.toLowerCase().endsWith('.pdf')) detectedType = 'pdf';
    else if (cleanUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/)) detectedType = 'video';
    else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be') || cleanUrl.includes('vimeo.com')) detectedType = 'video';

    const activeLesson = { ...activeLessonRaw, type: detectedType, resourceUrl: cleanUrl };
    const activeLessonIndex = course.lessons.findIndex((l: any) => l.id === activeLessonId);
    const isCompleted = progressList.some((p: any) => p.lessonId === activeLesson?.id && p.completed);

    // Calculate overall progress
    const totalLessons = course.lessons.length;
    const completedLessons = progressList.filter((p: any) => p.completed).length;
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100) || 0;

    const handleNextLesson = () => {
        if (activeLessonIndex < course.lessons.length - 1) {
            setActiveLessonId(course.lessons[activeLessonIndex + 1].id);
        }
    };

    const handlePrevLesson = () => {
        if (activeLessonIndex > 0) {
            setActiveLessonId(course.lessons[activeLessonIndex - 1].id);
        }
    };

    const toggleComplete = () => {
        if (!activeLesson) return;
        updateProgress.mutate({
            lessonId: activeLesson.id,
            completed: !isCompleted
        });
    };

    return (
        <div className="flex bg-slate-50 fixed inset-0 z-[100]" dir="rtl">
            <ScrollToTop />
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1F2F4A]/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 320 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="relative h-full bg-white border-l border-slate-200 overflow-y-auto shrink-0 shadow-2xl lg:shadow-none transition-all duration-300"
                style={{ transformOrigin: 'right' }}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Link to={`/courses/${slug}`} className="flex items-center gap-2 text-slate-500 hover:text-[#1F2F4A] transition-colors text-sm font-bold group">
                            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            العودة للدورة
                        </Link>
                        <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h2 className="text-xl font-black text-[#1F2F4A] leading-tight mb-6">{course.title}</h2>

                    <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                            <span>نسبة الإنجاز</span>
                            <span className="text-[#6FA65A]">{progressPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                className="h-full bg-[#6FA65A]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">محتوى الدورة</h3>
                        {course.lessons.map((lesson: any, index: number) => {
                            const lessonCompleted = progressList.some((p: any) => p.lessonId === lesson.id && p.completed);
                            const isActive = activeLessonId === lesson.id;

                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => {
                                        setActiveLessonId(lesson.id);
                                        if (window.innerWidth < 1024) setSidebarOpen(false);
                                    }}
                                    className={`w-full text-right p-4 rounded-2xl flex gap-4 transition-all group ${isActive
                                        ? 'bg-[#1F2F4A] shadow-xl shadow-[#1F2F4A]/10'
                                        : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`mt-0.5 shrink-0 ${lessonCompleted
                                        ? 'text-[#6FA65A]'
                                        : isActive ? 'text-white/40' : 'text-slate-300 group-hover:text-[#1F2F4A]/50'
                                        }`}>
                                        {lessonCompleted ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isActive ? 'border-white/20 text-white/40' : 'border-slate-200 text-slate-300'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className={`text-sm font-bold leading-relaxed mb-1.5 line-clamp-2 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-[#1F2F4A]'
                                            }`}>
                                            {lesson.title}
                                        </h4>
                                        <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-400'
                                            }`}>
                                            <span className="flex items-center gap-1.5">
                                                {lesson.type === 'video' ? <PlayCircle className="w-3.5 h-3.5" /> :
                                                    lesson.type === 'text' ? <FileText className="w-3.5 h-3.5" /> :
                                                        <BookOpen className="w-3.5 h-3.5" />}
                                                {lesson.type}
                                            </span>
                                            {lesson.duration && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full opacity-50" />
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" /> {lesson.duration}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-full lg:max-w-[calc(100%-320px)] transition-all duration-300 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4 md:p-8">

                    <div className="flex items-center gap-4 mb-8">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2.5 bg-white text-slate-500 hover:text-[#1F2F4A] hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-200 lg:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-2xl font-black text-[#1F2F4A]">
                            {activeLesson?.title}
                        </h1>
                    </div>

                    <div className="bg-black rounded-3xl overflow-hidden aspect-video shadow-2xl relative mb-8">
                        {activeLesson?.type === 'video' ? (
                            activeLesson.resourceUrl && activeLesson.resourceUrl !== '#' ? (
                                isDirectVideo(activeLesson.resourceUrl) ? (
                                    <video
                                        key={activeLesson.id}
                                        src={activeLesson.resourceUrl}
                                        controls
                                        controlsList="nodownload"
                                        onContextMenu={(e) => e.preventDefault()}
                                        className="absolute inset-0 w-full h-full bg-black outline-none"
                                    />
                                ) : (
                                    <iframe
                                        key={activeLesson.id}
                                        src={getEmbedUrl(activeLesson.resourceUrl, 'video')}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                )
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
                                    <div className="text-center">
                                        <PlayCircle className="w-16 h-16 mx-auto mb-4 text-[#6FA65A]/50" />
                                        <p className="text-xl font-bold text-slate-300">محتوى الفيديو غير متوفر حالياً</p>
                                    </div>
                                </div>
                            )
                        ) : activeLesson?.type === 'pdf' ? (
                            <PdfViewer url={activeLesson.resourceUrl} />
                        ) : (
                            <div key={activeLesson?.id} className="absolute inset-0 bg-white p-8 overflow-y-auto prose prose-slate prose-lg max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: activeLesson?.content || activeLesson?.resourceUrl || '' }} />
                            </div>
                        )}
                    </div>

                    {/* Lesson Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6FA65A]/5 rounded-bl-[100%] pointer-events-none" />

                        <button
                            onClick={toggleComplete}
                            disabled={updateProgress.isPending}
                            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                                : 'bg-[#6FA65A] text-white hover:bg-[#5b8c49] shadow-lg shadow-emerald-500/20'
                                }`}
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    مكتمل
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    تحديد كمكتمل
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={handlePrevLesson}
                                disabled={activeLessonIndex === 0}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-[#1F2F4A] transition-all disabled:opacity-50 disabled:pointer-events-none border border-slate-200"
                            >
                                <ArrowRight className="w-4 h-4" />
                                السابق
                            </button>
                            <button
                                onClick={handleNextLesson}
                                disabled={activeLessonIndex === course?.lessons.length - 1}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-white bg-[#1F2F4A] hover:bg-[#152238] transition-all shadow-lg shadow-[#1F2F4A]/20 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                التالي
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Additional text content below media player */}
                    {activeLesson?.type !== 'text' && activeLesson?.content && (
                        <div className="mt-8 bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-[#1F2F4A] mb-6 border-b border-slate-100 pb-4">ملاحظات الدرس</h3>
                            <div
                                className="prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-black"
                                dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                            />
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
