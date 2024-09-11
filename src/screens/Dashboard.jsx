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
    // Removed the setSelectedJob and setIsModalOpen calls
  };

  const allEvents = jobs.map((item) => {
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
            Events on {date.toLocaleDateString()}
          </h2>
          {allEvents.filter(
            (event) => event.start.toDateString() === date.toDateString()
          ).length > 0 ? (
            <ul className="space-y-2">
              {allEvents
                .filter(
                  (event) => event.start.toDateString() === date.toDateString()
                )
                .map((event) => (
                  <li
                    key={event.id}
                    className={`p-3 hover:bg-gray-100 rounded cursor-pointer transition duration-200 ${
                      event.type === "job" ? "bg-blue-100" : "bg-yellow-100"
                    }`}
                    onClick={
                      () =>
                        event.type === "job" ? handleJobClick(event) : null // Ensure there's a fallback for non-job events
                    }
                  >
                    {event.title} {/* Display the event title */}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
