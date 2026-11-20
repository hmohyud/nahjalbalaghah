import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Nahj al-Balaghah digital archive.",
};

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-page__container">
        {/* Header */}
        <div className="privacy-page__header">
          <h1 className="privacy-page__title">
            Privacy Policy
          </h1>
          <div className="privacy-page__divider">
            <div className="privacy-page__divider-line--left" />
            <div className="privacy-page__divider-diamond" />
            <div className="privacy-page__divider-line--right" />
          </div>
        </div>

        {/* Content */}
        <div className="privacy-page__card">
          {/* Corner accents */}
          <div className="privacy-page__corner-accent--top-left" />
          <div className="privacy-page__corner-accent--bottom-right" />

          <div className="privacy-page__body">
            <p className="privacy-page__date">
              Last updated: January 2026
            </p>

            <h2 className="privacy-page__section-heading">Information We Collect</h2>
            <p className="privacy-page__paragraph">
              The Nahj al-Balaghah Digital Archive is committed to protecting your privacy. This website is designed primarily as an educational and scholarly resource, and we collect minimal personal information.
            </p>
            <p className="privacy-page__paragraph">
              We may collect anonymous usage data to improve the website experience, including pages visited and time spent on the site. This data is collected through standard web analytics and does not personally identify you.
            </p>

            <h2 className="privacy-page__section-heading">Use of Information</h2>
            <p className="privacy-page__paragraph">
              Any information collected is used solely to improve the functionality and content of this digital archive. We do not sell, trade, or otherwise transfer your information to outside parties.
            </p>

            <h2 className="privacy-page__section-heading">Cookies</h2>
            <p className="privacy-page__paragraph">
              This website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though this may affect some functionality.
            </p>

            <h2 className="privacy-page__section-heading">Third-Party Links</h2>
            <p className="privacy-page__paragraph">
              This website may contain links to external sites. We are not responsible for the privacy practices or content of these external sites.
            </p>

            <h2 className="privacy-page__section-heading">Contact</h2>
            <p className="privacy-page__paragraph">
              If you have any questions about this privacy policy, please contact us through the contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
