
import Link from 'next/link';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="text-base text-gray-400 hover:text-white">
    {children}
  </Link>
);

const Footer = () => {
  return (
    <footer className="bg-[#08040e]/70 border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li><FooterLink href="/">Home</FooterLink></li>
              <li><FooterLink href="/login">Login</FooterLink></li>
              <li><FooterLink href="/dashboard">Dashboard</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Competition</h3>
            <ul className="mt-4 space-y-4">
              <li><FooterLink href="/apply/supplier">Enter</FooterLink></li>
              <li><FooterLink href="/prizes">Prizes</FooterLink></li>
              <li><FooterLink href="/terms">Terms</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">About</h3>
            <ul className="mt-4 space-y-4">
              <li><FooterLink href="/judges">Judges</FooterLink></li>
              <li><FooterLink href="/sponsors">Sponsors</FooterLink></li>
              <li><FooterLink href="/contact">Contact</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Results</h3>
            <ul className="mt-4 space-y-4">
              <li><FooterLink href="/results">Past Results</FooterLink></li>
              <li><FooterLink href="/rankings">Global Rankings</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Social</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="https://www.instagram.com/europeanhotsauceawards/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-400 hover:text-white">Instagram</a></li>
              <li><a href="mailto:heataward@gmail.com" className="text-base text-gray-400 hover:text-white">Email</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-base text-gray-400">&copy; 2026 Heat Awards Europe. All rights reserved.</p>
          <div className="flex space-x-6 md:order-1">
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/cookies">Cookie Policy</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
