import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClasses = "bg-slate-200 dark:bg-slate-800 animate-pulse";
  const variantClasses = {
    text: "h-4 w-full rounded",
    rect: "rounded-2xl",
    circle: "rounded-full"
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
      <Skeleton className="w-full aspect-video mb-4" />
      <Skeleton variant="text" className="w-3/4 mb-3" />
      <Skeleton variant="text" className="w-1/2 mb-6" />
      <div className="flex justify-between items-center">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex gap-6 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
      <Skeleton className="w-48 h-32 flex-shrink-0" />
      <div className="flex-1 space-y-3 py-2">
        <Skeleton variant="text" className="w-1/4 h-3" />
        <Skeleton variant="text" className="w-full h-5" />
        <Skeleton variant="text" className="w-3/4 h-3" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}
