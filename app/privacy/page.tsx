"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "../legal.css";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link href="/signup" className="back-link">
            <ArrowLeft size={18} /> Back to Signup
          </Link>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-date">Academic Project - VENTURA</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>Information We Collect</h2>
            <p>
              As part of this academic project, we collect basic information you
              provide when creating an account, including your name, email
              address, role (Innovator or Investor), and any content you choose
              to share such as posts, comments, and messages.
            </p>
          </section>

          <section className="legal-section">
            <h2>How We Use Your Information</h2>
            <p>
              Your information is used solely for the functionality of this
              academic project:
            </p>
            <ul>
              <li>To create and manage your account</li>
              <li>To display your profile and posts to other users</li>
              <li>To enable communication between innovators and investors</li>
              <li>
                To demonstrate the platform's features for evaluation purposes
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Your Information Is Safe</h2>
            <p>
              This is a performance task project, and your information will be
              kept safe and secure. We do not share your personal data with
              third parties. The platform is for demonstration purposes only.
            </p>
          </section>

          <section className="legal-section">
            <h2>No Cookies Used</h2>
            <p>
              VENTURA does not use cookies for tracking or advertising. Any
              session data is used only to keep you logged in during your visit.
            </p>
          </section>

          <section className="legal-section">
            <h2>Data Retention</h2>
            <p>
              Your information remains in the system for the duration of this
              academic project. If you wish to have your account deleted, please
              contact your course instructor.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>
              This is a student project. For any privacy concerns, please speak
              with your course instructor.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
