import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaMapMarkerAlt, FaFileDownload, FaArchive } from "react-icons/fa";
import InvoicePDF from "./InvoicePDF";

const JobCard = ({
  job,
  onJobClick,
  onDownload,
  onArchive,
  downloadedJobs,
  archivedJobs,
}) => {
  const isDownloaded = downloadedJobs.has(job.id);
  const isArchived = archivedJobs.has(job.id);

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-lg transition duration-300 ${
        isDownloaded ? "border-2 border-green-500" : ""
      } ${isArchived ? "opacity-75" : ""}`}
      onClick={() => onJobClick(job)}
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{job.name}</h3>
      <p className="flex items-center text-sm sm:text-base text-gray-600 mb-4">
        <FaMapMarkerAlt className="mr-2" /> {job.address}
      </p>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <PDFDownloadLink
          document={<InvoicePDF job={job} />}
          fileName={`invoice_${job.name}.pdf`}
          className={`inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition duration-300 ${
            isDownloaded
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(job.id);
          }}
        >
          {({ blob, url, loading, error }) =>
            loading ? (
              "Generating..."
            ) : (
              <>
                <FaFileDownload className="mr-2" />
                <span className="hidden sm:inline">
                  {isDownloaded ? "Invoice Downloaded" : "Download Invoice"}
                </span>
                <span className="sm:hidden">
                  {isDownloaded ? "Downloaded" : "Download"}
                </span>
              </>
            )
          }
        </PDFDownloadLink>
        {isDownloaded && !isArchived && (
          <button
            className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition duration-300 bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onArchive(job.id);
            }}
          >
            <FaArchive className="mr-2" />
            <span>Archive Job</span>
          </button>
        )}
      </div>
      {isArchived && (
        <p className="mt-2 text-sm text-gray-500">
          This job has been archived.
        </p>
      )}
    </div>
  );
};

export default JobCard;
