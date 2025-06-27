import React from 'react';
import JobCard from './JobCard';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';

const JobList = ({ jobs, onJobClick, onDownload, onArchive, downloadedJobs, archivedJobs, companyInfo }) => {
  console.log('JobList jobs:', jobs);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {jobs
        .filter((job) => job && job.id) // Skip invalid jobs
        .map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl shadow-lg p-4 transition-all duration-200 hover:shadow-xl"
          >
            <JobCard
              job={job}
              onJobClick={onJobClick}
              onDownload={() => onDownload(job.id)}
              onArchive={() => onArchive(job.id)}
              downloadedJobs={downloadedJobs}
              archivedJobs={archivedJobs}
              pdfDownloadLink={
                <PDFDownloadLink
                  document={<InvoicePDF job={job} companyInfo={companyInfo} />}
                  fileName={`invoice-${job.id}.pdf`}
                >
                  {({ loading }) => (
                    <button
                      onClick={() => onDownload(job.id)}
                      className={`w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base transition-all duration-200 ${
                        downloadedJobs?.has(job.id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      disabled={downloadedJobs?.has(job.id) || loading}
                    >
                      {downloadedJobs?.has(job.id) ? 'Downloaded' : 'Download Invoice'}
                    </button>
                  )}
                </PDFDownloadLink>
              }
            />
          </div>
        ))}
    </div>
  );
};

export default JobList;
