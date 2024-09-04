import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import JobCard from "./Addon/JobCard";
import JobModal from "./Addon/JobModal";
import ReportGenerator from "./Addon/ReportGenerator";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Management = () => {
  const [jobs, setJobs] = useState([]);
  const [archivedJobsList, setArchivedJobsList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedJobsValue, setCompletedJobsValue] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState(new Set());
  const [archivedJobs, setArchivedJobs] = useState(new Set());
  const [showArchivedJobs, setShowArchivedJobs] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const completedJobs = jobsData.filter((job) => job.completed);
      const activeJobs = completedJobs.filter((job) => !job.archived);
      const archivedJobs = completedJobs.filter((job) => job.archived);

      setJobs(activeJobs);
      setArchivedJobs(new Set(archivedJobs.map((job) => job.id)));

      const completedValue = completedJobs.reduce(
        (sum, job) => sum + parseFloat(job.price || 0),
        0
      );
      setCompletedJobsValue(completedValue);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, []);

  const fetchArchivedJobs = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const archivedJobs = jobsData.filter(
        (job) => job.completed && job.archived
      );
      setArchivedJobsList(archivedJobs);
    } catch (error) {
      console.error("Error fetching archived jobs:", error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchArchivedJobs();
  }, [fetchJobs, fetchArchivedJobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleDownload = (jobId) => {
    setShowNotification(true);
    setDownloadedJobs((prev) => new Set(prev).add(jobId));
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleArchive = async (jobId) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { archived: true });

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      setArchivedJobs((prev) => new Set(prev).add(jobId));

      // Add the archived job to the archivedJobsList
      const archivedJob = jobs.find((job) => job.id === jobId);
      if (archivedJob) {
        setArchivedJobsList((prev) => [
          ...prev,
          { ...archivedJob, archived: true },
        ]);
      }

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error("Error archiving job:", error);
    }
  };

  return (
    <div className="container mx-auto mt-20 px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Completed Jobs</h1>
      <p className="text-base sm:text-lg font-semibold mb-4">
        Total value of completed jobs: ${completedJobsValue.toFixed(2)}
      </p>

      {jobs.length === 0 && archivedJobsList.length === 0 ? (
        <p className="text-gray-600 text-center p-4">
          No completed jobs found.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onJobClick={handleJobClick}
                onDownload={() => handleDownload(job.id)}
                onArchive={() => handleArchive(job.id)}
                downloadedJobs={downloadedJobs}
                archivedJobs={archivedJobs}
              />
            ))}
          </div>

          {archivedJobsList.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowArchivedJobs(!showArchivedJobs)}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <span className="font-semibold">
                  Archived Jobs ({archivedJobsList.length})
                </span>
                {showArchivedJobs ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showArchivedJobs && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedJobsList.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onJobClick={handleJobClick}
                      onDownload={() => handleDownload(job.id)}
                      downloadedJobs={downloadedJobs}
                      archivedJobs={archivedJobs}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <ReportGenerator jobs={[...jobs, ...archivedJobsList]} />
      </div>

      {isModalOpen && selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={handleCloseModal}
          onDownload={() => handleDownload(selectedJob.id)}
          onArchive={() => handleArchive(selectedJob.id)}
          downloadedJobs={downloadedJobs}
          archivedJobs={archivedJobs}
        />
      )}

      {showNotification && (
        <div className="fixed bottom-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-lg text-sm">
          Action completed successfully!
        </div>
      )}
    </div>
  );
};

export default Management;
