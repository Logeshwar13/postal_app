// SkeletonLoader variants for DakShiksha
// Usage: import { CardSkeleton, TableRowSkeleton, VideoCardSkeleton, DashboardSkeleton } from '@/components/common/SkeletonLoader';

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-[shimmer_1.5s_infinite]`;

// ─── Base atom ────────────────────────────────────────────────────────────────
const SkeletonBox = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-200 dark:bg-dark-lighter rounded-lg ${shimmer} ${className}`} />
);

// ─── Stat / Summary Card ──────────────────────────────────────────────────────
export const CardSkeleton = ({ count = 1 }: { count?: number }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="bg-white dark:bg-dark-light rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-lighter space-y-4"
                aria-hidden="true"
            >
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <SkeletonBox className="h-4 w-24" />
                        <SkeletonBox className="h-8 w-20 mt-1" />
                    </div>
                    <SkeletonBox className="h-12 w-12 rounded-xl flex-shrink-0" />
                </div>
                <SkeletonBox className="h-3 w-36" />
            </div>
        ))}
    </>
);

// ─── Table Row ────────────────────────────────────────────────────────────────
export const TableRowSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
    <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-4 py-3 px-4 bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-dark-lighter">
                <SkeletonBox className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols - 1}, 1fr)` }}>
                    {Array.from({ length: cols - 1 }).map((_, colIdx) => (
                        <SkeletonBox key={colIdx} className="h-4" />
                    ))}
                </div>
                <SkeletonBox className="h-7 w-16 rounded-full flex-shrink-0" />
            </div>
        ))}
    </div>
);

// ─── Video Card ───────────────────────────────────────────────────────────────
export const VideoCardSkeleton = ({ count = 3 }: { count?: number }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-lighter"
                aria-hidden="true"
            >
                {/* Thumbnail */}
                <SkeletonBox className="h-44 w-full rounded-none" />
                <div className="p-4 space-y-3">
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-3 w-3/4" />
                    <div className="flex items-center justify-between pt-1">
                        <SkeletonBox className="h-3 w-20" />
                        <SkeletonBox className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </>
);

// ─── Full Dashboard Skeleton ──────────────────────────────────────────────────
export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard..." aria-busy="true">
        {/* Welcome banner */}
        <div className="bg-white dark:bg-dark-light rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-lighter">
            <div className="space-y-2">
                <SkeletonBox className="h-7 w-48" />
                <SkeletonBox className="h-4 w-72" />
            </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton count={4} />
        </div>

        {/* Two column section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-light rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-lighter space-y-4">
                <SkeletonBox className="h-5 w-40" />
                <TableRowSkeleton rows={4} cols={3} />
            </div>
            {/* Side panel */}
            <div className="bg-white dark:bg-dark-light rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-lighter space-y-4">
                <SkeletonBox className="h-5 w-32" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <SkeletonBox className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="space-y-1 flex-1">
                                <SkeletonBox className="h-3 w-full" />
                                <SkeletonBox className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
