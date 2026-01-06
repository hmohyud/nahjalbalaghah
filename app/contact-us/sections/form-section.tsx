'use client';
import React, { useState } from 'react';
import { Mail, User, MapPin, Phone, MessageCircle, Info, ShieldCheck, Send, CheckCircle } from 'lucide-react';

const whyContact = [
  {
    icon: MessageCircle,
    title: 'Quick Support',
    desc: 'Get fast answers to your questions and issues.'
  },
  {
    icon: Info,
    title: 'Expert Guidance',
    desc: 'Our team is ready to help you with any inquiry.'
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    desc: 'Your information is always safe and confidential.'
  }
];

const ContactFormSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm((prev) => ({ ...prev, [name]: e.target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, consent: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || !form.consent) {
      setError('Please fill all fields and accept the privacy policy.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section id="contact-form-section" className="bg-[var(--color-parchment)] py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Side - Contact Info */}
          <div>
            <h2 className="font-display text-3xl lg:text-4xl text-[var(--color-ink)] mb-6">
              Send Us a Message
            </h2>
            <p className="font-body text-[var(--color-warm-gray)] mb-8 leading-relaxed">
              Our team will respond as soon as possible. You can also reach us directly through the contact information below.
            </p>

            {/* Contact Details */}
            <div className="space-y-4 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body block">Email</span>
                  <span className="font-body text-[var(--color-charcoal)]">info@nahj-al-balagha.com</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body block">Phone</span>
                  <span className="font-body text-[var(--color-charcoal)]">+98 21 1234 5678</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body block">Location</span>
                  <span className="font-body text-[var(--color-charcoal)]">Qom, Iran</span>
                </div>
              </div>
            </div>

            {/* Why Contact Us */}
            <div>
              <h3 className="font-display text-xl text-[var(--color-ink)] mb-6">Why Contact Us?</h3>
              <div className="space-y-4">
                {whyContact.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h4 className="font-body font-medium text-[var(--color-charcoal)] mb-1">{item.title}</h4>
                      <p className="font-body text-sm text-[var(--color-warm-gray)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="relative bg-white border border-[var(--color-stone)]">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-[var(--color-accent)]" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-[var(--color-accent)]" />

              <div className="p-6 lg:p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-display text-2xl text-[var(--color-ink)] mb-4">Message Sent!</h3>
                    <p className="font-body text-[var(--color-warm-gray)] mb-6">
                      Thank you for reaching out! We have received your message and our team will get back to you soon.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', message: '', consent: false });
                      }}
                      className="font-body text-[var(--color-primary)] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">
                        Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-warm-gray)]" />
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="w-full pl-12 pr-4 py-3 border border-[var(--color-stone)] font-body text-[var(--color-charcoal)] placeholder:text-[var(--color-warm-gray)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-warm-gray)]" />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@email.com"
                          className="w-full pl-12 pr-4 py-3 border border-[var(--color-stone)] font-body text-[var(--color-charcoal)] placeholder:text-[var(--color-warm-gray)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Type your message here..."
                        rows={5}
                        className="w-full px-4 py-3 border border-[var(--color-stone)] font-body text-[var(--color-charcoal)] placeholder:text-[var(--color-warm-gray)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
                        required
                      />
                    </div>

                    {/* Consent Checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={form.consent}
                        onChange={handleCheckboxChange}
                        className="mt-1 w-4 h-4 border-[var(--color-stone)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <label htmlFor="consent" className="font-body text-sm text-[var(--color-warm-gray)]">
                        I agree to the <a href="/privacy" className="text-[var(--color-primary)] hover:underline">privacy policy</a>.
                      </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="text-red-600 text-sm font-body">{error}</div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-primary)] text-white font-body font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
