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
    <section className="py-24 bg-[var(--color-parchment)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
            The People Behind Our Mission
          </p>
          <h2 className="font-display text-3xl lg:text-5xl text-[var(--color-ink)] mb-6">
            Our Team
          </h2>
          
          {/* Decorative ornament */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>
          
          <p className="font-body text-lg text-[var(--color-warm-gray)] max-w-2xl mx-auto">
            Meet the dedicated scholars and professionals who work tirelessly to preserve and share
            the wisdom of Nahj al-Balaghah with the world.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="relative bg-white border border-[var(--color-stone)] p-6 text-center"
            >
              {/* Avatar */}
              <div className="w-20 h-20 bg-[var(--color-primary)]/10 mx-auto mb-5 flex items-center justify-center">
                <User className="w-10 h-10 text-[var(--color-primary)]" />
              </div>

              {/* Name & Role */}
              <h3 className="font-display text-lg text-[var(--color-ink)] mb-1">{member.name}</h3>
              <p className="text-sm font-body text-[var(--color-primary)] mb-4">{member.role}</p>

              {/* Bio */}
              <p className="font-body text-sm text-[var(--color-warm-gray)] leading-relaxed mb-5">
                {member.bio}
              </p>

              {/* Social Links - these ARE clickable, so keep hover */}
              <div className="flex justify-center gap-3">
                <a
                  href={`mailto:${member.email}`}
                  className="w-9 h-9 border border-[var(--color-stone)] flex items-center justify-center text-[var(--color-warm-gray)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition-all duration-200"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={member.linkedin}
                  className="w-9 h-9 border border-[var(--color-stone)] flex items-center justify-center text-[var(--color-warm-gray)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition-all duration-200"
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
