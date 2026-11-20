"use client";
import React from 'react'
import { User, Mail, Linkedin } from 'lucide-react'

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Dr. Ahmed Hassan",
      role: "Founder & Director",
      bio: "PhD in Islamic Studies with over 20 years of experience in Islamic scholarship and education.",
      email: "ahmed.hassan@example.com",
      linkedin: "#"
    },
    {
      name: "Dr. Fatima Al-Zahra",
      role: "Chief Scholar",
      bio: "Expert in Nahj al-Balaghah studies with numerous publications on Islamic philosophy and theology.",
      email: "fatima.alzahra@example.com",
      linkedin: "#"
    },
    {
      name: "Dr. Omar Ibn Khattab",
      role: "Research Director",
      bio: "Specializes in Islamic manuscripts and historical texts, leading our research initiatives.",
      email: "omar.khattab@example.com",
      linkedin: "#"
    },
    {
      name: "Dr. Aisha Bint Abu Bakr",
      role: "Education Coordinator",
      bio: "Dedicated to making Islamic education accessible through innovative teaching methods.",
      email: "aisha.bakr@example.com",
      linkedin: "#"
    }
  ]

  return (
    <section className="team-section">
      <div className="team-section__container">
        {/* Header */}
        <div className="team-section__header">
          <p className="team-section__label">
            The People Behind Our Mission
          </p>
          <h2 className="team-section__title">
            Our Team
          </h2>

          {/* Decorative ornament */}
          <div className="team-section__ornament">
            <div className="team-section__ornament-line team-section__ornament-line--right" />
            <div className="team-section__ornament-diamond" />
            <div className="team-section__ornament-line team-section__ornament-line--left" />
          </div>

          <p className="team-section__description">
            Meet the dedicated scholars and professionals who work tirelessly to preserve and share
            the wisdom of Nahj al-Balaghah with the world.
          </p>
        </div>

        {/* Team Grid */}
        <div className="team-section__grid">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="team-section__card"
            >
              {/* Avatar */}
              <div className="team-section__avatar">
                <User className="team-section__avatar-icon" />
              </div>

              {/* Name & Role */}
              <h3 className="team-section__name">{member.name}</h3>
              <p className="team-section__role">{member.role}</p>

              {/* Bio */}
              <p className="team-section__bio">
                {member.bio}
              </p>

              {/* Social Links - these ARE clickable, so keep hover */}
              <div className="team-section__socials">
                <a
                  href={`mailto:${member.email}`}
                  className="team-section__social-link"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={member.linkedin}
                  className="team-section__social-link"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamSection
