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
    <div className="max-w-sm mx-auto mt-4 p-4 bg-white shadow-lg rounded-lg md:max-w-md">
      <h2 className="text-xl font-bold mb-3 text-center">Wegeners Sealing Entry</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md text-lg"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md text-lg"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md text-lg"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md text-lg"
        />
        <input
          type="date"
          name="scheduledDate"
          value={formData.scheduledDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md text-lg"
        />

        <div className="w-full px-4 py-3 border rounded-md bg-gray-50">
          <p className="font-semibold mb-2">Select Services:</p>
          <div className="grid grid-cols-2 gap-2">
            {["seal", "stripe", "crack filling", "patching"].map((service) => (
              <label key={service} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={service}
                  checked={formData.services.includes(service)}
                  onChange={handleServiceChange}
                  className="w-5 h-5"
                />
                <span className="text-lg capitalize">{service}</span>
              </label>
            ))}
          </div>
        </div>

        <textarea
          name="additionalInfo"
          placeholder="Additional details (optional)"
          value={formData.additionalInfo}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md text-lg"
          rows="3"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-md text-lg hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Job"}
        </button>
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
          >
            <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
              <h3 className="text-lg font-bold mb-2">Submitted! ✅</h3>
              <p className="text-gray-600">
                Job information successfully added to Firestore.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
