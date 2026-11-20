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
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
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
    <section id="contact-form-section" className="contact-form">
      <div className="contact-form__container">
        <div className="contact-form__grid">
          {/* Left Side - Contact Info */}
          <div>
            <h2 className="contact-form__title">
              Send Us a Message
            </h2>
            <p className="contact-form__description">
              Our team will respond as soon as possible. You can also reach us directly through the contact information below.
            </p>

            {/* Contact Details */}
            <div className="contact-form__details">
              <div className="contact-form__detail-row">
                <div className="contact-form__detail-icon-box">
                  <Mail className="w-5 h-5 contact-form__detail-icon" />
                </div>
                <div>
                  <span className="contact-form__detail-label">Email</span>
                  <span className="contact-form__detail-value">info@nahj-al-balagha.com</span>
                </div>
              </div>
              <div className="contact-form__detail-row">
                <div className="contact-form__detail-icon-box">
                  <Phone className="w-5 h-5 contact-form__detail-icon" />
                </div>
                <div>
                  <span className="contact-form__detail-label">Phone</span>
                  <span className="contact-form__detail-value">+98 21 1234 5678</span>
                </div>
              </div>
              <div className="contact-form__detail-row">
                <div className="contact-form__detail-icon-box">
                  <MapPin className="w-5 h-5 contact-form__detail-icon" />
                </div>
                <div>
                  <span className="contact-form__detail-label">Location</span>
                  <span className="contact-form__detail-value">Qom, Iran</span>
                </div>
              </div>
            </div>

            {/* Why Contact Us */}
            <div>
              <h3 className="contact-form__why-title">Why Contact Us?</h3>
              <div className="contact-form__why-list">
                {whyContact.map((item) => (
                  <div key={item.title} className="contact-form__why-item">
                    <div className="contact-form__why-icon-box">
                      <item.icon className="w-5 h-5 contact-form__why-icon" />
                    </div>
                    <div>
                      <h4 className="contact-form__why-item-title">{item.title}</h4>
                      <p className="contact-form__why-item-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="contact-form__card">
              {/* Corner accents */}
              <div className="contact-form__corner--top" />
              <div className="contact-form__corner--bottom" />

              <div className="contact-form__card-inner">
                {submitted ? (
                  <div className="contact-form__success">
                    <div className="contact-form__success-icon-box">
                      <CheckCircle className="w-8 h-8 contact-form__success-icon" />
                    </div>
                    <h3 className="contact-form__success-title">Message Sent!</h3>
                    <p className="contact-form__success-text">
                      Thank you for reaching out! We have received your message and our team will get back to you soon.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', message: '', consent: false });
                      }}
                      className="contact-form__success-link"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form__fields">
                    {/* Name Field */}
                    <div>
                      <label className="contact-form__label">
                        Name
                      </label>
                      <div className="contact-form__input-wrapper">
                        <User className="w-5 h-5 contact-form__input-icon" />
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="contact-form__input"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="contact-form__label">
                        Email
                      </label>
                      <div className="contact-form__input-wrapper">
                        <Mail className="w-5 h-5 contact-form__input-icon" />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@email.com"
                          className="contact-form__input"
                          required
                        />
                      </div>
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="contact-form__label">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Type your message here..."
                        rows={5}
                        className="contact-form__textarea"
                        required
                      />
                    </div>

                    {/* Consent Checkbox */}
                    <div className="contact-form__consent">
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={form.consent}
                        onChange={handleCheckboxChange}
                        className="contact-form__checkbox"
                      />
                      <label htmlFor="consent" className="contact-form__consent-label">
                        I agree to the <a href="/privacy" className="contact-form__consent-link">privacy policy</a>.
                      </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="contact-form__error">{error}</div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn-primary contact-form__submit"
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
