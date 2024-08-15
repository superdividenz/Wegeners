import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "../components/Modal";
import styled from "styled-components";
import { FaMapMarkerAlt } from "react-icons/fa";

// Styled button component
const StyledButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #4285f4;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;

  &:hover {
    background-color: #357ae8;
  }

  &:focus {
    outline: none;
  }

  svg {
    margin-right: 5px;
  }
`;

// CSS class for highlighted dates
const highlightClass = `
  .highlight {
    background-color: #ffeb3b;
    border-radius: 50%;
  }
`;

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
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

  // Convert job date strings to Date objects for comparison
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

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{highlightClass}</style>
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Calendar</h2>
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

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Jobs on {date.toLocaleDateString()}
          </h2>
          {jobsForSelectedDate.length > 0 ? (
            <ul>
              {jobsForSelectedDate.map((job) => (
                <li
                  key={job.id}
                  className="mb-2 cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  {job.lastName || "N/A"} - {job.address || "N/A"}
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
          <div>
            <h2 className="text-xl font-bold mb-4">Job Details</h2>
            <p>
              <strong>First Name:</strong> {selectedJob.firstName || "N/A"}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedJob.lastName || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {selectedJob.email || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {selectedJob.address || "N/A"}
            </p>
            {selectedJob.address && (
              <StyledButton
                onClick={() => openInGoogleMaps(selectedJob.address)}
              >
                <FaMapMarkerAlt />
                View in Google Maps
              </StyledButton>
            )}
            <p>
              <strong>Time:</strong> {selectedJob.time || "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {selectedJob.date || "No date available"}
            </p>
            <p>
              <strong>Description:</strong> {selectedJob.description || "N/A"}
            </p>
            <p>
              <strong>Yardage:</strong> {selectedJob.yardage || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
