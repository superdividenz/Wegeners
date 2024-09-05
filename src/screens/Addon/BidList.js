import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import EditBidModal from './EditBidModal';

const BidList = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBid, setEditingBid] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'bids'));
      const bidData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBids(bidData);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (bidId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bids', bidId), { status: newStatus });
      fetchBids();
    } catch (error) {
      console.error('Error updating bid status:', error);
    }
  };

  const handleDelete = async (bidId) => {
    if (window.confirm('Are you sure you want to delete this bid?')) {
      try {
        await deleteDoc(doc(db, 'bids', bidId));
        fetchBids();
      } catch (error) {
        console.error('Error deleting bid:', error);
      }
    }
  };

  const handleEdit = (bid) => {
    setEditingBid(bid);
  };

  const handleUpdate = (updatedBid) => {
    setBids(bids.map(bid => bid.id === updatedBid.id ? updatedBid : bid));
  };

  const openInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-4">Loading bids...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Bid List</h2>
      {bids.length === 0 ? (
        <p className="text-center py-4">No bids available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left hidden md:table-cell">Email</th>
                <th className="px-4 py-2 text-left hidden md:table-cell">Phone</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id} className="hover:bg-gray-100">
                  <td className="border-t px-4 py-2">{bid.bidderName}</td>
                  <td className="border-t px-4 py-2 hidden md:table-cell">{bid.email}</td>
                  <td className="border-t px-4 py-2 hidden md:table-cell">{bid.phone}</td>
                  <td className="border-t px-4 py-2">${bid.bidAmount}</td>
                  <td className="border-t px-4 py-2">
                    <select
                      value={bid.status}
                      onChange={(e) => handleStatusChange(bid.id, e.target.value)}
                      className="p-1 border rounded w-full"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="border-t px-4 py-2">
                    {bid.address && (
                      <button
                        onClick={() => openInGoogleMaps(bid.address)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        View on Map
                      </button>
                    )}
                  </td>
                  <td className="border-t px-4 py-2">
                    <button
                      onClick={() => handleEdit(bid)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bid.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingBid && (
        <EditBidModal
          bid={editingBid}
          onClose={() => setEditingBid(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default BidList;