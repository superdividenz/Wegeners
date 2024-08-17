import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import Modal from "../components/Modal";
import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [completedJobsValue, setCompletedJobsValue] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);

  const calculateCompletedJobsValue = useCallback(() => {
    const totalValue = jobs.reduce((sum, job) => {
      if (job.completed && job.price) {
        const price = parseFloat(job.price);
        return isNaN(price) ? sum : sum + price;
      }
      return sum;
    }, 0);
    setCompletedJobsValue(totalValue);
  }, [jobs]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    calculateCompletedJobsValue();
  }, [calculateCompletedJobsValue]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completed: doc.data().completed || false,
      }));
      setJobs(jobList);

      // Calculate total value of completed jobs
      const totalValue = jobList.reduce((sum, job) => {
        if (job.completed && job.price) {
          const price = parseFloat(job.price);
          return isNaN(price) ? sum : sum + price;
        }
        return sum;
      }, 0);
      setCompletedJobsValue(totalValue);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const openInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  const markJobAsDone = async (jobId) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { completed: true });
      const updatedJobs = jobs.map((job) =>
        job.id === jobId ? { ...job, completed: true } : job
      );
      setJobs(updatedJobs);
      setIsModalOpen(false);

      // Recalculate total value of completed jobs
      const newTotalValue = updatedJobs.reduce((sum, job) => {
        if (job.completed && job.price) {
          const price = parseFloat(job.price);
          return isNaN(price) ? sum : sum + price;
        }
        return sum;
      }, 0);
      setCompletedJobsValue(newTotalValue);
    } catch (error) {
      console.error("Error marking job as done:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  const filteredJobs = jobs.filter((job) => job.completed === showCompleted);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Management</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            {showCompleted ? (
              <FaToggleOn className="mr-2" />
            ) : (
              <FaToggleOff className="mr-2" />
            )}
            {showCompleted ? "Show Active Jobs" : "Show Completed Jobs"}
          </button>
          <p className="text-lg font-semibold">
            Total value of completed jobs: ${completedJobsValue.toFixed(2)}
          </p>
        </div>
        {filteredJobs.length === 0 ? (
          <p className="text-gray-500 text-center">
            No {showCompleted ? "completed" : "active"} jobs found.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <li
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="py-4 cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">{job.name}</span>
                  <span className="text-sm text-gray-500">{job.date}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isModalOpen && selectedJob && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{selectedJob.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {selectedJob.date || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedJob.email || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedJob.phone || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Price:</span>{" "}
                {selectedJob.price || "N/A"}
              </p>
            </div>
            <p className="mb-2">
              <span className="font-semibold">Address:</span>{" "}
              {selectedJob.address || "N/A"}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Info:</span>{" "}
              {selectedJob.info || "N/A"}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={
                  selectedJob.completed ? "text-green-600" : "text-yellow-600"
                }
              >
                {selectedJob.completed ? "Completed" : "Pending"}
              </span>
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => openInGoogleMaps(selectedJob.address)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
              >
                <FaMapMarkerAlt className="mr-2" /> Open in Google Maps
              </button>
              {!selectedJob.completed && (
                <button
                  onClick={() => markJobAsDone(selectedJob.id)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
                >
                  <FaCheckCircle className="mr-2" /> Mark as Done
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
