import React, { useState } from "react";
import Modal from "./Addon/Modal";

const BidModal = ({ isOpen, onClose, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("");

  const handleSubmit = () => {
    onSubmit({ bidAmount, bidderName });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Submit a Bid</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your Name"
            value={bidderName}
            onChange={(e) => setBidderName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Bid Amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BidModal;