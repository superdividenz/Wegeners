import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import logo from "./img/Logo.png";

const Header = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
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

  const NavLinks = () => (
    <>
      {user && (
        <li>
          <NavLink
            to="/management"
            className={({ isActive }) =>
              `inline-block hover:text-blue-200 hover-scale ${
                isActive ? "text-yellow-400" : ""
              }`
            }
          >
            Management
          </NavLink>
        </li>
      )}
      {user && (
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `inline-block hover:text-blue-200 hover-scale ${
                isActive ? "text-yellow-400" : ""
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
      )}
      {user && (
        <li>
          <NavLink
            to="/customer"
            className={({ isActive }) =>
              `inline-block hover:text-blue-200 hover-scale ${
                isActive ? "text-yellow-400" : ""
              }`
            }
          >
            Customer
          </NavLink>
        </li>
      )}
      {user ? (
        <li>
          <button
            onClick={handleLogout}
            className="inline-block hover:text-blue-200 hover-scale"
          >
            Logout
          </button>
        </li>
      ) : (
        <li>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `inline-block hover:text-blue-200 hover-scale ${
                isActive ? "text-yellow-400" : ""
              }`
            }
          >
            Login
          </NavLink>
        </li>
      )}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-black to-gray-800 text-white shadow-lg sticky top-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <NavLink to="/" onClick={closeMobileMenu}>
              <img
                src={logo}
                alt="Wegener Sealer Logo"
                className="h-12 w-auto transition-transform duration-300 hover:scale-110"
              />
            </NavLink>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <NavLinks />
            </ul>
          </nav>
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="focus:outline-none">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" onClick={closeMobileMenu}>
          <nav className="px-2 pt-2 pb-4">
            <ul className="space-y-1">
              <NavLinks />
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
