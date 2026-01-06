import HeroSection from "./sections/hero";
import AboutSection from "./sections/about";
import MainCardsSection from "./sections/main-cards";
import FeaturedManuscriptsSection from "./sections/manuscripts";

export const metadata = {
  title: "Nahj al-Balaghah | The Way of Eloquence",
  description: "A scholarly digital archive of Nahj al-Balaghah: the sermons, letters, and sayings of Imam Ali ibn Abi Talib. Explore centuries of wisdom through authenticated manuscripts and translations.",
  openGraph: {
    title: "Nahj al-Balaghah | The Way of Eloquence",
    description: "A scholarly digital archive of Nahj al-Balaghah: the sermons, letters, and sayings of Imam Ali ibn Abi Talib.",
    url: "https://nahj-al-balagha.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nahj al-Balaghah - The Way of Eloquence"
      }
    ]
  }
};

export default function Page() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <MainCardsSection />
      <FeaturedManuscriptsSection />
    </div>
  );
}
