import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import logo from "./img/Logo.png";

const Header = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const NavLinks = () => (
    <>
      {user && (
        <li>
          <NavLink
            to="/management"
            className={({ isActive }) =>
              `inline-block hover:text-blue-200 hover-scale ${
                isActive ? "text-blue-400 font-bold" : ""
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
                isActive ? "text-blue-400 font-bold" : ""
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
                isActive ? "text-blue-400 font-bold" : ""
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
                isActive ? "text-blue-400 font-bold" : ""
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
    <header
      className={`bg-gradient-to-r from-black to-gray-800 text-white shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSticky ? "py-2" : "py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Wegener Sealer Logo"
              className={`transition-all duration-300 hover:scale-110 ${
                isSticky ? "h-10" : "h-12"
              }`}
            />
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
        <div className="md:hidden">
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
