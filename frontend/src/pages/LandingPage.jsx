import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { MdSecurity, MdFlashOn, MdHandshake } from 'react-icons/md';
import { FaShip } from 'react-icons/fa';

const features = [
  { icon: <FaShip size={36} />, title: 'Track Shipments', desc: 'Monitor every shipment in real time, anywhere in the world.' },
  { icon: <MdSecurity size={36} />, title: 'Blockchain Security', desc: 'Immutable records and transparent status updates.' },
  { icon: <MdFlashOn size={36} />, title: 'Instant Updates', desc: 'Get notified the moment your shipment status changes.' },
  { icon: <MdHandshake size={36} />, title: 'Easy Collaboration', desc: 'Share shipment status securely with partners and customers.' },
];

const howItWorks = [
  { step: 1, title: 'Register', desc: 'Create your account and onboard your company or as an individual.' },
  { step: 2, title: 'Add Shipments', desc: 'Register shipments and update their status on the blockchain.' },
  { step: 3, title: 'Track & Share', desc: 'Monitor progress and share updates with your network.' },
];

const testimonials = [
  { name: 'Maria S.', text: 'SeeChain made our global shipping transparent and stress-free. Real-time updates are a game changer!' },
  { name: 'James T.', text: 'The blockchain integration gives us peace of mind. We always know where our cargo is.' },
  { name: 'Aiko Y.', text: 'Onboarding was simple and the dashboard is intuitive. Highly recommended for any logistics company.' },
];

const LandingPage = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx(idx => (idx + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-root">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="navbar-logo">
          <span style={{display: 'inline-block', height: '40px', width: '40px', marginRight: '12px', verticalAlign: 'middle'}}>
            {/* Modern shipping SVG icon (unDraw style) */}
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="24" width="48" height="24" rx="6" fill="#00bcd4"/>
              <rect x="16" y="16" width="32" height="16" rx="4" fill="#00796b"/>
              <circle cx="20" cy="52" r="4" fill="#fff"/>
              <circle cx="44" cy="52" r="4" fill="#fff"/>
              <rect x="28" y="28" width="8" height="8" rx="2" fill="#e0f7fa"/>
            </svg>
          </span>
          SeeChain
        </div>
        <div className="navbar-links">
          <Link to="/signin" className="nav-link">Sign In</Link>
          <Link to="/register" className="nav-link nav-link-cta">Register</Link>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="hero-bg-shapes" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e0f7fa" fillOpacity="1" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
          </svg>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Track Shipments. Build Trust.</h1>
          <p className="hero-subtitle">The modern platform for transparent, secure, and real-time shipment tracking—powered by blockchain.</p>
          <Link to="/register" className="hero-cta">Get Started</Link>
        </div>
      </section>
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose SeeChain?</h2>
        <div className="features-grid">
          {features.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* How It Works Section */}
      <section className="howit-section">
        <h2 className="section-title">How It Works</h2>
        <div className="howit-steps">
          {howItWorks.map(step => (
            <div className="howit-card" key={step.step}>
              <div className="howit-step">{step.step}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-cards">
          {testimonials.map((t, idx) => (
            <div className={`testimonial-card${idx === testimonialIdx ? ' active' : ''}`} key={t.name}>
              <p className="testimonial-text">“{t.text}”</p>
              <p className="testimonial-author">- {t.name}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">Docs</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
        <p className="footer-copyright">&copy; {new Date().getFullYear()} SeeChain. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage; 