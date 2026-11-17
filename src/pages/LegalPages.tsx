import { AGENCY_CONFIG } from '../config/agency';

function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-[#0B1020] py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-[#00D4FF]">{AGENCY_CONFIG.brandName} · Legal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-xs text-slate-400">Last updated: {updated}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-4xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-[#374151] shadow-sm sm:p-10">
          {children}
        </div>
      </section>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="November 2026">
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">1. Information We Collect</h2>
        <p className="mt-2">
          When you submit a project enquiry or contact request to {AGENCY_CONFIG.brandName}, we collect your full name, business name (optional), email address, WhatsApp/mobile number, business category, selected service or package, budget range, and project description.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">2. How We Use Your Information</h2>
        <p className="mt-2">
          Your contact and project details are used solely to review your requirements, send enquiry confirmation emails, prepare project quotations, and communicate via your preferred contact method. We never sell or rent customer lead data to third parties.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">3. Data Storage &amp; Payment Security</h2>
        <p className="mt-2">
          Enquiry records and payment reference metadata are stored securely using parameterized queries on Cloudflare D1. Online payments are processed via Razorpay; we never collect, process, or store your card numbers, CVV, or net-banking passwords on our servers.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">4. Contact for Data Requests</h2>
        <p className="mt-2">
          To request updates or deletion of your enquiry records, email{' '}
          <a href={`mailto:${AGENCY_CONFIG.email}`} className="text-[#2563EB] underline">
            {AGENCY_CONFIG.email}
          </a>
          .
        </p>
      </div>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms and Conditions" updated="November 2026">
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">1. Scope of Services</h2>
        <p className="mt-2">
          {AGENCY_CONFIG.brandName} ({AGENCY_CONFIG.location}) provides website design, full-stack web application development, SEO, and maintenance services based on mutually agreed project scope.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">2. Packages &amp; Separate Third-Party Charges</h2>
        <p className="mt-2">
          Standard package fees (₹7,999, ₹16,999, and ₹25,999) cover one-time development deliverables within the specified package scope. Domain registration, cloud hosting, paid third-party APIs, SMS/email provider plans, and ongoing maintenance after the complimentary support period are billed separately.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">3. Client Responsibilities &amp; Timelines</h2>
        <p className="mt-2">
          Project timelines depend on timely delivery of business content, logos, photographs, and feedback. Demonstration projects displayed in our portfolio showcase industry layouts and are clearly labeled as demonstration blueprints unless noted as live showcases.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">4. Intellectual Property</h2>
        <p className="mt-2">
          Upon full and final settlement of project fees, ownership of the custom website deliverables created for your business transfers to you, excluding underlying open-source libraries governed by their respective licenses.
        </p>
      </div>
    </LegalShell>
  );
}

export function RefundPolicyPage() {
  return (
    <LegalShell title="Refund and Cancellation Policy" updated="November 2026">
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">1. Project Cancellation Before Work Begins</h2>
        <p className="mt-2">
          If you cancel a confirmed order before design or development work has commenced, any advance payment received for development services is eligible for refund after deducting applicable payment gateway processing charges.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">2. Milestone &amp; In-Progress Projects</h2>
        <p className="mt-2">
          Once design mockups, development environments, or custom integrations have been initiated, refunds are evaluated proportionally based on completed milestones and actual engineering hours expended.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">3. Non-Refundable Third-Party Purchases</h2>
        <p className="mt-2">
          Domain name registrations, cloud hosting subscriptions, SSL certificates, and third-party software/API credits purchased on your behalf are strictly non-refundable once provisioned.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-[#0B1020]">4. Refund Processing</h2>
        <p className="mt-2">
          Approved refunds are processed back to the original payment method via Razorpay within 5 to 7 business days. For refund requests, write to{' '}
          <a href={`mailto:${AGENCY_CONFIG.email}`} className="text-[#2563EB] underline">
            {AGENCY_CONFIG.email}
          </a>{' '}
          with your Enquiry Reference Number and Order ID.
        </p>
      </div>
    </LegalShell>
  );
}
