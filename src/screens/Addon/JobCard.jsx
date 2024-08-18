// JobCard.jsx
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaMapMarkerAlt, FaFileDownload } from "react-icons/fa";
import InvoicePDF from "./InvoicePDF";

const JobCard = ({ job, onJobClick, onDownload, downloadedJobs }) => {
  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-300 ${
        downloadedJobs.has(job.id) ? "border-2 border-green-500" : ""
      }`}
      onClick={() => onJobClick(job)}
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
          onDownload(job.id);
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
  );
};

export default JobCard;
