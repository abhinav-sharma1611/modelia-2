'use client';
import React, { useState } from 'react';
import { Menu, X, ChevronDown, CircleUserRoundIcon } from 'lucide-react'; // Added ChevronDown for dropdown arrows
import Link from 'next/link';
import { Button } from './button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header className="w-full shadow-sm px-6 py-4 bg-white fixed top-0 left-0 z-50">
      <div className="flex md:justify-between items-center">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
        {/* Logo */}
        <div className="flex items-center justify-center">
          <span className="text-[#0da86b] text-2xl ml-4 font-bold">modelia</span>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <div>
            <CircleUserRoundIcon size={40} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-4 text-gray-700 font-medium">
          {/* Action Buttons (Mobile) */}
          <div className=" space-y-2 pt-4">
            <div>
              <CircleUserRoundIcon size={25} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
