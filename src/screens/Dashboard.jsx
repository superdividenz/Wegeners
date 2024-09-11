import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState(null); // State for selected job
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "job", // Explicitly set the type
      }));
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job); // Set the selected job
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedJob(null); // Clear selected job
  };

  const allJobs = jobs.map((item) => {
    if (item.date && typeof item.date === "string") {
      const [month, day, year] = item.date.split("/");
      return {
        id: item.id,
        title: item.name,
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day),
        type: item.type || (item.hasOwnProperty("completed") ? "job" : "job"), // Ensure this is correct
      };
    } else {
      return {
        id: item.id,
        title: item.name,
        start: new Date(), // Use current date or some default
        end: new Date(),
        type: item.type || "job", // Ensure this is correct
      };
    }
  });

  if (loading) {
    return <div className="text-center mt-8 p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <style>{`
        .highlight {
          background-color: #ffeb3b;
          border-radius: 50%;
        }
        .react-calendar {
          width: 100%;
          max-width: 100%;
          background: white;
          border: 1px solid #a0a096;
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.125em;
        }
        @media (max-width: 640px) {
          .react-calendar__month-view__days__day {
            padding: 0.5em 0;
          }
        }
        .highlight-job {
          background-color: #3b82f6;
          border-radius: 50%;
        }
        .highlight-bid {
          background-color: #fbbf24;
          border-radius: 50%;
        }
        .highlight-both {
          background: linear-gradient(to right, #3b82f6 50%, #fbbf24 50%);
          border-radius: 50%;
        }
      `}</style>
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Calendar</h2>
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={({ date, view }) => {
              const dateString = date.toDateString();
              const hasJob = jobs.some((job) => {
                if (job.date && typeof job.date === "string") {
                  const [month, day, year] = job.date.split("/");
                  return (
                    new Date(year, month - 1, day).toDateString() === dateString
                  );
                }
                return false;
              });
              if (hasJob) return "highlight highlight-job";
              return null;
            }}
            className="react-calendar"
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Jobs on {date.toLocaleDateString()}
          </h2>
          {allJobs.filter(
            (job) => job.start.toDateString() === date.toDateString()
          ).length > 0 ? (
            <ul className="space-y-2">
              {allJobs
                .filter(
                  (job) => job.start.toDateString() === date.toDateString()
                )
                .map((job) => (
                  <li
                    key={job.id}
                    className={`p-3 hover:bg-gray-100 rounded cursor-pointer transition duration-200 ${
                      job.type === "job" ? "bg-blue-100" : "bg-yellow-200"
                    }`}
                    onClick={() => handleJobClick(job)} // Updated to use handleJobClick
                  >
                    {job.title} {/* Display the job title */}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No Jobs found.</p>
          )}
        </div>
      </div>

      {isModalOpen && ( // Render modal conditionally
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          {" "}
          {/* Increased opacity for better contrast */}
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            {" "}
            {/* Adjusted padding and max width */}
            <h2 className="text-2xl font-bold text-center mb-4">
              {selectedJob?.name}
            </h2>{" "}
            {/* Centered title and increased size */}
            <p className="mb-2">
              <strong>Name:</strong> {selectedJob?.name}
            </p>
            <p className="mb-2">
              <strong>Address:</strong> {selectedJob?.address}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {selectedJob?.date}
            </p>
            <p className="mb-2">
              <strong>Phone:</strong> {selectedJob?.phone}
            </p>
            <p className="mb-2">
              <strong>Info:</strong> {selectedJob?.info}
            </p>
            <p className="mb-4">
              <strong>Price:</strong> {selectedJob?.price}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedJob?.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline mb-4 block text-center" // Centered link
            >
              View on Map
            </a>
            <button
              onClick={closeModal}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200" // Full width button with hover effect
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
