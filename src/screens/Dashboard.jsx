import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "./Addon/Modal";
import { FaMapMarkerAlt, FaShare } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

const highlightClass = `
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
`;

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());
  const [shareableLink, setShareableLink] = useState("");

  const fetchJobs = useCallback(async () => {
    console.log("Fetching jobs");
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Jobs fetched:", jobList);
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

  const generateShareableLink = async (job) => {
    const shareId = uuidv4();
    const shareRef = doc(db, "jobs", shareId);
    await setDoc(shareRef, {
      ...job,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Link expires in 7 days
    });
    const link = `${window.location.origin}/share/${shareId}`;
    console.log("Generated link:", link); // Debugging line
    return link;
  };

  const generateShareableDayLink = async (date, jobsForDay) => {
    try {
      const shareId = uuidv4();
      const shareRef = doc(db, "shared_day_jobs", shareId);
      await setDoc(shareRef, {
        date: date.toDateString(),
        jobs: jobsForDay,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      return `${window.location.origin}/share-day/${shareId}`;
    } catch (error) {
      console.error("Error in generateShareableDayLink:", error);
      throw error;
    }
  };

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    try {
      const link = await generateShareableLink(job);
      console.log("Generated link:", link); // Debugging line
      setShareableLink(link);
    } catch (error) {
      console.error("Error generating shareable link:", error);
    }
  };

  const handleShareDay = async () => {
    try {
      console.log("Date:", date);
      console.log("Jobs for selected date:", jobsForSelectedDate);
      const link = await generateShareableDayLink(date, jobsForSelectedDate);
      console.log("Generated day link:", link);
      setShareableLink(link);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error generating shareable day link:", error);
    }
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{highlightClass}</style>
      <h1 className="text-3xl font-bold mb-8">Job Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={({ date }) =>
              jobDates.includes(date.toDateString()) ? "highlight" : ""
            }
          />
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">
            Jobs for {date.toDateString()}
          </h2>
          {jobsForSelectedDate.length > 0 ? (
            <>
              <ul>
                {jobsForSelectedDate.map((job) => (
                  <li key={job.id} className="mb-2">
                    <button
                      onClick={() => handleJobClick(job)}
                      className="text-left w-full p-2 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {job.name} - {job.address}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleShareDay}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Share Jobs for This Day
              </button>
            </>
          ) : (
            <p>No jobs scheduled for this date.</p>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedJob ? (
          <>
            <h2 className="text-xl font-bold mb-4">{selectedJob.name}</h2>
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
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => openInGoogleMaps(selectedJob.address)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                <FaMapMarkerAlt className="inline-block mr-2" />
                Open in Google Maps
              </button>
              {!selectedJob.completed && (
                <button
                  onClick={() => markJobAsCompleted(selectedJob.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </>
        ) : (
          <h2 className="text-xl font-bold mb-4">
            Jobs for {date.toDateString()}
          </h2>
        )}
        <div className="mt-4">
          <h3 className="font-bold mb-2">Shareable Link:</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="flex-grow p-2 border rounded-l"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareableLink);
                alert("Link copied to clipboard!");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r"
            >
              <FaShare />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
