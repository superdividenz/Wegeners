import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import Papa from "papaparse";

const AddData = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const [bulkData, setBulkData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const onSubmit = async (data) => {
    try {
      const db = getFirestore();
      const jobsRef = collection(db, "jobs");

      const jobData = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      if (selectedJob) {
        // Update existing job
        await updateDoc(doc(db, "jobs", selectedJob.id), jobData);
        console.log("Job updated successfully");
      } else {
        // Add new job
        await addDoc(jobsRef, jobData);
        console.log("Job added successfully");
      }

      reset();
      setIsModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error adding/updating job: ", error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          console.log("Parsed CSV data:", results.data);
          setBulkData(results.data);
        },
        header: true,
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkData || bulkData.length === 0) {
      console.error("No data to upload");
      return;
    }

    const db = getFirestore();
    const jobsRef = collection(db, "jobs");

    try {
      for (let row of bulkData) {
        if (Object.keys(row).length === 0) {
          console.log("Skipping empty row");
          continue;
        }

        const jobData = {
          ...row,
          timestamp: new Date().toISOString(),
        };

        console.log("Uploading job data:", jobData);
        await addDoc(jobsRef, jobData);
      }

      console.log("Bulk upload completed successfully");
      setBulkData(null);
    } catch (error) {
      console.error("Error during bulk upload:", error);
    }
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    // Populate form fields with job data
    Object.keys(job).forEach((key) => {
      setValue(key, job[key]);
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 mb-4"
      >
        Add Single Entry
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Bulk Upload</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-4"
        />
        {bulkData && (
          <div>
            <p>{bulkData.length} rows found in CSV</p>
            <button
              onClick={handleBulkUpload}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
            >
              Upload Bulk Data
            </button>
          </div>
        )}
      </div>

      {/* Example job list */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Jobs</h2>
        {/* Replace with dynamic job list */}
        <ul>
          <li
            onClick={() =>
              handleEditJob({ id: "1", firstName: "John", lastName: "Doe" })
            }
          >
            John Doe
          </li>
          {/* Add more jobs here */}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 overflow-y-auto flex-grow">
              <h2 className="text-xl font-bold mb-4">
                {selectedJob ? "Edit Job" : "Add Single Entry"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    placeholder="First Name"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-sm">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>

                {/* Add other form fields here */}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedJob(null);
                      reset();
                    }}
                    className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    {selectedJob ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddData;
