import React, { useEffect } from 'react'

const content = {
  terms: {
    title: 'Terms of Service',
    intro: 'This is a preview of the terms that apply to TaskHub usage. Replace this copy with your final legal text before production release.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By accessing TaskHub, you agree to use the service in accordance with these terms and all applicable laws.'
      },
      {
        title: '2. Account Responsibility',
        body: 'You are responsible for keeping your account credentials secure and for all activity that occurs under your account.'
      },
      {
        title: '3. Acceptable Use',
        body: 'You may not misuse the platform, interfere with service operation, or attempt unauthorized access to systems or data.'
      },
      {
        title: '4. Service Availability',
        body: 'We may update, suspend, or discontinue features to maintain the stability, security, or performance of the service.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This is a preview of the privacy policy for TaskHub. Replace this copy with your final policy text before production launch.',
    sections: [
      {
        title: '1. Information We Collect',
        body: 'We collect account information, task content, and usage data needed to provide the service and keep it secure.'
      },
      {
        title: '2. How We Use Data',
        body: 'Your data is used to authenticate you, sync your workspace, send notifications, and improve product reliability.'
      },
      {
        title: '3. Cookies',
        body: 'We use essential cookies for login state and session preferences. Additional cookies may be used for analytics in the future.'
      },
      {
        title: '4. Your Rights',
        body: 'You may request access, correction, or deletion of your personal data where applicable under local law.'
      }
    ]
  }
}

export default function LegalPreviewModal({ open, type, onClose }) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !content[type]) {
    return null
  }

  const preview = content[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>

        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Legal Preview</p>
        <h2 className="mt-2 text-4xl font-bold text-white">{preview.title}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{preview.intro}</p>

        <div className="mt-8 space-y-4">
          {preview.sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}