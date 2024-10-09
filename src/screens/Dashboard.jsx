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
      setJobs(jobList);
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
      } else {
        console.log("No blocked days found in Firebase.");
      }
    } catch (error) {
      console.error("Error fetching blocked days: ", error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchBlockedDays(); // Load blocked days on component mount
  }, [fetchJobs, fetchBlockedDays]);

  // Toggle block/unblock days and persist to Firebase
  const toggleBlockDay = async (selectedDate) => {
    const dateString = selectedDate.toDateString();
    const isCurrentlyBlocked = blockedDays.includes(dateString);

    // Check if there are jobs on this date
    if (!isCurrentlyBlocked && hasJobsOnDate(selectedDate)) {
      console.log("Cannot block a date with scheduled jobs.");
      return; // Exit the function without blocking the date
    }

    const updatedBlockedDays = isCurrentlyBlocked
      ? blockedDays.filter((day) => day !== dateString)
      : [...blockedDays, dateString];

    setBlockedDays(updatedBlockedDays);

    try {
      const blockedDaysRef = doc(db, "blockedDays", "schedule");
      await updateDoc(blockedDaysRef, { dates: updatedBlockedDays });
      console.log(
        `Date ${dateString} ${isCurrentlyBlocked ? "unblocked" : "blocked"}.`
      );
    } catch (error) {
      console.error("Error updating blocked days in Firebase:", error);
    }
  };

  // Handle job click for blocking/unblocking
  const handleJobClick = (job) => {
    const jobDate = new Date(
      job.date.split("/").reverse().join("-")
    ).toDateString();
    if (blockedDays.includes(jobDate)) {
      // Unblock the date if it's already blocked
      toggleBlockDay(new Date(job.date));
    } else {
      // Open the modal if the date is not blocked
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

  // already jobs?
  const hasJobsOnDate = (date) => {
    const dateString = date.toDateString();
    return jobs.some((job) => {
      const [month, day, year] = job.date.split("/");
      const jobDate = new Date(year, month - 1, day).toDateString();
      return jobDate === dateString;
    });
  };

  // Highlight dates with jobs and blocked days
  const tileClassName = ({ date }) => {
    const dateString = date.toDateString();
    if (jobDates.includes(dateString)) {
      return "highlight job-day"; // Add 'job-day' class
    }
    if (blockedDays.includes(dateString)) {
      return "blocked";
    }
    return null;
  };

  // Disable blocked days in the calendar
  const tileDisabled = ({ date }) => {
    return false; // Allow clicking on all days, including blocked ones
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-center text-lg sm:text-xl font-semibold mb-4">
            Calendar
          </h2>
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={tileClassName} // Highlight job and blocked days
            tileDisabled={tileDisabled} // Disable blocked days
            onClickDay={toggleBlockDay} // Block/unblock day on click
            className="react-calendar w-full"
            tileContent={({ date }) => {
              const dateString = date.toDateString();
              if (blockedDays.includes(dateString)) {
                return <span title="This date is blocked out">🚫</span>; // Tooltip message
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
                  onClick={() => handleJobClick(job)} // Use handleJobClick to block/unblock
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
                <strong>Date:</strong> {selectedJob.date || "N/A"}
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
