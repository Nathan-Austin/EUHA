
'use client';

import Link from 'next/link';
import { useState } from 'react';

const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link href={href} className="text-gray-300 hover:bg-white/10 hover:text-white px-3 py-2 rounded-md text-sm font-medium" onClick={onClick}>
    {children}
  </Link>
);

const Dropdown = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <span className="text-gray-300 hover:bg-white/10 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
        {title}
      </span>
      {isOpen && (
        <div className="absolute left-0 top-full z-[60] pt-1 w-48">
          <div className="rounded-md shadow-lg bg-[#08040e] ring-1 ring-white/20">
            <div className="py-1">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link href={href} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white" onClick={onClick}>
    {children}
  </Link>
);

const MobileDropdown = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-gray-300 hover:bg-white/10 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center justify-between"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pl-4 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/15 bg-[#08040e]/70 backdrop-blur-lg overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              Heat Awards
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/">Home</NavLink>
            <Dropdown title="About">
              <DropdownLink href="/prizes">Prizes</DropdownLink>
              <DropdownLink href="/judges">The Judges</DropdownLink>
              <DropdownLink href="/terms">Terms & Conditions</DropdownLink>
            </Dropdown>
            <Dropdown title="Enter Competition">
              <DropdownLink href="/apply/supplier">Entry Payment</DropdownLink>
              <DropdownLink href="/packing-sheet">Packing Sheet</DropdownLink>
            </Dropdown>
            <Dropdown title="Results">
              <DropdownLink href="/results">Past Results</DropdownLink>
              <DropdownLink href="/rankings">Global Rankings</DropdownLink>
            </Dropdown>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/sponsors">Sponsors</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>
          <div className="hidden md:block">
             <Link href="/login" className="bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] text-white font-bold py-2 px-4 rounded-full text-sm hover:opacity-90">
                Login
              </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login" className="bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] text-white font-bold py-1.5 px-3 rounded-full text-xs hover:opacity-90">
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink href="/" onClick={closeMobileMenu}>Home</NavLink>
            <MobileDropdown title="About">
              <DropdownLink href="/prizes" onClick={closeMobileMenu}>Prizes</DropdownLink>
              <DropdownLink href="/judges" onClick={closeMobileMenu}>The Judges</DropdownLink>
              <DropdownLink href="/terms" onClick={closeMobileMenu}>Terms & Conditions</DropdownLink>
            </MobileDropdown>
            <MobileDropdown title="Enter Competition">
              <DropdownLink href="/apply/supplier" onClick={closeMobileMenu}>Entry Payment</DropdownLink>
              <DropdownLink href="/packing-sheet" onClick={closeMobileMenu}>Packing Sheet</DropdownLink>
            </MobileDropdown>
            <MobileDropdown title="Results">
              <DropdownLink href="/results" onClick={closeMobileMenu}>Past Results</DropdownLink>
              <DropdownLink href="/rankings" onClick={closeMobileMenu}>Global Rankings</DropdownLink>
            </MobileDropdown>
            <NavLink href="/events" onClick={closeMobileMenu}>Events</NavLink>
            <NavLink href="/sponsors" onClick={closeMobileMenu}>Sponsors</NavLink>
            <NavLink href="/contact" onClick={closeMobileMenu}>Contact</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
