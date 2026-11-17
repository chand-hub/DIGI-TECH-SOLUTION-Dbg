import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { buildWhatsAppUrl } from '../config/agency';

interface WhatsAppFloatProps {
  whatsappNumber: string;
  activeService?: string;
  activePackage?: string;
}

export function WhatsAppFloat({ whatsappNumber, activeService, activePackage }: WhatsAppFloatProps) {
  const [hovered, setHovered] = useState(false);

  const href = buildWhatsAppUrl(whatsappNumber, {
    service: activeService,
    packageName: activePackage,
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 sm:bottom-6 sm:right-6">
      {hovered && (
        <div
          role="tooltip"
          className="hidden sm:block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0B1020] shadow-lg whitespace-nowrap"
        >
          {activePackage
            ? `Discuss ${activePackage} on WhatsApp`
            : activeService
              ? `Ask about ${activeService}`
              : 'Chat on WhatsApp'}
        </div>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with DIGI TECH SOLUTION on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </a>
    </div>
  );
}
