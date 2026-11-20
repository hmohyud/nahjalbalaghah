import React from 'react'
import { FileText, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import PDFViewer from '../components/pdf-viewer'

export const metadata: Metadata = {
  title: "Scholarly Notes on Edition and Translation | Nahj al-Balaghah",
  description: "Explore detailed scholarly notes on Tahera Qutbuddin's edition and translation of Nahj al-Balaghah, providing valuable insights into the academic work behind this timeless collection.",
  openGraph: {
    title: "Scholarly Notes on Edition and Translation | Nahj al-Balaghah",
    description: "Explore detailed scholarly notes on Tahera Qutbuddin's edition and translation of Nahj al-Balaghah.",
    url: "https://nahj-al-balagha.com/scholarly-notes",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Nahj al-Balaghah Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Scholarly Notes on Edition and Translation | Nahj al-Balaghah",
    description: "Explore detailed scholarly notes on Tahera Qutbuddin's edition and translation of Nahj al-Balaghah.",
    images: [
      {
        url: "/globe.svg",
        alt: "Nahj al-Balaghah Logo"
      }
    ]
  }
}

export default function ScholarlyNotesPage() {
  return (
    <div className="scholarly-page">
      {/* Hero Section */}
      <section className="scholarly-page__hero">
        <div className="scholarly-page__hero-inner">
          <div className="scholarly-page__hero-text">
            <div className="scholarly-page__hero-badge">
              <FileText className="w-8 h-8 text-[#43896B]" />
              <span className="scholarly-page__hero-badge-text">Scholarly Notes</span>
            </div>
            <h1 className="scholarly-page__title">
              Notes on <span className="scholarly-page__title-accent">Edition and Translation</span>
            </h1>
            <div className="scholarly-page__underline"></div>
            <p className="scholarly-page__subtitle">
              Discover the meticulous scholarly work behind Tahera Qutbuddin's edition and translation of Nahj al-Balaghah.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="scholarly-page__content">
        <div className="scholarly-page__content-inner">
          <div className="scholarly-page__card">
            <div className="scholarly-page__card-inner">
              <div className="scholarly-page__card-header">
                <div className="scholarly-page__card-header-left">
                  <div className="scholarly-page__card-title-row">
                    <BookOpen className="w-8 h-8 text-[#43896B]" />
                    <h2 className="scholarly-page__card-title">
                      Tahera Qutbuddin's Edition and Translation
                    </h2>
                  </div>
                  <div className="scholarly-page__card-underline"></div>
                </div>
              </div>
              <div className="scholarly-page__prose">
                <p className="scholarly-page__prose-lg">
                  <strong>Tahera Qutbuddin</strong> is a renowned scholar of Islamic studies, specializing in Arabic literature, Islamic history, and the intellectual traditions of Shi'i Islam. Her work on Nahj al-Balaghah represents a significant contribution to the field of Islamic scholarship.
                </p>
                <p>
                  This edition and translation brings together rigorous academic standards with deep cultural and linguistic understanding. Qutbuddin's approach combines philological precision with contextual awareness, making the profound wisdom of Imam Ali (AS) accessible to modern readers while preserving the richness of the original Arabic text.
                </p>
                <div className="scholarly-page__features-box">
                  <h3 className="scholarly-page__features-title">Key Features of This Edition</h3>
                  <ul className="scholarly-page__features-list">
                    <li><strong>Authentic Sources:</strong> Based on the most reliable manuscript traditions and scholarly editions</li>
                    <li><strong>Linguistic Precision:</strong> Careful attention to Arabic grammar, rhetoric, and poetic devices</li>
                    <li><strong>Historical Context:</strong> Detailed notes explaining historical references and cultural background</li>
                    <li><strong>Theological Insights:</strong> Explanations of Islamic concepts and theological implications</li>
                    <li><strong>Comparative Analysis:</strong> References to parallel passages and related Islamic texts</li>
                  </ul>
                </div>
                <p>
                  The translation maintains the eloquence and rhetorical power of the original Arabic while ensuring clarity for contemporary readers. Qutbuddin's extensive footnotes provide invaluable context, explaining difficult passages, identifying literary devices, and connecting the text to broader Islamic intellectual traditions.
                </p>
                <p>
                  This scholarly work serves as a bridge between classical Islamic learning and modern academic discourse, making Nahj al-Balaghah's timeless wisdom accessible to students, scholars, and general readers alike.
                </p>
              </div>

              <div className="scholarly-page__pdf-section">
                <div className="scholarly-page__pdf-header">
                  <FileText className="w-6 h-6 text-[#43896B]" />
                  <h3 className="scholarly-page__pdf-title">View Scholarly Notes</h3>
                </div>
                <div className="scholarly-page__pdf-wrapper">
                  <PDFViewer
                    pdfUrl="/pdfs/TQ-Notes-on-the-Edition-and-Translation.pdf"
                    title="Scholarly Notes on Edition and Translation"
                  />
                </div>
                <p className="scholarly-page__pdf-note">
                  Use the controls above to navigate pages, zoom, and view in fullscreen mode
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
