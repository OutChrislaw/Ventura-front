"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "../legal.css";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link href="/signup" className="back-link">
            <ArrowLeft size={18} /> Back to Signup
          </Link>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-date">Academic Project - VENTURA</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>About This Project</h2>
            <p>
              VENTURA is a performance task project for academic purposes. This
              platform is designed to demonstrate the functionality of a social
              network connecting innovators and investors.
            </p>
          </section>

          <section className="legal-section">
            <h2>Acceptance of Terms</h2>
            <p>
              By using VENTURA, you agree to use this platform responsibly and
              respectfully. This is an academic project, and all interactions
              should be conducted in a professional manner.
            </p>
          </section>

          <section className="legal-section">
            <h2>User Responsibilities</h2>
            <p>As a user of VENTURA, you agree to:</p>
            <ul>
              <li>Provide accurate and honest information about yourself</li>
              <li>Respect other users and their ideas</li>
              <li>Not post harmful, offensive, or inappropriate content</li>
              <li>
                Use the platform for its intended purpose - connecting
                innovators with investors
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms or engage in inappropriate behavior.
            </p>
          </section>

          <section className="legal-section">
            <h2>Disclaimer</h2>
            <p>
              VENTURA is an academic project and does not guarantee actual
              investment outcomes. Any investment decisions made through
              connections on this platform are at your own risk.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>
              For questions about this project, please contact your course
              instructor or the project team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
