import ContactHero from './sections/hero';
import ContactFormSection from './sections/form-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Nahj al-Balaghah. Reach out for inquiries, support, or feedback. We value your connection.',
  openGraph: {
    title: 'Contact | Nahj al-Balaghah',
    description: 'Get in touch with Nahj al-Balaghah. Reach out for inquiries, support, or feedback.',
    url: 'https://nahj-al-balagha.com/contact',
  }
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactFormSection />
    </>
  );
}
