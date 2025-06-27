import React from 'react';
import Modal from './Modal'; // Use Modal instead of JobModal
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';

const EditJobModal = ({
  job,
  onClose,
  onSubmit,
  register,
  downloadedJobs,
  handleDownload,
  companyInfo,
}) => {
  if (!job || !job.id) {
    console.warn('EditJobModal: job is invalid or missing', job);
    return null;
  }
  console.log('EditJobModal job:', job);

  return (
    <Modal onClose={onClose}>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
          Edit Job Details
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Name
            </label>
            <input
              {...register('name')}
              defaultValue={job.name || ''}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Date
            </label>
            <input
              {...register('date')}
              defaultValue={job.date || ''}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Email
            </label>
            <input
              {...register('email')}
              defaultValue={job.email || ''}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Phone
            </label>
            <input
              {...register('phone')}
              defaultValue={job.phone || ''}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Address
            </label>
            <input
              {...register('address')}
              defaultValue={job.address || ''}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Info
            </label>
            <textarea
              {...register('info')}
              defaultValue={job.info || ''}
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base">
              Price
            </label>
            <input
              {...register('price')}
              type="number"
              step="0.01"
              defaultValue={job.price || 0}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
            <PDFDownloadLink
              document={<InvoicePDF job={job} companyInfo={companyInfo} />}
              fileName={`invoice-${job.id}.pdf`}
            >
              {({ loading }) => (
                <button
                  type="button"
                  onClick={() => handleDownload(job.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    downloadedJobs?.has(job.id)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={downloadedJobs?.has(job.id) || loading}
                >
                  {downloadedJobs?.has(job.id) ? 'Downloaded' : 'Download Invoice'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditJobModal;