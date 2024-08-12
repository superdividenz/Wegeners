import React from "react";
import BandMemberCard from "../components/BandMemberCard";

const MemberDirectory = () => {
  // You would typically fetch this data from your Firebase backend
  const members = [
    {
      name: "John Doe",
      role: "Guitarist",
      image: "path/to/john.jpg",
      contact: "john@band.com",
    },
    {
      name: "Jane Smith",
      role: "Vocalist",
      image: "path/to/jane.jpg",
      contact: "jane@band.com",
    },
    {
      name: "Mike Johnson",
      role: "Drummer",
      image: "path/to/mike.jpg",
      contact: "mike@band.com",
    },
  ];

  return (
    <div className="member-directory">
      <h1>Band Members</h1>
      <div className="member-list">
        {members.map((member, index) => (
          <BandMemberCard key={index} {...member} />
        ))}
      </div>
    </div>
  );
};

export default MemberDirectory;
