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
import Modal from "./Addon/Management/Modal";
import { useAuth } from "../hooks/useAuth"; 
import { FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";

const Dashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());
  const [blockedDays, setBlockedDays] = useState([]);
  const [undatedJobs, setUndatedJobs] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const fetchJobs = useCallback(async () => {
  setLoading(true);
  try {
    const jobsCollection = collection(db, "jobs");
    const usersCollection = collection(db, "users");

    const [jobSnapshot, userSnapshot] = await Promise.all([
      getDocs(jobsCollection),
      getDocs(usersCollection),
    ]);

    const jobListRaw = jobSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const usersMap = {};
    userSnapshot.docs.forEach((doc) => {
      const { displayName } = doc.data();
      usersMap[doc.id] = displayName;
    });

    const jobList = jobListRaw.map((job) => ({
      ...job,
      claimerName: job.claimedBy ? usersMap[job.claimedBy] || "Unknown" : null,
    }));

    // 🔐 Only show jobs the user should see
    let visibleJobs = jobList;
    if (user?.role === "subcontractor") {
      visibleJobs = jobList.filter(
        (job) => !job.claimedBy || job.claimedBy === user.uid
      );
    }

    const jobsWithDate = visibleJobs.filter(
      (job) => job.date && job.date.trim() !== ""
    );
    const jobsWithoutDate = visibleJobs.filter(
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
}, [user?.role, user?.uid]); // ✅ Add dependencies here

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

    const claimJob = async (jobId) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      claimedBy: user.uid,
      claimedAt: new Date().toISOString(),
    });

    // Update selectedJob state immediately with claimedBy info
    setSelectedJob((prev) => ({
      ...prev,
      claimedBy: user.uid,
      claimedAt: new Date().toISOString(),
    }));

    fetchJobs();
    setSuccessMessage("Job claimed successfully!");
    setShowSuccessModal(true);
  } catch (error) {
    console.error("Error claiming job:", error);
    setSuccessMessage("Failed to claim job.");
    setShowSuccessModal(true);
  }
};
  
  const updateJobDate = async (jobId, newDate) => {
    try {
      const [year, month, day] = newDate.split("-");
      const formattedDate = `${month}/${day}/${year}`;

      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { date: formattedDate });

      setSuccessMessage("Date updated successfully!");
      setShowSuccessModal(true);

      fetchJobs();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating job date:", error);
      setSuccessMessage("Failed to update date. Please try again.");
      setShowSuccessModal(true);
    }
  };

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

  const getJobCountForDate = (date) => {
    const dateString = date.toDateString();
    return jobs.filter((job) => {
      if (job.date) {
        const [month, day, year] = job.date.split("/");
        const jobDate = new Date(year, month - 1, day).toDateString();
        return jobDate === dateString;
      }
      return false;
    }).length;
  };

  const tileClassName = ({ date, view }) => {
    const dateString = date.toDateString();
    const isJobDay = jobDates.includes(dateString);
    const isBlockedDay = blockedDays.includes(dateString);

    if (view !== "month") return null;

    if (isJobDay) {
      const jobCount = getJobCountForDate(date);
      const intensity = Math.min(jobCount * 100, 600);
      return `relative bg-blue-${intensity} text-blue-900 font-bold border-2 border-blue-700 rounded-full animate-pulse hover:scale-105 transition-transform duration-200`;
    }

    if (isBlockedDay) {
      return "relative bg-red-400 text-red-900 font-bold border border-red-700 rounded-full after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-red-900 after:top-1/2 after:left-0 after:transform after:-translate-y-1/2";
    }

    return null;
  };

  const tileContent = ({ date, view }) => {
    const dateString = date.toDateString();
    if (view === "month" && jobDates.includes(dateString)) {
      const jobCount = getJobCountForDate(date);
      return (
        <div className="absolute top-0 right-0 text-xs bg-blue-900 text-white px-1 rounded-bl">
          {jobCount}
        </div>
      );
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
        <div className="mb-6 flex flex-col space-y-4">
          <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
            Dashboard
          </h1>
          <div className="relative w-full">
            <select
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg p-3 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const job = undatedJobs.find(
                    (job) => job.id === e.target.value
                  );
                  handleJobClick(job);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled className="font-bold text-red-600 uppercase">
               🔴 UNDATED JOBS ❗ CALL TO SET UP! ({undatedJobs.length})
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

        {/* Success Modal Rendering */}
        {showSuccessModal && (
          <SuccessModal
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
          />
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedJob && (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Job Details
            </h2>

          {/* Claim Job Button or Claimed Info */}
      {!selectedJob.claimedBy ? (
        <button
          onClick={() => claimJob(selectedJob.id)}
          className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
        >
          Claim this Job
        </button>
      ) : (
        <p className="mb-4 text-sm text-gray-600">
          Job claimed by:{" "}
          <strong>
            {selectedJob.claimedBy === user.uid
              ? "You"
              : selectedJob.claimerName || selectedJob.claimedBy}
          </strong>
        </p>
      )}


      <div className="space-y-3 text-gray-700">
        <p>
          <strong>Name:</strong> {selectedJob.name || "N/A"}
        </p>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Scheduled Date:
          </label>
          <input
            type="date"
            value={selectedJob.date || ""}
            onChange={(e) =>
              setSelectedJob({ ...selectedJob, date: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

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
              selectedJob.completed ? "text-green-600" : "text-yellow-600"
            }
          >
            {selectedJob.completed ? "Completed" : "Pending"}
          </span>
        </p>
      </div>

      <div className="mt-4">
        <button
          onClick={() => updateJobDate(selectedJob.id, selectedJob.date)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Save Date
        </button>
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

        {selectedJob.phone && (
          <a
            href={`sms:${selectedJob.phone}?body=This is Wegeners Sealing. We are on our way!`}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center transition-all duration-200"
          >
            Text: We're on our way!
          </a>
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
