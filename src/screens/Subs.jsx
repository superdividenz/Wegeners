import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const SubcontractorForm = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    location: "",
    experience: "",
    equipment: "",
    insurance: "",
    additionalInfo: "",
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const subsCollection = collection(db, "subcontractors");
      await addDoc(subsCollection, {
        ...formData,
        timestamp: new Date().toISOString(),
      });

      setShowModal(true);
      setFormData({
        companyName: "",
        contactName: "",
        phone: "",
        email: "",
        location: "",
        experience: "",
        equipment: "",
        insurance: "",
        additionalInfo: "",
      });

      setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      console.error("Error submitting subcontractor:", err);
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Subcontractors
        </h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <input
      name="companyName"
      placeholder="Company Name"
      value={formData.companyName}
      onChange={handleChange}
      required
      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
    />
    <input
      name="contactName"
      placeholder="Contact Name"
      value={formData.contactName}
      onChange={handleChange}
      required
      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
    />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <input
      name="phone"
      placeholder="Phone"
      value={formData.phone}
      onChange={handleChange}
      required
      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
    />
    <input
      name="email"
      type="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      required
      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
    />
  </div>

  <input
    name="insurance"
    placeholder="Insurance Info (if any)"
    value={formData.insurance}
    onChange={handleChange}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />

  <textarea
    name="additionalInfo"
    placeholder="Additional Info (optional)"
    value={formData.additionalInfo}
    onChange={handleChange}
    rows="2"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />

  <button
    type="submit"
    disabled={loading}
    className="w-full py-3 bg-black text-white rounded-lg font-semibold shadow-md hover:bg-gray-800 transition-all duration-200"
  >
    {loading ? "Submitting..." : "Submit Application"}
  </button>
</form>

      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          >
            <motion.div className="bg-white px-6 py-5 rounded-xl shadow-lg text-center max-w-xs w-full">
              <h3 className="text-xl font-bold text-green-600 mb-2">Submitted! ✅</h3>
              <p className="text-gray-700">Thanks for applying. We’ll be in touch soon.</p>
              <button onClick={() => setShowModal(false)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">OK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubcontractorForm;
