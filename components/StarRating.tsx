import { Star } from "lucide-react";

interface StarRatingProps {
    views: number;
    className?: string;
}

/**
 * Calculates a rating score from 1.0–10.0 based on view count.
 * Uses a logarithmic scale so early views matter more.
 * Thresholds:
 *   0 views     → 1.0
 *   10 views    → ~3.0
 *   100 views   → ~5.0
 *   1000 views  → ~7.0
 *   10000 views → ~9.0
 *   50000+ views → 10.0
 */
function calculateRating(views: number): number {
    if (views <= 0) return 1.0;
    // log10 scale: 1 → 0, 10 → 1, 100 → 2, 1000 → 3, 10000 → 4, 100000 → 5
    const log = Math.log10(views);
    // Map log range [0, ~4.7 (50000)] to rating [1, 10]
    const rating = 1 + (log / Math.log10(50000)) * 9;
    return Math.min(10, Math.round(rating * 10) / 10);
}

export default function StarRating({ views, className = "" }: StarRatingProps) {
    const score = calculateRating(views);
    // Convert 1-10 score to 0-5 star fill
    const starFill = ((score - 1) / 9) * 5; // 1→0 stars, 10→5 stars

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => {
                    const fillAmount = Math.max(0, Math.min(1, starFill - i));
                    return (
                        <div key={i} className="relative w-4 h-4">
                            {/* Empty star (background) */}
                            <Star
                                size={16}
                                className="absolute inset-0 text-black/10 dark:text-white/10"
                                fill="currentColor"
                                strokeWidth={0}
                            />
                            {/* Filled star (clipped) */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillAmount * 100}%` }}
                            >
                                <Star
                                    size={16}
                                    className="text-amber-400"
                                    fill="currentColor"
                                    strokeWidth={0}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <span className="text-xs font-black tracking-tight text-amber-600 dark:text-amber-400">
                {score.toFixed(1)}
            </span>
            <span className="text-[0.55rem] font-bold opacity-30 uppercase tracking-wider">
                / 10
            </span>
        </div>
    );
}

export { calculateRating };
