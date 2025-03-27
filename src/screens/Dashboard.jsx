import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "./Addon/Modal";
import { FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());
  const [blockedDays, setBlockedDays] = useState([]);
  const [undatedJobs, setUndatedJobs] = useState([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const jobsWithDate = jobList.filter(
        (job) => job.date && job.date.trim() !== ""
      );
      const jobsWithoutDate = jobList.filter(
        (job) => !job.date || job.date.trim() === ""
      );
      setJobs(jobsWithDate);
      setUndatedJobs(jobsWithoutDate);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlockedDays = useCallback(async () => {
    try {
      const blockedDaysRef = doc(db, "blockedDays", "schedule");
      const blockedDaysDoc = await getDoc(blockedDaysRef);
      if (blockedDaysDoc.exists()) {
        setBlockedDays(blockedDaysDoc.data().dates || []);
      }
    } catch (error) {
      console.error("Error fetching blocked days: ", error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchBlockedDays();
  }, [fetchJobs, fetchBlockedDays]);

  const toggleBlockDay = async (selectedDate) => {
    const dateString = selectedDate.toDateString();
    const isCurrentlyBlocked = blockedDays.includes(dateString);

    if (!isCurrentlyBlocked && hasJobsOnDate(selectedDate)) {
      return;
    }

    const updatedBlockedDays = isCurrentlyBlocked
      ? blockedDays.filter((day) => day !== dateString)
      : [...blockedDays, dateString];

    setBlockedDays(updatedBlockedDays);

    try {
      const blockedDaysRef = doc(db, "blockedDays", "schedule");
      await updateDoc(blockedDaysRef, { dates: updatedBlockedDays });
    } catch (error) {
      console.error("Error updating blocked days in Firebase:", error);
    }
  };

  const handleJobClick = (job) => {
    if (job.date) {
      const jobDate = new Date(
        job.date.split("/").reverse().join("-")
      ).toDateString();
      if (blockedDays.includes(jobDate)) {
        toggleBlockDay(new Date(job.date));
      } else {
        setSelectedJob(job);
        setIsModalOpen(true);
      }
    } else {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  const jobDates = jobs
    .map((job) => {
      if (job.date) {
        const [month, day, year] = job.date.split("/");
        return new Date(year, month - 1, day).toDateString();
      }
      return null;
    })
    .filter(Boolean);

  const jobsForSelectedDate = jobs.filter((job) => {
    if (job.date) {
      const [month, day, year] = job.date.split("/");
      const jobDate = new Date(year, month - 1, day).toDateString();
      return jobDate === date.toDateString();
    }
    return false;
  });

  const hasJobsOnDate = (date) => {
    const dateString = date.toDateString();
    return jobs.some((job) => {
      if (job.date) {
        const [month, day, year] = job.date.split("/");
        const jobDate = new Date(year, month - 1, day).toDateString();
        return jobDate === dateString;
      }
      return false;
    });
  };

  const tileClassName = ({ date }) => {
    const dateString = date.toDateString();
    if (jobDates.includes(dateString)) {
      // Highlight dates with jobs
      return "bg-blue-200 text-blue-900 font-bold border-2 border-blue-400 rounded-full";
    }
    if (blockedDays.includes(dateString)) {
      // Blocked days styling
      return "bg-red-200 text-red-800 line-through";
    }
    return null; // Default styling
  };

  const tileContent = ({ date }) => {
    const dateString = date.toDateString();
    if (jobDates.includes(dateString)) {
      return (
        <div className="flex justify-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
        </div>
      );
    }
    if (blockedDays.includes(dateString)) {
      return <span className="text-xs">🚫</span>;
    }
    return null;
  };

  const tileDisabled = ({ date }) => false;

  const openInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  const markJobAsCompleted = async (jobId) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { completed: true });
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, completed: true } : job
        )
      );
      setUndatedJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, completed: true } : job
        )
      );
      setSelectedJob((prevJob) => ({ ...prevJob, completed: true }));
    } catch (error) {
      console.error("Error marking job as completed: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center sm:text-left">
            Dashboard
          </h1>
          <div className="relative">
            <select
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg p-3 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const job = undatedJobs.find((job) => job.id === e.target.value);
                  handleJobClick(job);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Undated Jobs ({undatedJobs.length})
              </option>
              {undatedJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name} - {job.address || "No address"}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex justify-center">
            <div className="w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Calendar
              </h2>
              <Calendar
                onChange={setDate}
                value={date}
                tileClassName={tileClassName}
                tileContent={tileContent}
                tileDisabled={tileDisabled}
                onClickDay={toggleBlockDay}
                className="w-full border-none mx-auto"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Jobs on {date.toLocaleDateString()}
            </h2>
            {jobsForSelectedDate.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {jobsForSelectedDate.map((job) => (
                  <li
                    key={job.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      blockedDays.includes(
                        new Date(
                          job.date.split("/").reverse().join("-")
                        ).toDateString()
                      )
                        ? "bg-red-100 hover:bg-red-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => handleJobClick(job)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {job.date} - {job.address || "N/A"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {job.completed ? "✓" : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No jobs scheduled for this date.
              </p>
            )}
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedJob && (
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Job Details
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Name:</strong> {selectedJob.name || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedJob.date || "Not scheduled"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedJob.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedJob.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {selectedJob.address || "N/A"}
                </p>
                {selectedJob.address && (
                  <button
                    onClick={() => openInGoogleMaps(selectedJob.address)}
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <FaMapMarkerAlt className="mr-2" />
                    View in Google Maps
                  </button>
                )}
                <p>
                  <strong>Info:</strong> {selectedJob.info || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      selectedJob.completed
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  >
                    {selectedJob.completed ? "Completed" : "Pending"}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Close
                </button>
                {!selectedJob.completed && (
                  <button
                    onClick={() => markJobAsCompleted(selectedJob.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;