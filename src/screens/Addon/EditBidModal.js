import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const EditBidModal = ({ bid, onClose, onUpdate }) => {
  const [editedBid, setEditedBid] = useState(bid);
  const [acceptedDate, setAcceptedDate] = useState(bid.acceptedDate || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedBid(prev => ({ ...prev, [name]: name === 'bidAmount' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bidRef = doc(db, 'bids', editedBid.id);
      const updatedBid = { ...editedBid, acceptedDate };
      await updateDoc(bidRef, updatedBid);

      // If the bid is accepted and has an accepted date, add it to the jobs collection
      if (updatedBid.status === 'accepted' && acceptedDate) {
        const jobData = {
          bidId: updatedBid.id,
          bidderName: updatedBid.bidderName,
          bidAmount: updatedBid.bidAmount,
          address: updatedBid.address,
          phone: updatedBid.phone,
          email: updatedBid.email,
          scheduledDate: acceptedDate,
          createdAt: new Date(),
        };
        await addDoc(collection(db, 'jobs'), jobData);
      }

      onUpdate(updatedBid);
      onClose();
    } catch (error) {
      console.error('Error updating bid:', error);
    }
  };

  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(editedBid.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Bid</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="bidderName"
            placeholder="Name"
            value={editedBid.bidderName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={editedBid.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={editedBid.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            name="bidAmount"
            placeholder="Bid Amount"
            value={editedBid.bidAmount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={editedBid.address}
              onChange={handleChange}
              className="shadow appearance-none border rounded flex-grow py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={openInGoogleMaps}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              disabled={!editedBid.address}
            >
              View on Map
            </button>
          </div>
          <textarea
            name="additionalInfo"
            placeholder="Additional Info"
            value={editedBid.additionalInfo}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          />
          <div className="flex space-x-2 items-center">
            <select
              name="status"
              value={editedBid.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            {editedBid.status === 'accepted' && (
              <input
                type="date"
                value={acceptedDate}
                onChange={(e) => setAcceptedDate(e.target.value)}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBidModal;