"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Search, Plus } from "lucide-react";

interface TagInputProps {
    suggestions: string[];
}

export function TagInput({ suggestions }: TagInputProps) {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = suggestions.filter(
                s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    }, [inputValue, suggestions, tags]);

    const addTag = (tag: string) => {
        const cleanTag = tag.trim();
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags([...tags, cleanTag]);
            setInputValue("");
            setShowSuggestions(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === "," || e.key === " ") {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        }
    };

    return (
        <div ref={containerRef} className="space-y-3 relative">
            <div className="flex flex-wrap gap-2 min-h-[50px] p-2 bg-white/80 border border-black/5 rounded-xl focus-within:ring-2 focus-within:ring-[#3E2723]/20 transition-all">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 bg-[#3E2723] text-[#F5F5DC] px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => inputValue.trim() && setShowSuggestions(true)}
                    placeholder={tags.length === 0 ? "Ketik tag dan Enter..." : ""}
                    className="flex-grow bg-transparent border-none focus:outline-none px-2 py-1 text-sm font-medium"
                />
            </div>

            {/* Hidden input for form submission */}
            <input type="hidden" name="tags" value={tags.join(",")} />

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-black/5 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden backdrop-blur-md">
                    {filteredSuggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-[#3E2723]/5 transition-colors flex items-center justify-between"
                        >
                            <span>{suggestion}</span>
                            <Plus size={14} className="opacity-40" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
