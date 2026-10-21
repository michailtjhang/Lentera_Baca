"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string;
}

interface CustomSelectProps {
    name?: string;
    id?: string;
    value?: string;
    defaultValue?: string;
    options: SelectOption[];
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
}

export default function CustomSelect({
    name,
    id: propId,
    value: controlledValue,
    defaultValue,
    options,
    onChange,
    placeholder = "Pilih opsi...",
    disabled = false,
    className = "",
    buttonClassName = "",
}: CustomSelectProps) {
    const generatedId = useId();
    const id = propId || generatedId;

    const isControlled = controlledValue !== undefined;
    const [selectedValue, setSelectedValue] = useState<string>(() => {
        if (isControlled) return controlledValue || "";
        if (defaultValue !== undefined) return defaultValue;
        return options[0]?.value ?? "";
    });

    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Keep state in sync if controlledValue or defaultValue changes
    useEffect(() => {
        if (isControlled) {
            setSelectedValue(controlledValue || "");
        } else if (defaultValue !== undefined) {
            setSelectedValue(defaultValue);
        }
    }, [controlledValue, defaultValue, isControlled]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    const handleSelect = (val: string) => {
        if (disabled) return;
        if (!isControlled) {
            setSelectedValue(val);
        }
        onChange?.(val);
        setIsOpen(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (e.key === "Escape") {
            setIsOpen(false);
            return;
        }

        if (e.key === "Enter" || e.key === " ") {
            if (!isOpen) {
                e.preventDefault();
                setIsOpen(true);
            } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                e.preventDefault();
                handleSelect(options[highlightedIndex].value);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setHighlightedIndex(options.findIndex((opt) => opt.value === selectedValue) || 0);
            } else {
                setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
            }
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setHighlightedIndex(options.findIndex((opt) => opt.value === selectedValue) || 0);
            } else {
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
            }
            return;
        }
    };

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll("li");
            items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex, isOpen]);

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Hidden input so standard FormData or React form submissions pick up the value */}
            {name && <input type="hidden" name={name} value={selectedValue} id={id} />}

            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer select-none text-left border ${
                    isOpen
                        ? "border-amber-500 ring-2 ring-amber-500/25 bg-white dark:bg-[#18181b]"
                        : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-white/5"
                } ${
                    disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "text-[#3E2723] dark:text-white"
                } ${buttonClassName}`}
            >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                    {selectedOption?.icon && (
                        <span className="shrink-0 flex items-center text-base">{selectedOption.icon}</span>
                    )}
                    <span className={`truncate ${!selectedOption ? "opacity-40" : "font-medium"}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.badge && (
                        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                            {selectedOption.badge}
                        </span>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    className={`shrink-0 opacity-50 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-600 dark:text-amber-400 opacity-100" : ""
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl shadow-2xl shadow-black/15 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                    <ul
                        ref={listRef}
                        role="listbox"
                        className="max-h-64 overflow-y-auto p-1.5 space-y-1 focus:outline-none"
                    >
                        {options.length === 0 ? (
                            <li className="px-3 py-2 text-xs opacity-50 italic text-center">
                                Tidak ada opsi tersedia
                            </li>
                        ) : (
                            options.map((option, idx) => {
                                const isSelected = option.value === selectedValue;
                                const isHighlighted = idx === highlightedIndex;

                                return (
                                    <li
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(option.value)}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-amber-600/10 text-amber-900 dark:text-amber-300 font-bold"
                                                : isHighlighted
                                                ? "bg-black/5 dark:bg-white/10 text-[#3E2723] dark:text-white"
                                                : "text-[#3E2723]/90 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate min-w-0">
                                            {option.icon && (
                                                <span className="shrink-0 flex items-center text-base">
                                                    {option.icon}
                                                </span>
                                            )}
                                            <span className="truncate">{option.label}</span>
                                            {option.badge && (
                                                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check
                                                size={16}
                                                className="shrink-0 text-amber-700 dark:text-amber-400"
                                            />
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
