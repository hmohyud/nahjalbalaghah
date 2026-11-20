import { Suspense } from 'react';
import IndexTermsContent from './IndexTermsContent';

export default function IndexTermsPage() {
  return (
    <Suspense fallback={<div className="index-loading">
      <div className="index-loading__inner">
        <div className="index-loading__spinner"></div>
        <p className="index-loading__text">Loading index terms...</p>
      </div>
    </div>}>
      <IndexTermsContent />
    </Suspense>
  );
}
