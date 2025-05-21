import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc } from "firebase/firestore";
import { format } from "date-fns";
import { db } from "../firebase/firebase";

const AddJobForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    scheduledDate: "",
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
      const jobsCollection = collection(db, "jobs");

      const [year, month, day] = formData.scheduledDate.split("-");
      const localDate = new Date(year, month - 1, day);

      const formattedData = {
        date: formData.scheduledDate
          ? format(localDate, "MM/dd/yyyy")
          : "",
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        info: formData.additionalInfo,
        services: formData.services,
        price: 0,
        timestamp: new Date().toISOString(),
      };

      await addDoc(jobsCollection, formattedData);

      setShowModal(true);
      setFormData({
        name: "",
        phone: "",
        address: "",
        email: "",
        scheduledDate: "",
        services: [],
        additionalInfo: "",
      });

      setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      console.error("Error submitting job:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 transition-transform duration-300 hover:scale-110">
          Wegener's Sealing Job Entry
        </h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          <div className="w-full px-4 py-4 border border-gray-200 bg-gray-50 rounded-md">
            <p className="font-semibold mb-3 text-gray-700">Select Services:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["seal", "stripe", "crack filling", "patching"].map((service) => (
                <label
                  key={service}
                  className="flex items-center space-x-2 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    value={service}
                    checked={formData.services.includes(service)}
                    onChange={handleServiceChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="capitalize">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            name="additionalInfo"
            placeholder="Additional job details (optional)"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows="4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-black hover:bg-gray-800 rounded-md font-semibold transition duration-200"
          >
            {loading ? "Submitting..." : "Submit Job"}
          </button>

        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          >
            <motion.div className="bg-white px-6 py-5 rounded-xl shadow-lg text-center max-w-xs w-full">
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Submitted! ✅
              </h3>
              <p className="text-gray-700">
                Job was successfully added to Firestore.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddJobForm;
