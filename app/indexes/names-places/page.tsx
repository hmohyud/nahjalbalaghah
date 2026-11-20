'use client';

import { Suspense } from 'react';
import NamesPlacesContent from './NamesPlacesContent';

export default function NamesPlacesIndexPage() {
    return (
        <Suspense fallback={<div className="index-loading">
            <div className="index-loading__inner">
                <div className="index-loading__spinner"></div>
                <p className="index-loading__text">Loading names and places...</p>
            </div>
        </div>}>
            <NamesPlacesContent />
        </Suspense>
    );
}
