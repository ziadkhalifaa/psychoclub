import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, Menu, User, BookOpen, PenTool, LayoutDashboard, ChevronDown, X, Activity, Layers, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveBackground } from './InteractiveBackground';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    // Pre-emptive Screenshot Protection
    const handleCaptureStart = () => setIsBlurred(true);
    const handleCaptureEnd = () => setIsBlurred(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen or Win+Shift+S or Cmd+Shift+4
      if (
        e.key === 'PrintScreen' || 
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && e.key === 'p')
      ) {
        handleCaptureStart();
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('blur', handleCaptureStart);
    window.addEventListener('focus', handleCaptureEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseleave', handleCaptureStart);
    window.addEventListener('mouseenter', handleCaptureEnd);
    window.addEventListener('beforeprint', handleCaptureStart);
    window.addEventListener('afterprint', handleCaptureEnd);
    
    // High-frequency health check for focus
    const interval = setInterval(() => {
      if (!document.hasFocus()) {
        handleCaptureStart();
      }
    }, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', handleCaptureStart);
      window.removeEventListener('focus', handleCaptureEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseleave', handleCaptureStart);
      window.removeEventListener('mouseenter', handleCaptureEnd);
      window.removeEventListener('beforeprint', handleCaptureStart);
      window.removeEventListener('afterprint', handleCaptureEnd);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div 
      className={`min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-[#6FA65A]/30 selection:text-[#1F2F4A] dark:selection:text-white transition-colors duration-500 bg-slate-50/80 dark:bg-[#0f172a]/90 ${isBlurred ? 'blur-[50px] select-none pointer-events-none' : ''}`} 
      style={{ transition: isBlurred ? 'none' : 'filter 0.5s, background-color 0.5s, color 0.5s' }}
      dir="rtl"
    >
      <ScrollToTop />
      <InteractiveBackground />
      <Toaster position="top-center" reverseOrder={false} />

      {/* Global Security Overlay (only visible when blurred) */}
      {isBlurred && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-3xl">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl text-center border border-rose-500/20 max-w-md mx-4">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-[#1F2F4A] dark:text-white mb-4">المحتوى محميّ</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              عذراً، لا يمكن التقاط صور للشاشة أو مغادرة الصفحة أثناء عرض المحتوى المحمي. 🛡️
            </p>
            <div className="mt-8 py-3 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] text-rose-500 font-black uppercase tracking-widest">
              نظام الحماية الإكلينيكية المتقدم
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
          ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border-b border-white/20 dark:border-slate-800/50 py-1 md:py-2'
          : 'bg-transparent py-4 md:py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center group transition-all duration-500">
            <div className="flex items-center justify-center overflow-hidden mr-[12px]">
              <img
                src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
                alt="Clinical Cases Group | Psycho-Club"
                style={{ height: '52px', width: 'auto' }}
                className="object-contain transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(111,166,90,0.3)]"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {[
              { to: '/courses', label: 'الدورات' },
              { to: '/articles', label: 'المقالات' },
              { to: '/about', label: 'من نحن' },
              { to: '/sessions', label: 'حجز جلسة' },
              { to: '/tools', label: 'الأدوات' },
              { to: '/community', label: 'المجتمع' }
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold transition-all duration-300 relative group py-1 ${location.pathname === link.to ? 'text-[#6FA65A]' : 'text-[#1F2F4A]/70 dark:text-slate-400 hover:text-[#1F2F4A] dark:hover:text-white'
                  }`}
              >
                {link.label}
                <span className={`absolute bottom-0 right-0 h-0.5 bg-[#6FA65A] transition-all duration-300 ${location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-5">
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="text-[10px] font-black tracking-widest uppercase text-white bg-[#1F2F4A] dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-[#6FA65A] transition-all shadow-md">لوحة الإدارة</Link>
                )}
                {user.role === 'DOCTOR' && (
                  <Link to="/doctor" className="text-[10px] font-black tracking-widest uppercase text-white bg-[#1F2F4A] dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-[#6FA65A] transition-all shadow-md">لوحة الطبيب</Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-transparent group-hover:border-[#6FA65A] transition-all overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                    ) : (
                      <User className="w-5 h-5 text-slate-400 group-hover:text-[#6FA65A]" />
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-[#1F2F4A] dark:text-white group-hover:text-[#6FA65A] transition-colors">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-[#1F2F4A] dark:text-slate-300 hover:text-[#6FA65A] transition-colors">دخول</Link>
                <Link to="/register" className="text-sm font-black bg-[#1F2F4A] dark:bg-[#6FA65A] text-white px-7 py-3 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95">انضم إلينا</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button className="text-slate-600 dark:text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-t border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6 text-right">
                <Link to="/courses" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>الدورات</Link>
                <Link to="/articles" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>المقالات</Link>
                <Link to="/about" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>من نحن</Link>
                <Link to="/sessions" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>حجز جلسة</Link>
                <Link to="/tools" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>الأدوات</Link>
                <Link to="/community" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>المجتمع</Link>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                {user ? (
                  <div className="flex flex-col gap-6">
                    <Link to="/profile" className="text-lg font-black text-[#6FA65A]" onClick={() => setIsMenuOpen(false)}>الملف الشخصي ({user.name})</Link>
                    {user.role === 'ADMIN' && <Link to="/admin" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>لوحة الإدارة</Link>}
                    {user.role === 'DOCTOR' && <Link to="/doctor" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>لوحة الطبيب</Link>}
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-right text-lg font-black text-rose-500">تسجيل الخروج</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <Link to="/login" className="text-lg font-black text-[#1F2F4A] dark:text-white" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
                    <Link to="/register" className="bg-[#1F2F4A] dark:bg-[#6FA65A] text-white p-4 rounded-2xl text-center font-black" onClick={() => setIsMenuOpen(false)}>انضم إلينا</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav >

      <main className="pt-24 pb-12 min-h-screen">
        <Outlet />
      </main>

      <footer className="relative bg-[#1F2F4A] dark:bg-slate-900 pt-24 pb-12 overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6FA65A]/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-4 mb-8 group">
                <div className="h-16 md:h-20 w-auto flex items-center justify-center bg-white/5 dark:bg-white/10 rounded-3xl p-3 md:p-4 border border-white/10 group-hover:border-[#6FA65A]/50 transition-all duration-500 shadow-2xl">
                  <img src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'} className="h-full w-auto object-contain" alt="CCG Logo" />
                </div>
                <div>
                  <h2 className="font-black text-2xl text-white tracking-tighter uppercase">Clinical Cases Group</h2>
                  <p className="text-[12px] text-[#6FA65A] font-black uppercase tracking-[0.4em] mt-1 bg-white/5 px-3 py-1 rounded-lg">Psycho-Club</p>
                </div>
              </Link>
              <p className="text-slate-400 text-sm leading-8 max-w-md font-medium">
                بوابتك الشاملة للنمو الإكلينيكي والاستقرار النفسي. نقدم منظومة متكاملة تجمع بين التدريب التخصصي، الإرشاد المهني، والدعم العلاجي المتقدم لخدمة مجتمع الصحة النفسية العربي بكفاءة عالمية.
              </p>
              <div className="flex gap-4 mt-8">
                {/* Social placeholders could go here */}
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#6FA65A] transition-all cursor-pointer"><Activity className="w-5 h-5 text-white/50" /></div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#6FA65A] transition-all cursor-pointer"><Layers className="w-5 h-5 text-white/50" /></div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">استكشاف المنصة</h3>
              <ul className="space-y-4">
                {[
                  { to: '/courses', label: 'الأكاديمية التدريبية' },
                  { to: '/articles', label: 'المستودع العلمي' },
                  { to: '/tools', label: 'الحقيبة الإكلينيكية' },
                  { to: '/sessions', label: 'حجز جلسة' }
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-slate-400 hover:text-[#6FA65A] text-sm font-bold transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#6FA65A] transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">دعم الأعضاء</h3>
              <ul className="space-y-4">
                <li><p className="text-slate-500 text-[10px] font-black uppercase mb-1">البريد الإلكتروني</p><p className="text-white font-bold text-sm">support@psychoclub.space</p></li>
                <li><p className="text-slate-500 text-[10px] font-black uppercase mb-1">المكتب الرئيسي</p><p className="text-white font-bold text-sm">القاهرة، مدينة نصر</p></li>
                <li><p className="text-slate-500 text-[10px] font-black uppercase mb-1">الخط الساخن</p><p className="text-[#6FA65A] font-black text-lg">+20 123 456 7890</p></li>
              </ul>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Clinical Cases Group | Psycho-Club. رحلة مهنية متكاملة بلمسة إنسانية.
            </p>
            <div className="flex gap-8 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
              <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
              <Link to="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
