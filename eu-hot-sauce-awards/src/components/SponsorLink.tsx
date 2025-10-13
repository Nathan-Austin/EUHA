'use client';

interface SponsorLinkProps {
  href: string;
  sponsorName: string;
  className?: string;
  children: React.ReactNode;
}

export default function SponsorLink({ href, sponsorName, className, children }: SponsorLinkProps) {
  const handleClick = () => {
    // Track outbound click with GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'outbound',
        event_label: sponsorName,
        transport_type: 'beacon',
        link_url: href,
      });
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
