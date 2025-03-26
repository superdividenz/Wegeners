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
import { FaMapMarkerAlt } from "react-icons/fa";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());
  const [blockedDays, setBlockedDays] = useState([]);
  const [undatedJobs, setUndatedJobs] = useState([]);

  // Fetch jobs from Firebase
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Separate jobs with and without dates
      const jobsWithDate = jobList.filter(job => job.date && job.date.trim() !== "");
      const jobsWithoutDate = jobList.filter(job => !job.date || job.date.trim() === "");
      setJobs(jobsWithDate);
      setUndatedJobs(jobsWithoutDate);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch blocked days from Firebase
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

  // Toggle block/unblock days and persist to Firebase
  const toggleBlockDay = async (selectedDate) => {
    const dateString = selectedDate.toDateString();
    const isCurrentlyBlocked = blockedDays.includes(dateString);

    if (!isCurrentlyBlocked && hasJobsOnDate(selectedDate)) {
      console.log("Cannot block a date with scheduled jobs.");
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

  // Handle job click from either list or dropdown
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

  // Convert job date strings to Date objects for highlighting
  const jobDates = jobs
    .map((job) => {
      if (job.date) {
        const [month, day, year] = job.date.split("/");
        return new Date(year, month - 1, day).toDateString();
      }
      return null;
    })
    .filter(Boolean);

  // Filter jobs for the selected date
  const jobsForSelectedDate = jobs.filter((job) => {
    if (job.date) {
      const [month, day, year] = job.date.split("/");
      const jobDate = new Date(year, month - 1, day).toDateString();
      return jobDate === date.toDateString();
    }
    return false;
  });

  // Check if a job exists on the selected date
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

  // Highlight dates with jobs and blocked days
  const tileClassName = ({ date }) => {
    const dateString = date.toDateString();
    if (jobDates.includes(dateString)) {
      return "highlight job-day";
    }
    if (blockedDays.includes(dateString)) {
      return "blocked";
    }
    return null;
  };

  // Disable blocked days in the calendar
  const tileDisabled = ({ date }) => {
    return false;
  };

  // Open address in Google Maps
  const openInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  // Mark job as completed in Firebase
  const markJobAsCompleted = async (jobId) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        completed: true,
      });
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
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Dashboard</h1>
        {/* Dropdown for undated jobs */}
        <div className="w-full max-w-md">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                const job = undatedJobs.find(job => job.id === e.target.value);
                handleJobClick(job);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Upcoming Jobs Without Dates ({undatedJobs.length})
            </option>
            {undatedJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name} - {job.address || "No address"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-center text-lg sm:text-xl font-semibold mb-4">
            Calendar
          </h2>
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={tileClassName}
            tileDisabled={tileDisabled}
            onClickDay={toggleBlockDay}
            className="react-calendar w-full"
            tileContent={({ date }) => {
              const dateString = date.toDateString();
              if (blockedDays.includes(dateString)) {
                return <span title="This date is blocked out">🚫</span>;
              }
              return null;
            }}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Jobs on {date.toLocaleDateString()}
          </h2>
          {jobsForSelectedDate.length > 0 ? (
            <ul className="space-y-2">
              {jobsForSelectedDate.map((job) => (
                <li
                  key={job.id}
                  className={`p-2 rounded cursor-pointer transition duration-200 ${
                    blockedDays.includes(
                      new Date(
                        job.date.split("/").reverse().join("-")
                      ).toDateString()
                    )
                      ? "bg-red-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleJobClick(job)}
                >
                  {job.date || "N/A"} - {job.address || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No jobs scheduled for this date.</p>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedJob && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-center text-xl sm:text-2xl font-bold mb-4">
              Job Details
            </h2>
            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <strong>Name:</strong> {selectedJob.name || "N/A"}
              </p>
              <p>
                <strong>Date:</strong> {selectedJob.date || "Not scheduled"}
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
                  className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition duration-200"
                >
                  <FaMapMarkerAlt className="mr-2" />
                  View in Google Maps
                </button>
              )}
              <p>
                <strong>Info:</strong> {selectedJob.info || "N/A"}
              </p>
              <p>
                <strong>Price:</strong> {selectedJob.price || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedJob.completed ? "Completed" : "Pending"}
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
              {!selectedJob.completed && (
                <button
                  onClick={() => markJobAsCompleted(selectedJob.id)}
                  className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;