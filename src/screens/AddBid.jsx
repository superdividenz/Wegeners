import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/firebase"; // Adjust path if needed
import { collection, addDoc } from "firebase/firestore";

const AddBid = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    bidType: "residential",
    services: [],
    additionalInfo: "",
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      services: checked
        ? [...prevData.services, value]
        : prevData.services.filter((service) => service !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bidsCollection = collection(db, "bids");
      await addDoc(bidsCollection, formData);

      setShowModal(true); // Show modal on success
      setFormData({
        name: "",
        phone: "",
        address: "",
        email: "",
        bidType: "residential",
        services: [],
        additionalInfo: "",
      });

      setTimeout(() => setShowModal(false), 3000); // Auto-close after 3 sec
    } catch (err) {
      console.error("Error adding bid:", err);
      setError("Failed to add bid. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-4 p-4 bg-white shadow-lg rounded-lg md:max-w-md">
      <h2 className="text-xl font-bold mb-3 text-center">Sealing Bid</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md text-lg" />
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md text-lg" />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md text-lg" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md text-lg" />

        {/* Bid Type Dropdown */}
        <select name="bidType" value={formData.bidType} onChange={handleChange} className="w-full px-4 py-2 border rounded-md text-lg">
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>

        {/* Multi-Select Services */}
        <div className="w-full px-4 py-3 border rounded-md bg-gray-50">
          <p className="font-semibold mb-2">Select Services:</p>
          <div className="grid grid-cols-2 gap-2">
            {["seal", "stripe", "crack filling", "patching"].map((service) => (
              <label key={service} className="flex items-center space-x-2">
                <input type="checkbox" value={service} checked={formData.services.includes(service)} onChange={handleServiceChange} className="w-5 h-5" />
                <span className="text-lg">{service.charAt(0).toUpperCase() + service.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Info Textarea */}
        <textarea name="additionalInfo" placeholder="Additional details (optional)" value={formData.additionalInfo} onChange={handleChange} className="w-full px-4 py-2 border rounded-md text-lg" rows="3" />

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-md text-lg hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Bid"}
        </button>

      </form>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
            <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
              <h3 className="text-lg font-bold mb-2">Bid Submitted! ✅</h3>
              <p className="text-gray-600">We have received your bid. We’ll get back to you soon.</p>
              <button onClick={() => setShowModal(false)} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddBid;
