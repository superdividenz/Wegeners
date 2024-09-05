import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import JobCard from "./Addon/JobCard";
import JobModal from "./Addon/JobModal";
import ReportGenerator from "./Addon/ReportGenerator";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import BidModal from "./Addon/BidModal"; // Adjust the path if necessary
import { gapi } from "gapi-script";

const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

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
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // Add this useEffect
  useEffect(() => {
    console.log("isBidModalOpen:", isBidModalOpen);
  }, [isBidModalOpen]);

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
    console.log("Bid submitted:", bidDetails);
    addEventToGoogleCalendar({
      title: `Bid by ${bidDetails.bidderName}`,
      description: `Bid Amount: ${bidDetails.bidAmount}`,
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(new Date().getTime() + 30 * 60000).toISOString(), // 30 minutes later
    });
    // Add any other logic for handling bid submission
    setIsBidModalOpen(false);
  };

  const handleOpenBidModal = () => {
    console.log("Opening bid modal");
    setIsBidModalOpen(true);
  };

  useEffect(() => {
    const initGapi = async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
        console.log("GAPI initialized successfully");
      } catch (error) {
        console.error("Error initializing GAPI:", error);
      }
    };
    initGapi();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Management</h1>
        <button
          onClick={handleOpenBidModal}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Bid
        </button>
      </div>

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

      {console.log("About to render BidModal, isBidModalOpen:", isBidModalOpen)}

      {/* Render BidModal unconditionally for testing */}
      {isBidModalOpen && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => {
            console.log("Closing modal");
            setIsBidModalOpen(false);
          }}
          onSubmit={handleBidSubmit}
          jobId="someJobId" // You need to provide a jobId or remove this prop if it's not needed
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
