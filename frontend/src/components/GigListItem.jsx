// src/components/GigListItem.jsx
import React from "react";

const GigListItem = ({ venue, date, time, description }) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-semibold mb-2">{venue}</h3>
      <p className="text-gray-700 mb-2">
        Date:{" "}
        {date instanceof Date
          ? date.toLocaleDateString()
          : new Date(date.seconds * 1000).toLocaleDateString()}
      </p>
      <p className="text-gray-700 mb-2">Time: {time}</p>
      {description && <p className="text-gray-700">{description}</p>}
    </div>
  );
};

export default GigListItem;
