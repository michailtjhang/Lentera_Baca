import { ChapterType } from "@prisma/client";

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export const typeSlugs: Record<string, string> = {
    PROLOGUE: "prolog",
    STORY: "chapter",
    ILLUSTRATION: "ilustrasi",
    EPILOGUE: "epilog",
    SIDESTORY: "sidestory",
    INTERLUDE: "selingan",
};

/**
 * Generates a descriptive URL part for a chapter.
 * Rules:
 * - First of type: /type
 * - Second of type: /type-1
 * - Third of type: /type-2
 */
export function getChapterSlug(chapter: { type: ChapterType, order: number }, allChapters: any[]): string {
    const slugBase = typeSlugs[chapter.type] || "chapter";
    
    // Sort all chapters by order to find the relative index within the same type
    const sameTypeChapters = allChapters
        .filter(c => c.type === chapter.type)
        .sort((a, b) => a.order - b.order);
    
    const index = sameTypeChapters.findIndex(c => c.order === chapter.order);
    
    if (index === 0) return slugBase;
    return `${slugBase}-${index}`;
}

/**
 * Reverse mapping from slug to find the chapter in the list.
 */
export function getChapterBySlug(chapterSlug: string, allChapters: { type: ChapterType, order: number }[]) {
    // 1. Identify base type and index
    let base = chapterSlug;
    let index = 0;
    
    if (chapterSlug.includes("-")) {
        const parts = chapterSlug.split("-");
        const suffix = parts.pop();
        if (suffix && !isNaN(parseInt(suffix))) {
            index = parseInt(suffix);
            base = parts.join("-");
        } else {
            // handle cases like "side-story" where base might have a hyphen but suffix is not a number
            base = chapterSlug;
            index = 0;
        }
    }

    // Special case for "chapter-1", "chapter-2" if they don't follow the "first is empty" rule yet
    // Or if the base is "chapter"
    if (base === "chapter" && index > 0) {
        // "chapter-1" is index 0 in our new logic, but if user comes from old links,
        // we might need to handle it.
        // However, the user said "chapter-1" was an illustration in their example.
        // Let's assume the new logic applies.
    }

    const type = Object.keys(typeSlugs).find(key => typeSlugs[key] === base) as ChapterType;
    if (!type) {
        // Fallback for "chapter-1" where it might just be the order number if no type matches
        const orderNum = parseInt(chapterSlug.replace("chapter-", ""));
        if (!isNaN(orderNum)) return allChapters.find(c => c.order === orderNum);
        return null;
    }

    const sameTypeChapters = allChapters
        .filter(c => c.type === type)
        .sort((a, b) => a.order - b.order);
    
    return sameTypeChapters[index] || null;
}
