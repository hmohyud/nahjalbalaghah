'use client';

import { Suspense } from 'react';
import QuranHadithContent from './QuranHadithContent';

export default function QuranHadithIndexPage() {
    return (
        <Suspense fallback={<div className="index-loading">
            <div className="index-loading__inner">
                <div className="index-loading__spinner"></div>
                <p className="index-loading__text">Loading Qur&apos;an and Hadith references...</p>
            </div>
        </div>}>
            <QuranHadithContent />
        </Suspense>
    );
}
