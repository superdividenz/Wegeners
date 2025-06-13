import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  deleteDoc, // ✅ Added deleteDoc
} from "firebase/firestore";

// Success Modal Component
const SuccessModal = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-fadeIn">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-700 rounded-full p-4">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-200 mb-2">Success!</h2>
      <p className="text-gray-200 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
      >
        Close
      </button>
    </div>
  </div>
);

const AddData = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchname, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // new

  const db = getFirestore();

  // Search jobs
  const handleSearch = async (e) => {
    const input = e.target.value;
    setSearchLastName(input);

    if (input.length > 0) {
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("name", ">=", input),
        where("name", "<=", input + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatchingJobs(jobsData);
    } else {
      setMatchingJobs([]);
    }
  };

  // Select job to edit
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsSearchModalOpen(true);
    Object.keys(job).forEach((key) => {
      setValue(key, key === "date" ? formatDateForInput(job[key]) : job[key]);
    });
  };

  // Format dates
  const formatDateForInput = (dateStr) => {
    if (!dateStr || !dateStr.includes("/")) return dateStr;
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const formatDateForStorage = (dateStr) => {
    if (!dateStr || !dateStr.includes("-")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  // Update existing job
  const onUpdateJob = async (data) => {
    if (!selectedJob) return;

    try {
      const jobDocRef = doc(db, "jobs", selectedJob.id);
      const updatedData = {
        ...data,
        date: formatDateForStorage(data.date),
        completed: selectedJob.completed || false,
      };
      await updateDoc(jobDocRef, updatedData);
      setSuccessMessage("Job updated successfully!");
      resetAll();
    } catch (error) {
      console.error("Error updating job: ", error);
    }
  };

  // Add new job
  const onAddJob = async (data) => {
    try {
      const jobsRef = collection(db, "jobs");
      const newJob = {
        ...data,
        date: formatDateForStorage(data.date),
        completed: false,
      };
      await addDoc(jobsRef, newJob);
      setSuccessMessage("Job added successfully!");
      resetAll();
    } catch (error) {
      console.error("Error adding job: ", error);
    }
  };

  // Delete job
  const onDeleteJob = async () => {
    if (!selectedJob) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );
    if (!confirmDelete) return;

    try {
      const jobDocRef = doc(db, "jobs", selectedJob.id);
      await deleteDoc(jobDocRef);
      setSuccessMessage("Job deleted successfully!");
      resetAll();
    } catch (error) {
      console.error("Error deleting job: ", error);
      alert("Failed to delete job");
    }
  };

  const resetAll = () => {
    setIsModalOpen(false);
    setIsSearchModalOpen(false);
    reset();
    setSelectedJob(null);
    setMatchingJobs([]);
    setSearchLastName("");
  };

  // Close modals when clicking outside
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      resetAll();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        Customer
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          value={searchname}
          onChange={handleSearch}
          placeholder="Search by Name"
          className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        {matchingJobs.length > 0 && (
          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {matchingJobs.map((job) => (
              <li
                key={job.id}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <span className="font-medium text-gray-700">{job.name}</span> -{" "}
                {job.date}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 space-y-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 text-white px-4 py-3 rounded-md hover:bg-purple-600 transition duration-200 w-full"
          >
            Add Job Manually
          </button>
        </div>
      </div>

      {/* Modal for Editing Job */}
      {isSearchModalOpen && selectedJob && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Edit Job Details
            </h3>
            <form onSubmit={handleSubmit(onUpdateJob)} className="space-y-4">
              <FormFields register={register} />
              <FormButtons
                onCancel={() => setIsSearchModalOpen(false)}
                onDelete={onDeleteJob} // pass delete here
                submitLabel="Update"
              />
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Job */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Add New Job
            </h3>
            <form onSubmit={handleSubmit(onAddJob)} className="space-y-4">
              <FormFields register={register} />
              <FormButtons
                onCancel={() => setIsModalOpen(false)}
                submitLabel="Add Job"
              />
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
};

// Reusable form fields
const FormFields = ({ register }) => (
  <>
    <input
      {...register("name", { required: true })}
      placeholder="Name"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      {...register("email", { required: false })}
      placeholder="Email"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      {...register("phone", { required: true })}
      placeholder="Phone"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      {...register("address", { required: true })}
      placeholder="Address"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      {...register("date", { required: true })}
      type="date"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      {...register("price", { required: true })}
      placeholder="Price"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <textarea
      {...register("info", { required: true })}
      placeholder="Info"
      className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </>
);

// Reusable buttons
const FormButtons = ({ onCancel, onDelete, submitLabel }) => (
  <div className="flex justify-between space-x-4">
    <button
      type="button"
      onClick={onCancel}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
    >
      Cancel
    </button>

    {onDelete && (
      <button
        type="button"
        onClick={onDelete}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-200"
      >
        Delete
      </button>
    )}

    <button
      type="submit"
      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
    >
      {submitLabel}
    </button>
  </div>
);

export default AddData;
