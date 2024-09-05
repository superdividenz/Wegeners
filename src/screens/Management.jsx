import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import BidModal from "./Addon/BidModal";
import BidList from "./Addon/BidList";
import ReportGenerator from "./Addon/ReportGenerator";

const Management = () => {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [showArchivedJobs, setShowArchivedJobs] = useState(false);

  const handleOpenBidModal = () => {
    console.log("Opening bid modal");
    setIsBidModalOpen(true);
  };

  const handleBidSubmit = (bidDetails) => {
    console.log("Bid submitted:", bidDetails);
    // Add any other logic for handling bid submission
    setIsBidModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Management</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Bids</h2>
        <button
          onClick={handleOpenBidModal}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4 w-full sm:w-auto"
        >
          Add New Bid
        </button>
        <BidList />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Jobs</h2>
        <button
          onClick={() => setShowArchivedJobs(!showArchivedJobs)}
          className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <span className="font-semibold">
            {showArchivedJobs ? "Hide" : "Show"} Archived Jobs
          </span>
          {showArchivedJobs ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {showArchivedJobs && (
          <div className="mt-4">
            {/* Add your archived jobs list here */}
            <p className="text-gray-600">
              Archived jobs will be displayed here.
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reports</h2>
        <ReportGenerator jobs={[]} /> {/* Pass your jobs data here */}
      </div>

      {isBidModalOpen && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          onSubmit={handleBidSubmit}
          jobId="someJobId" // You may want to pass a specific jobId here
        />
      )}
    </div>
  );
};

export default Management;
