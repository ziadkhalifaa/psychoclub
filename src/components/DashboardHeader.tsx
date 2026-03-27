import React from 'react';
import { motion } from 'framer-motion';
import { Settings, LucideIcon } from 'lucide-react';

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
    roleLabel?: string;
    extra?: React.ReactNode;
    onSettingsClick?: () => void;
}

export function DashboardHeader({ title, subtitle, roleLabel = "لوحة التحكم الاحترافية", extra, onSettingsClick }: DashboardHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-10 bg-[#1F2F4A] dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden mb-8 md:mb-12 border border-white/10 dark:border-slate-800"
        >
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,#6FA65A15_0%,transparent_50%)]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#6FA65A]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#6FA65A] animate-pulse" />
                    <span className="text-[10px] font-black text-[#6FA65A] uppercase tracking-[0.4em]">{roleLabel}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">{title}</h1>
                <p className="text-slate-400 text-sm md:text-lg font-medium max-w-2xl">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto justify-between md:justify-start">
                {extra}
                <button 
                  onClick={onSettingsClick}
                  className="w-12 h-12 md:w-16 md:h-16 bg-white/5 hover:bg-[#6FA65A] text-white rounded-2xl md:rounded-[2rem] transition-all duration-500 border border-white/10 flex items-center justify-center group shadow-2xl active:scale-90"
                >
                    <Settings className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                </button>
            </div>
        </motion.div>
    );
}
