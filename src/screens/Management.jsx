import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ReportGenerator from "./Addon/ReportGenerator";



  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Management</h1>

      

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

      
    </div>
  );
};

export default Management;
