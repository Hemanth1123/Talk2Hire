// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mic, CalendarCheck, ShieldCheck } from "lucide-react";
import { getToken } from "../utils/auth";
import "../styles/Home.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Welcome to <span className="highlight">Hack2Hire</span>
        </h1>
        <p className="hero-subtitle">
          Experience the future of hiring. Conduct intelligent, automated voice
          interviews and manage candidates effortlessly.
        </p>

        {/* ✅ Hide these buttons when logged in */}
        {!isLoggedIn && (
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn-outline">
              Login
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">Why Choose Hack2Hire?</h2>
        <div className="features-grid">
          <FeatureCard
            icon={<Mic className="icon" />}
            title="AI-Powered Interviews"
            description="Smart and consistent interviews using natural voice interactions."
          />
          <FeatureCard
            icon={<Brain className="icon" />}
            title="Candidate Insights"
            description="Instant analysis of candidate answers with AI-driven assessments."
          />
          <FeatureCard
            icon={<CalendarCheck className="icon" />}
            title="Easy Scheduling"
            description="Book and manage interviews seamlessly through our scheduler."
          />
          <FeatureCard
            icon={<ShieldCheck className="icon" />}
            title="Secure & Reliable"
            description="All candidate data and recordings are encrypted for privacy."
          />
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="trusted-section">
        <p className="trusted-text">Trusted by leading companies</p>
        <div className="trusted-logos">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
            alt="Amazon"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
            alt="Google"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Hack2Hire. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}


