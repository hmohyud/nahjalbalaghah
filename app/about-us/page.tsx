export const metadata = {
  title: "About Us",
  description: "Learn about the mission, vision, and community impact of Nahj al-Balaghah. Discover our dedication to preserving and sharing the wisdom of Imam Ali (AS).",
  openGraph: {
    title: "About Us | Nahj al-Balaghah",
    description: "Learn about the mission, vision, and community impact of Nahj al-Balaghah. Discover our dedication to preserving and sharing the wisdom of Imam Ali (AS).",
    url: "https://nahj-al-balagha.com/about-us",
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
    title: "About Us | Nahj al-Balaghah",
    description: "Learn about the mission, vision, and community impact of Nahj al-Balaghah. Discover our dedication to preserving and sharing the wisdom of Imam Ali (AS).",
    images: [
      {
        url: "/globe.svg",
        alt: "Nahj al-Balaghah Logo"
      }
    ]
  }
};

export default function Page() {
  return (
    <div className="about-page">
      <section className="about-us-hero">
        <div className="about-us-hero__bg-pattern bg-pattern-cross" />
        <div className="about-us-hero__container">
          <div className="about-us-hero__header">
            <p className="about-us-hero__subtitle">Our Mission &amp; Team</p>
            <h1 className="about-us-hero__title">About Nahjalbalaghah.org</h1>
            <div className="about-us-hero__ornament">
              <div className="about-us-hero__ornament-line about-us-hero__ornament-line--right" />
              <div className="about-us-hero__ornament-diamond" />
              <div className="about-us-hero__ornament-line about-us-hero__ornament-line--left" />
            </div>
          </div>

          <div className="about-us-hero__card">
            <div className="about-us-hero__card-corner about-us-hero__card-corner--tl" />
            <div className="about-us-hero__card-corner about-us-hero__card-corner--br" />
            <div className="about-us-hero__card-body about-prose">
              <div className="about-prose__body">
        <p>
          <strong>Nahjalbalaghah.org</strong> is a non-profit
          digital humanities project dedicated to making <em>Nahj al-Balāghah</em>—the celebrated
          collection of sermons, letters, and sayings attributed to{" "}
          <strong>Imam Ali ibn Abi Talib (d. 661)</strong>—accessible
          to readers, students, and scholars around the world.
        </p>
        <p>
          Compiled by{" "}
          <strong>al-Sharif al-Radi (d. 1015)</strong>,{" "}
          <em>Nahj al-Balāghah</em> is revered for its eloquence, depth of thought, and enduring
          influence on Islamic philosophy, theology, literature, and ethics. Despite its global
          significance, reliable English-language resources on the text have long been limited. This
          project seeks to bridge that gap.
        </p>
      </div>

              <h2 className="about-prose__heading">Our Mission</h2>
              <div className="about-prose__body">
        <p>
          Our mission is to provide an open-access, English-language digital platform for the study
          and appreciation of <em>Nahj al-Balāghah</em>—combining scholarship, technology, and
          accessibility.
        </p>
        <ul className="about-prose__list">
          <li>
            The project is grounded in{" "}
            <strong>academic rigor</strong>, ensuring that all
            materials—texts, translations, and analyses—meet the highest scholarly standards.
          </li>
          <li>
            Our audience is{" "}
            <strong>broad and inclusive</strong>, encompassing
            academics, researchers, students, interested readers, and people of faith who wish to
            engage deeply with the eloquence and wisdom of Imam Ali.
          </li>
          <li>
            The site hosts the text, translations, manuscripts, audio recordings, and related
            research, serving as a{" "}
            <strong>growing hub</strong> for both academic and
            public engagement.
          </li>
        </ul>
      </div>

              <h2 className="about-prose__heading">What We Offer</h2>
              <ul className="about-prose__body">
        <li>
          <strong>Text &amp; Translation:</strong>
          <br />
          A searchable version of <em>Nahj al-Balāghah</em>, in both the original Arabic and
          translations into other languages, will provide readers with easy access to the entire
          text in their preferred language. The English translation will be based on Dr. Tahera
          Qutbuddin&rsquo;s critical edition and translation (<em>Brill, 2024</em>), the first direct
          English rendering from Arabic. This open-access translation, published with permission from
          Brill, provides an accurate and readable version of the text for the first time online. The
          website will include numerous critical editions of the Arabic text, including those edited
          by Tahera Qutbuddin (2025), Qays al-Attar (2025), and Hashim Milani (2010). It will also
          include a fully vocalized version of the Qutbuddin edition, a feature unique to the online
          format. Additional critical editions of the text will be added in due course, as will
          accurate and idiomatic translations into different languages.
        </li>
        <li>
          <strong>Recitations:</strong>
          <br />
          Professionally produced recitations of the entire Arabic text and its English translation
          bring the orations and letters to life, honoring their origins as spoken masterpieces.
        </li>
        <li>
          <strong>Digitized Manuscripts:</strong>
          <br />
          The site features high-resolution images of{" "}
          <strong>the earliest manuscripts</strong> of{" "}
          <em>Nahj al-Balāghah</em>, including 14 used in Professor Qutbuddin&rsquo;s critical
          edition. These rare manuscripts—held in libraries across India, Iran, Iraq, Turkey, and
          Ireland—offer invaluable insights into the text&rsquo;s transmission and reception history.
        </li>
        <li>
          <strong>Scholarly Resources:</strong>
          <br />
          Scholarly resources include indices, a glossary, an introduction, notes on the edition and
          translation, and detailed contents from Professor Qutbuddin&rsquo;s volume. The growing
          database will further include medieval and modern commentaries, bibliographical entries,
          and links to open-access research in English, Arabic, Persian, Urdu, and other languages.
        </li>
        <li>
          <strong>Timeline:</strong>
          <br />
          A timeline of the orations, letters, and sayings of Nahj al-Balaghah will be reconstructed
          and displayed on the website, based on evidence culled from various historical and literary
          sources. This timeline will provide invaluable historical context to many of the orations,
          letters, and sayings for which this evidence is available.
        </li>
      </ul>

              <h2 className="about-prose__heading">Our Team</h2>
              <ul className="about-prose__list about-prose__list--plain">
        <li>
          <strong>Project Principal:</strong>
          <br />
          <em>Professor Tahera Qutbuddin</em> — AlBabtain Laudian Professor of Arabic, University of
          Oxford; editor and translator of{" "}
          <em>Nahj al-Balāghah: The Eloquence and Wisdom of ʿAlī</em> (Brill, 2024).
        </li>
        <li>
          <strong>Web Developer:</strong>
          <br />
          <em>Syed Kazim Hussain</em> — Graduate of the Islamic Seminary of Qum (2020) and
          independent software development consultant.
        </li>
        <li>
          <strong>Research Manager:</strong>
          <br />
          <em>Reza Hemyari</em> — Ph.D. candidate, Department of Middle Eastern Studies, University of
          Chicago.
        </li>
      </ul>

              <h2 className="about-prose__heading">Our Sponsor</h2>
              <p className="about-prose__body">
        <strong>
          Shia Research Institute, Toronto (
          <a
            href="https://shiaresearch.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="about-prose__link"
          >
            https://shiaresearch.ca/
          </a>
          )
        </strong>
      </p>

              <h2 className="about-prose__heading">Our Ongoing Vision</h2>
              <p className="about-prose__body">
        We envision <em>Nahjalbalaghah.org</em> as a{" "}
        <strong>living digital archive</strong>—a comprehensive,
        continually expanding resource that connects tradition and technology. By combining scholarly
        rigor with open access, we aim to make the wisdom of Imam Ali available to all who seek
        knowledge, reflection, and eloquence.
      </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
