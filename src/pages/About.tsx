import { motion } from 'framer-motion';
import { Brain, Target, Users, Award, Heart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const stats = [
    { label: 'خريج متدرب', value: '+1500', icon: Users },
    { label: 'دورة تدريبية', value: '+50', icon: Brain },
    { label: 'سنة خبرة', value: '+10', icon: Award },
    { label: 'محاضر خبير', value: '+20', icon: Sparkles },
];

const values = [
    {
        title: 'الأمانة العلمية',
        description: 'نلتزم بتقديم محتوى علمي رصين ومبني على أحدث الأدلة والبراهين في مجال الصحة النفسية.',
        icon: Heart,
    },
    {
        title: 'التطبيق العملي',
        description: 'تركيزنا الأساسي هو سد الفجوة بين النظرية والممارسة لتمكين المعالج من أدواته.',
        icon: Target,
    },
    {
        title: 'المجتمع المهني',
        description: 'نسعى لبناء بيئة داعمة تجمع المختصين لتبادل الخبرات والنمو المشترك.',
        icon: Users,
    },
];

export default function About() {
    return (
        <div className="pt-20 lg:pt-32 pb-24 overflow-hidden">
            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-[#6FA65A]/10 rounded-full blur-3xl opacity-50" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100 dark:border-emerald-900">
                            <Sparkles className="w-3 h-3" /> من نحن
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-[#1F2F4A] dark:text-white mb-8 leading-[1.1] tracking-tighter">
                            نصنع مستقبلاً أفضل <br />
                            <span className="text-[#6FA65A]">للجيل القادم من المعالجين</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl leading-relaxed font-medium mb-10 max-w-xl">
                            تأسست Clinical Cases Group لتكون المنارة التي تضيء طريق الممارسة الإكلينيكية الواعية. نحن لسنا مجرد مركز تدريب، بل نحن رحلة تحول مهني شاملة لكل مختص يطمح للتميز.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000"
                                alt="Our Team"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#1F2F4A] rounded-full -z-10 animate-pulse" />
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#6FA65A]/20 rounded-full -z-10 blur-2xl" />
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-[#1F2F4A] py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#6FA65A_0%,transparent_50%)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    <stat.icon className="w-8 h-8 text-[#6FA65A]" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {values.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:border-[#6FA65A]/30 transition-all group"
                            >
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#6FA65A] transition-colors">
                                    <value.icon className="w-6 h-6 text-[#1F2F4A] dark:text-white group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-[#1F2F4A] dark:text-white mb-4">{value.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-24 bg-white dark:bg-transparent transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[4rem] p-12 lg:p-24 flex flex-col lg:flex-row gap-16 items-center border border-transparent dark:border-slate-800">
                        <div className="w-64 h-64 lg:w-96 lg:h-96 rounded-[3rem] overflow-hidden shadow-2xl shrink-0">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1000"
                                alt="Founder"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 text-right">
                            <h2 className="text-3xl lg:text-5xl font-black text-[#1F2F4A] dark:text-white mb-6 tracking-tighter">رسالة من الإدارة</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl leading-loose italic mb-10">
                                "هدفنا في CCG هو توفير الدفء المعرفي والاحتضان المهني لكل معالج نفسي عربي. نؤمن أن جودة الخدمات النفسية في مجتمعنا تبدأ من جودة تدريب الممارسين، وهذا هو العهد الذي قطعناه على أنفسنا."
                            </p>
                            <div>
                                <h4 className="text-xl font-black text-[#1F2F4A] dark:text-white">د. محمود الشريف</h4>
                                <p className="text-[#6FA65A] font-bold uppercase tracking-widest text-xs mt-1">المدير التنفيذي والمؤسس</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-10"
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-[#1F2F4A] dark:text-white tracking-tighter">جاهز لبدء رحلتك المهنية؟</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium">انضم إلى مجتمعنا اليوم واكتشف عالمًا جديدًا من الفرص التعليمية.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="/register" className="w-full sm:w-auto px-10 py-5 bg-[#1F2F4A] dark:bg-[#6FA65A] text-white rounded-[2rem] font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95 flex items-center justify-center gap-3 group">
                                انضم إلينا الآن
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-180" />
                            </a>
                            <a href="/courses" className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-[#1F2F4A] dark:text-white border border-slate-200 dark:border-slate-700 rounded-[2rem] font-black text-lg hover:border-[#6FA65A] transition-all flex items-center justify-center">
                                تصفح الدورات
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
