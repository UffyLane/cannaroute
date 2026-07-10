'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const links = [
  { label: 'Dispensaries', href: '#dispensaries' },
  { label: 'Growers',      href: '#growers' },
  { label: 'Customers',    href: '#customers' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Demo',         href: '#demo' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(6,15,8,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex-shrink-0">
            {/* Heart leaf icon */}
            <svg viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M20,38 C18,34 -2,22 -2,8 C-2,-6 10,-10 20,0 C30,-10 42,-6 42,8 C42,22 22,34 20,38Z"
                fill="#1e3a28" transform="translate(0,2)"/>
              <line x1="20" y1="5" x2="20" y2="37" stroke="#4a7c5a" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20,18 C13,12 4,11 2,16" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M20,26 C13,20 6,20 4,24" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M20,18 C27,12 36,11 38,16" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M20,26 C27,20 34,20 36,24" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="20" cy="5" r="4" fill="#f59e0b"/>
              <circle cx="20" cy="39" r="3" fill="#f59e0b"/>
              <line x1="20" y1="42" x2="20" y2="47" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="49" r="2" fill="#f59e0b"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Canna<span style={{ color: '#f59e0b' }}>Route</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#demo"
            className="text-sm px-4 py-2 rounded-lg transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
          >
            Try demo
          </a>
          <a
            href="#waitlist"
            className="text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-150"
            style={{ background: '#f59e0b', color: '#060f08' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#fbbf24')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#f59e0b')}
          >
            Join waitlist
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{ background: 'rgba(6,15,8,0.98)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#waitlist"
            className="text-sm px-4 py-2 rounded-lg font-semibold text-center mt-2"
            style={{ background: '#f59e0b', color: '#060f08' }}
            onClick={() => setMenuOpen(false)}
          >
            Join waitlist
          </a>
        </div>
      )}
    </header>
  );
}
