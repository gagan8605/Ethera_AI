import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Lock } from 'lucide-react'

const sections = [
  {
    title: '1. Introduction & Who We Are',
    body: [
      'TaskHub, Inc. ("TaskHub," "we," "us," or "our") operates the TaskHub project management platform, accessible at taskhub.io and via our mobile applications (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard information about you when you use the Service.',
      'TaskHub acts as a data controller for information we collect about registered users and visitors. For User Content (tasks, projects, comments, and files) that you upload to the Service on behalf of your organization, TaskHub acts as a data processor, and your organization is the data controller.',
      'If you have questions or concerns about our data practices, you can contact our Data Protection Officer at: privacy@taskhub.io or write to: TaskHub, Inc., 1209 Orange Street, Wilmington, DE 19801, USA.',
    ]
  },
  {
    title: '2. Information We Collect',
    body: [
      'Account & Profile Information: When you register, we collect your name, email address, password (stored as a bcrypt hash — we never store plaintext passwords), optional profile photo, and job title. If you sign up via OAuth (Google, GitHub), we receive only the profile data you authorize through that provider.',
      'Workspace & Usage Data: We collect information about how you use the Service, including projects created, tasks assigned, feature interactions, session duration, browser type, operating system, IP address, and referring URLs. This helps us improve reliability and product features.',
      'Payment Information: If you subscribe to a paid plan, your billing details (card number, expiry, CVV) are processed directly by our payment processor, Stripe, Inc. TaskHub receives only a tokenized payment reference and the last four digits of your card. We never store full card numbers.',
      'Communications: If you contact our support team, we retain the contents of your messages to resolve your issue and improve our service quality. We may also collect responses to optional product surveys.',
      'Device & Technical Data: We automatically collect device identifiers, screen resolution, time zone, locale, and error/crash logs to diagnose technical issues and maintain service stability.',
      'Cookies & Tracking Technologies: See Section 5 for a full description of cookies we use.',
    ]
  },
  {
    title: '3. How We Use Your Information',
    body: [
      'To Provide & Maintain the Service: Authenticating your identity, syncing your workspace across devices, sending transactional emails (password resets, task notifications, team invitations), and maintaining database integrity.',
      'To Improve the Service: Analyzing aggregated, de-identified usage patterns to inform product decisions, A/B test new features, and prioritize bug fixes. We do not sell or share individual usage profiles with third parties for this purpose.',
      'For Security & Fraud Prevention: Monitoring for unauthorized account access, detecting abuse patterns, enforcing our Acceptable Use Policy, and complying with our obligations under applicable law.',
      'To Communicate with You: Sending service announcements, security alerts, and (with your consent) product newsletters and feature updates. You may opt out of marketing emails at any time via the unsubscribe link in each email or through your account notification settings.',
      'Legal Basis for Processing (GDPR): We process your data on the following grounds: (a) Contract performance — to deliver the services you have requested; (b) Legitimate interests — to improve the Service, ensure security, and prevent fraud; (c) Legal obligation — to comply with applicable laws; and (d) Consent — for marketing communications and optional analytics cookies.',
    ]
  },
  {
    title: '4. Data Sharing & Third-Party Processors',
    body: [
      'TaskHub does not sell, rent, or trade your personal information to any third party for their own marketing purposes. We share data only as necessary to deliver the Service, as described below.',
      'We engage trusted sub-processors who process data on our behalf under contractual obligations that meet or exceed GDPR Article 28 requirements. Key sub-processors include: Stripe (payment processing, USA), Amazon Web Services (cloud infrastructure, USA/EU), Postmark (transactional email, USA), Sentry (error monitoring, USA), and Cloudflare (CDN & DDoS protection, USA). A full and current list of sub-processors is available at taskhub.io/legal/sub-processors.',
      'We may disclose your information to law enforcement, regulators, or other parties: (a) in response to a valid legal request such as a court order or subpoena; (b) to protect the rights, property, or safety of TaskHub, our users, or the public; or (c) in connection with a merger, acquisition, or sale of assets, provided the acquiring entity agrees to honor this Privacy Policy or provide you with equivalent protections.',
      'If you participate in integrations (e.g., connecting TaskHub to Slack or GitHub), those third-party services will process your data according to their own privacy policies. We encourage you to review those policies before enabling integrations.',
    ]
  },
  {
    title: '5. Cookies & Tracking Technologies',
    body: [
      'We use cookies (small text files stored on your device) and similar technologies (localStorage, session storage, device fingerprinting pixels) to operate and improve the Service.',
      'Essential Cookies: Strictly necessary for the Service to function. These include session authentication cookies (httpOnly, Secure flag, SameSite=Strict) and CSRF protection tokens. These cannot be disabled without breaking core functionality.',
      'Preference Cookies: Store your UI settings such as sidebar state, theme selection, and notification preferences. Retained for 12 months.',
      'Analytics Cookies: We use privacy-preserving, cookieless analytics to understand aggregate usage patterns. No personal identifiers are shared with analytics providers. These are optional and can be disabled in your account settings.',
      'You can manage cookie preferences at any time via the Cookie Settings link in the site footer. Note that blocking essential cookies will impair your ability to log in and use the Service. Most web browsers also allow you to manage cookies through browser settings — refer to your browser\'s help documentation for instructions.',
    ]
  },
  {
    title: '6. Data Retention & Deletion',
    body: [
      'We retain your personal information for as long as your account is active or as needed to provide the Service. Specific retention periods by data category:',
      '• Account data (name, email, profile): retained for the duration of your account plus 30 days after deletion to allow recovery, then permanently deleted.\n• Workspace content (tasks, projects, comments): retained for the duration of your account plus 30 days; deleted upon confirmed account deletion.\n• Payment records and invoices: retained for 7 years to comply with financial regulations.\n• Server logs: retained for 90 days for security and debugging purposes.\n• Backup snapshots: purged on a rolling 30-day cycle.',
      'You may request deletion of your personal data at any time by emailing privacy@taskhub.io or using the "Delete Account" option in your account settings. We will process verified deletion requests within 30 days, except where retention is required by law or a legitimate interest such as fraud prevention or dispute resolution.',
    ]
  },
  {
    title: '7. Data Security',
    body: [
      'TaskHub implements technical and organizational security measures designed to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:',
      '• Encryption in transit: All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher.\n• Encryption at rest: Database contents and file storage are encrypted using AES-256.\n• Access controls: Production data access is restricted to authorized personnel on a need-to-know basis, with access logged and audited.\n• Multi-factor authentication: Required for all TaskHub engineers with production access.\n• Regular security assessments: We conduct annual penetration tests and quarterly vulnerability scans.\n• Incident response: We maintain a documented data breach response plan, including notification of affected users and regulators within 72 hours where required by GDPR.',
      'No method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security. If you discover a security vulnerability, please report it responsibly to security@taskhub.io.',
    ]
  },
  {
    title: '8. International Data Transfers',
    body: [
      'TaskHub is headquartered in the United States and our primary infrastructure is hosted on AWS infrastructure in the US-East-1 and EU-West-1 regions. If you access the Service from outside the United States, your information may be transferred to and processed in the United States or other countries where our sub-processors operate.',
      'For transfers of personal data from the European Economic Area (EEA), United Kingdom, or Switzerland to countries not recognized as having adequate data protection, TaskHub relies on Standard Contractual Clauses (SCCs) as approved by the European Commission, or other lawful transfer mechanisms. Data Processing Agreements incorporating SCCs are in place with all relevant sub-processors.',
      'Residents of the EEA and UK may contact us at privacy@taskhub.io to obtain a copy of the applicable transfer safeguards.',
    ]
  },
  {
    title: '9. Your Rights & Choices',
    body: [
      'Depending on your location, you may have the following rights regarding your personal data. To exercise any of these rights, email privacy@taskhub.io with "Privacy Request" in the subject line. We will respond within 30 days (extendable by an additional 60 days for complex requests, with notice).',
      '• Right of Access (GDPR Art. 15 / CCPA): Request a copy of the personal data we hold about you.\n• Right to Rectification (GDPR Art. 16): Request correction of inaccurate or incomplete data. Most profile data can be updated directly in your account settings.\n• Right to Erasure (GDPR Art. 17 / CCPA): Request deletion of your personal data, subject to legal retention obligations.\n• Right to Restrict Processing (GDPR Art. 18): Request that we limit processing of your data while a dispute is resolved.\n• Right to Data Portability (GDPR Art. 20): Request your data in a structured, machine-readable format (CSV or JSON).\n• Right to Object (GDPR Art. 21): Object to processing based on legitimate interests.\n• Right to Opt Out of Sale (CCPA): TaskHub does not sell personal information. No opt-out is required.\n• Right to Non-Discrimination (CCPA): We will not discriminate against you for exercising your privacy rights.',
      'If you are located in the EU or UK and are not satisfied with our response, you have the right to lodge a complaint with your local supervisory authority. A list of EU Data Protection Authorities is available at edpb.europa.eu.',
    ]
  },
  {
    title: '10. Children\'s Privacy',
    body: [
      'The Service is not directed to children under the age of 16 (or the applicable age of digital consent in your jurisdiction, which may be higher in some countries — up to 18 in some EU member states). We do not knowingly collect personal information from children below this age.',
      'If you believe we have inadvertently collected information from a child, please contact us immediately at privacy@taskhub.io and we will take prompt steps to delete that information and terminate the associated account.',
    ]
  },
  {
    title: '11. Third-Party Links & Integrations',
    body: [
      'The Service may contain links to third-party websites, apps, or services, and may allow you to connect TaskHub with external tools. This Privacy Policy does not apply to those third parties. We encourage you to review the privacy policies of any third-party services you access through TaskHub.',
      'TaskHub is not responsible for the privacy practices, security measures, or content of any third-party services. Your interactions with integrated services are governed by those services\' own terms and privacy policies.',
    ]
  },
  {
    title: '12. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will notify you by: (a) posting a notice on the Service at least 14 days before the changes take effect; (b) sending an email to the address associated with your account; and/or (c) displaying a prominent in-app banner.',
      'The "Effective Date" at the top of this policy indicates when it was last updated. Your continued use of the Service after the effective date of the updated Policy constitutes your acceptance of the changes. If you do not agree to the updated Policy, you should stop using the Service and may request deletion of your account.',
    ]
  },
]

