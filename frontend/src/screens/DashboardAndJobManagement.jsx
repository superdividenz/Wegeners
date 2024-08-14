import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "../components/Modal";
import BookingForm from "../components/BookingForm";
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

const DashboardAndJobManagement = () => {
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

  const addJob = async (newJob) => {
    try {
      const jobWithTimestamp = {
        ...newJob,
        date: Timestamp.fromDate(new Date(newJob.date)),
      };
      const docRef = await addDoc(collection(db, "jobs"), jobWithTimestamp);
      console.log("Document written with ID: ", docRef.id);
      await fetchJobs(); // Refresh the job list
      setIsModalOpen(false); // Close the modal after adding a job
    } catch (error) {
      console.error("Error adding job:", error);
      setError("Failed to add job. Please try again.");
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

  const jobDates = jobs.map((job) => {
    const jobDate =
      job.date instanceof Date ? job.date : new Date(job.date.seconds * 1000);
    return jobDate.toDateString();
  });

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{highlightClass}</style> {/* Inject highlight styles */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Job
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Calendar</h2>
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={({ date }) => {
              const dateString = date.toDateString();
              return jobDates.includes(dateString) ? "highlight" : null;
            }}
            className="react-calendar"
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Jobs</h2>
          {jobs.length > 0 ? (
            <ul>
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="mb-2 cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  {job.date instanceof Date
                    ? job.date.toLocaleDateString()
                    : new Date(
                        job.date.seconds * 1000
                      ).toLocaleDateString()}{" "}
                  {job.lastName} - {job.address}
                </li>
              ))}
            </ul>
          ) : (
            <p>No jobs scheduled.</p>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedJob ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Job Details</h2>
            <p>
              <strong>First Name:</strong> {selectedJob.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedJob.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedJob.email}
            </p>
            <p>
              <strong>Address:</strong> {selectedJob.address}
            </p>
            <StyledButton onClick={() => openInGoogleMaps(selectedJob.address)}>
              <FaMapMarkerAlt />
              View in Google Maps
            </StyledButton>
            <p>
              <strong>Time:</strong> {selectedJob.time}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {selectedJob.date instanceof Date
                ? selectedJob.date.toLocaleDateString()
                : new Date(
                    selectedJob.date.seconds * 1000
                  ).toLocaleDateString()}
            </p>
            <p>
              <strong>Description:</strong> {selectedJob.description}
            </p>
            <p>
              <strong>Yardage:</strong> {selectedJob.yardage}
            </p>
          </div>
        ) : (
          <BookingForm onSubmit={addJob} />
        )}
      </Modal>
    </div>
  );
};

export default DashboardAndJobManagement;
