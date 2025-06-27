import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import JobList from './Addon/JobList';
import EditJobModal from './Addon/EditJobModal';
import Notification from './Addon/Notification';
import ReportGenerator from './Addon/ReportGenerator';
import SubcontractorTable from './Addon/SubcontractorTable';

const Management = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedJobsValue, setCompletedJobsValue] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState(new Set());
  const [archivedJobs, setArchivedJobs] = useState(new Set());

  const { register, handleSubmit, reset } = useForm();

    const companyInfo = {
      name: "Wegener Asphalt",
      address: "10200 Quail Run Dr. 63125",
      phone: "314-300-6562",
      logoUrl: "/img/logo+w+dropshadow-306w.webp",
    };


  const fetchJobs = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'jobs'));
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: '',
        date: '',
        email: '',
        phone: '',
        address: '',
        info: '',
        price: 0,
        ...doc.data(),
      }));
      console.log('Fetched jobs:', jobsData);

      const completedJobs = jobsData.filter((job) => job.completed && !job.archived);
      setJobs(completedJobs);

      const completedValue = completedJobs.reduce(
        (sum, job) => sum + parseFloat(job.price || 0),
        0
      );
      setCompletedJobsValue(completedValue);

      const archived = new Set(jobsData.filter((job) => job.archived).map((job) => job.id));
      setArchivedJobs(archived);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobClick = (job) => {
    if (!job || !job.id) {
      console.warn('Invalid job selected:', job);
      return;
    }
    console.log('handleJobClick job:', job);
    setSelectedJob(job);
    setIsModalOpen(true);
    reset(job);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    reset();
  };

  const handleDownload = (jobId) => {
    setShowNotification(true);
    setDownloadedJobs((prev) => new Set(prev).add(jobId));
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleArchive = async (jobId) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, { archived: true });
      setArchivedJobs((prev) => new Set(prev).add(jobId));
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      setCompletedJobsValue((prev) =>
        prev - parseFloat(jobs.find((job) => job.id === jobId)?.price || 0)
      );
    } catch (error) {
      console.error('Error archiving job:', error);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedJob) return;

    try {
      const jobRef = doc(db, 'jobs', selectedJob.id);
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
      console.error('Error updating job:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
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
        <JobList
          jobs={jobs}
          onJobClick={handleJobClick}
          onDownload={handleDownload}
          onArchive={handleArchive}
          downloadedJobs={downloadedJobs}
          archivedJobs={archivedJobs}
          companyInfo={companyInfo}
        />
        <SubcontractorTable />

        {isModalOpen && selectedJob && (
          <>
            {console.log('Rendering EditJobModal with job:', selectedJob)}
            <EditJobModal
              job={selectedJob}
              onClose={handleCloseModal}
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              downloadedJobs={downloadedJobs}
              handleDownload={handleDownload}
              companyInfo={companyInfo}
            />
          </>
        )}

        {showNotification && <Notification message="Invoice downloaded successfully!" />}
      </div>
    </div>
  );
};

export default Management;