import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-center py-4 mt-8">
      <p className="text-gray-600">
        © {new Date().getFullYear()} My Band App. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
