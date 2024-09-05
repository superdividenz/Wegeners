import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "./Modal"; // Ensure this path is correct
import BidModal from "./Addon/BidModal"; // Ensure this path is correct
import { FaMapMarkerAlt } from "react-icons/fa";
import { gapi } from "gapi-script";

const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());

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

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          console.log("GAPI client initialized");
        })
        .catch((error) => {
          console.error("Error initializing GAPI client", error);
        });
    });
  }, []);

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

  const addEventToGoogleCalendar = (eventDetails) => {
    gapi.client.calendar.events
      .insert({
        calendarId: "primary",
        resource: {
          summary: eventDetails.title,
          description: eventDetails.description,
          start: {
            dateTime: eventDetails.startDateTime,
            timeZone: "America/Los_Angeles",
          },
          end: {
            dateTime: eventDetails.endDateTime,
            timeZone: "America/Los_Angeles",
          },
        },
      })
      .then((response) => {
        console.log("Event created: " + response.result.htmlLink);
      })
      .catch((error) => {
        console.error("Error creating event", error);
      });
  };

  const handleBidSubmit = (bidDetails) => {
    addEventToGoogleCalendar({
      title: `Bid by ${bidDetails.bidderName}`,
      description: `Bid Amount: ${bidDetails.bidAmount}`,
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(new Date().getTime() + 30 * 60000).toISOString(), // 30 minutes later
    });
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
              return jobDates.includes(dateString) ? "highlight" : null;
            }}
            className="react-calendar"
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Jobs on {date.toLocaleDateString()}
          </h2>
          {jobsForSelectedDate.length > 0 ? (
            <ul className="space-y-2">
              {jobsForSelectedDate.map((job) => (
                <li
                  key={job.id}
                  className="p-3 hover:bg-gray-100 rounded cursor-pointer transition duration-200"
                  onClick={() => handleJobClick(job)}
                >
                  {job.date || "N/A"} - {job.address || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center p-4">No jobs scheduled for this date.</p>
          )}
        </div>
      </div>
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handleBidSubmit}
      />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedJob && (
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Job Details</h2>
            <div className="space-y-2 text-sm">
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
                  className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition duration-200 w-full justify-center mt-2"
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
            <div className="mt-6 flex flex-col space-y-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
              {!selectedJob.completed && (
                <button
                  onClick={() => markJobAsCompleted(selectedJob.id)}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
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
