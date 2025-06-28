import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebase";
import logo from "./img/Logo.png";

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `transition-transform duration-200 hover:scale-105 ${
      isActive ? "underline underline-offset-4 font-semibold" : ""
    }`;

  const NavLinks = () => (
    <>
      
      {currentUser ? (
        <>
          <li>
            <NavLink to="/management" className={linkClass}>
              Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/customer" className={linkClass}>
              Customer
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="transition-transform duration-200 hover:scale-105"
            >
              Logout
            </button>
          </li>
        </>
      ) : (
        <li>
          <NavLink to="/login" className={linkClass}>
            Login
          </NavLink>
        </li>
      )}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-black to-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" onClick={closeMobileMenu}>
          <img
            src={logo}
            alt="Wegener Sealer Logo"
            className="h-10 w-auto transition-transform duration-300 hover:scale-110"
          />
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center text-sm md:text-base">
            <NavLinks />
          </ul>
        </nav>

        {/* Mobile Hamburger Icon */}
        <button onClick={toggleMobileMenu} className="md:hidden focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-90 py-4 px-6" onClick={closeMobileMenu}>
          <ul className="space-y-3 text-white text-base">
            <NavLinks />
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
