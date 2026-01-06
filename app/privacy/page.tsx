import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Nahj al-Balaghah",
  description: "Privacy policy for the Nahj al-Balaghah digital archive.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-32 lg:pt-36">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl text-[var(--color-ink)] mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>
        </div>

        {/* Content */}
        <div className="relative bg-white border border-[var(--color-stone)] p-8 lg:p-12">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />

          <div className="prose prose-lg max-w-none font-body text-[var(--color-charcoal)]">
            <p className="text-lg leading-relaxed mb-6">
              Last updated: January 2026
            </p>

            <h2 className="font-display text-2xl text-[var(--color-ink)] mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">
              The Nahj al-Balaghah Digital Archive is committed to protecting your privacy. This website is designed primarily as an educational and scholarly resource, and we collect minimal personal information.
            </p>
            <p className="mb-4">
              We may collect anonymous usage data to improve the website experience, including pages visited and time spent on the site. This data is collected through standard web analytics and does not personally identify you.
            </p>

            <h2 className="font-display text-2xl text-[var(--color-ink)] mt-8 mb-4">Use of Information</h2>
            <p className="mb-4">
              Any information collected is used solely to improve the functionality and content of this digital archive. We do not sell, trade, or otherwise transfer your information to outside parties.
            </p>

            <h2 className="font-display text-2xl text-[var(--color-ink)] mt-8 mb-4">Cookies</h2>
            <p className="mb-4">
              This website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though this may affect some functionality.
            </p>

            <h2 className="font-display text-2xl text-[var(--color-ink)] mt-8 mb-4">Third-Party Links</h2>
            <p className="mb-4">
              This website may contain links to external sites. We are not responsible for the privacy practices or content of these external sites.
            </p>

            <h2 className="font-display text-2xl text-[var(--color-ink)] mt-8 mb-4">Contact</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy, please contact us through the contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
