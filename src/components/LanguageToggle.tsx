import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleLanguage}
      className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex items-center gap-2 group"
      aria-label="Toggle language"
    >
      <Languages className="w-5 h-5 text-[#6FA65A] group-hover:rotate-12 transition-transform" />
      <div className="relative w-6 h-5 overflow-hidden">
        <motion.span
          key={language}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center font-black text-[10px] tracking-tighter"
        >
          {language.toUpperCase()}
        </motion.span>
      </div>
    </motion.button>
  );
}
