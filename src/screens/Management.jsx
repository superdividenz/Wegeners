import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import JobCard from "./Addon/JobCard";
import JobModal from "./Addon/JobModal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./Addon/InvoicePDF";
import ReportGenerator from "./Addon/ReportGenerator";
import { useForm } from "react-hook-form";

const Management = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedJobsValue, setCompletedJobsValue] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState(new Set());
  const [archivedJobs, setArchivedJobs] = useState(new Set());
  const { register, handleSubmit, setValue } = useForm();

  const companyInfo = {
    name: "Wegener Asphalt",
    address: "10200 Quail Run Dr. 63125",
    phone: "314-300-6562",
    logoUrl: "../img/logo+w+dropshadow-306w.webp",
  };

  const fetchJobs = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    const jobsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const completedJobs = jobsData.filter((job) => job.completed && !job.archived);
    setJobs(completedJobs);

    const completedValue = completedJobs.reduce(
      (sum, job) => sum + parseFloat(job.price || 0),
      0
    );
    setCompletedJobsValue(completedValue);

    // Update archivedJobs state based on Firestore data
    const archived = new Set(jobsData.filter(job => job.archived).map(job => job.id));
    setArchivedJobs(archived);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    Object.keys(job).forEach((key) => {
      setValue(key, job[key]);
    });
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
      setArchivedJobs((prev) => new Set(prev).add(jobId));
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      setCompletedJobsValue((prev) =>
        prev - parseFloat(jobs.find((job) => job.id === jobId)?.price || 0)
      );
    } catch (error) {
      console.error("Error archiving job: ", error);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedJob) return;

    const jobRef = doc(db, "jobs", selectedJob.id);
    try {
      const updatedData = {
        ...data,
        price: parseFloat(data.price) || 0,
      };
      await updateDoc(jobRef, updatedData);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === selectedJob.id ? { ...job, ...updatedData } : job
        )
      );
      setSelectedJob(updatedData);
      setIsModalOpen(false);
      fetchJobs();
    } catch (error) {
      console.error("Error updating job: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center sm:text-left">
            Completed Jobs
          </h1>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <ReportGenerator jobs={jobs} />
            <p className="text-base sm:text-lg font-semibold text-gray-700 mt-4">
              Total value of completed jobs: ${completedJobsValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Jobs List or Empty State */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
            <p className="text-gray-500 italic text-sm sm:text-base">
              No completed jobs found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-lg p-4 transition-all duration-200 hover:shadow-xl"
              >
                <JobCard
                  job={job}
                  onJobClick={handleJobClick}
                  onDownload={() => handleDownload(job.id)}
                  onArchive={() => handleArchive(job.id)}
                  downloadedJobs={downloadedJobs}
                  archivedJobs={archivedJobs}
                  pdfDownloadLink={
                    <PDFDownloadLink
                      document={<InvoicePDF job={job} companyInfo={companyInfo} />}
                      fileName={`invoice-${job.id}.pdf`}
                    >
                      {({ loading }) => (
                        <button
                          onClick={() => handleDownload(job.id)}
                          className={`w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base transition-all duration-200 ${
                            downloadedJobs.has(job.id)
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          disabled={downloadedJobs.has(job.id) || loading}
                        >
                          {downloadedJobs.has(job.id)
                            ? "Downloaded"
                            : "Download Invoice"}
                        </button>
                      )}
                    </PDFDownloadLink>
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && selectedJob && (
          <JobModal onClose={handleCloseModal}>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                Edit Job Details
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Name
                  </label>
                  <input
                    {...register("name")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Date
                  </label>
                  <input
                    {...register("date")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Phone
                  </label>
                  <input
                    {...register("phone")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Address
                  </label>
                  <input
                    {...register("address")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Info
                  </label>
                  <textarea
                    {...register("info")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
                    Price
                  </label>
                  <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-200"
                  >
                    Save
                  </button>
                  <PDFDownloadLink
                    document={<InvoicePDF job={selectedJob} companyInfo={companyInfo} />}
                    fileName={`invoice-${selectedJob.id}.pdf`}
                  >
                    {({ loading }) => (
                      <button
                        type="button"
                        onClick={() => handleDownload(selectedJob.id)}
                        className={`flex-1 px-4 py-2 rounded-lg text-white text-sm sm:text-base transition-all duration-200 ${
                          downloadedJobs.has(selectedJob.id)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                        disabled={downloadedJobs.has(selectedJob.id) || loading}
                      >
                        {downloadedJobs.has(selectedJob.id)
                          ? "Downloaded"
                          : "Download Invoice"}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
              </form>
            </div>
          </JobModal>
        )}

        {/* Notification */}
        {showNotification && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm sm:text-base">
            Invoice downloaded successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;