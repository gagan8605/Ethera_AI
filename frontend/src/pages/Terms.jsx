import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By creating an account, clicking "I Agree," or otherwise accessing or using TaskHub (the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy, which is incorporated herein by reference. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and TaskHub, Inc. ("TaskHub," "we," "us," or "our").',
      'If you are accepting these Terms on behalf of a company or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms. In that case, "you" and "your" will refer to that entity. If you do not have such authority, or if you do not agree to these Terms, you must not access or use the Service.',
      'We may revise these Terms at any time. We will notify you of material changes by posting a notice on the Service or sending an email to the address associated with your account at least 14 days before the changes take effect. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of those changes.',
    ]
  },
  {
    title: '2. Eligibility & Account Registration',
    body: [
      'You must be at least 16 years of age (or the applicable age of digital consent in your jurisdiction) to use the Service. By using TaskHub, you represent and warrant that you meet this requirement and that all registration information you provide is accurate, current, and complete.',
      'You are responsible for maintaining the confidentiality of your account credentials, including your password, and for all activity that occurs under your account. You agree to notify us immediately at security@taskhub.io of any unauthorized use of your account or any other breach of security. TaskHub will not be liable for any loss or damage arising from your failure to comply with this obligation.',
      'You may not create an account using a false identity, impersonate another person or entity, or use the Service if your account has been previously suspended or terminated by TaskHub. You may not share, sell, or transfer your account credentials to any third party.',
    ]
  },
  {
    title: '3. License Grant & Restrictions',
    body: [
      'Subject to your compliance with these Terms, TaskHub grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service solely for your internal business purposes. This license does not include any right to resell, distribute, or make the Service available to third parties as a standalone product.',
      'You may not: (a) copy, modify, create derivative works of, or reverse engineer the Service or any portion thereof; (b) remove or alter any proprietary notices, labels, or marks; (c) use the Service to build a competing product or service; (d) access the Service through automated means (bots, scrapers) without our prior written consent; (e) sublicense, sell, resell, transfer, or otherwise exploit the Service commercially; or (f) use the Service in any manner that could damage, disable, overburden, or impair our servers or networks.',
      'TaskHub reserves the right to modify, suspend, or discontinue any feature of the Service with reasonable prior notice. We will endeavor to provide at least 30 days notice for material feature removals that impact existing workflows.',
    ]
  },
  {
    title: '4. Acceptable Use Policy',
    body: [
      'You agree to use the Service only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the Service. Prohibited conduct includes, but is not limited to: uploading, transmitting, or distributing content that is unlawful, harassing, defamatory, obscene, or invasive of privacy; impersonating any person or entity; transmitting unsolicited bulk communications (spam); or introducing malware, viruses, or any other harmful code.',
      'You may not use the Service to: process or store data in violation of applicable export control laws; conduct unauthorized penetration testing or security assessments of our infrastructure; circumvent or disable any security or access control mechanisms; or engage in any activity that violates applicable local, national, or international law or regulation.',
      'TaskHub reserves the right to investigate violations of this policy and may, at its sole discretion, remove offending content, suspend or terminate accounts, and report illegal activity to law enforcement authorities.',
    ]
  },
  {
    title: '5. User Content & Data Ownership',
    body: [
      'You retain full ownership of all data, files, content, and information you submit, upload, or create through the Service ("User Content"). TaskHub does not claim any intellectual property rights over your User Content. By using the Service, you grant TaskHub a limited, worldwide, royalty-free license to host, store, process, and display your User Content solely as necessary to provide and improve the Service.',
      'You are solely responsible for the accuracy, quality, integrity, and legality of your User Content and the means by which you acquired it. You represent and warrant that you have all necessary rights, licenses, or permissions to submit your User Content to the Service and that doing so does not violate any third-party rights.',
      'TaskHub will not access, review, or use your User Content except: (a) as needed to provide technical support you have requested; (b) to comply with a valid legal obligation; (c) to investigate a suspected violation of these Terms; or (d) as otherwise described in our Privacy Policy.',
    ]
  },
  {
    title: '6. Intellectual Property Rights',
    body: [
      'The Service and all related components — including but not limited to software, source code, interfaces, designs, graphics, logos, icons, text, and documentation — are the exclusive property of TaskHub, Inc. and are protected by applicable intellectual property laws, including copyright, trademark, and trade secret law.',
      '"TaskHub" and associated logos and product names are trademarks of TaskHub, Inc. You may not use our trademarks or trade dress in connection with any product or service without our prior written consent. Nothing in these Terms transfers any intellectual property rights to you other than the limited license expressly granted herein.',
      'If you provide TaskHub with feedback, suggestions, or ideas regarding the Service ("Feedback"), you grant us an irrevocable, perpetual, worldwide, royalty-free license to use, incorporate, and commercialize that Feedback without any obligation to you.',
    ]
  },
  {
    title: '7. Subscription, Billing & Payment',
    body: [
      'Access to certain features of the Service requires a paid subscription. By subscribing, you authorize TaskHub (or our designated payment processor) to charge your payment method on a recurring basis at the then-current rate for your selected plan. All fees are stated in USD and are non-refundable except as expressly provided in these Terms or required by applicable law.',
      'Subscriptions automatically renew at the end of each billing cycle unless you cancel at least 48 hours before the renewal date. We will notify you by email at least 7 days before any price change takes effect. Continued use of the Service after the price change constitutes acceptance of the new pricing.',
      'If payment fails, we will notify you and may suspend access to paid features until payment is resolved. Accounts with unresolved payment failures for more than 30 days may be terminated. Upon termination for non-payment, you remain liable for all outstanding amounts.',
    ]
  },
  {
    title: '8. Confidentiality',
    body: [
      '"Confidential Information" means any non-public information disclosed by either party to the other that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. Each party agrees to hold the other\'s Confidential Information in strict confidence and not to disclose it to any third party except as expressly permitted herein.',
      'These confidentiality obligations do not apply to information that: (a) is or becomes publicly available through no breach of these Terms; (b) was rightfully known by the receiving party prior to disclosure; (c) is independently developed by the receiving party without use of Confidential Information; or (d) is required to be disclosed by law or court order, provided the receiving party gives the disclosing party prompt written notice and reasonably cooperates with efforts to obtain protective treatment.',
    ]
  },
  {
    title: '9. Service Level & Availability',
    body: [
      'TaskHub targets 99.9% monthly uptime for the core Service ("SLA Target"), measured on a calendar-month basis. Downtime for the purpose of this SLA is defined as periods during which the Service is inaccessible to all users, excluding scheduled maintenance windows announced at least 24 hours in advance, force majeure events, or issues caused by third-party services outside our control.',
      'In the event of a breach of the SLA Target in any given calendar month, eligible paid subscribers may request a service credit equal to 5% of their monthly subscription fee for each full percentage point below the SLA Target, up to a maximum of 30% of fees for that month. Service credits are the sole and exclusive remedy for SLA failures.',
      'We perform routine maintenance typically during off-peak hours (02:00–04:00 UTC on Sundays). Emergency maintenance may be performed without advance notice if required to protect service security or stability.',
    ]
  },
  {
    title: '10. Disclaimer of Warranties',
    body: [
      'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TASKHUB EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.',
      'TASKHUB DOES NOT WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS; (B) ANY DEFECTS WILL BE CORRECTED; (C) THE SERVICE OR SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL CODE; OR (D) THE RESULTS OF USING THE SERVICE WILL MEET YOUR REQUIREMENTS. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.',
    ]
  },
  {
    title: '11. Limitation of Liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL TASKHUB, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES — INCLUDING, WITHOUT LIMITATION, LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS INTERRUPTION — EVEN IF TASKHUB HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
      "TASKHUB'S TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO TASKHUB IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD $100. THIS LIMITATION APPLIES REGARDLESS OF THE LEGAL THEORY (CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE). SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIABILITY LIMITATIONS, SO THE ABOVE MAY NOT FULLY APPLY TO YOU.",
    ]
  },
  {
    title: '12. Indemnification',
    body: [
      'You agree to indemnify, defend, and hold harmless TaskHub and its officers, directors, employees, contractors, agents, licensors, and successors from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or in any way connected with: (a) your access to or use of the Service; (b) your User Content; (c) your violation of these Terms; (d) your violation of any third-party rights, including intellectual property rights or privacy rights; or (e) your violation of any applicable law or regulation.',
      'TaskHub reserves the right, at your expense, to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with our defense of such claims. You shall not settle any claim without the prior written consent of TaskHub.',
    ]
  },
  {
    title: '13. Termination',
    body: [
      'Either party may terminate these Terms at any time. You may terminate by ceasing to use the Service and deleting your account. TaskHub may suspend or terminate your access to the Service, with or without notice, if we reasonably believe you have violated these Terms, if required by law, or if your account has been inactive for more than 24 consecutive months.',
      'Upon termination for any reason: your license to use the Service immediately ceases; you must stop accessing and using the Service; and TaskHub may delete your User Content after a 30-day grace period during which you may export your data. We will retain data as required by law or for legitimate business purposes. Sections 5–6, 8, 10–12, 14, and 15 survive termination.',
    ]
  },
  {
    title: '14. Governing Law & Dispute Resolution',
    body: [
      'These Terms are governed by and construed in accordance with the laws of the State of Delaware, USA, without regard to conflict of law principles. The United Nations Convention on Contracts for the International Sale of Goods does not apply.',
      'Before filing any claim, you agree to attempt informal resolution by emailing legal@taskhub.io with a written description of the dispute and your desired resolution. If the dispute is not resolved within 30 days, either party may pursue formal proceedings. Any legal action must be brought exclusively in the state or federal courts located in Wilmington, Delaware, and you consent to personal jurisdiction in such courts.',
      'FOR USERS IN THE EUROPEAN UNION: Nothing in these Terms affects your rights as a consumer under applicable EU law, including your right to bring proceedings before the courts of your country of residence.',
    ]
  },
  {
    title: '15. General Provisions',
    body: [
      'These Terms, together with our Privacy Policy and any order forms or supplemental agreements, constitute the entire agreement between you and TaskHub regarding the Service and supersede all prior and contemporaneous understandings. If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.',
      'Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. You may not assign or transfer these Terms or any rights hereunder without our prior written consent. TaskHub may freely assign these Terms, including in connection with a merger, acquisition, or sale of assets.',
      'Notices to you may be delivered via email, in-app notification, or by posting to the Service. Notices to TaskHub must be sent to legal@taskhub.io. For questions regarding these Terms, contact us at support@taskhub.io.',
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
            <p key={i} className="text-sm leading-6 text-slate-300">{para}</p>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-purple-400" />
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300">Legal Document</p>
            </div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="mt-1 text-sm text-slate-400">TaskHub, Inc. &nbsp;·&nbsp; Effective Date: January 1, 2025 &nbsp;·&nbsp; Version 2.1</p>
          </div>
          <Link
            to="/register"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 whitespace-nowrap"
          >
            ← Back to Register
          </Link>
        </div>

        {/* Intro */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 mb-8">
          <p className="text-sm leading-6 text-slate-300">
            Please read these Terms of Service carefully before using TaskHub. These Terms govern your access to and use of our
            project management platform, APIs, and related services. By using TaskHub, you agree to be bound by these Terms.
            If you have questions, contact us at{' '}
            <a href="mailto:legal@taskhub.io" className="text-purple-400 hover:underline">legal@taskhub.io</a>.
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
            <Link to="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link>
            <a href="mailto:legal@taskhub.io" className="hover:text-purple-400 transition">Contact Legal</a>
          </div>
        </div>
      </div>
    </div>
  )
}