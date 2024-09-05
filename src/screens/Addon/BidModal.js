import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase.js";

const BidModal = ({ isOpen, onClose, onSubmit, jobId }) => {
  console.log("BidModal rendered, isOpen:", isOpen);
  useEffect(() => {
    console.log("BidModal rendered, isOpen:", isOpen);
  }, [isOpen]);

  const [bidAmount, setBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [proposedStartDate, setProposedStartDate] = useState(""); // New state
  const [estimatedDuration, setEstimatedDuration] = useState(""); // New state
  const [address, setAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async () => {
    const bidData = {
      jobId,
      bidAmount: Number(bidAmount),
      bidderName,
      proposedStartDate,
      estimatedDuration,
      address,
      additionalInfo,
      price: Number(price),
      status: "pending", // Initial status
      createdAt: new Date(),
    };

    try {
      // Add bid to the 'bids' collection
      const docRef = await addDoc(collection(db, "bids"), bidData);
      console.log("Bid submitted with ID: ", docRef.id);
      onSubmit(bidData);
      onClose();
    } catch (error) {
      console.error("Error submitting bid: ", error);
    }
  };

  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Submit a Bid</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Name"
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
          <input
            type="date"
            placeholder="Proposed Start Date"
            value={proposedStartDate}
            onChange={(e) => setProposedStartDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Estimated Duration (e.g., '2 weeks')"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <button
              onClick={openInGoogleMaps}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={!address}
            >
              View on Map
            </button>
          </div>
          <textarea
            placeholder="Info"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="w-full p-2 border rounded"
            rows="1"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
    </div>
  );
};

export default BidModal;