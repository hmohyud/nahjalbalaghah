'use client';

import { Suspense } from 'react';
import ReligiousConceptsContent from './ReligiousConceptsContent';

export default function ReligiousConceptsIndexPage() {
    return (
        <Suspense fallback={<div className="index-loading">
            <div className="index-loading__inner">
                <div className="index-loading__spinner"></div>
                <p className="index-loading__text">Loading religious concepts...</p>
            </div>
        </div>}>
            <ReligiousConceptsContent />
        </Suspense>
    );
}
