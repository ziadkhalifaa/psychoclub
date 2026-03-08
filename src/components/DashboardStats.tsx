import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Stat {
    title: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    trend?: string;
}

interface DashboardStatsProps {
    stats: Stat[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.7, ease: "circOut" }}
                        className={`relative overflow-hidden p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/20 shadow-2xl group ${stat.gradient}`}
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2 leading-none">{stat.title}</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter mb-4">{stat.value}</h3>
                            {stat.trend && (
                                <div className="text-[10px] font-black text-[#1F2F4A] bg-[#6FA65A] px-4 py-2 rounded-xl shadow-lg shadow-black/5">
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
