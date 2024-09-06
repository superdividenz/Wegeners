import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase.js";

const BidModal = ({ isOpen, onClose, onSubmit, jobId }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bidData = {
      jobId,
      bidAmount: Number(bidAmount),
      bidderName,
      email,
      phone,
      address,
      additionalInfo,
      status: "pending",
      createdAt: new Date(),
    };

    try {
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
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Name"
            value={bidderName}
            onChange={(e) => setBidderName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
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
              type="button"
              onClick={openInGoogleMaps}
              className="bg-green-500 text-white px-4 py-2 rounded"
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
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;