import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import ConfirmModal from "../Addon/ConfirmModal"; // Adjust path if needed

const SubcontractorTable = () => {
  const [subcontractors, setSubcontractors] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchSubcontractors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "subcontractors"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSubcontractors(data);
      } catch (error) {
        console.error("Error fetching subcontractors:", error);
      }
    };
    fetchSubcontractors();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "subcontractors", selectedSubId));
      setSubcontractors((prev) => prev.filter((sub) => sub.id !== selectedSubId));
      setSelectedSubId(null);
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting subcontractor:", error);
    }
  };

  const openConfirm = (id) => {
    setSelectedSubId(id);
    setShowConfirm(true);
  };

  const downloadCSV = () => {
    const headers = [
      "Company Name", "Contact Name", "Phone", "Email", "Location",
      "Experience", "Equipment", "Insurance", "Additional Info", "Timestamp"
    ];
    const rows = subcontractors.map((sub) => [
      sub.companyName,
      sub.contactName,
      sub.phone,
      sub.email,
      sub.location,
      sub.experience,
      sub.equipment,
      sub.insurance,
      sub.additionalInfo,
      sub.timestamp,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val || ""}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "subcontractors.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Subcontractor Applications
        </h2>
        <button
          onClick={downloadCSV}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Download CSV
        </button>
      </div>

      {subcontractors.length === 0 ? (
        <p className="text-gray-500 italic text-sm sm:text-base">
          No subcontractor data available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Insurance</th>
                <th className="px-4 py-2">Additional</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcontractors.map((sub) => (
                <tr key={sub.id} className="border-t">
                  <td className="px-4 py-2">{sub.companyName}</td>
                  <td className="px-4 py-2">{sub.contactName}</td>
                  <td className="px-4 py-2">{sub.phone}</td>
                  <td className="px-4 py-2">{sub.email}</td>
                  <td className="px-4 py-2">{sub.insurance}</td>
                  <td className="px-4 py-2">{sub.additionalInfo}</td>
                  <td className="px-4 py-2">
                    {sub.timestamp
                      ? new Date(sub.timestamp).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => openConfirm(sub.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
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

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        show={showConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default SubcontractorTable;
