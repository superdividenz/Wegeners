// Management.jsx
import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import JobCard from "./Addon/JobCard";
import JobModal from "./Addon/JobModal";

const Management = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedJobsValue, setCompletedJobsValue] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState(new Set());

  const fetchJobs = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    const jobsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const completedJobs = jobsData.filter((job) => job.completed);
    setJobs(completedJobs);

    const completedValue = completedJobs.reduce(
      (sum, job) => sum + parseFloat(job.price || 0),
      0
    );
    setCompletedJobsValue(completedValue);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleDownload = (jobId) => {
    setTimeout(() => {
      setShowNotification(true);
      setDownloadedJobs((prev) => new Set(prev).add(jobId));
      setTimeout(() => setShowNotification(false), 3000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Completed Jobs</h1>
      <p className="text-lg font-semibold mb-6">
        Total value of completed jobs: ${completedJobsValue.toFixed(2)}
      </p>

      {jobs.length === 0 ? (
        <p className="text-gray-600 text-center">No completed jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobClick={handleJobClick}
              onDownload={handleDownload}
              downloadedJobs={downloadedJobs}
            />
          ))}
        </div>
      )}

      {isModalOpen && selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={handleCloseModal}
          onDownload={handleDownload}
          downloadedJobs={downloadedJobs}
        />
      )}

      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Invoice downloaded successfully!
        </div>
      )}
    </div>
  );
};

export default Management;
