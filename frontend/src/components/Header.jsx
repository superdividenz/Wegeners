import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="bg-blue-600 text-white p-4">
    <nav>
      <ul className="flex space-x-4">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/gigs">Gigs</Link>
        </li>
        <li>
          <Link to="/members">Members</Link>
        </li>
        <li>
          <Link to="/equipment">Equipment</Link>
        </li>
      </ul>
    </nav>
  </header>
);

export default Header;