function Section({ section, index }) {
  const [open, setOpen] = useState(index < 2)

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition"
      >
        <h2 className="text-sm font-semibold text-white">{section.title}</h2>
        {open
          ? <ChevronUp size={16} className="text-purple-400 shrink-0 ml-3" />
          : <ChevronDown size={16} className="text-slate-500 shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
          {section.body.map((para, i) => (
            <p key={i} className="text-sm leading-6 text-slate-300 whitespace-pre-line">{para}</p>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-purple-400" />
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300">Legal Document</p>
            </div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="mt-1 text-sm text-slate-400">TaskHub, Inc. &nbsp;·&nbsp; Effective Date: January 1, 2025 &nbsp;·&nbsp; Version 2.1</p>
          </div>
          <Link
            to="/register"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 whitespace-nowrap"
          >
            ← Back to Register
          </Link>
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['GDPR Compliant', 'CCPA Compliant', 'TLS 1.2+ Encrypted', 'AES-256 at Rest'].map(badge => (
            <span key={badge} className="text-xs px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">
              {badge}
            </span>
          ))}
        </div>

        {/* Intro */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 mb-8">
          <p className="text-sm leading-6 text-slate-300">
            Your privacy matters to us. This policy explains exactly what data TaskHub collects, why we collect it,
            how long we keep it, and the rights you have over it. We have written it to be as clear and specific as
            possible — no vague legalese. For questions, email{' '}
            <a href="mailto:privacy@taskhub.io" className="text-purple-400 hover:underline">privacy@taskhub.io</a>.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Table of Contents</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-xs text-slate-400 hover:text-purple-400 transition"
                  onClick={e => { e.preventDefault(); document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth' }) }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <div id={`section-${i}`} key={section.title}>
              <Section section={section} index={i} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} TaskHub, Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-purple-400 transition">Terms of Service</Link>
            <a href="mailto:privacy@taskhub.io" className="hover:text-purple-400 transition">Contact DPO</a>
          </div>
        </div>
      </div>
    </div>
  )
}