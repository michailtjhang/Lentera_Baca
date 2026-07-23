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

/**
 * Formats a chapter title gracefully.
 * Example:
 * - Title "Aku", Type Prologue -> "Prolog - Aku"
 * - Title empty, Type Chapter (1st) -> "Chapter 1"
 * - Title "Chapter 1", Type Chapter -> "Chapter 1" (prevents "Chapter 1 - Chapter 1")
 */
export function formatChapterTitle(
    chapter: { title?: string | null; type: ChapterType; order: number },
    allChapters: { type: ChapterType; order: number }[]
): string {
    const typeStr = chapter.type.toString();
    let prefix = "";

    if (typeStr === "PROLOGUE") prefix = "Prolog";
    else if (typeStr === "EPILOGUE") prefix = "Epilog";
    else if (typeStr === "INTERLUDE") prefix = "Selingan";
    else if (typeStr === "SIDESTORY") prefix = "Side Story";
    else if (typeStr === "ILLUSTRATION") prefix = "Ilustrasi";
    else if (typeStr === "CHAPTER" || typeStr === "STORY") {
        const sameTypeChapters = allChapters.filter(c => c.type === chapter.type).sort((a, b) => a.order - b.order);
        const index = sameTypeChapters.findIndex(c => c.order === chapter.order) + 1; // 1-based
        prefix = `Chapter ${index}`;
    } else {
        prefix = `Chapter ${chapter.order}`; // Fallback
    }

    if (chapter.title && chapter.title.trim() !== "") {
        const lowerTitle = chapter.title.toLowerCase().trim();
        // If user already prefixed it manually, just use their title
        if (
            lowerTitle.startsWith("chapter") ||
            lowerTitle.startsWith("prolog") ||
            lowerTitle.startsWith("epilog") ||
            lowerTitle.startsWith("selingan") ||
            lowerTitle.startsWith("side story") ||
            lowerTitle.startsWith("ilustrasi")
        ) {
            return chapter.title;
        }
        return `${prefix} - ${chapter.title}`;
    }

    return prefix;
}
