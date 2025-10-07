
'use client';

import Link from 'next/link';
import { useState } from 'react';

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="text-gray-300 hover:bg-white/10 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
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
        <div className="absolute z-10 -mt-1 pt-3 w-48">
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

const DropdownLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white">
    {children}
  </Link>
);

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/15 bg-[#08040e]/70 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              Heat Awards
            </Link>
          </div>
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
