// src/components/JobListItem.jsx
import React from "react";
import PropTypes from "prop-types";

const JobListItem = ({
  firstName,
  lastName,
  address,
  email,
  date,
  time,
  description,
  yardage,
}) => {
  // Format the date, assuming it might be a Firestore Timestamp
  const formattedDate =
    date instanceof Date
      ? date.toLocaleDateString()
      : new Date(date.seconds * 1000).toLocaleDateString();

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-semibold mb-2">{`${firstName} ${lastName}`}</h3>
      <p className="text-gray-700 mb-2">Address: {address}</p>
      <p className="text-gray-700 mb-2">Email: {email}</p>
      <p className="text-gray-700 mb-2">Date: {formattedDate}</p>
      <p className="text-gray-700 mb-2">Time: {time}</p>
      <p className="text-gray-700 mb-2">Yardage: {yardage}</p>
      {description && (
        <p className="text-gray-700">Description: {description}</p>
      )}
    </div>
  );
};

// Prop types for type checking
JobListItem.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.shape({
      seconds: PropTypes.number.isRequired,
    }),
  ]).isRequired,
  time: PropTypes.string.isRequired,
  description: PropTypes.string,
  yardage: PropTypes.string.isRequired,
};

// Default props
JobListItem.defaultProps = {
  description: "",
};

export default JobListItem;
