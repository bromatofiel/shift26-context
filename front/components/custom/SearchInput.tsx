"use client";
import { useState } from "react";

interface SearchInputProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
}

export default function SearchInput({
    placeholder = "Search...",
    onSearch
}: SearchInputProps) {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onSearch?.(newValue);
    };

    const handleClear = () => {
        setValue("");
        onSearch?.("");
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="px-2 py-2 text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            )}
        </div>
    );
}
