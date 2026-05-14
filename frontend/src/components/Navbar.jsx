import { Leaf, Menu, X } from 'lucide-react';
import React, { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/detect', label: 'Detect' },
  { href: '/community', label: 'Community' },
];

function Navbar({ currentPath }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-leaf-100/80 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a className="flex items-center gap-3 text-leaf-900" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-700 text-white">
            <Leaf aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">AgriScan AI</span>
        </a>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink currentPath={currentPath} key={link.href} link={link} />
          ))}
        </div>

        <button
          aria-label="Toggle navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-leaf-100 text-leaf-800 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-leaf-100 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            {links.map((link) => (
              <NavLink currentPath={currentPath} key={link.href} link={link} onClick={() => setIsOpen(false)} />
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({ currentPath, link, onClick }) {
  const isActive = currentPath === link.href;

  return (
    <a
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        isActive ? 'bg-leaf-700 text-white' : 'text-leaf-800 hover:bg-leaf-50'
      }`}
      href={link.href}
      onClick={onClick}
    >
      {link.label}
    </a>
  );
}

export default Navbar;
