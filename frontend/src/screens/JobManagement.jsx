// src/screens/JobManagement.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import BookingForm from "../components/BookingForm";
import JobListItem from "../components/JobListItem";
import Modal from "../components/Modal"; // Import the Modal component

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Filter for upcoming jobs
      const upcomingJobs = jobList.filter((job) => {
        const jobDate =
          job.date instanceof Date
            ? job.date
            : new Date(job.date.seconds * 1000);
        return jobDate >= new Date();
      });
      setJobs(upcomingJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Management</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add New Job
      </button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BookingForm onSubmit={addJob} />
      </Modal>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Jobs</h2>
        {jobs.length > 0 ? (
          jobs.map((job) => <JobListItem key={job.id} {...job} />)
        ) : (
          <p>No jobs scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default JobManagement;
