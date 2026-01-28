import React from 'react';

interface AlphabetChipsProps {
    selectedLetter: string;
    onSelectLetter: (letter: string) => void;
    language: 'English' | 'Arabic';
}

const ENGLISH_ALPHABET = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const ARABIC_ALPHABET = [
    'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
    'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

export default function AlphabetChips({ selectedLetter, onSelectLetter, language }: AlphabetChipsProps) {
    const letters = language === 'English' ? ENGLISH_ALPHABET : ARABIC_ALPHABET;

    return (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-6 justify-center px-2 sm:px-0" dir={language === 'Arabic' ? 'rtl' : 'ltr'}>
            <button
                onClick={() => onSelectLetter('')}
                className={`h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold transition-all border flex items-center justify-center ${!selectedLetter
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-[var(--color-cream)] text-[var(--color-charcoal)] border-[var(--color-stone)] hover:bg-[var(--color-stone)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    }`}
            >
                All
            </button>
            {letters.map((letter) => (
                <button
                    key={letter}
                    onClick={() => onSelectLetter(letter)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-semibold transition-all border flex items-center justify-center ${selectedLetter === letter
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] scale-105"
                            : "bg-[var(--color-cream)] text-[var(--color-charcoal)] border-[var(--color-stone)] hover:bg-[var(--color-stone)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        }`}
                >
                    {letter}
                </button>
            ))}
        </div>
    );
}
