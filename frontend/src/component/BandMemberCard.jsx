import React from "react";

const BandMemberCard = ({ name, role, image, contact }) => {
  return (
    <div className="band-member-card">
      <img src={image} alt={name} className="member-image" />
      <h3>{name}</h3>
      <p>{role}</p>
      <p>{contact}</p>
    </div>
  );
};

export default BandMemberCard;
