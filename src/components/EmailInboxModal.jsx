import React, { useState } from 'react';
import { Mail, X, ShieldCheck, Copy, Check, Clock, ExternalLink, Inbox, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EmailInboxModal() {
  const {
    emailInbox,
    isInboxModalOpen,
    setIsInboxModalOpen,
    pendingAuth
  } = useAuth();

  const [copiedId, setCopiedId] = useState(null);

  if (!isInboxModalOpen) return null;

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="email-inbox-overlay" onClick={() => setIsInboxModalOpen(false)}>
      <div className="email-inbox-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Inbox Header */}
        <div className="inbox-header">
          <div className="inbox-brand">
            <div className="inbox-icon-wrap">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="inbox-title">Webmail Security Inbox</h3>
              <span className="inbox-user-email">
                Recipient: {pendingAuth?.email || 'user@example.com'}
              </span>
            </div>
          </div>
          <button
            className="inbox-close-btn"
            onClick={() => setIsInboxModalOpen(false)}
            title="Close Email Viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Email Content Body */}
        <div className="inbox-scroll-body">
          {emailInbox.length === 0 ? (
            <div className="empty-inbox">
              <Inbox size={40} className="empty-icon" />
              <p>No emails yet. Submit the registration form to receive your verification code.</p>
            </div>
          ) : (
            emailInbox.map((mail) => (
              <div key={mail.id} className="official-email-card">
                {/* Email Meta Header */}
                <div className="email-meta-header">
                  <div className="email-meta-row">
                    <span className="meta-label">From:</span>
                    <span className="meta-value sender-highlight">{mail.from}</span>
                  </div>
                  <div className="email-meta-row">
                    <span className="meta-label">To:</span>
                    <span className="meta-value">{mail.to}</span>
                  </div>
                  <div className="email-meta-row">
                    <span className="meta-label">Date:</span>
                    <span className="meta-value">{mail.date}</span>
                  </div>
                  <div className="email-meta-row">
                    <span className="meta-label">Subject:</span>
                    <span className="meta-value subject-highlight">{mail.subject}</span>
                  </div>
                </div>

                <div className="email-divider" />

                {/* Email Letter Layout */}
                <div className="email-letter-body">
                  <div className="letter-brand-row">
                    <span className="letter-logo">Flipkart Music <span>PLUS</span></span>
                    <span className="security-tag">
                      <ShieldCheck size={12} />
                      <span>OFFICIAL VERIFICATION</span>
                    </span>
                  </div>

                  <p className="letter-greeting">Dear <strong>{mail.recipientName}</strong>,</p>
                  <p className="letter-text">
                    Thank you for signing up for <strong>Flipkart Music Plus</strong>. To verify your email address and authorize your unlimited 320kbps Studio Master streaming access, please use the One-Time Password (OTP) below:
                  </p>

                  {/* Big OTP Showcase Box */}
                  <div className="otp-showcase-box">
                    <span className="otp-large-digits">{mail.code}</span>
                    <button
                      className={`copy-otp-pill-btn ${copiedId === mail.id ? 'copied' : ''}`}
                      onClick={() => handleCopyCode(mail.code, mail.id)}
                    >
                      {copiedId === mail.id ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy 6-Digit Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="letter-security-notice">
                    <Clock size={15} className="notice-icon" />
                    <div>
                      <strong>Security Note:</strong> This verification code is valid for <strong>10 minutes</strong>. Never share this code with anyone. Flipkart representatives will never ask for your password or OTP.
                    </div>
                  </div>

                  <div className="letter-signoff">
                    <span>Best regards,</span>
                    <strong>Flipkart Identity & Security Operations</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
