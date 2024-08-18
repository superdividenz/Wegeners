import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Modal from "../components/Modal";
import { FaMapMarkerAlt, FaFileDownload } from "react-icons/fa";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

const InvoicePDF = ({ job }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.text}>Job: {job.name}</Text>
        <Text style={styles.text}>Date: {job.date}</Text>
        <Text style={styles.text}>Price: ${job.price}</Text>
        <Text style={styles.text}>Address: {job.address}</Text>
        <Text style={styles.text}>Email: {job.email}</Text>
        <Text style={styles.text}>Phone: {job.phone}</Text>
        <Text style={styles.text}>Additional Info: {job.info}</Text>
      </View>
    </Page>
  </Document>
);

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
            <div
              key={job.id}
              className={`bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-300 ${
                downloadedJobs.has(job.id) ? "border-2 border-green-500" : ""
              }`}
              onClick={() => handleJobClick(job)}
            >
              <h3 className="text-xl font-semibold mb-2">{job.name}</h3>
              <p className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2" /> {job.address}
              </p>
              <PDFDownloadLink
                document={<InvoicePDF job={job} />}
                fileName={`invoice_${job.name}.pdf`}
                className={`inline-flex items-center px-4 py-2 rounded transition duration-300 ${
                  downloadedJobs.has(job.id)
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(job.id);
                }}
              >
                {({ blob, url, loading, error }) =>
                  loading ? (
                    "Generating Invoice..."
                  ) : (
                    <>
                      <FaFileDownload className="mr-2" />
                      {downloadedJobs.has(job.id)
                        ? "Invoice Downloaded"
                        : "Download Invoice"}
                    </>
                  )
                }
              </PDFDownloadLink>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedJob && (
        <Modal onClose={handleCloseModal}>
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{selectedJob.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {selectedJob.date || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedJob.email || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedJob.phone || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Price:</span> $
                {selectedJob.price || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {selectedJob.address || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Status:</span> Completed
              </p>
            </div>
            <p className="mb-4">
              <span className="font-semibold">Info:</span>{" "}
              {selectedJob.info || "N/A"}
            </p>
            <PDFDownloadLink
              document={<InvoicePDF job={selectedJob} />}
              fileName={`invoice_${selectedJob.name}.pdf`}
              className={`inline-flex items-center px-4 py-2 rounded transition duration-300 ${
                downloadedJobs.has(selectedJob.id)
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              onClick={() => handleDownload(selectedJob.id)}
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  "Generating Invoice..."
                ) : (
                  <>
                    <FaFileDownload className="mr-2" />
                    {downloadedJobs.has(selectedJob.id)
                      ? "Invoice Downloaded"
                      : "Download Invoice"}
                  </>
                )
              }
            </PDFDownloadLink>
          </div>
        </Modal>
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
