import React from "react";

const GigListItem = ({ venue, date, time, payment }) => {
  return (
    <div className="gig-list-item">
      <h4>{venue}</h4>
      <p>Date: {date}</p>
      <p>Time: {time}</p>
      <p>Payment: ${payment}</p>
    </div>
  );
};

export default GigListItem;
