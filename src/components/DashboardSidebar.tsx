import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface DashboardSidebarProps {
    items: SidebarItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function DashboardSidebar({ items, activeTab, onTabChange }: DashboardSidebarProps) {
    return (
        <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl p-6 sticky top-24 space-y-10">
                <div className="px-4">
                    <div className="w-12 h-1 bg-[#6FA65A]/20 rounded-full mb-2" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">القائمة الرئيسية</p>
                </div>

                <nav className="space-y-4">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full relative flex items-center gap-4 px-6 py-5 rounded-[2rem] text-sm font-black transition-all duration-500 group ${isActive
                                    ? 'bg-[#1F2F4A] text-white shadow-2xl scale-105 z-10'
                                    : 'text-slate-400 hover:bg-emerald-50 hover:text-[#6FA65A]'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-[#6FA65A]' : 'text-slate-300'}`} />
                                <span className="tracking-tight">{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#6FA65A] shadow-[0_0_10px_#6FA65A]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-8 bg-slate-900/5 rounded-[2.5rem] border border-slate-100 mt-20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">الدعم الفني</p>
                    <button className="w-full py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1F2F4A] hover:bg-[#1F2F4A] hover:text-white transition-all shadow-sm">تواصل معنا</button>
                </div>
            </div>
        </div>
    );
}
