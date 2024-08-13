import React from "react";

const BandMemberCard = ({ name, role }) => (
  <div className="bg-white p-4 mb-2 rounded shadow">
    <h3 className="font-bold">{name}</h3>
    <p>{role}</p>
  </div>
);

export default BandMemberCard;
