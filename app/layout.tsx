import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./components/ui/header";
import Footer from "./components/ui/footer";

export const metadata: Metadata = {
  title: {
    default: "Nahj al-Balaghah | The Peak of Eloquence",
    template: "%s | Nahj al-Balaghah"
  },
  description: "A scholarly digital archive of Nahj al-Balaghah: the sermons, letters, and sayings of Imam Ali ibn Abi Talib. Explore centuries of wisdom through authenticated manuscripts and translations.",
  keywords: [
    "Nahj al-Balaghah",
    "Peak of Eloquence",
    "Imam Ali",
    "Islamic manuscripts",
    "Arabic literature",
    "Islamic wisdom",
    "Sharif al-Radi",
    "Islamic philosophy",
    "Classical Arabic",
    "Sermons",
    "Letters",
    "Sayings"
  ],
  metadataBase: new URL("https://nahj-al-balagha.com"),
  openGraph: {
    title: "Nahj al-Balaghah | The Peak of Eloquence",
    description: "A scholarly digital archive of Nahj al-Balaghah: the sermons, letters, and sayings of Imam Ali ibn Abi Talib.",
    url: "https://nahj-al-balagha.com",
    siteName: "Nahj al-Balaghah",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nahj al-Balaghah - The Peak of Eloquence"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Nahj al-Balaghah | The Peak of Eloquence",
    description: "A scholarly digital archive of the sermons, letters, and sayings of Imam Ali ibn Abi Talib.",
    images: ["/og-image.jpg"]
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar"
    }
  }
};

export const viewport: Viewport = {
  themeColor: "#2D5A47",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
