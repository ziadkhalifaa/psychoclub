import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    y: theme === 'light' ? 0 : -40,
                    opacity: theme === 'light' ? 1 : 0,
                    rotate: theme === 'light' ? 0 : 90
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Sun className="w-5 h-5 text-amber-500" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    y: theme === 'dark' ? -20 : 20,
                    opacity: theme === 'dark' ? 1 : 0,
                    rotate: theme === 'dark' ? 0 : -90
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Moon className="w-5 h-5 text-indigo-400" />
            </motion.div>
        </motion.button>
    );
}
