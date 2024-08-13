import React from "react";

const GigListItem = ({ venue, date, time }) => (
  <div className="bg-white p-4 mb-2 rounded shadow">
    <h3 className="font-bold">{venue}</h3>
    <p>
      {date} at {time}
    </p>
  </div>
);

export default GigListItem;
