import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="font-bold text-xl">My Band App</div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-blue-200">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/gigs" className="hover:text-blue-200">
                Gigs
              </Link>
            </li>
            <li>
              <Link to="/members" className="hover:text-blue-200">
                Members
              </Link>
            </li>
            <li>
              <Link to="/equipment" className="hover:text-blue-200">
                Equipment
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
