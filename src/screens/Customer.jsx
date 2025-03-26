import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

const AddData = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchname, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Handle search input to filter jobs
  const handleSearch = async (e) => {
    const input = e.target.value;
    setSearchLastName(input);

    if (input.length > 0) {
      const db = getFirestore();
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("name", ">=", input),
        where("name", "<=", input + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatchingJobs(jobsData);
    } else {
      setMatchingJobs([]);
    }
  };

  // Handle job selection from search
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsSearchModalOpen(true);
    Object.keys(job).forEach((key) => {
      setValue(key, key === "date" ? formatDateForInput(job[key]) : job[key]);
    });
  };

  // Format date functions
  const formatDateForInput = (dateStr) => {
    if (!dateStr || !dateStr.includes("/")) return dateStr;
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const formatDateForStorage = (dateStr) => {
    if (!dateStr || !dateStr.includes("-")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  // Handle update submission
  const onSubmit = async (data) => {
    if (!selectedJob) return;

    const db = getFirestore();
    const jobDocRef = doc(db, "jobs", selectedJob.id);

    try {
      const updatedData = {
        ...data,
        date: formatDateForStorage(data.date),
        completed: selectedJob.completed || false,
      };
      await updateDoc(jobDocRef, updatedData);
      alert("Job updated successfully");
      setIsSearchModalOpen(false);
      reset();
      setSelectedJob(null);
      setMatchingJobs([]);
      setSearchLastName("");
    } catch (error) {
      console.error("Error updating job: ", error);
    }
  };

  // Handle modal closing
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
      setIsSearchModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        Customer
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          value={searchname}
          onChange={handleSearch}
          placeholder="Search by Name"
          className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        {matchingJobs.length > 0 && (
          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {matchingJobs.map((job) => (
              <li
                key={job.id}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <span className="font-medium text-gray-700">{job.name}</span> -{" "}
                {job.date}
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-6 space-y-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 text-white px-4 py-3 rounded-md hover:bg-purple-600 transition duration-200 w-full"
          >
            Add Job Manually
          </button>
        </div>
      </div>

      {/* Search Result Modal */}
      {isSearchModalOpen && selectedJob && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Edit Job Details
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("email", { required: true })}
                placeholder="Email"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("phone", { required: true })}
                placeholder="Phone"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("address", { required: true })}
                placeholder="Address"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("date", { required: true })}
                type="date"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("price", { required: true })}
                placeholder="Price"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("info", { required: true })}
                placeholder="Info"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Add New Job
            </h3>
            <form onSubmit={handleSubmit(/* Add your add job handler here */)} className="space-y-4">
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("email", { required: false })}
                placeholder="Email"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("phone", { required: true })}
                placeholder="Phone"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("address", { required: true })}
                placeholder="Address"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("date", { required: true })}
                type="date"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("price", { required: true })}
                placeholder="Price"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("info", { required: true })}
                placeholder="Info"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddData;