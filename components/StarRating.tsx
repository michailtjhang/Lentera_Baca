import { Star } from "lucide-react";

interface StarRatingProps {
    views: number;
    maxViews?: number;
    className?: string;
}

/**
 * Calculates a rating score from 0.0–5.0 based on view count and project max views.
 */
function calculateRating(views: number, maxViews: number = 10000): number {
    if (views <= 0) return 0.0;
    const targetMax = Math.max(maxViews, 10);
    const logViews = Math.log10(views + 1);
    const logMax = Math.log10(targetMax + 1);
    const rating = (logViews / logMax) * 5;
    return Math.min(5, Math.max(0, Math.round(rating * 10) / 10));
}

export default function StarRating({ views, maxViews = 10000, className = "" }: StarRatingProps) {
    const score = calculateRating(views, maxViews);
    // Score is 0.0–5.0 directly mapping to 5 stars fill
    const starFill = score;

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
                / 5
            </span>
        </div>
    );
}

export { calculateRating };
