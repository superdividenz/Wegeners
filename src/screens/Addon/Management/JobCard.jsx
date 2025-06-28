import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { FaMapMarkerAlt, FaArchive, FaEye } from 'react-icons/fa';
import InvoicePDF from './InvoicePDF';
import PDFPreviewModal from '../PDFModal';

const JobCard = ({
  job,
  onJobClick,
  onDownload,
  onArchive,
  downloadedJobs,
  archivedJobs,
  companyInfo,
  pdfDownloadLink,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!job || !job.id) {
    console.warn('JobCard: job is invalid or missing', job);
    return null;
  }

  const isDownloaded = downloadedJobs?.has(job.id) || false;
  const isArchived = archivedJobs?.has(job.id) || false;

  const handlePreviewPdf = async (e) => {
    e.stopPropagation();
    try {
      const blob = await pdf(
        <InvoicePDF job={job} companyInfo={companyInfo} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview PDF:', error);
    }
  };


  return (
    <>
      <div
        className={`flex flex-col justify-between h-full
          ${isDownloaded ? 'border-2 border-green-500' : ''}
          ${isArchived ? 'opacity-75' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onJobClick(job);
        }}
      >
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 truncate">{job.name || 'N/A'}</h3>
          <p className="flex items-center text-sm sm:text-base text-gray-600 mb-5 break-words">
            <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
            <span>{job.address || 'N/A'}</span>
          </p>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <button
            onClick={handlePreviewPdf}
            className="inline-flex items-center justify-center w-full sm:w-auto px-2 py-2 rounded text-sm sm:text-base transition duration-300 bg-yellow-500 hover:bg-yellow-600 text-white select-none min-h-[44px]"
            type="button"
            aria-label="Preview PDF"
          >
            <FaEye className="mr-2" />
            Preview PDF
          </button>

          {pdfDownloadLink}

          {isDownloaded && !isArchived && (
            <button
              className="inline-flex items-center justify-center w-full sm:w-auto px-2 py-2 rounded text-sm sm:text-base transition duration-300 bg-gray-600 hover:bg-gray-700 text-white select-none min-h-[44px]"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(job.id);
              }}
              type="button"
              aria-label="Archive Job"
            >
              <FaArchive className="mr-2" />
              Archive Job
            </button>
          )}
        </div>

        {isArchived && (
          <p className="mt-3 text-sm text-gray-500 italic select-none">
            This job has been archived.
          </p>
        )}
      </div>

      {showPreview && previewUrl && (
  <PDFPreviewModal
    isOpen={showPreview}
    fileUrl={previewUrl}
    onClose={() => {
      setShowPreview(false);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }}
  >
    <div style={{padding: 20, color: 'black'}}>
      PDF Preview should load here.
    </div>
  </PDFPreviewModal>
)}
    </>
  );
};

export default JobCard;