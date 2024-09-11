import React from "react";

const BidModal = ({ isOpen, onClose, bid, onUpdate, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Bid Details</h2>
      {/* Add bid details and actions here */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default BidModal;
