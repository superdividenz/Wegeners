import React from "react";

const JobModal = ({
  isOpen,
  onClose,
  job,
  onMarkAsCompleted,
  openInGoogleMaps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>{job.title}</h2>
      {/* Add more job details and actions here */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default JobModal;
